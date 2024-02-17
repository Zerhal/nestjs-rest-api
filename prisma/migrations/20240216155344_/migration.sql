/*
  Warnings:

  - You are about to drop the column `userInformationId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `UserInformation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `UserInformation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userInformationId_fkey";

-- DropIndex
DROP INDEX "User_userInformationId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userInformationId";

-- AlterTable
ALTER TABLE "UserInformation" ADD COLUMN     "userId" UUID NOT NULL,
ALTER COLUMN "firstname" DROP NOT NULL,
ALTER COLUMN "lastname" DROP NOT NULL,
ALTER COLUMN "birthdate" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserInformation_userId_key" ON "UserInformation"("userId");

-- AddForeignKey
ALTER TABLE "UserInformation" ADD CONSTRAINT "UserInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
