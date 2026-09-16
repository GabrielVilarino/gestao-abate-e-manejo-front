import type { Metadata } from "next";

import { AgendaScreen } from "@/features/agenda/components/agenda-screen";

export const metadata: Metadata = {
  title: "Agenda | TecNutre",
};

export default function AgendaPage() {
  return <AgendaScreen />;
}
