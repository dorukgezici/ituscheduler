
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."user_count"() RETURNS integer
    LANGUAGE "sql" SECURITY DEFINER
    AS $$select
  count(*)
from
  auth.users;$$;

ALTER FUNCTION "public"."user_count"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."courses" (
    "crn" "text" NOT NULL,
    "major_code" "text",
    "code" "text",
    "catalogue" "text",
    "title" "text",
    "teaching_method" "text",
    "instructor" "text",
    "capacity" bigint,
    "enrolled" bigint,
    "reservation" "text",
    "major_restriction" "text",
    "prerequisites" "text",
    "class_restriction" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."courses" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."course_codes" AS
 SELECT DISTINCT ON ("courses"."code") "courses"."code",
    "courses"."major_code"
   FROM "public"."courses"
  ORDER BY "courses"."code";

ALTER TABLE "public"."course_codes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."lectures" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "course_crn" "text",
    "building" "text",
    "day" "text",
    "time" "text",
    "time_start" bigint,
    "time_end" bigint,
    "room" "text"
);

ALTER TABLE "public"."lectures" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."lectures_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."lectures_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."lectures_id_seq" OWNED BY "public"."lectures"."id";

CREATE TABLE IF NOT EXISTS "public"."majors" (
    "code" "text" NOT NULL,
    "created_at" timestamp with time zone,
    "refreshed_at" timestamp with time zone
);

ALTER TABLE "public"."majors" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "author" "text",
    "date" "text",
    "content" "text"
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."posts_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."posts_id_seq" OWNED BY "public"."posts"."id";

CREATE TABLE IF NOT EXISTS "public"."schedule_courses" (
    "schedule_id" bigint NOT NULL,
    "course_crn" "text" NOT NULL
);

ALTER TABLE "public"."schedule_courses" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" bigint NOT NULL,
    "is_selected" boolean NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."schedules" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."schedules_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."schedules_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."schedules_id_seq" OWNED BY "public"."schedules"."id";

CREATE TABLE IF NOT EXISTS "public"."user_courses" (
    "course_crn" "text" NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."user_courses" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_major" (
    "user_id" "uuid" NOT NULL,
    "major" character varying DEFAULT 'BLG'::character varying NOT NULL
);

ALTER TABLE "public"."user_major" OWNER TO "postgres";

ALTER TABLE ONLY "public"."lectures" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."lectures_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."posts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."posts_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."schedules" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."schedules_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("crn");

ALTER TABLE ONLY "public"."lectures"
    ADD CONSTRAINT "lectures_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."majors"
    ADD CONSTRAINT "majors_pkey" PRIMARY KEY ("code");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."schedule_courses"
    ADD CONSTRAINT "schedule_courses_pkey" PRIMARY KEY ("schedule_id", "course_crn");

ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_courses"
    ADD CONSTRAINT "user_courses_pkey" PRIMARY KEY ("course_crn", "user_id");

ALTER TABLE ONLY "public"."user_major"
    ADD CONSTRAINT "user_major_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."user_major"
    ADD CONSTRAINT "user_major_user_id_key" UNIQUE ("user_id");

CREATE INDEX "idx_courses_deleted_at" ON "public"."courses" USING "btree" ("deleted_at");

CREATE UNIQUE INDEX "idx_lecture" ON "public"."lectures" USING "btree" ("course_crn", "day", "time");

CREATE INDEX "idx_lectures_deleted_at" ON "public"."lectures" USING "btree" ("deleted_at");

CREATE INDEX "idx_posts_deleted_at" ON "public"."posts" USING "btree" ("deleted_at");

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_major_code_fkey" FOREIGN KEY ("major_code") REFERENCES "public"."majors"("code") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."lectures"
    ADD CONSTRAINT "lectures_course_crn_fkey" FOREIGN KEY ("course_crn") REFERENCES "public"."courses"("crn") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."schedule_courses"
    ADD CONSTRAINT "schedule_courses_course_crn_fkey" FOREIGN KEY ("course_crn") REFERENCES "public"."courses"("crn") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."schedule_courses"
    ADD CONSTRAINT "schedule_courses_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_courses"
    ADD CONSTRAINT "user_courses_course_crn_fkey" FOREIGN KEY ("course_crn") REFERENCES "public"."courses"("crn") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_courses"
    ADD CONSTRAINT "user_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_major"
    ADD CONSTRAINT "user_major_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."user_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_count"() TO "service_role";

GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";

GRANT ALL ON TABLE "public"."course_codes" TO "anon";
GRANT ALL ON TABLE "public"."course_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."course_codes" TO "service_role";

GRANT ALL ON TABLE "public"."lectures" TO "anon";
GRANT ALL ON TABLE "public"."lectures" TO "authenticated";
GRANT ALL ON TABLE "public"."lectures" TO "service_role";

GRANT ALL ON SEQUENCE "public"."lectures_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lectures_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lectures_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."majors" TO "anon";
GRANT ALL ON TABLE "public"."majors" TO "authenticated";
GRANT ALL ON TABLE "public"."majors" TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."schedule_courses" TO "anon";
GRANT ALL ON TABLE "public"."schedule_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_courses" TO "service_role";

GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";

GRANT ALL ON SEQUENCE "public"."schedules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."schedules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."schedules_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_courses" TO "anon";
GRANT ALL ON TABLE "public"."user_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_courses" TO "service_role";

GRANT ALL ON TABLE "public"."user_major" TO "anon";
GRANT ALL ON TABLE "public"."user_major" TO "authenticated";
GRANT ALL ON TABLE "public"."user_major" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
