# Hướng dẫn triển khai (Deployment Guide) - Project Movie Short

Tài liệu này tổng hợp lại toàn bộ các lệnh và quy trình đã thực hiện để triển khai hạ tầng AWS bằng CDK và cấu hình server EC2.

---

## 1. Lệnh trên máy Local (CDK & AWS CLI)

### Kiểm tra danh tính AWS
```bash
# Xem Account ID và User đang dùng
aws sts get-caller-identity --profile kien_dva_0810
```

### Triển khai hạ tầng (CDK)
Đảm bảo bạn đang ở trong thư mục `cdk`.

```bash
# 1. Khởi tạo môi trường CDK trên AWS (Chỉ chạy 1 lần duy nhất)
npm run cdk -- bootstrap --profile kien_dva_0810 -c environment=Dev

# 2. Xem các thay đổi sắp triển khai
npm run cdk -- diff "MovieShortDev/*" -c environment=Dev --profile kien_dva_0810

# 3. Triển khai toàn bộ hạ tầng (S3, EC2, Elastic IP)
npm run cdk -- deploy "MovieShortDev/*" -c environment=Dev --profile kien_dva_0810
```

---

## 2. Cấu hình trên Server EC2 (Qua Session Manager)

### Cấu hình Database (MySQL)
Truy cập vào MySQL để tạo DB và đặt mật khẩu cho root.

```bash
# Vào MySQL lần đầu (chưa có mật khẩu)
sudo mysql

# --- Tại dấu nhắc mysql> ---
# 1. Tạo Database
CREATE DATABASE IF NOT EXISTS short_movie;

# 2. Đặt mật khẩu và đổi phương thức xác thực cho user root
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345678';
FLUSH PRIVILEGES;
EXIT;
```

**Cách vào MySQL kể từ lần sau:**
```bash
mysql -u root -p
# Sau đó nhập mật khẩu: 12345678
```

### Cấu hình Biến môi trường (.env)
```bash
cd /home/ubuntu/app
nano .env

# Phím tắt trong nano:
# Ctrl + O -> Enter : Để lưu
# Ctrl + X : Để thoát
```

**Nội dung mẫu cho `.env`:**
```env
DATABASE_URL="mysql://root:12345678@localhost:3306/short_movie"
PORT=3001
```

### Quản lý Application (PM2 & Prisma)
```bash
cd /home/ubuntu/app

# 1. Cài đặt dependency (nếu cần)
npm install

# 2. Đẩy cấu hình database qua Prisma
npx prisma db push

# 3. Khởi chạy App bằng PM2
# Chạy từ file build (NestJS)
sudo -u ubuntu pm2 start dist/main.js --name "movie-short-be"
# Hoặc chạy qua npm start
sudo -u ubuntu pm2 start npm --name "movie-short-be" -- start

# 4. Lưu trạng thái PM2 (để tự khởi động khi server restart)
sudo -u ubuntu pm2 save

# 5. Các lệnh PM2 hữu ích:
sudo -u ubuntu pm2 status           # Xem trạng thái app
sudo -u ubuntu pm2 logs             # Xem log app (để debug)
sudo -u ubuntu pm2 restart all      # Restart app
```

---

## 3. Các thông số cần nhớ
- **Region:** ap-southeast-1 (Singapore)
- **Elastic IP:** Đã được gán cố định cho EC2.
- **Port App:** Đã mở Ingress trong Security Group cho port 3000, 3001, 80, 443.
- **VPC:** Sử dụng Default VPC của Account.

---

## 4. Cấu hình Nginx & HTTPS (Self-signed) cho IP
Nếu chưa có domain, bạn có thể cấu hình HTTPS cho IP `47.130.184.14` theo các bước sau:

### Cài đặt Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

### Tạo Self-signed Certificate
```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt \
  -subj "/C=VN/ST=HN/L=HN/O=MovieShort/OU=Dev/CN=47.130.184.14"
```

### Cấu hình file Nginx
Sửa file `/etc/nginx/sites-available/movie-short`:
```nginx
server {
    listen 80;
    server_name 47.130.184.14;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name 47.130.184.14;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Kích hoạt cấu hình
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/movie-short /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. Cấu hình kết nối DBeaver từ máy cá nhân

Để kết nối DBeaver (máy cá nhân) tới MySQL trên EC2, thực hiện các bước sau:

### Bước 1: Cho phép MySQL nhận kết nối bên ngoài
1. Mở file cấu hình mysql: `sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf`
2. Tìm dòng `bind-address = 127.0.0.1` và sửa thành `bind-address = 0.0.0.0`
3. Restart MySQL: `sudo systemctl restart mysql`

### Bước 2: Cấp quyền cho User Root truy cập từ xa
1. Đăng nhập vào mysql: `mysql -u root -p` (Pass: 12345678)
2. Chạy các lệnh SQL sau:
```sql
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

### Bước 3: Cấu hình trên DBeaver
- **Host:** 47.130.184.14
- **Port:** 3306
- **Database:** short_movie
- **Username:** root
- **Password:** 12345678
