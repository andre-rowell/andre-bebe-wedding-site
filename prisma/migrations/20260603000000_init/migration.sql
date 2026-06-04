CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'PLANNER', 'FAMILY_ADMIN', 'READ_ONLY');
CREATE TYPE "InvitationStatus" AS ENUM ('NOT_SENT', 'SENT', 'OPENED', 'RSVP_COMPLETE');
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'INVITE_ONLY');
CREATE TYPE "RSVPAttending" AS ENUM ('YES', 'NO', 'UNANSWERED');

CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'OWNER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Household" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mailingAddressLine1" TEXT,
  "mailingAddressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "country" TEXT DEFAULT 'United States',
  "primaryEmail" TEXT,
  "primaryPhone" TEXT,
  "inviteCode" TEXT NOT NULL,
  "inviteLinkToken" TEXT NOT NULL,
  "invitationStatus" "InvitationStatus" NOT NULL DEFAULT 'NOT_SENT',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Guest" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "isAdult" BOOLEAN NOT NULL DEFAULT true,
  "isChild" BOOLEAN NOT NULL DEFAULT false,
  "plusOneAllowed" BOOLEAN NOT NULL DEFAULT false,
  "plusOneName" TEXT,
  "relationshipGroup" TEXT,
  "tags" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Event" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT,
  "venueName" TEXT NOT NULL,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postalCode" TEXT,
  "mapUrl" TEXT,
  "dressCode" TEXT,
  "parkingInfo" TEXT,
  "transportationInfo" TEXT,
  "visibility" "EventVisibility" NOT NULL DEFAULT 'PUBLIC',
  "rsvpRequired" BOOLEAN NOT NULL DEFAULT true,
  "mealSelectionRequired" BOOLEAN NOT NULL DEFAULT false,
  "mealOptions" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventInvitation" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "guestId" TEXT,
  "householdId" TEXT NOT NULL,
  "invited" BOOLEAN NOT NULL DEFAULT true,
  "plusOneInvited" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EventInvitation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RSVP" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "guestId" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "attending" "RSVPAttending" NOT NULL DEFAULT 'UNANSWERED',
  "mealChoice" TEXT,
  "dietaryRestrictions" TEXT,
  "accessibilityNeeds" TEXT,
  "songRequest" TEXT,
  "travelNotes" TEXT,
  "submittedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RegistryLink" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "buttonText" TEXT NOT NULL DEFAULT 'Open registry',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RegistryLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FAQItem" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FAQItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TravelSection" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "url" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TravelSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Photo" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "caption" TEXT,
  "imageUrl" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuestbookEntry" (
  "id" TEXT NOT NULL,
  "householdId" TEXT,
  "name" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isApproved" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "GuestbookEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "adminUserId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX "Household_inviteCode_key" ON "Household"("inviteCode");
CREATE UNIQUE INDEX "Household_inviteLinkToken_key" ON "Household"("inviteLinkToken");
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE UNIQUE INDEX "EventInvitation_eventId_guestId_key" ON "EventInvitation"("eventId", "guestId");
CREATE UNIQUE INDEX "RSVP_eventId_guestId_key" ON "RSVP"("eventId", "guestId");
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

ALTER TABLE "Guest" ADD CONSTRAINT "Guest_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuestbookEntry" ADD CONSTRAINT "GuestbookEntry_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
