import CourseFilter from "@/components/CourseFilter";
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
    <div className="container-fluid">
      <div className="row">
        <CourseFilter majors={props.majors} courseCodes={courseCodes} />

        <div className="col-md-10 col-lg-9">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <div className="row">
                <div className="col-md-8 col-xs-6">
                  <h2 className="panel-title">Courses</h2>
                </div>
              </div>
            </div>
            <ul className="list-group">
              <li className="list-group-item">
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>CRN</th>
                        <th>Major Code</th>
                        <th>Title</th>
                        <th>Teaching Method</th>
                        <th>Instructor</th>
                        {/* <th>Building</th>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Room</th> */}
                        <th>Capacity</th>
                        <th>Major Restriction</th>
                        <th>Prerequisites</th>
                        <th>Class Restriction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses?.map((course) => (
                        <tr key={course.crn}>
                          <th>{course.crn}</th>
                          <td>
                            <a target="_blank" href="{{.Catalogue}}">
                              {course.code}
                            </a>
                          </td>
                          <td>{course.title}</td>
                          <td>{course.teaching_method}</td>
                          <td>{course.instructor}</td>
                          <td>
                            {course.enrolled}/{course.capacity}
                          </td>
                          <td>
                            <a href="javascript:alert('Major Restrictions: {{.MajorRestriction}}')">
                              {course.major_restriction}
                            </a>
                          </td>
                          <td>
                            <a href="javascript:alert('Prerequisites: {{.Prerequisites}}')">{course.prerequisites}</a>
                          </td>
                          <td>{course.class_restriction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <p>Latest Database Refresh: {props.selectedMajor?.refreshed_at}</p>
        </div>
      </div>
    </div>
  );
}
