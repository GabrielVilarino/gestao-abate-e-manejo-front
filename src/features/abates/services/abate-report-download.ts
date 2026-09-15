export function downloadAbateReport(blob: Blob, fileName: string) {
  if (blob.size === 0) throw new Error("O relatório retornado está vazio.");
  if (blob.type && !blob.type.includes("pdf")) {
    throw new Error("O servidor não retornou um arquivo PDF válido.");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
