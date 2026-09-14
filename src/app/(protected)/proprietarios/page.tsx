import type { Metadata } from "next";

import { ProprietariosScreen } from "@/features/proprietarios/components/proprietarios-screen";

export const metadata: Metadata = {
  title: "Proprietários | TecNutre",
};

export default function ProprietariosPage() {
  return <ProprietariosScreen />;
}
