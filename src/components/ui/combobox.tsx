"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type ComboboxProps = {
  id?: string;
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
};

export function Combobox({
  id,
  options,
  value,
  onValueChange,
  placeholder = "Selecione uma opção",
  emptyMessage = "Nenhuma opção encontrada.",
  disabled,
  invalid,
  describedBy,
  className,
}: ComboboxProps) {
  const optionValues = options.map((option) => option.value);
  const selectedValue = optionValues.includes(value ?? "") ? value : null;

  return (
    <ComboboxPrimitive.Root
      items={optionValues}
      value={selectedValue}
      onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
      itemToStringLabel={(optionValue) => options.find((option) => option.value === optionValue)?.label ?? optionValue}
      disabled={disabled}
    >
      <ComboboxPrimitive.InputGroup
        className={cn(
          "relative flex h-10 w-full items-center rounded-lg border border-input bg-background transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-3 has-[input[aria-invalid=true]]:ring-destructive/20",
          disabled && "cursor-not-allowed bg-input/50 opacity-50",
          className,
        )}
      >
        <ComboboxPrimitive.Input
          id={id}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 bg-transparent px-3 pr-16 text-base outline-none placeholder:text-muted-foreground md:text-sm"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {selectedValue ? (
            <ComboboxPrimitive.Clear
              aria-label="Limpar seleção"
              className="grid h-full w-8 place-items-center text-zinc-500 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <X className="size-4" />
            </ComboboxPrimitive.Clear>
          ) : null}
          <ComboboxPrimitive.Trigger
            aria-label="Abrir opções"
            className="grid h-full w-8 place-items-center text-zinc-500 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <ChevronsUpDown className="size-4" />
          </ComboboxPrimitive.Trigger>
        </div>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner className="z-[70] outline-none" sideOffset={4}>
          <ComboboxPrimitive.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-lg transition-[transform,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <ComboboxPrimitive.Empty className="px-3 py-4 text-sm text-zinc-500">
              {emptyMessage}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="max-h-[min(18rem,var(--available-height))] overflow-y-auto overscroll-contain p-1 outline-none data-empty:p-0">
              {(optionValue: string) => {
                const option = options.find((item) => item.value === optionValue);
                if (!option) return null;
                return (
                  <ComboboxPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-md px-2 py-2.5 text-sm outline-none select-none data-disabled:opacity-50 data-highlighted:bg-orange-50 data-highlighted:text-orange-900"
                  >
                    <ComboboxPrimitive.ItemIndicator className="text-orange-600">
                      <Check className="size-4" />
                    </ComboboxPrimitive.ItemIndicator>
                    <span className="col-start-2 truncate">{option.label}</span>
                  </ComboboxPrimitive.Item>
                );
              }}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
