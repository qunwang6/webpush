function receivePushNotification(event) {
  console.log("[Service Worker] Push Received.");

  const { title, body, data } = event.data.json();

  const options = {
    body: body,
    data: data, 
  };

  event.waitUntil(self.registration.showNotification(title, options));
}

async function openPushNotification(event) {
  console.log("[Service Worker] Notification click Received.", event);

  event.notification.close();
  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window' });

    for (const client of allClients) {
      // if (!client.focused) {
      //   await client.focus().catch(e => { console.log(e) });
      // }
      client.postMessage(event.notification.data);
      return;
    }

    let url = event.target.registration.scope;
    let w = await clients.openWindow(url);
    w.postMessage(event.notification.data);
  })());
}

self.addEventListener("push", receivePushNotification);
self.addEventListener("notificationclick", openPushNotification);
