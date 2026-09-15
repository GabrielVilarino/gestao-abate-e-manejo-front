"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, LoaderCircle, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AbateGeneralFields } from "@/features/abates/components/abate-general-fields";
import { EtapaFazendaFields } from "@/features/abates/components/etapa-fazenda-fields";
import { EtapaFrigorificoFields } from "@/features/abates/components/etapa-frigorifico-fields";
import { abateSchema, type AbateFormData } from "@/features/abates/schemas/abate-schema";
import { abateService } from "@/features/abates/services/abate-service";
import type { FotoEtapa } from "@/features/abates/types/abate";
import { getErrorMessage } from "@/lib/api-client";

const defaultValues: AbateFormData = {
  proprietario_id: 0,
  fazenda_id: 0,
  data_abate: "",
  numero_lote: "",
  nome_frigorifico: "",
  distancia_frigorifico: "",
  categoria_animal: "",
  preco_funrural: "",
  preco_sem_funrural: "",
  incluir_etapa_fazenda: false,
  peso_total_fazenda: "",
  quantidade_animal: [],
  fotos_fazenda: [],
  incluir_etapa_frigorifico: false,
  peso_total_frigorifico: "",
  balancao: "",
  acabamento_carcaca: [],
  classificacao_frigorifico: [],
  distribuicao_peso: [],
  fotos_frigorifico: [],
};

type AbateFormProps = {
  onSuccess: (message: string) => void;
  onCancel: () => void;
  onLockChange: (locked: boolean) => void;
};

type PendingPhoto = { file: File; etapa: FotoEtapa };
type PhotoUploadResult = PendingPhoto & (
  | { success: true }
  | { success: false; error: string }
);

