-- CreateTable
CREATE TABLE "SherryFile" (
    "sherryFileId" UUID NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "path" VARCHAR NOT NULL,
    "oldPath" VARCHAR NOT NULL,
    "hash" VARCHAR NOT NULL,
    "sherryId" UUID NOT NULL,

    CONSTRAINT "SherryFile_pkey" PRIMARY KEY ("sherryFileId")
);

-- AddForeignKey
ALTER TABLE "SherryFile" ADD CONSTRAINT "SherryFile_sherryId_fkey" FOREIGN KEY ("sherryId") REFERENCES "Sherry"("sherryId") ON DELETE CASCADE ON UPDATE CASCADE;
