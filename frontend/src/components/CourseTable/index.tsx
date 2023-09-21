import CourseFilter from "@/components/CourseFilter";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useCourseCodes from "@/hooks/useCourseCodes";
import useCourses from "@/hooks/useCourses";
import { clientComponentClient } from "@/lib/supabaseClient";
import { $selectedCourseCode, $selectedDay, $selectedMajor } from "@/store";
import type { Tables, Views } from "@/types/supabase";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import type { Session } from "supabase-auth-helpers-astro";

type Props = {
  session: Session | null;
  myCourses: Tables<"user_courses">[] | null;
  majors: Tables<"majors">[] | { code: string }[] | null;
  courseCodes: Views<"course_codes">[] | { code: string; major_code: string }[] | null;
  courses: Tables<"courses">[] | null;
  selectedMajor: { refreshed_at: string | null } | null;
};

export default function CourseTable(props: Props) {
  type Course = Exclude<typeof props.courses, null>[number];
  const supabase = clientComponentClient();

  const major = useStore($selectedMajor);
  const courseCode = useStore($selectedCourseCode);
  const day = useStore($selectedDay);

  const { data: courseCodes } = useCourseCodes(props.courseCodes, major);
  const { data: courses } = useCourses(props.courses, major, courseCode, day);

  const [myCourses, setMyCourses] = useState(props.myCourses);
  const toggleMyCourse = async (checked: boolean | "indeterminate", course: Course) => {
    const userId = props.session!.user.id;

    if (!checked) {
      const { error } = await supabase.from("user_courses").delete().eq("course_crn", course.crn).eq("user_id", userId);
      if (!error) setMyCourses(myCourses!.filter((c) => c.course_crn != course.crn || c.user_id != userId));
      else alert(error);
    } else {
      const { data, error } = await supabase
        .from("user_courses")
        .upsert({ course_crn: course.crn, user_id: userId })
        .select()
        .single();
      if (!error) setMyCourses([data, ...myCourses!]);
      else alert(error);
    }
  };

  return (
    <div className="container grid place-items-center pb-8 pt-6 md:py-10 gap-24">
      <div className="flex flex-wrap justify-center gap-y-4 w-full overflow-auto">
        <div className="md:w-1/5">
          <CourseFilter majors={props.majors} courseCodes={courseCodes} selectedMajor={props.selectedMajor} />
        </div>

        <div className="w-full md:w-4/5">
          <Table className="border border-collapse">
            <TableHeader>
              <TableRow>
                {props.session && <TableHead>My Courses</TableHead>}
                <TableHead>CRN</TableHead>
                <TableHead>Major Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Teaching</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Major Restriction</TableHead>
                <TableHead>Prerequisites</TableHead>
                <TableHead className="text-right">Class Restriction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map((course) => (
                <TableRow key={course.crn}>
                  {props.session && (
                    <TableCell>
                      <Checkbox
                        checked={myCourses?.some((c) => c.course_crn === course.crn)}
                        onCheckedChange={(checked) => toggleMyCourse(checked, course)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-bold">{course.crn}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.teaching_method}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>
                    {course.lectures.map((lecture) => (
                      <span key={lecture.id}>
                        {lecture.building}
                        <br />
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    {course.lectures.map((lecture) => (
                      <span key={lecture.id}>
                        {lecture.day}
                        <br />
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    {course.lectures.map((lecture) => (
                      <span key={lecture.id}>
                        {lecture.time_start}/{lecture.time_end}
                        <br />
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    {course.lectures.map((lecture) => (
                      <span key={lecture.id}>
                        {lecture.room}
                        <br />
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    {course.enrolled}/{course.capacity}
                  </TableCell>
                  <TableCell>{course.major_restriction}</TableCell>
                  <TableCell>{course.prerequisites}</TableCell>
                  <TableCell className="text-right">{course.class_restriction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
