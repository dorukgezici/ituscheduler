import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCourseCodes from "@/hooks/useCourseCodes";
import { dateAgo } from "@/lib/dayjs";
import { daySlots } from "@/lib/globals";
import { $selectedCourseCode, $selectedDay, $selectedMajor } from "@/store";
import { useStore } from "@nanostores/react";

type Props = {
  majors: { code: string }[] | null;
  selectedMajor: { refreshed_at: string | null } | null;
};

export default function CourseFilter({ majors, selectedMajor: selectedMajorData }: Props) {
  const selectedMajor = useStore($selectedMajor);
  const selectedCourseCode = useStore($selectedCourseCode);
  const selectedDay = useStore($selectedDay);

  const { data: courseCodes } = useCourseCodes(selectedMajor);

  return (
    <div>
      <Card className="text-center border-none">
        <CardHeader>
          <CardTitle>Major</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedMajor}
            onValueChange={(value) => {
              $selectedMajor.set(value);
              $selectedCourseCode.set(undefined);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[400px]">
                {majors?.map((major) => (
                  <SelectItem key={major.code} value={major.code}>
                    {major.code}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </CardContent>

        <CardHeader>
          <CardTitle>Course Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourseCode ?? ""} onValueChange={(value) => $selectedCourseCode.set(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className={(courseCodes?.length || 0) > 10 ? "h-[400px]" : undefined}>
                <SelectItem value="">All</SelectItem>
                {courseCodes?.map((courseCode) => (
                  <SelectItem key={courseCode.code} value={courseCode.code ?? ""}>
                    {courseCode.code}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </CardContent>

        <CardHeader>
          <CardTitle>Day</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDay ?? ""} onValueChange={(value) => $selectedDay.set(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {Object.keys(daySlots).map((key) => (
                <SelectItem key={key} value={key}>
                  {daySlots[key].nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>

        <CardHeader>
          <CardFooter>
            <CardDescription>Last Refresh: {dateAgo(selectedMajorData?.refreshed_at)}</CardDescription>
          </CardFooter>
        </CardHeader>
      </Card>
    </div>
  );
}
