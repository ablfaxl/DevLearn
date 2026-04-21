import { ROUTES } from "@/constants";
import { redirect } from "next/navigation";

/** PRD: Instructor Studio → same app shell as course admin. */
export default function StudioPage() {
  redirect(ROUTES.ADMIN_COURSES);
}
