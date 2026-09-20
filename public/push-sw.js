self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { body: event.data.text() };
  }

  const message = payload && typeof payload === "object" ? payload : {};
  const title = typeof message.title === "string" && message.title ? message.title : "TecNutre";
  const body = typeof message.body === "string" ? message.body : "Você tem uma nova notificação.";
  const url = typeof message.url === "string" && message.url.startsWith("/") && !message.url.startsWith("//")
    ? message.url
    : "/home";

  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: "/icon-mobile.png",
    data: { url },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = event.notification.data?.url || "/home";
  const target = new URL(path, self.location.origin);
  if (target.origin !== self.location.origin) return;

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);

    if (existing) {
      await existing.navigate(target.href);
      await existing.focus();
    } else {
      await clients.openWindow(target.href);
    }
  })());
});
