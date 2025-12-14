-- CreateTable
CREATE TABLE "DailySend" (
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySend_pkey" PRIMARY KEY ("day")
);
