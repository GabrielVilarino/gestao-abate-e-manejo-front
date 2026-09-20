import { AppShell } from "@/components/layout/app-shell";
import { verifySession } from "@/lib/auth-session";
import { cookies } from "next/headers";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession((await cookies()).get("auth")?.value);
  return <AppShell isAdmin={session?.role === 1}>{children}</AppShell>;
}
