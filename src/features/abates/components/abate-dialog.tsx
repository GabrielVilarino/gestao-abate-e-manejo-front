"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AbateForm } from "@/features/abates/components/abate-form";

type AbateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
};

export function AbateDialog({ open, onOpenChange, onSuccess }: AbateDialogProps) {
  const [locked, setLocked] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && locked) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="grid h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:h-[min(92dvh,58rem)] sm:max-w-5xl"
        showCloseButton={!locked}
      >
        <DialogHeader className="border-b px-4 py-4 pr-12 sm:px-6">
          <DialogTitle className="text-lg">Novo abate</DialogTitle>
          <DialogDescription>Cadastre os dados gerais e, se desejar, as etapas e fotos do abate.</DialogDescription>
        </DialogHeader>
        <AbateForm onCancel={() => onOpenChange(false)} onSuccess={onSuccess} onLockChange={setLocked} />
      </DialogContent>
    </Dialog>
  );
}
