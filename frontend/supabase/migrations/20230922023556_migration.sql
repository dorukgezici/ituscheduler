alter table "public"."courses" alter column "major_code" set not null;

alter table "public"."lectures" alter column "course_crn" set not null;

alter table "public"."schedules_go" alter column "user_id" set not null;

alter table "public"."sessions" alter column "user_id" set not null;


