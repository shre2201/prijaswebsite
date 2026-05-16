-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query → paste → Run

CREATE TABLE "Service" (
  "id"          TEXT            NOT NULL,
  "name"        TEXT            NOT NULL,
  "description" TEXT            NOT NULL,
  "price"       DECIMAL(10, 2)  NOT NULL,
  "duration"    INTEGER         NOT NULL DEFAULT 30,
  "isActive"    BOOLEAN         NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
