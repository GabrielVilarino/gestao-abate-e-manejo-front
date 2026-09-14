import { z } from "zod";

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export const proprietarioSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome completo."),
  cpf: z
    .string()
    .min(1, "Informe o CPF.")
    .refine((value) => onlyDigits(value).length === 11, "O CPF deve ter 11 dígitos."),
  observacao: z.string().trim().max(500, "Use no máximo 500 caracteres."),
});

export type ProprietarioFormData = z.infer<typeof proprietarioSchema>;

export function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
