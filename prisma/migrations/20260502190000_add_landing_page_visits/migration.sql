CREATE TABLE IF NOT EXISTS "public"."landing_page_visits" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" UUID NOT NULL,
  "username" TEXT NOT NULL,
  "visitor_id_hash" TEXT,
  "country_code" TEXT,
  "region" TEXT,
  "city" TEXT,
  "source_path" TEXT NOT NULL DEFAULT '/',
  "referrer" TEXT,
  "device_type" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "landing_page_visits_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "landing_page_visits_profile_id_fkey"
    FOREIGN KEY ("profile_id")
    REFERENCES "public"."profiles"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "landing_page_visits_created_at_idx"
  ON "public"."landing_page_visits"("created_at");

CREATE INDEX IF NOT EXISTS "landing_page_visits_profile_created_at_idx"
  ON "public"."landing_page_visits"("profile_id", "created_at");

CREATE INDEX IF NOT EXISTS "landing_page_visits_username_created_at_idx"
  ON "public"."landing_page_visits"("username", "created_at");

CREATE INDEX IF NOT EXISTS "landing_page_visits_country_created_at_idx"
  ON "public"."landing_page_visits"("country_code", "created_at");

CREATE INDEX IF NOT EXISTS "landing_page_visits_unique_visitor_idx"
  ON "public"."landing_page_visits"("visitor_id_hash", "profile_id", "created_at");
