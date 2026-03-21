import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
const ffprobe = require('@ffprobe-installer/ffprobe');

const prisma = new PrismaClient();
const PHIM_DA_CAT_DIR = path.join(__dirname, '..', 'phimdacat');

// Helper to get video duration using ffprobe
function getVideoDuration(filePath: string): string {
  try {
    // Use ffprobe from the installer package
    const ffprobePath = ffprobe.path;
    const command = `"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    const output = execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const durationSeconds = parseFloat(output);

    if (isNaN(durationSeconds)) {
      return '00:00';
    }

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.floor(durationSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    console.warn(`Could not get duration for ${filePath}: ${error}`);
    return '00:00';
  }
}

async function importSeries() {
  if (!fs.existsSync(PHIM_DA_CAT_DIR)) {
    console.error(`Folder not found: ${PHIM_DA_CAT_DIR}`);
    return;
  }

  const folders = fs.readdirSync(PHIM_DA_CAT_DIR).filter((f) => {
    return fs.statSync(path.join(PHIM_DA_CAT_DIR, f)).isDirectory();
  });

  console.log(`Found ${folders.length} series folders.`);

  for (const seriesFolderName of folders) {
    const seriesPath = path.join(PHIM_DA_CAT_DIR, seriesFolderName);
    const files = fs.readdirSync(seriesPath);

    // Find image file
    const imageFile = files.find((f) => {
      const ext = path.extname(f).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    });

    console.log(`Processing Series: ${seriesFolderName}`);

    // Create or find Series
    let series = await prisma.series.findFirst({
      where: { title: seriesFolderName },
    });

    if (!series) {
      series = await prisma.series.create({
        data: {
          title: seriesFolderName,
          description: `Phim ${seriesFolderName}`,
          image: imageFile || null,
          status: 'active',
          isExclusive: false,
          hasAds: true,
        },
      });
      console.log(`Created new series: ${series.title} (ID: ${series.id})`);
    } else {
      console.log(`Series already exists: ${series.title} (ID: ${series.id})`);
      // Update image if it was changed
      if (series.image !== imageFile && imageFile) {
        series = await prisma.series.update({
          where: { id: series.id },
          data: { image: imageFile },
        });
        console.log(`Updated image for: ${series.title}`);
      }
    }

    // Process Episodes
    const episodeFiles = files.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      const name = f.toLowerCase();
      return (
        ['.mp4', '.mkv', '.avi', '.mov'].includes(ext) &&
        name.startsWith('tap-')
      );
    });

    console.log(
      `Found ${episodeFiles.length} episode files for ${seriesFolderName}`,
    );

    for (const episodeFile of episodeFiles) {
      const episodeNumberMatch = episodeFile.match(/tap-(\d+)/i);
      if (!episodeNumberMatch) continue;

      const episodeNumber = parseInt(episodeNumberMatch[1], 10);
      const episodeTitle = `Tập ${episodeNumber}`;
      const episodePath = path.join(seriesPath, episodeFile);

      // Get real duration
      const durationStr = getVideoDuration(episodePath);

      // Create or update Episode
      const existingEpisode = await prisma.episode.findUnique({
        where: {
          seriesId_episodeNumber: {
            seriesId: series.id,
            episodeNumber: episodeNumber,
          },
        },
      });

      if (!existingEpisode) {
        await prisma.episode.create({
          data: {
            seriesId: series.id,
            episodeNumber: episodeNumber,
            title: episodeTitle,
            videoUrl: episodeFile,
            thumbnailUrl: series.image, // Use series image for episodes too
            duration: durationStr,
            status: 'active',
            isExclusive: false,
            hasAds: true,
          },
        });
        console.log(
          `  Added episode ${episodeNumber}: ${episodeFile} (${durationStr})`,
        );
      } else {
        // Update both videoUrl, thumbnailUrl and duration if changed
        const updateData: any = {};
        if (existingEpisode.videoUrl !== episodeFile) {
          updateData.videoUrl = episodeFile;
        }
        if (existingEpisode.thumbnailUrl !== series.image) {
          updateData.thumbnailUrl = series.image;
        }
        if (existingEpisode.duration !== durationStr) {
          updateData.duration = durationStr;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.episode.update({
            where: { id: existingEpisode.id },
            data: updateData,
          });
          console.log(
            `  Updated episode ${episodeNumber}: ${JSON.stringify(updateData)}`,
          );
        } else {
          console.log(
            `  Episode ${episodeNumber} already exists with correct data.`,
          );
        }
      }
    }
  }
}

importSeries()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
