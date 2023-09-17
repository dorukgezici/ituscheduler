import { atom } from "nanostores";

export const $selectedMajor = atom<string>("BLG");
export const $selectedCourseCode = atom<string | undefined>();
export const $selectedDay = atom<string | undefined>();
