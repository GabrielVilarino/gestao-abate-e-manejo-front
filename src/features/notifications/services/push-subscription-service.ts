import { normalizePushSubscription } from "@/features/notifications/schemas/push-subscription-schema";
import type { CreatePushSubscriptionResponse } from "@/features/notifications/types/push-subscription";
import { apiFetch } from "@/lib/api-client";

export const pushSubscriptionService = {
  save(subscription: PushSubscription) {
    return apiFetch<CreatePushSubscriptionResponse>("/v1/push/subscriptions", {
      method: "POST",
      body: JSON.stringify(normalizePushSubscription(subscription)),
    });
  },
  async unsubscribeFromBrowser() {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
  },
};
