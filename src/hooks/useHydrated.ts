import { useEffect, useState } from "react";

/** True once the client has hydrated — use before reading browser-only state. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
