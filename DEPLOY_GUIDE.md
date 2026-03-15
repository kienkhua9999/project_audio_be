# Hướng dẫn triển khai (không dùng Docker)

Tài liệu này mô tả mô hình triển khai tối ưu chi phí theo yêu cầu và từng bước thực hiện, **không dùng Docker**.

## 1) Quy tắc lưu link video trong Database (Rất quan trọng)

**Không lưu** full link S3 hoặc CloudFront.

- Không nên lưu: `s3://bucket/phim1/index.m3u8`
- Không nên lưu: `https://d123.cloudfront.net/phim1/index.m3u8`

**Cách chuẩn**: chỉ lưu **đường dẫn tương đối** (path).

Ví dụ:

```
movies/phim-ngan-A/tap-1/index.m3u8
```

**Lợi ích**:
- Đổi domain CDN hoặc đổi bucket chỉ cần sửa **1 biến môi trường**.
- Tránh phải update hàng nghìn record trong DB.

Gợi ý biến môi trường:

- `CDN_BASE_URL=https://d123.cloudfront.net`
- Khi trả về API: `fullUrl = CDN_BASE_URL + "/" + path`

---

## 2) Mô hình tổng thể

- **S3**: lưu file video (Private)
- **CloudFront**: public URL để stream video
- **EC2**:
  - NestJS (API)
  - MySQL (Database)
- **Vercel**: Next.js (Frontend) gọi API và gọi video qua CloudFront

---

## 3) Thiết lập S3 + CloudFront (OAC)

### 3.1 Tạo S3 Bucket
1. Tạo bucket trên AWS S3.
2. **Tắt Public Access** (bucket private).
3. Upload video vào S3 theo cấu trúc path chuẩn, ví dụ:
   ```
   movies/phim-ngan-A/tap-1/index.m3u8
   movies/phim-ngan-A/tap-1/segment_000.ts
   ```

### 3.2 Tạo CloudFront
1. Tạo distribution, origin là S3 bucket.
2. Bật **Origin Access Control (OAC)**.
3. S3 bucket policy chỉ cho phép CloudFront truy cập.
4. Kiểm tra link CloudFront phát video được.

---

## 4) Triển khai EC2 (không dùng Docker)

### 4.1 Tạo EC2
- Chọn **t3.micro** (free tier) nếu mới bắt đầu.
- Security Group:
  - **Inbound**:
    - Port **22**: SSH từ IP của bạn
    - Port **3000**: API public
    - Port **3306**: **chỉ mở nội bộ** (nếu cần), không mở public

### 4.2 Cài MySQL
1. SSH vào EC2.
2. Cài MySQL và tạo database/user cho ứng dụng.
3. Cấu hình MySQL chỉ listen nội bộ (127.0.0.1).

### 4.3 Cài Node.js + NestJS
1. Cài Node.js LTS.
2. Clone source code lên EC2.
3. Tạo file `.env` với `DATABASE_URL` và các biến khác.
4. Chạy:
   ```
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```

### 4.4 Chạy API bằng pm2 hoặc systemd
Dùng **pm2**:

```
npm i -g pm2
pm2 start dist/main.js --name short-movie-backend
pm2 save
```

---

## 5) Thiết lập Frontend (Vercel)

1. Deploy Next.js lên Vercel.
2. Trỏ API base URL tới EC2 (ví dụ `https://api.yourdomain.com`).
3. Video URL dùng CloudFront + path từ DB.

---

## 6) Backup & Scale

- **Backup MySQL** định kỳ (cron + mysqldump).
- Khi tăng traffic:
  - Tách DB sang RDS.
  - Nâng EC2 hoặc tách API riêng.

---

## 7) Checklist nhanh

- [ ] DB chỉ lưu path tương đối
- [ ] S3 private + OAC
- [ ] CloudFront public
- [ ] API chạy ổn trên EC2
- [ ] Vercel gọi API + CloudFront
- [ ] Backup DB định kỳ
