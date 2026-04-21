const LS_KEY = "lms_notifications_dismissed_keys";

function loadKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveKeys(keys: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify([...keys]));
}

export function getDismissedNotificationKeys(): Set<string> {
  return loadKeys();
}

export function dismissNotificationKey(key: string) {
  const s = loadKeys();
  s.add(key);
  saveKeys(s);
}

/** Remove one key (e.g. when server state shows no unread messages anymore). */
export function clearDismissedNotificationKey(key: string) {
  const s = loadKeys();
  s.delete(key);
  saveKeys(s);
}

export function clearDismissedNotificationKeys() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LS_KEY);
}
