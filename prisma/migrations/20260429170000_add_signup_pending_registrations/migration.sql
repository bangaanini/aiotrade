CREATE TABLE "public"."signup_pending_registrations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "username" text NOT NULL,
  "whatsapp" text NOT NULL,
  "member_id" text NOT NULL,
  "referral_link" text NOT NULL,
  "password_hash" text NOT NULL,
  "referred_by" text,
  "plan_id" text NOT NULL,
  "plan_label" text NOT NULL,
  "plan_description" text NOT NULL,
  "plan_price" integer NOT NULL,
  "plan_duration_months" integer NOT NULL,
  "plan_is_lifetime" boolean NOT NULL DEFAULT false,
  "channel_code" text NOT NULL,
  "payment_reference_id" text,
  "status" text NOT NULL DEFAULT 'pending',
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "signup_pending_registrations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "signup_pending_registrations_email_key" UNIQUE ("email"),
  CONSTRAINT "signup_pending_registrations_username_key" UNIQUE ("username"),
  CONSTRAINT "signup_pending_registrations_member_id_key" UNIQUE ("member_id"),
  CONSTRAINT "signup_pending_registrations_referral_link_key" UNIQUE ("referral_link"),
  CONSTRAINT "signup_pending_registrations_payment_reference_id_key" UNIQUE ("payment_reference_id")
);

CREATE INDEX "signup_pending_registrations_contact_idx"
ON "public"."signup_pending_registrations" ("email", "whatsapp", "status");

CREATE INDEX "signup_pending_registrations_status_idx"
ON "public"."signup_pending_registrations" ("status", "expires_at");

ALTER TABLE "public"."signup_payment_transactions"
ADD COLUMN IF NOT EXISTS "pending_registration_id" uuid;

CREATE INDEX IF NOT EXISTS "signup_payment_transactions_pending_registration_idx"
ON "public"."signup_payment_transactions" ("pending_registration_id");

ALTER TABLE "public"."signup_payment_transactions"
ADD CONSTRAINT "signup_payment_transactions_pending_registration_id_fkey"
FOREIGN KEY ("pending_registration_id") REFERENCES "public"."signup_pending_registrations"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
