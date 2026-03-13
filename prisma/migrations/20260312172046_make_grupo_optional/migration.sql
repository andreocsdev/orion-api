-- DropForeignKey
ALTER TABLE "Eventos" DROP CONSTRAINT "Eventos_grupoId_fkey";

-- AlterTable
ALTER TABLE "Eventos" ALTER COLUMN "grupoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Eventos" ADD CONSTRAINT "Eventos_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
