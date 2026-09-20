import { z } from "zod";

export const pushSubscriptionSchema = z.object({
  endpoint: z.url(),
  expirationTime: z.number().int().nonnegative().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export type PushSubscriptionPayload = z.infer<typeof pushSubscriptionSchema>;

export function normalizePushSubscription(subscription: PushSubscription): PushSubscriptionPayload {
  const json = subscription.toJSON();

  return pushSubscriptionSchema.parse({
    endpoint: json.endpoint,
    ...(typeof json.expirationTime === "number" ? { expirationTime: json.expirationTime } : {}),
    keys: json.keys,
  });
}
