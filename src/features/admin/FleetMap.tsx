import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { sampleData } from '../../data/sampleData';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Select from '../../components/Select';
import type { Driver, FleetDeliveryStatus, Vehicle, VehicleLocation } from '../../types';
import { DELIVERY_STATUSES, REFRESH_TIME_MS } from '../../constants';

const MAPBOX_TOKEN = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '').trim();

const FleetMap = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapEl, setMapEl] = useState<HTMLDivElement | null>(null);

  const allLocations = useMemo(() => sampleData.vehicleLocations as VehicleLocation[], []);
  const vehicles = useMemo(() => sampleData.vehicles as Vehicle[], []);
  const drivers = useMemo(() => sampleData.drivers as Driver[], []);

  const [driverId, setDriverId] = useState('all');
  const [vehicleId, setVehicleId] = useState('all');
  const [deliveryStatus, setDeliveryStatus] = useState<'all' | FleetDeliveryStatus>('all');
  const [refreshTick, setRefreshTick] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());

  const filtered = useMemo(() => {
    return allLocations.filter((loc) => {
      if (driverId !== 'all' && loc.driverId !== driverId) return false;
      if (vehicleId !== 'all' && loc.vehicleId !== vehicleId) return false;
      if (deliveryStatus !== 'all' && loc.deliveryStatus !== deliveryStatus) return false;
      return true;
    });
  }, [allLocations, driverId, vehicleId, deliveryStatus]);

  const driverOptions = useMemo(
    () => [
      { value: 'all', label: 'All drivers' },
      ...drivers
        .filter((d) => d.active !== false)
        .map((d) => ({ value: d.id, label: d.name })),
    ],
    [drivers],
  );

  const vehicleOptions = useMemo(
    () => [
      { value: 'all', label: 'All vehicles' },
      ...vehicles.map((v) => ({ value: v.id, label: `${v.registration} (${v.id})` })),
    ],
    [vehicles],
  );

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'All statuses' },
      ...DELIVERY_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
    ],
    [],
  );

  const bumpRefresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
    setLastRefreshedAt(new Date());
  }, []);

  useEffect(() => {
    const id = window.setInterval(bumpRefresh, REFRESH_TIME_MS);
    return () => window.clearInterval(id);
  }, [bumpRefresh]);

  useLayoutEffect(() => {
    if (!MAPBOX_TOKEN || !mapEl) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapEl,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-95.35, 29.75],
      zoom: 9,
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    const onWinResize = () => map.resize();
    window.addEventListener('resize', onWinResize);

    map.on('load', () => {
      map.resize();
      requestAnimationFrame(() => map.resize());
      setMapReady(true);
    });

    if (import.meta.env.DEV) {
      map.on('error', (e) => console.error('[FleetMap]', e));
    }

    return () => {
      window.removeEventListener('resize', onWinResize);
      mapRef.current = null;
      setMapReady(false);
      map.remove();
    };
  }, [MAPBOX_TOKEN, mapEl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    for (const loc of filtered) {
      const { lng, lat } = loc.coordinates;
      bounds.extend([lng, lat]);

      const el = document.createElement('button');
      el.type = 'button';
      el.className =
        'h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-violet-600 shadow-md ring-1 ring-black/20 dark:border-slate-900';

      const v = vehicles.find((x) => x.id === loc.vehicleId);
      const d = drivers.find((x) => x.id === loc.driverId);
      const status = loc.deliveryStatus.replace(/_/g, ' ');
      const popupHtml = `
        <div class="text-xs leading-snug" style="min-width:10rem">
          <div class="font-semibold text-slate-900">${v?.registration ?? loc.vehicleId}</div>
          <div class="text-slate-700">${d?.name ?? loc.driverId}</div>
          <div class="mt-1 text-slate-500">${status}</div>
          ${loc.speedKmh != null ? `<div class="mt-0.5 text-slate-600">${loc.speedKmh} km/h</div>` : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 14 }).setHTML(popupHtml))
        .addTo(map);
      markersRef.current.push(marker);
    }

    if (filtered.length > 0) {
      map.fitBounds(bounds, { padding: 56, maxZoom: 11, duration: 0 });
    }

    return () => {
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
    };
  }, [filtered, refreshTick, vehicles, drivers, mapReady]);

  const lastRefreshedLabel = useMemo(
    () =>
      lastRefreshedAt.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [lastRefreshedAt],
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <h1 className="my-4 text-xl font-semibold my-4">Fleet map</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Set <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">VITE_MAPBOX_ACCESS_TOKEN</code> in{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.env</code> at the project root, then restart{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">npm run dev</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="my-4 text-xl font-semibold my-4">Fleet map</h1>

      <div className="mb-3 flex flex-wrap items-end gap-3">
        <Select
          label="Driver"
          name="fm-driver"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          options={driverOptions}
          className="min-w-[160px] max-w-[220px]"
        />
        <Select
          label="Vehicle"
          name="fm-vehicle"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          options={vehicleOptions}
          className="min-w-[180px] max-w-[260px]"
        />
        <Select
          label="Delivery status"
          name="fm-status"
          value={deliveryStatus}
          onChange={(e) => setDeliveryStatus(e.target.value as FleetDeliveryStatus)}
          options={statusOptions}
          className="min-w-[160px] max-w-[200px]"
        />
        <Button type="button" onClick={bumpRefresh}>
          Refresh
        </Button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 my-4">
        Last updated: {lastRefreshedLabel}
      </p>

      {/* Fixed height so Mapbox always gets a non-zero container (absolute children need parent height). */}
      <div
        className="relative w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
        style={{ height: 'min(70vh, 560px)' }}
      >
        <div
          ref={setMapEl}
          className="absolute inset-0 z-0 min-h-[200px] w-full"
          style={{ width: '100%', height: '100%' }}
        />
        {!mapReady ? (
          <Loading
            label="Loading map…"
            className="pointer-events-none absolute inset-0 z-10 gap-3 rounded-lg bg-slate-100/90 dark:bg-slate-900/90"
          />
        ) : null}
      </div>
    </div>
  );
};

export default FleetMap;
