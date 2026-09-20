import { z } from "zod";

const baseUsuarioSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do usuário.").max(150, "Use no máximo 150 caracteres."),
  email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
  role: z.enum(["1", "2"], { error: "Selecione um perfil." }),
});

export function usuarioSchema(isEditing: boolean) {
  return baseUsuarioSchema.extend({
    password: isEditing
      ? z.string()
      : z.string().min(1, "Informe a senha."),
  });
}

export type UsuarioFormData = z.infer<ReturnType<typeof usuarioSchema>>;
