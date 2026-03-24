
npx prisma migrate dev --name init

// import phim
npx ts-node scripts/import-movies.ts

// xử lý video mobile
npx ts-node scripts/process-mobile-videos.ts

// chèn logo vào video
npx ts-node scripts/overlay-icon.ts phimdacat scripts/logo1.png phimdacat_xong