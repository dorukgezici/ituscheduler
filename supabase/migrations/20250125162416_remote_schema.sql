revoke delete on table "public"."schedule_courses_go" from "anon";

revoke insert on table "public"."schedule_courses_go" from "anon";

revoke references on table "public"."schedule_courses_go" from "anon";

revoke select on table "public"."schedule_courses_go" from "anon";

revoke trigger on table "public"."schedule_courses_go" from "anon";

revoke truncate on table "public"."schedule_courses_go" from "anon";

revoke update on table "public"."schedule_courses_go" from "anon";

revoke delete on table "public"."schedule_courses_go" from "authenticated";

revoke insert on table "public"."schedule_courses_go" from "authenticated";

revoke references on table "public"."schedule_courses_go" from "authenticated";

revoke select on table "public"."schedule_courses_go" from "authenticated";

revoke trigger on table "public"."schedule_courses_go" from "authenticated";

revoke truncate on table "public"."schedule_courses_go" from "authenticated";

revoke update on table "public"."schedule_courses_go" from "authenticated";

revoke delete on table "public"."schedule_courses_go" from "service_role";

revoke insert on table "public"."schedule_courses_go" from "service_role";

revoke references on table "public"."schedule_courses_go" from "service_role";

revoke select on table "public"."schedule_courses_go" from "service_role";

revoke trigger on table "public"."schedule_courses_go" from "service_role";

revoke truncate on table "public"."schedule_courses_go" from "service_role";

revoke update on table "public"."schedule_courses_go" from "service_role";

revoke delete on table "public"."schedules_go" from "anon";

revoke insert on table "public"."schedules_go" from "anon";

revoke references on table "public"."schedules_go" from "anon";

revoke select on table "public"."schedules_go" from "anon";

revoke trigger on table "public"."schedules_go" from "anon";

revoke truncate on table "public"."schedules_go" from "anon";

revoke update on table "public"."schedules_go" from "anon";

revoke delete on table "public"."schedules_go" from "authenticated";

revoke insert on table "public"."schedules_go" from "authenticated";

revoke references on table "public"."schedules_go" from "authenticated";

revoke select on table "public"."schedules_go" from "authenticated";

revoke trigger on table "public"."schedules_go" from "authenticated";

revoke truncate on table "public"."schedules_go" from "authenticated";

revoke update on table "public"."schedules_go" from "authenticated";

revoke delete on table "public"."schedules_go" from "service_role";

revoke insert on table "public"."schedules_go" from "service_role";

revoke references on table "public"."schedules_go" from "service_role";

revoke select on table "public"."schedules_go" from "service_role";

revoke trigger on table "public"."schedules_go" from "service_role";

revoke truncate on table "public"."schedules_go" from "service_role";

revoke update on table "public"."schedules_go" from "service_role";

revoke delete on table "public"."user_courses_go" from "anon";

revoke insert on table "public"."user_courses_go" from "anon";

revoke references on table "public"."user_courses_go" from "anon";

revoke select on table "public"."user_courses_go" from "anon";

revoke trigger on table "public"."user_courses_go" from "anon";

revoke truncate on table "public"."user_courses_go" from "anon";

revoke update on table "public"."user_courses_go" from "anon";

revoke delete on table "public"."user_courses_go" from "authenticated";

revoke insert on table "public"."user_courses_go" from "authenticated";

revoke references on table "public"."user_courses_go" from "authenticated";

revoke select on table "public"."user_courses_go" from "authenticated";

revoke trigger on table "public"."user_courses_go" from "authenticated";

revoke truncate on table "public"."user_courses_go" from "authenticated";

revoke update on table "public"."user_courses_go" from "authenticated";

revoke delete on table "public"."user_courses_go" from "service_role";

revoke insert on table "public"."user_courses_go" from "service_role";

revoke references on table "public"."user_courses_go" from "service_role";

revoke select on table "public"."user_courses_go" from "service_role";

revoke trigger on table "public"."user_courses_go" from "service_role";

revoke truncate on table "public"."user_courses_go" from "service_role";

revoke update on table "public"."user_courses_go" from "service_role";

alter table "public"."schedule_courses_go" drop constraint "fk_schedule_courses_go_course";

alter table "public"."schedule_courses_go" drop constraint "fk_schedule_courses_go_schedule";

alter table "public"."schedules_go" drop constraint "fk_users_schedules";

alter table "public"."user_courses_go" drop constraint "fk_user_courses_go_course";

alter table "public"."user_courses_go" drop constraint "fk_user_courses_go_user";

alter table "public"."schedule_courses_go" drop constraint "schedule_courses_go_pkey";

alter table "public"."schedules_go" drop constraint "schedules_go_pkey";

alter table "public"."user_courses_go" drop constraint "user_courses_go_pkey";

drop index if exists "public"."idx_schedules_go_deleted_at";

drop index if exists "public"."schedule_courses_go_pkey";

drop index if exists "public"."schedules_go_pkey";

drop index if exists "public"."user_courses_go_pkey";

drop table "public"."schedule_courses_go";

drop table "public"."schedules_go";

drop table "public"."user_courses_go";

alter table "public"."lectures" add column "key" text not null;

alter table "public"."majors" add column "id" smallint;

drop sequence if exists "public"."schedules_go_id_seq";

CREATE UNIQUE INDEX lectures_key_key ON public.lectures USING btree (key);

alter table "public"."lectures" add constraint "lectures_key_key" UNIQUE using index "lectures_key_key";


