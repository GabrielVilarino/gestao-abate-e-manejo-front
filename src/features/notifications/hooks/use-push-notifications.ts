"use client";

import { useEffect, useRef, useState } from "react";

import { pushSubscriptionService } from "@/features/notifications/services/push-subscription-service";
import { getErrorMessage } from "@/lib/api-client";

type PushStatus = "loading" | "install-required" | "unsupported" | "unconfigured" | "needs-consent" | "denied" | "saving" | "enabled" | "error";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function decodeVapidPublicKey(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.padEnd(Math.ceil(value.length / 4) * 4, "=");
  const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(decoded.length);

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return bytes;
}

async function createSubscription(registration: ServiceWorkerRegistration) {
  if (!vapidPublicKey) {
    throw new Error("A chave pública das notificações não está configurada.");
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeVapidPublicKey(vapidPublicKey),
  });
}

export function usePushNotifications(disabled: boolean) {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [status, setStatus] = useState<PushStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (disabled) return;

    let active = true;

    async function initialize() {
      const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;

      if (isIos && !isStandalone) {
        setStatus("install-required");
        return;
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setStatus("unsupported");
        return;
      }

      try {
        await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
        const registration = await navigator.serviceWorker.ready;
        registrationRef.current = registration;
        const existingSubscription = await registration.pushManager.getSubscription();

        if (!active) return;

        if (Notification.permission === "denied") {
          setStatus("denied");
          return;
        }

        if (existingSubscription) {
          await pushSubscriptionService.save(existingSubscription);
        } else if (Notification.permission === "granted") {
          const subscription = await createSubscription(registration);
          if (!active) {
            await subscription.unsubscribe();
            return;
          }
          await pushSubscriptionService.save(subscription);
        } else {
          setStatus(vapidPublicKey ? "needs-consent" : "unconfigured");
          return;
        }

        if (active) setStatus("enabled");
      } catch (caught) {
        if (active) {
          setError(getErrorMessage(caught));
          setStatus("error");
        }
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, [disabled]);

  async function enable() {
    if (disabled || !registrationRef.current || status === "saving") return;

    setStatus("saving");
    setError("");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "needs-consent");
        return;
      }

      const subscription =
        (await registrationRef.current.pushManager.getSubscription()) ??
        (await createSubscription(registrationRef.current));
      await pushSubscriptionService.save(subscription);
      setStatus("enabled");
    } catch (caught) {
      setError(getErrorMessage(caught));
      setStatus("error");
    }
  }

  return { status, error, enable };
}
