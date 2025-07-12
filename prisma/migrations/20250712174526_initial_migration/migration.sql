-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_rut_key" ON "User"("rut");
