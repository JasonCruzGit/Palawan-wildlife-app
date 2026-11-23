/** Cross-tab + polling sync for admin/community dashboards. */

export function subscribeLiveSync(
  onChange: () => void,
  storageKeys: string[],
  intervalMs = 4000
) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (e: StorageEvent) => {
    if (e.key && storageKeys.includes(e.key)) onChange();
  };

  const onVisible = () => {
    if (document.visibilityState === "visible") onChange();
  };

  const onFocus = () => onChange();

  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisible);

  const id = window.setInterval(() => {
    if (document.visibilityState === "visible") onChange();
  }, intervalMs);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisible);
    window.clearInterval(id);
  };
}
