import { AdminLoginForm } from "./login-form";

type PageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <AdminLoginForm showRegistered={sp.registered === "1"} />;
}
