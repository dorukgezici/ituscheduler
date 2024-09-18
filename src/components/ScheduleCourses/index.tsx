import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import useScheduleCourses from "@/hooks/useScheduleCourses";
import { browserClient } from "@/lib/supabase";
import { $selectedSchedule } from "@/store";
import { useStore } from "@nanostores/react";
import { ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

export default function ScheduleCourses() {
  const selectedSchedule = useStore($selectedSchedule);
  const { data } = useScheduleCourses(selectedSchedule ?? "");
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex flex-wrap items-center justify-between space-x-4 px-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost">
            <h4 className="text-sm font-semibold">
              Courses of the selected schedule
            </h4>
            <ChevronsUpDown className="h-4 w-4 ml-2" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="text-left">
          {data?.map(({ courses: course }) => (
            <li key={course?.crn} className="list-group-item">
              {`${course?.crn} | ${course?.code} | ${course?.title} | ${course?.instructor} | ${course?.lectures.map(
                (l) => `${l.day} ${l.time} | `,
              )}${course?.enrolled}/${course?.capacity} `}
              <Button
                variant="ghost"
                onClick={async () => {
                  const supabase = browserClient();

                  if (!selectedSchedule || !course?.crn) return;
                  const { error } = await supabase
                    .from("schedule_courses")
                    .delete()
                    .eq("schedule_id", selectedSchedule)
                    .eq("course_crn", course.crn);
                  if (!error) {
                    // TODO: mutate
                    location.reload();
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
