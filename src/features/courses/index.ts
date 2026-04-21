export { LockedCurriculumMessage } from "./components/locked-curriculum-message";
export { useCourseCurriculumLoader } from "./hooks/use-course-curriculum-loader";
export type { CurriculumBlockReason } from "./types";
export { findContent, findLessonForContent, flattenFirstContent } from "./lib/course-tree";
export { canLoadFullCurriculum, hasStaffCurriculumAccess, isEnrolledInCourse } from "./lib/curriculum-access-policy";