export function AbateForm({ onSuccess, onCancel, onLockChange }: AbateFormProps) {
  const [serverError, setServerError] = useState("");
  const [createdId, setCreatedId] = useState<number>();
  const [createdMessage, setCreatedMessage] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AbateFormData>({ resolver: zodResolver(abateSchema), defaultValues });
  const includeFarmStage = useWatch({ control, name: "incluir_etapa_fazenda" });
  const includePlantStage = useWatch({ control, name: "incluir_etapa_frigorifico" });
  const farmPhotos = useWatch({ control, name: "fotos_fazenda" });
  const plantPhotos = useWatch({ control, name: "fotos_frigorifico" });
  const hasPendingPhotos = farmPhotos.length + plantPhotos.length > 0;
  const locked = isSubmitting || Boolean(createdId && hasPendingPhotos);
  const farmStageField = register("incluir_etapa_fazenda");
  const plantStageField = register("incluir_etapa_frigorifico");

  useEffect(() => {
    onLockChange(locked);
  }, [locked, onLockChange]);

  async function uploadPhotos(id: number, photos: PendingPhoto[]) {
    const results: PhotoUploadResult[] = [];
    for (const photo of photos) {
      try {
        await abateService.uploadPhoto(id, photo.etapa, photo.file);
        results.push({ ...photo, success: true });
      } catch (error) {
        results.push({ ...photo, success: false, error: getErrorMessage(error) });
      }
    }
    return results;
  }

  async function submit(data: AbateFormData) {
    setServerError("");
    try {
      let id = createdId;
      let message = createdMessage;
      if (!id) {
        const response = await abateService.create(data);
        id = response.id;
        message = response.message || "Abate criado com sucesso.";
        setCreatedId(id);
        setCreatedMessage(message);
      }

      const photos: PendingPhoto[] = [
        ...data.fotos_fazenda.map((file) => ({ file, etapa: "FAZENDA" as const })),
        ...data.fotos_frigorifico.map((file) => ({ file, etapa: "FRIGORIFICO" as const })),
      ];

      if (!photos.length) {
        finish(message);
        return;
      }

      const results = await uploadPhotos(id, photos);
      const failedFarm = results.filter((result) => !result.success && result.etapa === "FAZENDA").map((result) => result.file);
      const failedPlant = results.filter((result) => !result.success && result.etapa === "FRIGORIFICO").map((result) => result.file);
      const succeeded = results.length - failedFarm.length - failedPlant.length;
      setUploadedCount((current) => current + succeeded);
      setValue("fotos_fazenda", failedFarm, { shouldValidate: true });
      setValue("fotos_frigorifico", failedPlant, { shouldValidate: true });

      if (failedFarm.length || failedPlant.length) {
        const firstFailure = results.find((result) => !result.success);
        setServerError(
          `O abate #${id} foi criado, mas ${failedFarm.length + failedPlant.length} foto(s) não foram enviadas. ${firstFailure && !firstFailure.success ? firstFailure.error : "Tente novamente."}`,
        );
        return;
      }

      finish(`${message} ${uploadedCount + succeeded} foto(s) enviada(s).`);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  function finish(message: string) {
    reset(defaultValues);
    setCreatedId(undefined);
    setCreatedMessage("");
    setUploadedCount(0);
    onLockChange(false);
    onSuccess(message);
  }

  function cancel() {
    reset(defaultValues);
    setServerError("");
    onCancel();
  }

  function abandonPendingPhotos() {
    if (!createdId) return;
    finish(`Abate #${createdId} criado. As fotos pendentes não foram enviadas.`);
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(submit)} noValidate>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
        {createdId ? (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle />
            <AlertTitle>Abate #{createdId} já foi criado</AlertTitle>
            <AlertDescription>Os dados não serão cadastrados novamente. A próxima tentativa enviará somente as fotos que continuam pendentes.</AlertDescription>
          </Alert>
        ) : null}

        <fieldset disabled={Boolean(createdId) || isSubmitting} className="space-y-5 disabled:opacity-70">
          <AbateGeneralFields control={control} register={register} setValue={setValue} clearErrors={clearErrors} errors={errors} />

          <section className="space-y-3 rounded-2xl bg-zinc-50 p-4 sm:p-5">
            <div>
              <h3 className="font-semibold text-zinc-950">Etapas do abate</h3>
              <p className="mt-1 text-sm text-zinc-500">São opcionais e podem ser incluídas junto com os dados gerais.</p>
            </div>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 py-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-orange-600"
                {...farmStageField}
                onChange={(event) => {
                  void farmStageField.onChange(event);
                  if (!event.target.checked) setValue("fotos_fazenda", []);
                }}
              />
              Incluir etapa na fazenda
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 py-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-orange-600"
                {...plantStageField}
                onChange={(event) => {
                  void plantStageField.onChange(event);
                  if (!event.target.checked) setValue("fotos_frigorifico", []);
                }}
              />
              Incluir etapa no frigorífico
            </label>
          </section>

          {includeFarmStage ? <EtapaFazendaFields control={control} register={register} setValue={setValue} errors={errors} disabled={isSubmitting || Boolean(createdId)} /> : null}
          {includePlantStage ? <EtapaFrigorificoFields control={control} register={register} setValue={setValue} errors={errors} disabled={isSubmitting || Boolean(createdId)} /> : null}
        </fieldset>

        {serverError ? <Alert variant="destructive"><AlertTitle>Não foi possível concluir o envio</AlertTitle><AlertDescription>{serverError}</AlertDescription></Alert> : null}
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-zinc-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
        {createdId && hasPendingPhotos ? (
          <Button type="button" variant="ghost" onClick={abandonPendingPhotos} disabled={isSubmitting} className="h-10">Fechar sem enviar fotos</Button>
        ) : (
          <Button type="button" variant="outline" onClick={cancel} disabled={isSubmitting} className="h-10">Cancelar</Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="h-10">
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : createdId ? <Upload className="size-4" /> : null}
          {isSubmitting ? (createdId ? "Enviando fotos..." : "Salvando...") : createdId ? "Tentar enviar fotos novamente" : "Salvar abate"}
        </Button>
      </div>
    </form>
  );
}
