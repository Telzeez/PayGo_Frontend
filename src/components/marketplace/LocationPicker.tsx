"use client";

import { useEffect, useRef, useState } from "react";

type SearchResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

type Props = {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
};

declare global {
  interface Window {
    L?: any;
  }
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

export default function LocationPicker({ latitude, longitude, onChange }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const [place, setPlace] = useState("Finding the selected place…");
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const accuracyCircle = useRef<any>(null);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!document.querySelector('link[data-paygo-leaflet="true"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = LEAFLET_CSS;
        link.dataset.paygoLeaflet = "true";
        document.head.appendChild(link);
      }
      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>('script[data-paygo-leaflet="true"]');
          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Map library failed to load")), { once: true });
            if (window.L) resolve();
            return;
          }
          const script = document.createElement("script");
          script.src = LEAFLET_JS;
          script.async = true;
          script.dataset.paygoLeaflet = "true";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Map library failed to load"));
          document.body.appendChild(script);
        });
      }
      if (cancelled || !mapElement.current || !window.L || map.current) return;
      const L = window.L;
      map.current = L.map(mapElement.current, { scrollWheelZoom: true }).setView([latitude, longitude], 17);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map.current);
      marker.current = L.marker([latitude, longitude], { draggable: true }).addTo(map.current);
      marker.current.on("dragend", () => {
        const point = marker.current.getLatLng();
        onChangeRef.current(point.lat, point.lng);
      });
      map.current.on("click", (event: any) => {
        marker.current.setLatLng(event.latlng);
        onChangeRef.current(event.latlng.lat, event.latlng.lng);
      });
      setMapReady(true);
    };
    load().catch(() => setPlace("Map could not load. Check your internet connection and try again."));
    return () => {
      cancelled = true;
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, []);

  // Reverse-geocode after the user finishes moving the pin, rather than on every map movement.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setPlace("Finding the selected place…");
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
        signal: controller.signal,
      })
        .then((response) => response.ok ? response.json() : Promise.reject())
        .then((data) => {
          if (!active) return;
          const a = data.address || {};
          const exact = [a.house_number, a.road || a.pedestrian || a.residential, a.neighbourhood || a.suburb || a.village || a.town || a.city_district, a.city || a.town || a.city_district, a.state].filter(Boolean);
          setPlace(exact.length ? [...new Set(exact)].join(", ") : data.display_name || "Selected map location");
        })
        .catch((error) => {
          if (active && error.name !== "AbortError") setPlace("Selected map pin");
        });
    }, 1000);
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [latitude, longitude]);

  const getCurrentCoordinates = () => {
    if (!navigator.geolocation) {
      setGpsError("This browser does not support device location. Search for your area and position the pin manually.");
      return;
    }

    setLocating(true);
    setGpsError("");
    setGpsAccuracy(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        setGpsAccuracy(accuracy);
        setLocating(false);
        marker.current?.setLatLng([lat, lng]);
        map.current?.setView([lat, lng], 19);
        if (map.current && window.L) {
          if (accuracyCircle.current) accuracyCircle.current.remove();
          accuracyCircle.current = window.L.circle([lat, lng], {
            radius: accuracy,
            color: "#2563eb",
            fillColor: "#3b82f6",
            fillOpacity: 0.12,
            weight: 1,
          }).addTo(map.current);
        }
        onChangeRef.current(lat, lng);
      },
      (error) => {
        setLocating(false);
        setGpsError(error.code === 1
          ? "Location permission was denied. Allow location access in your browser settings, or search for your address instead."
          : error.code === 2
            ? "Your device could not determine its location. Turn on GPS/location services or search for your address."
            : "Getting your location timed out. Try again outdoors or search for your address.");
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
    );
  };

  const searchPlaces = async (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearching(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const params = new URLSearchParams({
        q: query,
        format: "jsonv2",
        addressdetails: "1",
        limit: "5",
        countrycodes: "ng",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      if (!response.ok) throw new Error("Place search is temporarily unavailable.");
      const results = await response.json() as SearchResult[];
      if (!results.length) {
        setSearchError("No matching place found. Try adding the area, city or state.");
      } else {
        setSearchResults(results);
      }
    } catch (error: any) {
      setSearchError(error.message || "Could not search for that place. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result: SearchResult) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setSearchQuery(result.display_name);
    setSearchResults([]);
    setSearchError("");
    marker.current?.setLatLng([lat, lng]);
    map.current?.setView([lat, lng], 18);
    onChangeRef.current(lat, lng);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
        <button type="button" onClick={getCurrentCoordinates} disabled={locating} className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
          {locating ? "Getting your coordinates…" : "Use my current location"}
        </button>
        {gpsAccuracy !== null && (
          <p className="mt-2 text-xs text-blue-900 dark:text-blue-200">
            GPS estimate: ±{Math.round(gpsAccuracy)} metres. The blue circle shows the estimated accuracy area. Move the pin onto your exact premises if needed.
          </p>
        )}
        {gpsError && <p role="status" className="mt-2 text-xs text-red-700 dark:text-red-300">{gpsError}</p>}
      </div>
      <form onSubmit={searchPlaces} className="space-y-2">
        <label htmlFor="paygo-location-search" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Search for your area or address</label>
        <div className="flex gap-2">
          <input
            id="paygo-location-search"
            value={searchQuery}
            onChange={(event) => { setSearchQuery(event.target.value); setSearchResults([]); setSearchError(""); }}
            placeholder="e.g. Bodija, Ibadan, Oyo State"
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          />
          <button type="submit" disabled={searching || !searchQuery.trim()} className="rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
        {searchError && <p role="status" className="text-xs text-amber-700 dark:text-amber-400">{searchError}</p>}
        {searchResults.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            {searchResults.map((result) => (
              <button key={result.place_id} type="button" onClick={() => selectSearchResult(result)} className="block w-full border-b border-zinc-100 px-3 py-2.5 text-left text-xs text-zinc-700 last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900">
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </form>
      <div ref={mapElement} className="h-72 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700" aria-label="Map for selecting your exact location" />
      {!mapReady && <p className="text-xs text-zinc-500">Loading map…</p>}
      <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Selected location</p>
        <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">{place}</p>
        <p className="mt-1 font-mono text-[10px] text-zinc-500">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
      </div>
      <p className="text-[11px] text-zinc-500">GPS accuracy depends on your device and surroundings. Use the current-location button for a fresh GPS estimate, or search for your area. Then zoom in and move the pin onto the exact premises before confirming.</p>
    </div>
  );
}
