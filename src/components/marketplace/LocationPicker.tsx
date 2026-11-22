"use client";

import { useEffect, useRef, useState } from "react";

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
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (map.current && marker.current) {
      marker.current.setLatLng([latitude, longitude]);
      map.current.setView([latitude, longitude], Math.max(map.current.getZoom(), 16));
    }
    let active = true;
    setPlace("Finding the selected place…");
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (!active) return;
        const a = data.address || {};
        const exact = [a.house_number, a.road || a.pedestrian || a.residential, a.neighbourhood || a.suburb || a.village || a.town || a.city_district, a.city || a.town || a.city_district, a.state].filter(Boolean);
        setPlace(exact.length ? [...new Set(exact)].join(", ") : data.display_name || "Selected map location");
      })
      .catch(() => { if (active) setPlace("Selected map pin"); });
    return () => { active = false; };
  }, [latitude, longitude]);

  return (
    <div className="space-y-3">
      <div ref={mapElement} className="h-72 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700" aria-label="Map for selecting your exact location" />
      {!mapReady && <p className="text-xs text-zinc-500">Loading map…</p>}
      <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Selected location</p>
        <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">{place}</p>
        <p className="mt-1 font-mono text-[10px] text-zinc-500">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
      </div>
      <p className="text-[11px] text-zinc-500">Drag the pin or tap the map to place it exactly at the premises. Zoom in for greater accuracy.</p>
    </div>
  );
}
