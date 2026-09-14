import type { Metadata } from "next";

import { ProprietarioDetailScreen } from "@/features/proprietarios/components/proprietario-detail-screen";

export const metadata: Metadata = {
  title: "Detalhes do proprietário | TecNutre",
};

export default async function ProprietarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProprietarioDetailScreen id={id} />;
}
