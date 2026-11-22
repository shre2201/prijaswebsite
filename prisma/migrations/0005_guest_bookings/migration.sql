-- Allow consultations to be booked without an account.
-- Contact details live on the booking; userId is set only when the visitor is signed in.
ALTER TABLE "Booking" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Booking" ADD COLUMN "name" TEXT;
ALTER TABLE "Booking" ADD COLUMN "email" TEXT;
ALTER TABLE "Booking" ADD COLUMN "phone" TEXT;
ALTER TABLE "Booking" ADD COLUMN "notes" TEXT;

-- Backfill contact details for existing bookings from their accounts.
UPDATE "Booking" b SET "name" = u."name", "email" = u."email", "phone" = u."phone"
FROM "User" u WHERE b."userId" = u."id";
