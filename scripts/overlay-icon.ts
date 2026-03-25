import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const ffmpegPath = ffmpegInstaller.path;

const inputDir = process.argv[2];
const watermarkIcon = process.argv[3];
const outputDir = process.argv[4] || `${inputDir}_che`;

if (!inputDir || !watermarkIcon) {
  console.error('❌ Vui lòng cung cấp đủ đường dẫn thư mục video và icon!');
  console.log('📝 Cách dùng: npx ts-node scripts/overlay-icon.ts <thu_muc_phim> <icon.png> [thu_muc_dau_ra]');
  console.log('Ví dụ: npx ts-node scripts/overlay-icon.ts phimdacat scripts/cheicon/logo1.png phimdacat_xong');
  process.exit(1);
}

// Cấu hình vị trí và kích thước icon
const ICON_WIDTH = 320; // Chiều rộng icon
const MARGIN_RIGHT = -50; // Số âm để đẩy icon sang bên TRÁI hoặc PHẢI thêm (có thể âm để đẩy sát lề hơn)
const MARGIN_TOP = -50; // Số âm để đẩy icon LÊN TRÊN cao hơn

// Các định dạng video được hỗ trợ
const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

/**
 * Hàm hỗ trợ quét thư mục chứa nhiều thư mục con (đệ quy)
 */
function getAllVideos(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllVideos(filePath, fileList);
    } else {
      if (videoExtensions.includes(path.extname(file).toLowerCase())) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function processVideo(inputFile: string, outputFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Tạo thư mục đường dẫn cho file xuất nếu chưa có
    const outDirTemp = path.dirname(outputFile);
    if (!fs.existsSync(outDirTemp)) {
      fs.mkdirSync(outDirTemp, { recursive: true });
    }

    const args = [
      '-y',
      '-i', inputFile,
      '-i', watermarkIcon,
      '-filter_complex', `[1:v]scale=${ICON_WIDTH}:-1[watermark];[0:v][watermark]overlay=W-w-${MARGIN_RIGHT}:${MARGIN_TOP}`,
      '-codec:a', 'copy',
      outputFile
    ];

    console.log(`⏳ Đang xử lý: ${path.basename(inputFile)}...`);

    // Sử dụng execFile thay cho exec để tránh lỗi parse path có dấu cách của Windows cmd
    const childProcess = require('child_process').execFile(ffmpegPath, args);

    let stderrData = '';
    childProcess.stderr?.on('data', (data: any) => {
      stderrData += data.toString();
    });

    childProcess.on('exit', (code: number) => {
      if (code === 0) {
        console.log(`✅ Đã xong: ${path.basename(outputFile)}`);
        resolve();
      } else {
        console.error(`❌ Lỗi ffmpeg: ${stderrData}`);
        console.error(`❌ Lỗi khi xử lý file: ${inputFile} (mã lỗi: ${code})`);
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    const allVideos = getAllVideos(inputDir);

    if (allVideos.length === 0) {
      console.log(`Không tìm thấy file video nào trong thư mục ${inputDir}`);
      return;
    }

    console.log(`Tìm thấy ${allVideos.length} video. Bắt đầu xử lý...`);

    // Xử lý lần lượt từng video
    for (const inputFile of allVideos) {
      // Tính toán đường dẫn file đích (giữ nguyên cấu trúc thư mục con)
      const relativePath = path.relative(inputDir, inputFile);
      const outputFile = path.join(outputDir, relativePath);

      // Bỏ qua các file đang được cập nhật/ghi bởi process-mobile-videos (sửa đổi trong 2 phút gần đây)
      const stat = fs.statSync(inputFile);
      const isFileBeingWritten = (Date.now() - stat.mtimeMs) < 2 * 60 * 1000;
      if (isFileBeingWritten) {
        console.log(`⚠️ Bỏ qua ${path.basename(inputFile)} vì file này đang được update/mới tạo gần đây (đang được render).`);
        continue;
      }

      await processVideo(inputFile, outputFile);
    }

    console.log('🎉 Đã xử lý xong tất cả các video!');
  } catch (error) {
    console.error('Lỗi trong quá trình chạy:', error);
  }
}

main();
