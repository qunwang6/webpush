const pushServerPublicKey = "BDx3ZmI_BsHXE_ulMdumvCJKBl4coa_fFAWPMLD2TCzuUiHWBDdhXRlkoxXxSq51Zwq3XKB4zETpKNEW4yJpZfA"

const pushNotificationSuported = isPushNotificationSupported();

const pushNotificationConsentSpan = document.getElementById("push-notification-consent");
const pushNotificationSupportedSpan = document.getElementById("push-notification-supported");
pushNotificationSupportedSpan.innerHTML = pushNotificationSuported;

const askUserPemissionButton = document.getElementById("ask-user-permission-button");
askUserPemissionButton.addEventListener("click", askUserPermission);

const susbribeToPushNotificationButton = document.getElementById("create-notification-subscription-button");
susbribeToPushNotificationButton.addEventListener("click", susbribeToPushNotification);

const sendPushNotificationButton = document.getElementById("send-push-notification-button");
sendPushNotificationButton.addEventListener("click", sendNotification);

navigator.serviceWorker.addEventListener("message", (event) => {
  let wn = document.getElementById("web-notification");
  wn.innerHTML = event.data;
});

if (pushNotificationSuported) {
  updateUserConsent(Notification.permission);
  askUserPemissionButton.disabled = false;

  await navigator.serviceWorker.register("sw.js");

  let subscrition = await getUserSubscription();
  if (subscrition) {
    showUserSubscription(subscrition);
  }
}

function updateUserConsent(userConsent) {
  pushNotificationConsentSpan.innerHTML = userConsent;
  if (userConsent === "granted") {
    sendPushNotificationButton.disabled = false;
    susbribeToPushNotificationButton.disabled = false;
  } else {
    sendPushNotificationButton.disabled = true;
    susbribeToPushNotificationButton.disabled = true;
  }
}

async function askUserPermission() {
  let r = await Notification.requestPermission();
  updateUserConsent(r)
}

async function susbribeToPushNotification() {
  let s = await createNotificationSubscription();
  showUserSubscription(s);
}

function showUserSubscription(subscrition) {
  document.getElementById("user-susbription").value = JSON.stringify(subscrition, null, " ");
}

function isPushNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

async function sendNotification(event) {
  event.preventDefault();

  let subscrition = await getUserSubscription();

  let p = new URLSearchParams();

  let f = document.getElementById("send-push-form")

  for (let e of f.elements) {
    if (e.type.startsWith("text")) {
      p.set(e.name, e.value);
    }
  }

  p.set("subs", document.getElementById("user-susbription").value);

  let resp = await fetch("/+/push", {
    "method": "POST",
    "body": p,
  });
  console.log(resp);
}

function setBadge() {
  let b = localStorage.getItem('badge');
  b++;
  if (b > 10) b = 0;
  localStorage.setItem('badge', b);
  navigator.setAppBadge(b);
}

async function createNotificationSubscription() {
  let sw = await navigator.serviceWorker.ready;
  let s = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: pushServerPublicKey
  })
  console.log("User is subscribed.", s);
  return s;
}

async function getUserSubscription() {
  let sw = await navigator.serviceWorker.ready;
  let s = sw.pushManager.getSubscription();
  return s;
}
