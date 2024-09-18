import { browserClient } from "@/lib/supabase";
import { atom, onMount, onSet, task } from "nanostores";

// courses
export const $selectedMajor = atom<string>("BLG");

onMount($selectedMajor, () => {
  const loadSelectedMajor = async () => {
    const supabase = browserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;

    if (userId) {
      const { data: userMajor } = await supabase
        .from("user_major")
        .select("major")
        .eq("user_id", userId)
        .single();
      if (userMajor) $selectedMajor.set(userMajor.major);
    }
  };
  loadSelectedMajor();
});

onSet($selectedMajor, async ({ newValue }) => {
  if (newValue && newValue !== $selectedMajor.get()) {
    const supabase = browserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;

    if (userId)
      await supabase
        .from("user_major")
        .upsert({ user_id: userId, major: newValue })
        .eq("user_id", userId);
  }
});

export const $selectedCourseCode = atom<string | undefined>();
export const $selectedDay = atom<string | undefined>();

// schedules
export const $selectedSchedule = atom<string | undefined>();

onSet($selectedSchedule, async ({ newValue }) => {
  const oldValue = $selectedSchedule.get();
  if (newValue !== oldValue) {
    const supabase = browserClient();
    if (oldValue)
      await supabase
        .from("schedules")
        .update({ is_selected: false })
        .eq("id", oldValue);
    if (newValue)
      await supabase
        .from("schedules")
        .update({ is_selected: true })
        .eq("id", newValue);
  }
});

export const deleteSchedule = task(async () => {
  const supabase = browserClient();
  const { error } = await supabase
    .from("schedules")
    .delete()
    .eq("id", $selectedSchedule.get());
  if (!error) $selectedSchedule.set(undefined);
});
