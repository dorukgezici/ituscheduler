import CourseFilter from "@/components/CourseFilter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useCourseCodes from "@/hooks/useCourseCodes";
import useCourses from "@/hooks/useCourses";
import { $selectedCourseCode, $selectedDay, $selectedMajor } from "@/store/courses";
import type { Tables, Views } from "@/types/supabase";
import { useStore } from "@nanostores/react";

type Props = {
  majors: Tables<"majors">[] | { code: string }[] | null;
  courseCodes: Views<"course_codes">[] | { code: string; major_code: string }[] | null;
  courses: Tables<"courses">[] | null;
  selectedMajor: { refreshed_at: string | null } | null;
};

export default function CourseTable(props: Props) {
  const major = useStore($selectedMajor);
  const courseCode = useStore($selectedCourseCode);
  const day = useStore($selectedDay);

  const { data: courseCodes } = useCourseCodes(props.courseCodes, major);
  const { data: courses } = useCourses(props.courses, major, courseCode, day);

  return (
    <div className="container grid place-items-center pb-8 pt-6 md:py-10 gap-24">
      <div className="flex flex-wrap gap-y-10">
        <div className="md:w-1/5">
          <CourseFilter majors={props.majors} courseCodes={courseCodes} selectedMajor={props.selectedMajor} />
        </div>

        <div className="md:w-4/5">
          <Table className="border border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">CRN</TableHead>
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
                  <TableCell className="font-medium">{course.crn}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.teaching_method}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>
                    {course.lectures.map((lecture) => (
                      <>
                        {lecture.building}
                        <br />
                      </>
                    ))}
                  </TableCell>
                  <TableCell>
                    {course.lectures.map((lecture) => (
                      <>
                        {lecture.day}
                        <br />
                      </>
                    ))}
                  </TableCell>
                  <TableCell>
                    {course.lectures.map((lecture) => (
                      <>
                        {lecture.time_start}/{lecture.time_end}
                        <br />
                      </>
                    ))}
                  </TableCell>
                  <TableCell>
                    {course.lectures.map((lecture) => (
                      <>
                        {lecture.room}
                        <br />
                      </>
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
