-- CreateIndex
CREATE INDEX "Job_isActive_idx" ON "Job"("isActive");

-- CreateIndex
CREATE INDEX "Job_isActive_category_idx" ON "Job"("isActive", "category");

-- CreateIndex
CREATE INDEX "Job_recruiterId_createdAt_idx" ON "Job"("recruiterId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Job_isActive_createdAt_idx" ON "Job"("isActive", "createdAt" DESC);
