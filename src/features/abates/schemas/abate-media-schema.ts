import { z } from "zod";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export const mediaFileSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Selecione um arquivo válido.",
  )
  .refine((file) => {
    if (file.type.startsWith("image/")) return file.size <= MAX_IMAGE_SIZE;
    if (file.type === "video/mp4" || file.type === "video/webm") return file.size <= MAX_VIDEO_SIZE;
    return false;
  }, "Imagens devem ter até 10 MiB e vídeos MP4 ou WebM até 50 MiB.")
  .refine(
    (file) => file.type.startsWith("image/") || file.type === "video/mp4" || file.type === "video/webm",
    "Selecione uma imagem, um vídeo MP4 ou um vídeo WebM.",
  );
