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
            label: `${course_crn} | ${course?.code} | ${course?.title} | ${course?.instructor} | ${course?.lectures.map(
              (l) => `${l.day} ${l.time} | `
            )}${course?.enrolled}/${course?.capacity} `,
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
  );
}
