import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const ffprobe = require('@ffprobe-installer/ffprobe');

const ROOT_DIR = path.join(__dirname, '..', 'phimdacat');

// Lấy thông tin codec Video và Audio của file
function getMediaInfo(filePath: string): { vCodec: string; aCodec: string } {
  try {
    const ffprobePath = ffprobe.path;
    const vCommand = `"${ffprobePath}" -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    const aCommand = `"${ffprobePath}" -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    
    let vCodec = 'unknown';
    let aCodec = 'unknown';

    try { vCodec = execSync(vCommand).toString().trim(); } catch (e) {}
    try { aCodec = execSync(aCommand).toString().trim(); } catch (e) {}

    return { vCodec, aCodec };
  } catch (error) {
    console.error(`Lỗi đọc file info cho ${filePath}:`, error);
    return { vCodec: 'unknown', aCodec: 'unknown' };
  }
}

// Xử lý chuẩn hóa file video
function processFile(filePath: string) {
  const { vCodec, aCodec } = getMediaInfo(filePath);
  
  // Nếu file bị lỗi, không đọc được thì bỏ qua
  if (vCodec === 'unknown' && aCodec === 'unknown') return;

  const tempPath = filePath + '.fixed.mp4';
  const ffmpegPath = ffmpeg.path;

  let vParam = '-c:v copy';
  let aParam = '-c:a copy';
  let isReEncode = false;

  // 1. Kiểm tra Video
  // Nếu không phải H.264 (mà là hevc/H.265, av1...) -> bắt buộc Render lại video
  if (vCodec !== 'h264') {
    isReEncode = true;
    vParam = '-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p';
  }

  // 2. Kiểm tra Audio
  // Nếu không phải AAC -> Render lại Audio
  if (aCodec !== 'aac') {
    isReEncode = true;
    aParam = '-c:a aac';
  }

  // Lệnh ffmpeg thần thánh: 
  // - Nếu chuẩn MP4 H.264 + AAC rồi thì lệnh này tốn 1s để bốc cái "moov atom" ném lên đầu (-movflags +faststart)
  // - Nếu sai codec thì nó bao gồm luôn cả việc Re-Render và fix faststart
  const modeText = isReEncode ? "RE-ENCODE (Lâu)" : "FASTSTART (Rất nhanh)";
  console.log(`[Đang xử lý ${modeText}] ${path.basename(filePath)} (Video: ${vCodec}, Audio: ${aCodec})`);

  const command = `"${ffmpegPath}" -i "${filePath}" ${vParam} ${aParam} -movflags +faststart -y "${tempPath}"`;
  
  try {
    // Chạy lệnh ffmpeg (chặn luồng, có log stdio nếu muốn, ở đây mute luôn cho báo cáo Console sạch sẽ)
    execSync(command, { stdio: 'ignore' });
    
    // Ghi đè file cũ
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
    console.log(` -> [XONG] Hoàn tất chuẩn hóa file: ${path.basename(filePath)}\n`);
  } catch (error) {
    console.error(` -> [THẤT BẠI] Lỗi chuẩn hóa: ${path.basename(filePath)}`);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

// Chạy đệ quy quét mục phimdacat
function scanFolder(dir: string) {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    // Bỏ qua các file tạm sinh ra từ lần chạy trước chưa dọn hoặc đã bị đổi tên trong vòng lặp này
    if (!fs.existsSync(fullPath) || item.endsWith('.fixed.mp4') || item.endsWith('.fixed.mp4.fixed.mp4')) {
      continue;
    }

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      scanFolder(fullPath);
    } else if (item.toLowerCase().endsWith('.mp4')) {
      processFile(fullPath);
    }
  }
}

console.log('--- KHỞI ĐỘNG CÔNG CỤ TỐI ƯU VIDEO CHO MOBILE ---');
console.log('Công cụ này sẽ quét toàn bộ thư mục, fix 2 lỗi cốt lõi:');
console.log(' 1. Tự chuyển đổi H.265 (HEVC) / AV1 -> H.264');
console.log(' 2. Đẩy moov atom (FastStart) lên đầu để Mobile không bị lỗi load quay tròn.');
console.log('--------------------------------------------------\n');

scanFolder(ROOT_DIR);

console.log('\n--- XONG! TẤT CẢ VIDEO ĐÃ CHUẨN ĐÉT CHO IPHONE/ANDROID ---');
