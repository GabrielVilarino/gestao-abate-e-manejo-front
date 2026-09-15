import type { Metadata } from "next";

import { AbatesScreen } from "@/features/abates/components/abates-screen";

export const metadata: Metadata = {
  title: "Abates | TecNutre",
};

export default function AbatesPage() {
  return <AbatesScreen />;
}
