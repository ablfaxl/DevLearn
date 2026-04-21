import type { CurrentUserAccess } from "@/lib/api/types";

/**
 * List courses with `?mine=1` when the role allows it and the user is not a platform admin.
 * When `access` is missing (legacy profile), omit `mine` and use the API default.
 */
export function coursesListMineParam(access: CurrentUserAccess | undefined): true | undefined {
  if (!access) return undefined;
  if (access.can_manage_users) return undefined;
  if (access.can_use_mine_courses_query) return true;
  return undefined;
}
