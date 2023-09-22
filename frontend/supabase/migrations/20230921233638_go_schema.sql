create sequence "public"."schedules_go_id_seq";

create sequence "public"."users_id_seq";

create table "public"."schedule_courses_go" (
    "schedule_id" bigint not null,
    "course_crn" text not null
);


create table "public"."schedules_go" (
    "id" bigint not null default nextval('schedules_go_id_seq'::regclass),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "user_id" bigint,
    "is_selected" boolean
);


create table "public"."sessions" (
    "token" text not null,
    "user_id" bigint,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "deleted_at" timestamp with time zone
);


create table "public"."user_courses_go" (
    "user_id" bigint not null,
    "course_crn" text not null
);


create table "public"."users" (
    "id" bigint not null default nextval('users_id_seq'::regclass),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "username" text,
    "email" text,
    "password" text,
    "is_admin" boolean,
    "facebook_id" text,
    "twitter_id" text,
    "major_code" text
);


alter sequence "public"."schedules_go_id_seq" owned by "public"."schedules_go"."id";

alter sequence "public"."users_id_seq" owned by "public"."users"."id";

CREATE INDEX idx_schedules_go_deleted_at ON public.schedules_go USING btree (deleted_at);

CREATE INDEX idx_sessions_deleted_at ON public.sessions USING btree (deleted_at);

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);

CREATE UNIQUE INDEX schedule_courses_go_pkey ON public.schedule_courses_go USING btree (schedule_id, course_crn);

CREATE UNIQUE INDEX schedules_go_pkey ON public.schedules_go USING btree (id);

CREATE UNIQUE INDEX sessions_pkey ON public.sessions USING btree (token);

CREATE UNIQUE INDEX user_courses_go_pkey ON public.user_courses_go USING btree (user_id, course_crn);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_facebook_id_key ON public.users USING btree (facebook_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_twitter_id_key ON public.users USING btree (twitter_id);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

alter table "public"."schedule_courses_go" add constraint "schedule_courses_go_pkey" PRIMARY KEY using index "schedule_courses_go_pkey";

alter table "public"."schedules_go" add constraint "schedules_go_pkey" PRIMARY KEY using index "schedules_go_pkey";

alter table "public"."sessions" add constraint "sessions_pkey" PRIMARY KEY using index "sessions_pkey";

alter table "public"."user_courses_go" add constraint "user_courses_go_pkey" PRIMARY KEY using index "user_courses_go_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."courses" add constraint "fk_majors_courses" FOREIGN KEY (major_code) REFERENCES majors(code) not valid;

alter table "public"."courses" validate constraint "fk_majors_courses";

alter table "public"."lectures" add constraint "fk_courses_lectures" FOREIGN KEY (course_crn) REFERENCES courses(crn) not valid;

alter table "public"."lectures" validate constraint "fk_courses_lectures";

alter table "public"."schedule_courses_go" add constraint "fk_schedule_courses_go_course" FOREIGN KEY (course_crn) REFERENCES courses(crn) not valid;

alter table "public"."schedule_courses_go" validate constraint "fk_schedule_courses_go_course";

alter table "public"."schedule_courses_go" add constraint "fk_schedule_courses_go_schedule" FOREIGN KEY (schedule_id) REFERENCES schedules_go(id) not valid;

alter table "public"."schedule_courses_go" validate constraint "fk_schedule_courses_go_schedule";

alter table "public"."schedules_go" add constraint "fk_users_schedules" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."schedules_go" validate constraint "fk_users_schedules";

alter table "public"."sessions" add constraint "fk_users_sessions" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."sessions" validate constraint "fk_users_sessions";

alter table "public"."user_courses_go" add constraint "fk_user_courses_go_course" FOREIGN KEY (course_crn) REFERENCES courses(crn) not valid;

alter table "public"."user_courses_go" validate constraint "fk_user_courses_go_course";

alter table "public"."user_courses_go" add constraint "fk_user_courses_go_user" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."user_courses_go" validate constraint "fk_user_courses_go_user";

alter table "public"."users" add constraint "fk_users_major" FOREIGN KEY (major_code) REFERENCES majors(code) not valid;

alter table "public"."users" validate constraint "fk_users_major";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_facebook_id_key" UNIQUE using index "users_facebook_id_key";

alter table "public"."users" add constraint "users_twitter_id_key" UNIQUE using index "users_twitter_id_key";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";


