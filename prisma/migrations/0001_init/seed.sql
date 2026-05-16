-- Run this AFTER migration.sql
-- Creates the admin account (password: PrijasAdmin2026)

INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Prijas Admin',
  'admin@prijas.in',
  '$2b$12$XluVC5P7iKlm/B6FUHwRVOquz7xzIiPIRS7AtAY4Rzbuw5sgGWdku',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;
