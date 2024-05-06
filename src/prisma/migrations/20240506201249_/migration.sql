-- CreateTable
CREATE TABLE "Sherry" (
    "sherryId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "maxFileSize" INTEGER NOT NULL DEFAULT 500,
    "maxDirSize" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "Sherry_pkey" PRIMARY KEY ("sherryId")
);

-- CreateTable
CREATE TABLE "FileType" (
    "fileTypeId" UUID NOT NULL,
    "sherryId" UUID NOT NULL,

    CONSTRAINT "FileType_pkey" PRIMARY KEY ("fileTypeId")
);

-- CreateTable
CREATE TABLE "FileName" (
    "fileNameId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sherryId" UUID NOT NULL,

    CONSTRAINT "FileName_pkey" PRIMARY KEY ("fileNameId")
);

-- AddForeignKey
ALTER TABLE "FileType" ADD CONSTRAINT "FileType_sherryId_fkey" FOREIGN KEY ("sherryId") REFERENCES "Sherry"("sherryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileName" ADD CONSTRAINT "FileName_sherryId_fkey" FOREIGN KEY ("sherryId") REFERENCES "Sherry"("sherryId") ON DELETE RESTRICT ON UPDATE CASCADE;
