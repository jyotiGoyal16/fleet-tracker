import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { sampleData } from '../../data/sampleData';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import type { HubTerminal, Order } from '../../types';

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '';

const DRIVER_ID = 'driver-4';
const TODAY = '2026-04-05';

const DriverMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const didFitRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const shift = useMemo(
    () => sampleData.driverShifts.find((s) => s.driverId === DRIVER_ID && s.date === TODAY),
    [],
  );

  const [pos, setPos] = useState(() => {
    const vid =
      shift?.vehicleId ??
      sampleData.vehicleAllocations.find((a) => a.driverId === DRIVER_ID && a.date === TODAY)
        ?.vehicleId;
    const loc = sampleData.vehicleLocations.find((l) => l.vehicleId === vid);
    return loc
      ? { lng: loc.coordinates.lng, lat: loc.coordinates.lat }
      : { lng: -95.35, lat: 29.75 };
  });

  const hubs = useMemo(() => sampleData.hubTerminals as HubTerminal[], []);

  const destStops = useMemo(() => {
    if (!shift) return [] as { lng: number; lat: number; label: string }[];
    const out: { lng: number; lat: number; label: string }[] = [];
    for (const oid of shift.orderIds) {
      const o = (sampleData.orders as Order[]).find((x) => x.id === oid);
      if (!o) continue;
      const h = hubs.find((t) => t.id === o.destinationId);
      if (h) out.push({ lng: h.coordinates.lng, lat: h.coordinates.lat, label: h.name });
    }
    return out;
  }, [shift, hubs]);

  const routeCoords = useMemo(() => {
    const line: [number, number][] = [[pos.lng, pos.lat]];
    for (const d of destStops) line.push([d.lng, d.lat]);
    return line.length >= 2 ? line : [line[0], line[0]];
  }, [pos, destStops]);

  useEffect(() => {
    if (!TOKEN || !containerRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-95.35, 29.75],
      zoom: 10,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;
    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [-95.35, 29.75],
              [-95.35, 29.75],
            ],
          },
        },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#7c3aed', 'line-width': 3, 'line-opacity': 0.85 },
      });
      setMapReady(true);
    });
    return () => {
      mapRef.current = null;
      setMapReady(false);
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    const driverEl = document.createElement('div');
    driverEl.className =
      'h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md ring-1 ring-black/20';
    markersRef.current.push(
      new mapboxgl.Marker({ element: driverEl }).setLngLat([pos.lng, pos.lat]).addTo(map),
    );

    for (const d of destStops) {
      const el = document.createElement('div');
      el.className =
        'h-3 w-3 rounded-sm border-2 border-white bg-amber-500 shadow ring-1 ring-black/20';
      markersRef.current.push(
        new mapboxgl.Marker({ element: el }).setLngLat([d.lng, d.lat]).addTo(map),
      );
    }

    const src = map.getSource('route') as mapboxgl.GeoJSONSource | undefined;
    src?.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: routeCoords },
    });

    if (!didFitRef.current && routeCoords.length >= 2) {
      const b = new mapboxgl.LngLatBounds();
      routeCoords.forEach(([lng, lat]) => b.extend([lng, lat]));
      map.fitBounds(b, { padding: 56, maxZoom: 12, duration: 0 });
      didFitRef.current = true;
    }

    return () => {
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
    };
  }, [mapReady, pos, destStops, routeCoords]);

  function sendGpsUpdate() {
    setPos((p) => ({
      lng: p.lng + (Math.random() - 0.5) * 0.003,
      lat: p.lat + (Math.random() - 0.5) * 0.003,
    }));
    setLastSent(new Date().toLocaleTimeString());
  }

  if (!TOKEN) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-sm text-slate-600 dark:text-slate-400">
        <p className="font-medium text-slate-900 dark:text-slate-100">Driver map</p>
        <p className="mt-2">Set VITE_MAPBOX_ACCESS_TOKEN in .env and restart the dev server.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-xl font-semibold my-4">Live map</h1>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={sendGpsUpdate}>
          Send GPS update
        </Button>
        {lastSent ? (
          <span className="text-xs text-slate-500">Last sent: {lastSent}</span>
        ) : null}
      </div>
      <div className="relative h-[min(55vh,420px)] w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <div ref={containerRef} className="absolute inset-0" />
        {!mapReady ? (
          <Loading
            label="Loading map…"
            className="absolute inset-0 z-10 gap-3 rounded-lg bg-slate-100/90 dark:bg-slate-900/90"
          />
        ) : null}
      </div>
    </div>
  );
};

export default DriverMap;
