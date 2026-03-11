/*
  Warnings:

  - You are about to drop the column `bannerImage` on the `series` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `series` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `series` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Series_slug_key` ON `series`;

-- AlterTable
ALTER TABLE `series` DROP COLUMN `bannerImage`,
    DROP COLUMN `coverImage`,
    DROP COLUMN `slug`,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `tags` VARCHAR(191) NULL,
    ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0;
