"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id?: string;
  options: readonly SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
};

export function Select({
  id,
  options,
  value,
  onValueChange,
  placeholder = "Selecione uma opção",
  disabled,
  invalid,
  describedBy,
  className,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      items={options}
      value={value || null}
      onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 text-left text-base outline-none transition select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50 data-[invalid]:border-destructive md:text-sm",
          invalid && "border-destructive ring-3 ring-destructive/20",
          className,
        )}
      >
        <SelectPrimitive.Value className="min-w-0 flex-1 truncate data-placeholder:text-muted-foreground" placeholder={placeholder} />
        <SelectPrimitive.Icon><ChevronsUpDown className="size-4 text-zinc-500" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner className="z-[70] outline-none" sideOffset={4}>
          <SelectPrimitive.Popup className="min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-lg transition-[transform,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <SelectPrimitive.ScrollUpArrow className="flex h-7 items-center justify-center bg-white text-zinc-500"><ChevronUp className="size-4" /></SelectPrimitive.ScrollUpArrow>
            <SelectPrimitive.List className="max-h-[min(18rem,var(--available-height))] overflow-y-auto p-1 outline-none">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-md px-2 py-2.5 text-sm outline-none select-none data-highlighted:bg-orange-50 data-highlighted:text-orange-900"
                >
                  <SelectPrimitive.ItemIndicator className="text-orange-600"><Check className="size-4" /></SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText className="col-start-2">{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
            <SelectPrimitive.ScrollDownArrow className="flex h-7 items-center justify-center bg-white text-zinc-500"><ChevronDown className="size-4" /></SelectPrimitive.ScrollDownArrow>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
