export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          capacity: number | null
          catalogue: string | null
          class_restriction: string | null
          code: string | null
          created_at: string | null
          crn: string
          deleted_at: string | null
          enrolled: number | null
          instructor: string | null
          major_code: string | null
          major_restriction: string | null
          prerequisites: string | null
          reservation: string | null
          teaching_method: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          catalogue?: string | null
          class_restriction?: string | null
          code?: string | null
          created_at?: string | null
          crn: string
          deleted_at?: string | null
          enrolled?: number | null
          instructor?: string | null
          major_code?: string | null
          major_restriction?: string | null
          prerequisites?: string | null
          reservation?: string | null
          teaching_method?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          catalogue?: string | null
          class_restriction?: string | null
          code?: string | null
          created_at?: string | null
          crn?: string
          deleted_at?: string | null
          enrolled?: number | null
          instructor?: string | null
          major_code?: string | null
          major_restriction?: string | null
          prerequisites?: string | null
          reservation?: string | null
          teaching_method?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_majors_courses"
            columns: ["major_code"]
            referencedRelation: "majors"
            referencedColumns: ["code"]
          }
        ]
      }
      lectures: {
        Row: {
          building: string | null
          course_crn: string | null
          created_at: string | null
          day: string | null
          deleted_at: string | null
          id: number
          room: string | null
          time: string | null
          time_end: number | null
          time_start: number | null
          updated_at: string | null
        }
        Insert: {
          building?: string | null
          course_crn?: string | null
          created_at?: string | null
          day?: string | null
          deleted_at?: string | null
          id?: number
          room?: string | null
          time?: string | null
          time_end?: number | null
          time_start?: number | null
          updated_at?: string | null
        }
        Update: {
          building?: string | null
          course_crn?: string | null
          created_at?: string | null
          day?: string | null
          deleted_at?: string | null
          id?: number
          room?: string | null
          time?: string | null
          time_end?: number | null
          time_start?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_courses_lectures"
            columns: ["course_crn"]
            referencedRelation: "courses"
            referencedColumns: ["crn"]
          }
        ]
      }
      majors: {
        Row: {
          code: string
          created_at: string | null
          refreshed_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          refreshed_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          refreshed_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          date: string | null
          deleted_at: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule_courses: {
        Row: {
          course_crn: string
          schedule_id: number
        }
        Insert: {
          course_crn: string
          schedule_id: number
        }
        Update: {
          course_crn?: string
          schedule_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_courses_course"
            columns: ["course_crn"]
            referencedRelation: "courses"
            referencedColumns: ["crn"]
          },
          {
            foreignKeyName: "fk_schedule_courses_schedule"
            columns: ["schedule_id"]
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          }
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: number
          is_selected: boolean | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          is_selected?: boolean | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          is_selected?: boolean | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_schedules"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          expires_at: string | null
          token: string
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          token: string
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          token?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_sessions"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_courses: {
        Row: {
          course_crn: string
          id: string
          user_id: string
        }
        Insert: {
          course_crn: string
          id?: string
          user_id: string
        }
        Update: {
          course_crn?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_crn_fkey"
            columns: ["course_crn"]
            referencedRelation: "courses"
            referencedColumns: ["crn"]
          },
          {
            foreignKeyName: "user_courses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          email: string | null
          facebook_id: string | null
          id: number
          is_admin: boolean | null
          major_code: string | null
          password: string | null
          twitter_id: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          facebook_id?: string | null
          id?: number
          is_admin?: boolean | null
          major_code?: string | null
          password?: string | null
          twitter_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          facebook_id?: string | null
          id?: number
          is_admin?: boolean | null
          major_code?: string | null
          password?: string | null
          twitter_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_major"
            columns: ["major_code"]
            referencedRelation: "majors"
            referencedColumns: ["code"]
          }
        ]
      }
    }
    Views: {
      course_codes: {
        Row: {
          code: string | null
          major_code: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_majors_courses"
            columns: ["major_code"]
            referencedRelation: "majors"
            referencedColumns: ["code"]
          }
        ]
      }
    }
    Functions: {
      user_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
