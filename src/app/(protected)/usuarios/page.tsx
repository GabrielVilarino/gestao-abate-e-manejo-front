import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UsuariosScreen } from "@/features/usuarios/components/usuarios-screen";
import { verifySession } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Usuários | TecNutre",
};

export default async function UsuariosPage() {
  const session = await verifySession((await cookies()).get("auth")?.value);
  if (!session) redirect("/");
  if (session.role !== 1) redirect("/home");

  return <UsuariosScreen currentUserId={session.userId} />;
}
