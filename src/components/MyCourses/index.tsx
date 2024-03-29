import type { Option } from "@/components/MultiSelect";
import MultiSelect from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useMyCourses from "@/hooks/useMyCourses";
import { clientComponentClient } from "@/lib/supabaseClient";
import { $selectedSchedule } from "@/store";
import { useState } from "react";
import type { User } from "supabase-auth-helpers-astro";

export default function MyCourses({ user }: { user: User }) {
  const [selected, setSelected] = useState<Option[]>([]);
  const { data: myCourses } = useMyCourses(user.id);

  const filterSelectedOptions = () => myCourses?.filter((c) => !selected.some((s) => s.value === c.course_crn));

  return (
    <Card className="w-full flex flex-col text-center">
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>

      <CardContent>
        <MultiSelect
          placeholder="Select courses..."
          selected={selected}
          setSelected={setSelected}
          options={filterSelectedOptions()?.map(({ course_crn, courses: course }) => ({
            label: `${course_crn} | ${course?.code} | ${course?.title} | ${course?.instructor} | ${course?.lectures.map(
              (l) => `${l.day} ${l.time} | `
            )}${course?.enrolled}/${course?.capacity} `,
            value: course_crn,
          }))}
        />
      </CardContent>

      <CardFooter className="flex flex-wrap justify-center gap-x-2">
        <div className="md:w-1/6">
          <Button
            variant="outline"
            onClick={async () => {
              const supabase = clientComponentClient();
              const { data, error } = await supabase
                .from("schedules")
                .insert({ user_id: user.id, is_selected: true })
                .select()
                .single();

              if (data && !error) {
                $selectedSchedule.set(`${data.id}`);

                const selectedCourses = selected.map((s) => ({ schedule_id: data.id, course_crn: s.value }));
                await supabase.from("schedule_courses").insert(selectedCourses);

                // TODO: mutate
                location.reload();
              }
            }}
          >
            New Schedule
          </Button>
        </div>
        <div className="md:w-1/6">
          <Button
            variant="outline"
            onClick={async () => {
              const supabase = clientComponentClient();
              const selectedScheduleId = parseInt($selectedSchedule.get() ?? "0");
              const selectedCourses = selected.map((s) => ({ schedule_id: selectedScheduleId, course_crn: s.value }));
              const { error } = await supabase.from("schedule_courses").insert(selectedCourses);
              // TODO: mutate
              if (!error) location.reload();
            }}
          >
            Add to Schedule
          </Button>
        </div>
        <div className="hidden sm:block md:w-3/6">
          <small>
            1) Add all relevant courses from the{" "}
            <a href="/courses" className="font-medium hover:underline">
              courses page
            </a>{" "}
            to your shortlist and come back here.
          </small>
          <br />
          <small>2) Select courses from the shortlist, add to current schedule or create a new schedule.</small>
        </div>
      </CardFooter>
    </Card>
  );
}
