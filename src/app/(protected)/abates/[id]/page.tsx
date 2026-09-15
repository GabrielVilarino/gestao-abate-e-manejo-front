import type { Metadata } from "next";

import { AbateDetailScreen } from "@/features/abates/components/abate-detail-screen";

export const metadata: Metadata = {
  title: "Detalhes do abate | TecNutre",
};

export default async function AbateDetailPage({ params }: PageProps<"/abates/[id]">) {
  const { id } = await params;
  return <AbateDetailScreen id={id} />;
}
