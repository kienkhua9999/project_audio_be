-- DropForeignKey
ALTER TABLE `adimpression` DROP FOREIGN KEY `AdImpression_adUnitId_fkey`;

-- DropForeignKey
ALTER TABLE `adimpression` DROP FOREIGN KEY `AdImpression_episodeId_fkey`;

-- DropForeignKey
ALTER TABLE `adimpression` DROP FOREIGN KEY `AdImpression_userId_fkey`;

-- DropForeignKey
ALTER TABLE `episode` DROP FOREIGN KEY `Episode_seriesId_fkey`;

-- DropForeignKey
ALTER TABLE `episodepurchase` DROP FOREIGN KEY `EpisodePurchase_episodeId_fkey`;

-- DropForeignKey
ALTER TABLE `episodepurchase` DROP FOREIGN KEY `EpisodePurchase_userId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_planId_fkey`;

-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_userId_fkey`;

-- DropForeignKey
ALTER TABLE `watchhistory` DROP FOREIGN KEY `WatchHistory_episodeId_fkey`;

-- DropForeignKey
ALTER TABLE `watchhistory` DROP FOREIGN KEY `WatchHistory_userId_fkey`;

-- AlterTable
ALTER TABLE `episode` MODIFY `duration` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `episode` ADD CONSTRAINT `episode_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `series`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `episodepurchase` ADD CONSTRAINT `episodepurchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `episodepurchase` ADD CONSTRAINT `episodepurchase_episodeId_fkey` FOREIGN KEY (`episodeId`) REFERENCES `episode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `watchhistory` ADD CONSTRAINT `watchhistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `watchhistory` ADD CONSTRAINT `watchhistory_episodeId_fkey` FOREIGN KEY (`episodeId`) REFERENCES `episode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adimpression` ADD CONSTRAINT `adimpression_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adimpression` ADD CONSTRAINT `adimpression_episodeId_fkey` FOREIGN KEY (`episodeId`) REFERENCES `episode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adimpression` ADD CONSTRAINT `adimpression_adUnitId_fkey` FOREIGN KEY (`adUnitId`) REFERENCES `adunit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `adimpression` RENAME INDEX `AdImpression_adUnitId_idx` TO `adimpression_adUnitId_idx`;

-- RenameIndex
ALTER TABLE `adimpression` RENAME INDEX `AdImpression_episodeId_idx` TO `adimpression_episodeId_idx`;

-- RenameIndex
ALTER TABLE `adimpression` RENAME INDEX `AdImpression_userId_idx` TO `adimpression_userId_idx`;

-- RenameIndex
ALTER TABLE `episode` RENAME INDEX `Episode_seriesId_episodeNumber_key` TO `episode_seriesId_episodeNumber_key`;

-- RenameIndex
ALTER TABLE `episode` RENAME INDEX `Episode_seriesId_idx` TO `episode_seriesId_idx`;

-- RenameIndex
ALTER TABLE `episodepurchase` RENAME INDEX `EpisodePurchase_episodeId_idx` TO `episodepurchase_episodeId_idx`;

-- RenameIndex
ALTER TABLE `episodepurchase` RENAME INDEX `EpisodePurchase_userId_episodeId_key` TO `episodepurchase_userId_episodeId_key`;

-- RenameIndex
ALTER TABLE `payment` RENAME INDEX `Payment_userId_idx` TO `payment_userId_idx`;

-- RenameIndex
ALTER TABLE `subscription` RENAME INDEX `Subscription_planId_idx` TO `subscription_planId_idx`;

-- RenameIndex
ALTER TABLE `subscription` RENAME INDEX `Subscription_userId_idx` TO `subscription_userId_idx`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;

-- RenameIndex
ALTER TABLE `watchhistory` RENAME INDEX `WatchHistory_episodeId_idx` TO `watchhistory_episodeId_idx`;

-- RenameIndex
ALTER TABLE `watchhistory` RENAME INDEX `WatchHistory_userId_episodeId_key` TO `watchhistory_userId_episodeId_key`;
