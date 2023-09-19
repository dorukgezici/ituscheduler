import MultiSelect from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useMyCourses from "@/hooks/useMyCourses";
import type { Session } from "supabase-auth-helpers-astro";

export default function MyCourses({ session }: { session: Session }) {
  const { data: myCourses } = useMyCourses(session.user.id);

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>

      <CardContent>
        <MultiSelect
          placeholder="Select courses..."
          options={myCourses?.map(({ course_crn, courses: course }) => ({
            label: `${course_crn} | ${course?.code} | ${course?.title}`,
            value: course_crn,
          }))}
        />
      </CardContent>

      <CardFooter className="flex gap-x-2">
        <div className="w-1/6">
          <Button variant="outline">New Schedule</Button>
        </div>
        <div className="w-1/6">
          <Button id="addToSchedule" variant="outline">
            Add to Schedule
          </Button>
        </div>
        <div className="w-4/6">
          <small>
            1) Add all relevant courses from the{" "}
            <a href="/courses" className="font-medium hover:underline">
              courses page
            </a>{" "}
            and come back here.
          </small>
          <br />
          <small>2) Hold CTRL, CMD or SHIFT (or drag with the mouse) to select courses.</small>
        </div>
      </CardFooter>
    </Card>

    // <form action="" method="POST" id="courses_form">
    //                         <div className="form-group">
    //                             <label className="control-label" for="id_courses">Courses</label>
    //                             <select name="courses" className="form-control" required id="id_courses" multiple
    //                                     size="3">
    //                                 {{range .User.Courses}}
    //                                     <option value="{{.CRN}}">{{. | course}}</option>
    //                                 {{end}}
    //                             </select>
    //                         </div>
    //                         <div className="row">
    //                             <div style="margin-bottom: 5px;" className="col-md-2 col-sm-6 col-xs-6">
    //                                 <button className="btn btn-primary" name="save">New Schedule</button>
    //                             </div>
    //                             <div style="margin-bottom: 5px;" className="col-md-2 col-sm-6 col-xs-6">
    //                                 <button className="btn btn-primary" id="addToSchedule">Add To Schedule</button>
    //                             </div>
    //                             <div className="col-md-8 col-sm-12 col-xs-12">
    //                                 <small>1) Add all relevant courses from the <a href="/courses">Courses
    //                                         page</a> and come back here.</small><br><small>2) Hold CTRL, CMD or
    //                                     SHIFT
    //                                     (or drag with the mouse) to select courses.</small>
    //                             </div>
    //                         </div>
    //                     </form>
    //                     {{if .Schedule.ID}}
    //                         <div className="row">
    //                             <div className="col-md-12" style="margin-top: 20px;">
    //                                 <label className="control-label" for="selected-courses">Courses of the selected
    //                                     schedule</label>
    //                                 <ul className="list-group" id="selected-courses">
    //                                     {{range .Schedule.Courses}}
    //                                         <li className="list-group-item">
    //                                             {{. | course}}
    //                                             <a href="javascript:removeScheduleCourse({{.CRN}})">Remove</a>
    //                                         </li>
    //                                     {{end}}
    //                                 </ul>
    //                             </div>
    //                         </div>
    //                     {{end}}
  );
}
