/*
  Warnings:

  - A unique constraint covering the columns `[device_serial_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "device_serial_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_device_serial_id_key" ON "users"("device_serial_id");
