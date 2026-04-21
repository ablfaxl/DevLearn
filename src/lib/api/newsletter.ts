import { publicApiRequest } from "./client";

export async function subscribeNewsletter(email: string): Promise<void> {
  await publicApiRequest<unknown>("newsletter/", {
    method: "POST",
    json: { email: email.trim() },
  });
}
