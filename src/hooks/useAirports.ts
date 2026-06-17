import { useEffect, useState } from "react";
import { getAirports } from "../core/api";
import type { Airport } from "../core/types";

// Module-level cache so the (large, hour-cached) airports list is fetched once.
let cache: Airport[] | null = null;
let inflight: Promise<Airport[]> | null = null;

function load(): Promise<Airport[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getAirports()
      .then((data) => {
        cache = data;
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useAirports() {
  const [airports, setAirports] = useState<Airport[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (cache) return;
    setLoading(true);
    load()
      .then((data) => active && setAirports(data))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { airports, loading, error };
}
