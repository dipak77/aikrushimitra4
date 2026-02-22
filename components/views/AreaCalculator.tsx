import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import {
  RotateCcw, Undo2, MapPin, Layers, Crosshair, Plus, ArrowLeft,
  Ruler, ChevronDown, ChevronUp, Search, X, Navigation,
  CornerDownLeft, Maximize2, Minus, Triangle, Share2, Download, Copy, Check
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import clsx from 'clsx';
import L from 'leaflet';

// ═══════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════

interface GeoPoint {
  lat: number;
  lng: number;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

const TILE_LAYERS = {
  SATELLITE: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    label: 'Satellite',
  },
  STREET: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
    subdomains: 'abcd',
    label: 'Street',
  },
  TERRAIN: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    maxZoom: 17,
    subdomains: 'abc',
    label: 'Terrain',
  },
};

type MapType = keyof typeof TILE_LAYERS;

const EARTH_RADIUS = 6378137;

// ═══════════════════════════════════════════════════════════════
// AREA CALCULATION (Spherical Excess / Surveyor's Formula)
// ═══════════════════════════════════════════════════════════════

function calculatePolygonArea(pts: GeoPoint[]): number {
  if (pts.length < 3) return 0;
  const toRad = (d: number) => (d * Math.PI) / 180;
  let area = 0;
  const rPts = pts.map((p) => ({ lat: toRad(p.lat), lng: toRad(p.lng) }));
  for (let i = 0; i < rPts.length; i++) {
    const p1 = rPts[i];
    const p2 = rPts[(i + 1) % rPts.length];
    area += (p2.lng - p1.lng) * (2 + Math.sin(p1.lat) + Math.sin(p2.lat));
  }
  return Math.abs((area * EARTH_RADIUS * EARTH_RADIUS) / 2);
}

