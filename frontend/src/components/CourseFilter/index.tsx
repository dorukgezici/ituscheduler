import { daySlots } from "@/lib/globals";
import { $selectedCourseCode, $selectedDay, $selectedMajor } from "@/store/courses";
import type { Tables, Views } from "@/types/supabase";
import { useStore } from "@nanostores/react";

type Props = {
  majors: Tables<"majors">[] | { code: string }[] | null;
  courseCodes: Views<"course_codes">[] | undefined;
};

export default function CourseFilter({ majors, courseCodes }: Props) {
  const selectedMajor = useStore($selectedMajor);
  const selectedCourseCode = useStore($selectedCourseCode);
  const selectedDay = useStore($selectedDay);

  return (
    <div className="col-md-2 col-lg-1 col-lg-offset-1">
      <h3>Find the exact course you want</h3>
      <br />
      <div className="row">
        <div className="form-group col-md-12">
          <form id="form-major">
            <label>
              <select
                className="form-control"
                name="major"
                value={selectedMajor}
                onChange={(e) => $selectedMajor.set(e.target.value)}
              >
                {majors?.map((major) => (
                  <option key={major.code} value={major.code}>
                    {major.code}
                  </option>
                ))}
              </select>
            </label>
          </form>
        </div>
        <div className="form-group col-md-12">
          <form id="form-code">
            <label>
              <select
                className="form-control"
                name="code"
                value={selectedCourseCode}
                onChange={(e) => $selectedCourseCode.set(e.target.value)}
              >
                <option value={undefined}>Course Code</option>
                {courseCodes?.map((courseCode) => (
                  <option key={courseCode.code} value={courseCode.code ?? undefined}>
                    {courseCode.code}
                  </option>
                ))}
              </select>
            </label>
          </form>
        </div>
        <div className="form-group col-md-12 col-xs-12">
          <form id="form-day">
            <label>
              <select
                className="form-control"
                name="day"
                value={selectedDay}
                onChange={(e) => $selectedDay.set(e.target.value)}
              >
                <option value={undefined}>Day</option>
                {Object.keys(daySlots).map((key) => (
                  <option key={key} value={key}>
                    {daySlots[key].nameEn}
                  </option>
                ))}
              </select>
            </label>
          </form>
        </div>
      </div>
      <br />
    </div>
  );
}
