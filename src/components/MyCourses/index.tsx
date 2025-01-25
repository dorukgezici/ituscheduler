import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useMyCourses from "@/hooks/useMyCourses";
import { supabase } from "@/lib/supabase";
import { $selectedSchedule } from "@/store";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";

export default function MyCourses({ user }: { user: User }) {
  const [selectedCRNs, setSelectedCRNs] = useState<string[]>([]);
  const { data: myCourses } = useMyCourses(user.id);

  return (
    <Card className="w-full flex flex-col text-center">
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>

      <CardContent>
        <MultiSelect
          placeholder="Select courses..."
          defaultValue={selectedCRNs}
          onValueChange={setSelectedCRNs}
          options={
            myCourses?.map(({ course_crn, courses: course }) => ({
              value: course_crn as string,
              label: `${course_crn} | ${course?.code} | ${course?.title} | ${course?.instructor} | ${course?.lectures?.map(
                (l) => `${l.day} ${l.time} | `,
              )}${course?.enrolled}/${course?.capacity}`,
            })) ?? []
          }
        />
      </CardContent>

      <CardFooter className="flex flex-wrap justify-center gap-x-2">
        <div className="md:w-1/6">
          <Button
            variant="outline"
            onClick={async () => {
              const { data, error } = await supabase
                .from("schedules")
                .insert({ user_id: user.id, is_selected: true })
                .select()
                .single();

              if (data && !error) {
                $selectedSchedule.set(`${data.id}`);

                const selectedCourses = selectedCRNs.map((crn) => ({
                  schedule_id: data.id,
                  course_crn: crn,
                }));
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
              const selectedScheduleId = parseInt(
                $selectedSchedule.get() ?? "0",
              );
              const selectedCourses = selectedCRNs.map((crn) => ({
                schedule_id: selectedScheduleId,
                course_crn: crn,
              }));
              const { error } = await supabase
                .from("schedule_courses")
                .insert(selectedCourses);
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
          <small>
            2) Select courses from the shortlist, add to current schedule or
            create a new schedule.
          </small>
        </div>
      </CardFooter>
    </Card>
  );
}