function calculatePerimeter(pts: GeoPoint[]): number {
  if (pts.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const R = EARTH_RADIUS;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    perimeter += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return perimeter;
}

// ═══════════════════════════════════════════════════════════════
// SEARCH HOOK
// ═══════════════════════════════════════════════════════════════

function useLocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=in`
        );
        const data: SearchResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return { query, results, loading, search, clear };
}

// ═══════════════════════════════════════════════════════════════
// UNIT DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════════

const UnitCard = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div
    className={clsx(
      'flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all',
      highlight
        ? 'bg-emerald-500/10 border-emerald-500/20'
        : 'bg-white/[0.03] border-white/[0.06]'
    )}
  >
    <span
      className={clsx(
        'text-[8px] font-bold uppercase tracking-[0.15em] mb-1',
        highlight ? 'text-emerald-400/70' : 'text-white/35'
      )}
    >
      {label}
    </span>
    <span
      className={clsx(
        'text-sm font-mono font-bold leading-none',
        highlight ? 'text-emerald-300' : 'text-white/90'
      )}
    >
      {value}
    </span>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const AreaCalculator = ({
  lang,
  onBack,
}: {
  lang: Language;
  onBack: () => void;
}) => {
  const t = TRANSLATIONS[lang];

  // ─── State ───
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [areaSqM, setAreaSqM] = useState(0);
  const [perimeter, setPerimeter] = useState(0);
  const [mapType, setMapType] = useState<MapType>('SATELLITE');
  const [isLocating, setIsLocating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMapTypes, setShowMapTypes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(15);

  // ─── Refs ───
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polygonRef = useRef<L.Polygon | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const locationMarkerRef = useRef<L.CircleMarker | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { query, results, loading, search, clear } = useLocationSearch();

  // ═══════════════════════════════════════════════════════════════
  // MAP INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 22,
      minZoom: 4,
      tap: true,
      touchZoom: true,
    }).setView([19.7515, 75.7139], 15);

    mapInstance.current = map;

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    applyTileLayer(map, 'SATELLITE');
    locateUser();

    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // DRAW POINTS / POLYGON ON MAP
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear previous drawings
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (points.length === 0) {
      setAreaSqM(0);
      setPerimeter(0);
      return;
    }

    const latLngs = points.map(
      (p) => [p.lat, p.lng] as [number, number]
    );

    // Draw polygon / polyline
    if (points.length >= 3) {
      polygonRef.current = L.polygon(latLngs, {
        color: '#34d399',
        weight: 2.5,
        opacity: 0.9,
        fillColor: '#059669',
        fillOpacity: 0.18,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    } else if (points.length >= 2) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#34d399',
        weight: 2.5,
        opacity: 0.7,
        dashArray: '8, 8',
        lineCap: 'round',
      }).addTo(map);
    }

    // Draw markers with distance labels
    points.forEach((p, i) => {
      const isFirst = i === 0;
      const isLast = i === points.length - 1;

      // Calculate distance from previous point
      let distLabel = '';
      if (i > 0) {
        const prev = points[i - 1];
        const R = EARTH_RADIUS;
        const dLat = ((p.lat - prev.lat) * Math.PI) / 180;
        const dLng = ((p.lng - prev.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((prev.lat * Math.PI) / 180) *
            Math.cos((p.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distLabel =
          dist >= 1000
            ? `${(dist / 1000).toFixed(2)} km`
            : `${dist.toFixed(1)} m`;
      }

      const markerColor = isFirst
        ? '#22c55e'
        : isLast
        ? '#f59e0b'
        : '#34d399';
      const markerBorder = isFirst
        ? '#166534'
        : isLast
        ? '#92400e'
        : '#065f46';

      const icon = L.divIcon({
        className: 'area-marker',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            ${isLast ? '<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(245,158,11,0.4);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
            <div style="
              width:${isFirst ? '16px' : '12px'};
              height:${isFirst ? '16px' : '12px'};
              background:${markerColor};
              border:2.5px solid ${markerBorder};
              border-radius:50%;
              box-shadow:0 0 0 3px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.4);
              display:flex;align-items:center;justify-content:center;
              font-size:7px;font-weight:900;color:white;
            ">${isFirst ? '1' : ''}</div>
            <div style="
              position:absolute;top:-22px;left:50%;transform:translateX(-50%);
              background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);
              padding:1px 6px;border-radius:6px;white-space:nowrap;
              font-size:9px;font-weight:700;color:white;
              border:1px solid rgba(255,255,255,0.1);
              ${i === 0 ? 'display:none;' : ''}
            ">${distLabel}</div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([p.lat, p.lng], {
        icon,
        draggable: true,
      }).addTo(map);

      // Enable drag to reposition
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setPoints((prev) =>
          prev.map((pt, idx) =>
            idx === i ? { lat: pos.lat, lng: pos.lng } : pt
          )
        );
      });

      markersRef.current.push(marker);
    });

    // Calculate
    const area = calculatePolygonArea(points);
    const perim = calculatePerimeter(points);
    setAreaSqM(area);
    setPerimeter(perim);
  }, [points]);

  // ═══════════════════════════════════════════════════════════════
  // MAP HELPERS
  // ═══════════════════════════════════════════════════════════════

  const applyTileLayer = (map: L.Map, type: MapType) => {
    if (tileLayerRef.current) tileLayerRef.current.remove();
    const cfg = TILE_LAYERS[type];
    tileLayerRef.current = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom,
      ...(('subdomains' in cfg) ? { subdomains: cfg.subdomains } : {}),
    }).addTo(map);
  };

  const locateUser = () => {
    if (!mapInstance.current) return;
    setIsLocating(true);
    triggerHaptic();

    mapInstance.current.locate({
      setView: true,
      maxZoom: 18,
      enableHighAccuracy: true,
    });

    mapInstance.current.once('locationfound', (e: L.LocationEvent) => {
      setIsLocating(false);
      if (locationMarkerRef.current) locationMarkerRef.current.remove();
      locationMarkerRef.current = L.circleMarker(e.latlng, {
        radius: 7,
        color: '#ffffff',
        fillColor: '#3b82f6',
        fillOpacity: 1,
        weight: 3,
      }).addTo(mapInstance.current!);

      // Accuracy circle
      L.circle(e.latlng, {
        radius: e.accuracy / 2,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
        weight: 1,
      }).addTo(mapInstance.current!);
    });

    mapInstance.current.once('locationerror', () => {
      setIsLocating(false);
    });
  };

  const handleAddPoint = () => {
    if (!mapInstance.current) return;
    const center = mapInstance.current.getCenter();
    setPoints((prev) => [...prev, { lat: center.lat, lng: center.lng }]);
    triggerHaptic('medium');
  };

  const handleUndo = () => {
    if (points.length === 0) return;
    setPoints((prev) => prev.slice(0, -1));
    triggerHaptic();
  };

  const handleReset = () => {
    setPoints([]);
    setShowResults(false);
    triggerHaptic();
  };

  const handleMapTypeChange = (type: MapType) => {
    if (!mapInstance.current) return;
    setMapType(type);
    applyTileLayer(mapInstance.current, type);
    setShowMapTypes(false);
    triggerHaptic();
  };

  const handleSearchSelect = (result: SearchResult) => {
    if (!mapInstance.current) return;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    mapInstance.current.setView([lat, lng], 17, { animate: true });
    clear();
    setShowSearch(false);
    triggerHaptic();
  };

  const handleZoom = (dir: 'in' | 'out') => {
    if (!mapInstance.current) return;
    if (dir === 'in') mapInstance.current.zoomIn();
    else mapInstance.current.zoomOut();
    triggerHaptic();
  };

  const handleFitBounds = () => {
    if (!mapInstance.current || points.length === 0) return;
    const bounds = L.latLngBounds(
      points.map((p) => [p.lat, p.lng] as [number, number])
    );
    mapInstance.current.fitBounds(bounds, { padding: [60, 60] });
    triggerHaptic();
  };

  const handleCopyResult = () => {
    const text = `Area: ${acre.toFixed(3)} Acre | ${guntha.toFixed(2)} Guntha | ${hectare.toFixed(4)} Hectare | ${sqMeter.toFixed(0)} Sq.m | Perimeter: ${perimeter >= 1000 ? (perimeter / 1000).toFixed(2) + ' km' : perimeter.toFixed(1) + ' m'}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    triggerHaptic();
  };

  // Conversions
  const sqMeter = areaSqM;
  const guntha = sqMeter / 101.17;
  const acre = sqMeter / 4046.86;
  const hectare = sqMeter / 10000;
  const bigha = sqMeter / 2529.28;

  const hasArea = points.length >= 3 && areaSqM > 0;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0f1a] flex flex-col h-[100dvh] w-full overflow-hidden select-none">
      {/* ═══ MAP ═══ */}
      <div className="absolute inset-0 z-0">
        <div ref={mapRef} className="w-full h-full bg-[#0a0f1a]" />
      </div>

      {/* ═══ CROSSHAIR ═══ */}
      <div className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none">
        <div className="relative">
          {/* Outer ring */}
          <div
            className="absolute -inset-4 rounded-full border border-white/20 transition-all duration-300"
            style={{
              transform: points.length === 0 ? 'scale(1.2)' : 'scale(1)',
              opacity: points.length === 0 ? 0.6 : 0.3,
            }}
          />
          {/* Crosshair lines */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50" />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50" />
            <div className="absolute top-1/2 -left-5 -translate-y-1/2 h-px w-3 bg-white/50" />
            <div className="absolute top-1/2 -right-5 -translate-y-1/2 h-px w-3 bg-white/50" />
          </div>
          {/* Center dot */}
          <div className="w-3 h-3 rounded-full border-2 border-white/80 bg-emerald-400/60 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
          {/* Pulse on idle */}
          {points.length === 0 && (
            <div className="absolute inset-[-6px] rounded-full border-2 border-emerald-400/30 animate-ping pointer-events-none" />
          )}
        </div>
      </div>

      {/* ═══ TOP BAR ═══ */}
      <div className="relative z-[20] shrink-0 px-3 sm:px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          {/* Back */}
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-xl border border-white/[0.08] text-white/80 flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <div
              className={clsx(
                'flex items-center gap-2 h-10 rounded-xl border backdrop-blur-xl transition-all',
                showSearch
                  ? 'bg-black/60 border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.1)]'
                  : 'bg-black/40 border-white/[0.08]'
              )}
            >
              <div className="pl-3 flex items-center">
                <Search
                  size={15}
                  className={clsx(
                    'transition-colors',
                    showSearch ? 'text-emerald-400' : 'text-white/40'
                  )}
                />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onFocus={() => setShowSearch(true)}
                onChange={(e) => search(e.target.value)}
                placeholder={
                  lang === 'mr'
                    ? 'गाव / शहर शोधा...'
                    : lang === 'hi'
                    ? 'गाँव / शहर खोजें...'
                    : 'Search village, city...'
                }
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none pr-2 font-medium"
              />
              {(query || showSearch) && (
                <button
                  onClick={() => {
                    clear();
                    setShowSearch(false);
                    searchInputRef.current?.blur();
                  }}
                  className="pr-3 text-white/40 hover:text-white/70 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearch && (query.length >= 3 || results.length > 0) && (
              <div className="absolute top-12 left-0 right-0 bg-[#0c1425]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-[slideDown_0.25s_ease-out] z-50">
                {loading && (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    <span className="text-xs text-white/50">Searching...</span>
                  </div>
                )}
                {!loading && results.length === 0 && query.length >= 3 && (
                  <div className="px-4 py-4 text-center">
                    <p className="text-xs text-white/30">No results found</p>
                  </div>
                )}
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearchSelect(r)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors text-left border-b border-white/[0.04] last:border-b-0"
                  >
                    <MapPin
                      size={14}
                      className="text-emerald-400/60 mt-0.5 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/80 font-medium truncate leading-tight">
                        {r.display_name.split(',')[0]}
                      </p>
                      <p className="text-[10px] text-white/30 truncate mt-0.5 leading-tight">
                        {r.display_name.split(',').slice(1).join(',').trim()}
                      </p>
                    </div>
                    <CornerDownLeft
                      size={12}
                      className="text-white/20 mt-1 shrink-0"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Point counter badge */}
          <div className="h-10 px-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/[0.08] flex items-center gap-1.5">
            <Triangle
              size={11}
              className={clsx(
                'transition-colors',
                hasArea ? 'text-emerald-400' : 'text-white/30'
              )}
              fill={hasArea ? 'currentColor' : 'none'}
            />
            <span className="text-xs font-bold text-white/70 tabular-nums">
              {points.length}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT SIDE TOOLS ═══ */}
      <div className="absolute right-3 sm:right-4 top-[72px] z-[20] flex flex-col gap-2">
        {/* Locate */}
        <button
          onClick={locateUser}
          className={clsx(
            'w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-lg',
            isLocating
              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
              : 'bg-black/40 backdrop-blur-xl border-white/[0.08] text-white/60 hover:text-white hover:bg-black/60'
          )}
        >
          <Navigation
            size={16}
            className={clsx(isLocating && 'animate-pulse')}
          />
        </button>

        {/* Map Type */}
        <div className="relative">
          <button
            onClick={() => setShowMapTypes(!showMapTypes)}
            className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-xl border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 active:scale-95 transition-all shadow-lg"
          >
            <Layers size={16} />
          </button>
          {showMapTypes && (
            <div className="absolute right-12 top-0 bg-[#0c1425]/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden animate-[slideInRight_0.2s_ease-out] min-w-[120px]">
              {(Object.keys(TILE_LAYERS) as MapType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleMapTypeChange(key)}
                  className={clsx(
                    'w-full px-3 py-2.5 text-left text-xs font-semibold transition-colors flex items-center gap-2',
                    mapType === key
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-white/60 hover:bg-white/[0.04]'
                  )}
                >
                  {mapType === key && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                  <span className={mapType !== key ? 'ml-3.5' : ''}>
                    {TILE_LAYERS[key].label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden shadow-lg">
          <button
            onClick={() => handleZoom('in')}
            className="w-10 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all border-b border-white/[0.06]"
          >
            <Plus size={15} />
          </button>
          <div className="w-full flex items-center justify-center py-1">
            <span className="text-[8px] font-mono font-bold text-white/30">
              {zoomLevel}
            </span>
          </div>
          <button
            onClick={() => handleZoom('out')}
            className="w-10 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all border-t border-white/[0.06]"
          >
            <Minus size={15} />
          </button>
        </div>

        {/* Fit bounds */}
        {points.length >= 2 && (
          <button
            onClick={handleFitBounds}
            className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-xl border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 active:scale-95 transition-all shadow-lg animate-[fadeIn_0.3s]"
          >
            <Maximize2 size={15} />
          </button>
        )}
      </div>

      {/* ═══ ZOOM SCALE BAR (Left Side) ═══ */}
      <div className="absolute left-3 sm:left-4 bottom-[200px] z-[20] flex flex-col items-center gap-1">
        <div className="bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-lg px-2 py-1">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-px bg-white/40" />
            <span className="text-[8px] font-mono text-white/40 font-bold">
              {zoomLevel >= 18
                ? '10m'
                : zoomLevel >= 16
                ? '50m'
                : zoomLevel >= 14
                ? '200m'
                : zoomLevel >= 12
                ? '1km'
                : '5km'}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM PANEL ═══ */}
      <div className="absolute bottom-0 inset-x-0 z-[20] pointer-events-none">
        <div className="flex flex-col items-center px-3 sm:px-4 pb-4 gap-3">
          {/* ─── AREA RESULTS CARD ─── */}
          {hasArea && (
            <div className="w-full max-w-md pointer-events-auto animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
              <div
                className={clsx(
                  'bg-[#0c1425]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-400',
                  showResults ? 'p-4' : 'p-3.5'
                )}
              >
                {/* Header row */}
                <button
                  onClick={() => setShowResults(!showResults)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Ruler
                        size={16}
                        className="text-emerald-400"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30 leading-none">
                        {t.total_area || 'Total Area'}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl font-black text-white font-mono tracking-tight leading-none">
                          {acre.toFixed(3)}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 uppercase">
                          {t.unit_acre || 'Acre'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!showResults && (
                      <div className="hidden sm:flex flex-col items-end mr-1">
                        <span className="text-[11px] font-mono text-white/60 font-semibold">
                          {guntha.toFixed(2)}{' '}
                          <span className="text-white/30 text-[9px]">
                            {t.unit_guntha || 'Guntha'}
                          </span>
                        </span>
                      </div>
                    )}
                    <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center">
                      <ChevronUp
                        size={14}
                        className={clsx(
                          'text-white/40 transition-transform duration-300',
                          showResults && 'rotate-180'
                        )}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                <div
                  className={clsx(
                    'transition-all duration-400 overflow-hidden',
                    showResults
                      ? 'max-h-[300px] opacity-100 mt-4'
                      : 'max-h-0 opacity-0 mt-0'
                  )}
                >
                  {/* Perimeter */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-3">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                      Perimeter
                    </span>
                    <span className="text-sm font-mono font-bold text-white/70">
                      {perimeter >= 1000
                        ? `${(perimeter / 1000).toFixed(2)} km`
                        : `${perimeter.toFixed(1)} m`}
                    </span>
                  </div>

                  {/* Unit grid */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <UnitCard
                      label={t.unit_guntha || 'Guntha'}
                      value={guntha.toFixed(2)}
                      highlight
                    />
                    <UnitCard
                      label={t.unit_bigha || 'Bigha'}
                      value={bigha.toFixed(2)}
                    />
                    <UnitCard
                      label={t.unit_hectare || 'Hectare'}
                      value={hectare.toFixed(4)}
                    />
                    <UnitCard
                      label={t.unit_sqm || 'Sq.m'}
                      value={sqMeter.toFixed(0)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyResult}
                      className="flex-1 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center gap-2 text-white/50 hover:text-white/80 hover:bg-white/[0.08] active:scale-[0.98] transition-all"
                    >
                      {copied ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span className="text-[11px] font-semibold">
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                    <button
                      onClick={handleFitBounds}
                      className="flex-1 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center gap-2 text-white/50 hover:text-white/80 hover:bg-white/[0.08] active:scale-[0.98] transition-all"
                    >
                      <Maximize2 size={13} />
                      <span className="text-[11px] font-semibold">
                        Fit View
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HELPER TEXT ─── */}
          {!hasArea && points.length < 3 && (
            <div className="pointer-events-auto animate-[fadeIn_0.3s]">
              <div className="bg-black/50 backdrop-blur-xl border border-white/[0.08] px-4 py-2 rounded-full flex items-center gap-2">
                <div
                  className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    points.length === 0
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  )}
                />
                <p className="text-xs font-semibold text-white/70">
                  {points.length === 0
                    ? lang === 'mr'
                      ? 'पहिला कोपरा चिन्हांकित करा'
                      : lang === 'hi'
                      ? 'पहला कोना चिह्नित करें'
                      : 'Mark the first corner'
                    : points.length === 1
                    ? lang === 'mr'
                      ? 'पुढचा कोपरा चिन्हांकित करा'
                      : lang === 'hi'
                      ? 'अगला कोना चिह्नित करें'
                      : 'Mark the next corner'
                    : lang === 'mr'
                    ? 'आणखी कोपरे जोडा (किमान ३)'
                    : lang === 'hi'
                    ? 'और कोने जोड़ें (कम से कम ३)'
                    : 'Add more corners (min 3)'}
                </p>
              </div>
            </div>
          )}

          {/* ─── CONTROLS ROW ─── */}
          <div className="w-full max-w-md flex items-center justify-between pointer-events-auto">
            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={points.length === 0}
              className={clsx(
                'w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-95 shadow-lg',
                points.length > 0
                  ? 'bg-black/40 backdrop-blur-xl border-white/[0.1] text-white/70 hover:bg-black/60 hover:text-white'
                  : 'bg-black/20 border-white/[0.04] text-white/15 pointer-events-none'
              )}
            >
              <Undo2 size={18} />
            </button>

            {/* Add Point - Main CTA */}
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute inset-[-4px] rounded-full bg-emerald-500/20 blur-xl pointer-events-none" />

              <button
                onClick={handleAddPoint}
                className="relative group w-[68px] h-[68px] rounded-full flex items-center justify-center active:scale-90 transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, #059669, #10b981, #34d399)',
                  boxShadow:
                    '0 8px 30px rgba(16,185,129,0.35), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <Plus
                  size={30}
                  className="text-white drop-shadow-sm group-hover:rotate-90 transition-transform duration-300"
                  strokeWidth={2.5}
                />

                {/* Ripple hint on first point */}
                {points.length === 0 && (
                  <div className="absolute inset-[-6px] rounded-full border-2 border-emerald-400/40 animate-ping pointer-events-none" />
                )}
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              disabled={points.length === 0}
              className={clsx(
                'w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-95 shadow-lg',
                points.length > 0
                  ? 'bg-black/40 backdrop-blur-xl border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
                  : 'bg-black/20 border-white/[0.04] text-white/15 pointer-events-none'
              )}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close panels */}
      {(showMapTypes || (showSearch && results.length > 0)) && (
        <div
          className="absolute inset-0 z-[19]"
          onClick={() => {
            setShowMapTypes(false);
            if (showSearch) {
              clear();
              setShowSearch(false);
            }
          }}
        />
      )}

      {/* ═══ STYLES ═══ */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scaleY(0.95); transform-origin: top; }
          to { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-container {
          background: #0a0f1a !important;
          font-family: inherit !important;
        }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-tile-pane { filter: saturate(1.05) contrast(1.02); }
        .area-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default AreaCalculator;
