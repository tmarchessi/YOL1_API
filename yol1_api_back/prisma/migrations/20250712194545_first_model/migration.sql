-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_rut_key" ON "users"("rut");
