import { exec } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Bắt tự động đường dẫn ffmpeg cài sẵn trong project (không cần cài thêm trên Windows)
const ffmpegPath = ffmpegInstaller.path;

// Nhận tham số từ terminal
const inputVideo = process.argv[2]; 
const watermarkIcon = process.argv[3];
const outputVideo = process.argv[4] || 'output.mp4';

if (!inputVideo || !watermarkIcon) {
  console.error('❌ Vui lòng cung cấp đủ đường dẫn video và icon!');
  console.log('📝 Cách dùng: npx ts-node scripts/overlay-icon.ts <input_video.mp4> <icon.png> [output_video.mp4]');
  console.log('Ví dụ: npx ts-node scripts/overlay-icon.ts video_goc.mp4 icon_che.png video_da_che.mp4');
  process.exit(1);
}

// Kích thước icon (chiều rộng px), bạn có thể chỉnh sửa số này
const ICON_WIDTH = 260; // Đã tăng từ 180 lên 260
// margin so với mép phải và trên (px) 
const MARGIN_RIGHT = 10;
const MARGIN_TOP = 10;

// Sử dụng ffmpegPath
const ffmpegCommand = `"${ffmpegPath}" -y -i "${inputVideo}" -i "${watermarkIcon}" -filter_complex "[1:v]scale=${ICON_WIDTH}:-1[watermark];[0:v][watermark]overlay=W-w-${MARGIN_RIGHT}:${MARGIN_TOP}" -codec:a copy "${outputVideo}"`;

console.log('⏳ Đang xử lý video... Vui lòng chờ. Lệnh đang chạy:');
console.log(ffmpegCommand);

const childProcess = exec(ffmpegCommand);

childProcess.stderr?.on('data', (data) => {
  if (data.includes('frame=')) {
    process.stdout.write(`\r${data.trim()}`);
  }
});

childProcess.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n✅ Xử lý thành công! Video đã được lưu tại: ${outputVideo}`);
  } else {
    console.error(`\n❌ Quá trình chạy bị lỗi với mã exit: ${code}`);
  }
});
