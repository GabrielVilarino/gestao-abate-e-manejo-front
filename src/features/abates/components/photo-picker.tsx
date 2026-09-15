"use client";

import { Camera, Images, LoaderCircle, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type PhotoPickerProps = {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
  disabled?: boolean;
};

export function PhotoPicker({ label, files, onChange, error, disabled }: PhotoPickerProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [cameraError, setCameraError] = useState("");
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (!cameraOpen) return;
    let active = true;

    async function startCamera() {
      await Promise.resolve();
      if (!active) return;
      setIsStartingCamera(true);
      setCameraError("");
      stopCamera();

      if (!window.isSecureContext) {
        setCameraError("A câmera só pode ser usada em uma conexão segura (HTTPS) ou no localhost.");
        setIsStartingCamera(false);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Este navegador não oferece acesso direto à câmera.");
        setIsStartingCamera(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (cameraAccessError) {
        stopCamera();
        if (active) setCameraError(getCameraErrorMessage(cameraAccessError));
      } finally {
        if (active) setIsStartingCamera(false);
      }
    }

    void startCamera();
    return () => {
      active = false;
      stopCamera();
    };
  }, [cameraAttempt, cameraOpen, stopCamera]);

  function appendFiles(selectedFiles: FileList | null) {
    onChange([...files, ...Array.from(selectedFiles ?? [])]);
  }

  function openCamera() {
    setCameraError("");
    setCameraAttempt((attempt) => attempt + 1);
    setCameraOpen(true);
  }

  function handleCameraOpenChange(open: boolean) {
    if (!open && isCapturing) return;
    if (!open) {
      stopCamera();
      setCameraError("");
      setIsStartingCamera(false);
    }
    setCameraOpen(open);
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("A imagem da câmera ainda não está pronta. Aguarde um instante e tente novamente.");
      return;
    }

    setIsCapturing(true);
    setCameraError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Não foi possível preparar a captura da foto.");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) throw new Error("Não foi possível gerar a foto capturada.");

      const timestamp = new Date().toISOString().replaceAll(":", "-");
      const photo = new File([blob], `foto-${timestamp}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      onChange([...files, photo]);
      stopCamera();
      setCameraOpen(false);
      setIsStartingCamera(false);
    } catch (captureError) {
      setCameraError(captureError instanceof Error ? captureError.message : "Não foi possível capturar a foto.");
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="sr-only"
        onChange={(event) => {
          appendFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" className="h-10" disabled={disabled} onClick={() => fileInputRef.current?.click()}>
          <Images className="size-4" /> Selecionar fotos
        </Button>
        <Button type="button" variant="outline" className="h-10" disabled={disabled} onClick={openCamera}>
          <Camera className="size-4" /> Tirar foto
        </Button>
      </div>
      <p className="text-xs text-zinc-500">Imagens de até 10 MiB cada.</p>
      {error ? <p id={errorId} className="text-sm text-red-600">{error}</p> : null}
      {files.length ? (
        <ul className="space-y-1 rounded-lg bg-zinc-50 p-2 text-sm text-zinc-600">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-2">
              <Camera className="size-4 shrink-0 text-orange-500" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              {!disabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remover ${file.name}`}
                  onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
                >
                  <X className="size-3" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={cameraOpen} onOpenChange={handleCameraOpenChange}>
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-xl" showCloseButton={!isCapturing}>
          <DialogHeader>
            <DialogTitle>Tirar foto</DialogTitle>
            <DialogDescription>Autorize o acesso à câmera e enquadre a imagem antes de capturar.</DialogDescription>
          </DialogHeader>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-950">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Pré-visualização da câmera"
              className="size-full object-contain"
            />
            {isStartingCamera ? (
              <div role="status" className="absolute inset-0 grid place-items-center bg-zinc-950/80 text-sm text-white">
                <span className="flex items-center gap-2"><LoaderCircle className="size-5 animate-spin" /> Iniciando câmera...</span>
              </div>
            ) : null}
          </div>

          {cameraError ? (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível acessar a câmera</AlertTitle>
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="h-10" disabled={isCapturing} onClick={() => handleCameraOpenChange(false)}>Cancelar</Button>
            {cameraError ? (
              <Button type="button" className="h-10" disabled={isStartingCamera || isCapturing} onClick={() => setCameraAttempt((attempt) => attempt + 1)}>
                <RefreshCw className="size-4" /> Tentar novamente
              </Button>
            ) : (
              <Button type="button" className="h-10" disabled={isStartingCamera || isCapturing} onClick={() => void capturePhoto()}>
                {isCapturing ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />}
                {isCapturing ? "Capturando..." : "Capturar foto"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getCameraErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "O acesso à câmera foi negado. Autorize a câmera nas permissões do navegador e tente novamente.";
    }
    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return "Nenhuma câmera compatível foi encontrada neste dispositivo.";
    }
    if (error.name === "NotReadableError" || error.name === "AbortError") {
      return "A câmera está indisponível ou sendo usada por outro aplicativo.";
    }
  }
  return "Não foi possível iniciar a câmera. Verifique as permissões do navegador e tente novamente.";
}
