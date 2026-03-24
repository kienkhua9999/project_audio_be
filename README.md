npx prisma migrate dev --name init
npx ts-node scripts/import-movies.ts
npx ts-node scripts/process-mobile-videos.ts
