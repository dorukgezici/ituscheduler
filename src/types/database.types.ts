export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          major_code: string
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
          major_code: string
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
          major_code?: string
          major_restriction?: string | null
          prerequisites?: string | null
          reservation?: string | null
          teaching_method?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_major_code_fkey"
            columns: ["major_code"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "fk_majors_courses"
            columns: ["major_code"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["code"]
          },
        ]
      }
      lectures: {
        Row: {
          building: string | null
          course_crn: string
          created_at: string | null
          day: string | null
          deleted_at: string | null
          id: number
          key: string
          room: string | null
          time: string | null
          time_end: number | null
          time_start: number | null
          updated_at: string | null
        }
        Insert: {
          building?: string | null
          course_crn: string
          created_at?: string | null
          day?: string | null
          deleted_at?: string | null
          id?: number
          key: string
          room?: string | null
          time?: string | null
          time_end?: number | null
          time_start?: number | null
          updated_at?: string | null
        }
        Update: {
          building?: string | null
          course_crn?: string
          created_at?: string | null
          day?: string | null
          deleted_at?: string | null
          id?: number
          key?: string
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
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["crn"]
          },
          {
            foreignKeyName: "lectures_course_crn_fkey"
            columns: ["course_crn"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["crn"]
          },
        ]
      }
      majors: {
        Row: {
          code: string
          created_at: string | null
          id: number | null
          refreshed_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number | null
          refreshed_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number | null
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
            foreignKeyName: "schedule_courses_course_crn_fkey"
            columns: ["course_crn"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["crn"]
          },
          {
            foreignKeyName: "schedule_courses_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          id: number
          is_selected: boolean
          user_id: string
        }
        Insert: {
          id?: number
          is_selected: boolean
          user_id: string
        }
        Update: {
          id?: number
          is_selected?: boolean
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          expires_at: string | null
          token: string
          user_id: number
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          token: string
          user_id: number
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          token?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_sessions"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_courses: {
        Row: {
          course_crn: string
          user_id: string
        }
        Insert: {
          course_crn: string
          user_id: string
        }
        Update: {
          course_crn?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_crn_fkey"
            columns: ["course_crn"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["crn"]
          },
        ]
      }
      user_major: {
        Row: {
          major: string
          user_id: string
        }
        Insert: {
          major?: string
          user_id: string
        }
        Update: {
          major?: string
          user_id?: string
        }
        Relationships: []
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
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["code"]
          },
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
            foreignKeyName: "courses_major_code_fkey"
            columns: ["major_code"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "fk_majors_courses"
            columns: ["major_code"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["code"]
          },
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
