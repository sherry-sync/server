-- CreateTable
CREATE TABLE "SherryPermission" (
    "sherryPermossionId" UUID NOT NULL,
    "sherryId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "SherryPermission_pkey" PRIMARY KEY ("sherryPermossionId")
);

-- AddForeignKey
ALTER TABLE "SherryPermission" ADD CONSTRAINT "SherryPermission_sherryId_fkey" FOREIGN KEY ("sherryId") REFERENCES "Sherry"("sherryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SherryPermission" ADD CONSTRAINT "SherryPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
