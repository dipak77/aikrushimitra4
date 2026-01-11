
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { RotateCcw, Undo2, MapPin, Layers, Crosshair, Plus, ArrowLeft, Ruler, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { clsx } from 'clsx';
import { Button } from '../Button';

// Declare Leaflet global
declare const L: any;

const AreaCalculator = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
    const t = TRANSLATIONS[lang];
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const polygonRef = useRef<any>(null);
    const tileLayerRef = useRef<any>(null);
    
    const [points, setPoints] = useState<{lat: number, lng: number}[]>([]);
    const [areaSqM, setAreaSqM] = useState(0);
    const [mapType, setMapType] = useState<'SATELLITE' | 'STREET'>('SATELLITE');
    const [isLocating, setIsLocating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    // Init Map
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Initialize Map centered on India (Maharashtra default)
        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
            maxZoom: 22,
        }).setView([19.7515, 75.7139], 15);

        mapInstance.current = map;

        // Add Default Layer
        updateMapLayer(map, 'SATELLITE');

        // Add "Click to Add" listener
        map.on('click', (e: any) => {
             // Optional: allow map click if needed, but crosshair is primary
             // handleAddPoint(e.latlng.lat, e.latlng.lng);
        });

        // Try to locate user immediately
        handleLocate();

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    // Update Points on Map
    useEffect(() => {
        if (!mapInstance.current) return;
        const map = mapInstance.current;

        // Clear existing
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        if (polygonRef.current) polygonRef.current.remove();

        // Draw Polygon
        if (points.length > 0) {
            const latLngs = points.map(p => [p.lat, p.lng]);
            
            // Draw Polygon
            polygonRef.current = L.polygon(latLngs, {
                color: '#22d3ee', // Cyan-400
                weight: 4,
                opacity: 1,
                fillColor: '#0891b2', // Cyan-600
                fillOpacity: 0.3,
                dashArray: points.length < 3 ? '10, 10' : undefined
            }).addTo(map);

            // Draw Markers (Corners)
            points.forEach((p, i) => {
                const isFirst = i === 0;
                const isLast = i === points.length - 1;
                
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div class="relative w-4 h-4">
                            <div class="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75 ${isLast ? 'block' : 'hidden'}"></div>
                            <div class="relative w-4 h-4 bg-white border-2 ${isFirst ? 'border-green-500 bg-green-100 scale-125' : 'border-cyan-600'} rounded-full shadow-lg"></div>
                        </div>
                    `,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });
                const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
                markersRef.current.push(marker);
            });
        }

        calculateArea(points);

    }, [points]);

    const updateMapLayer = (map: any, type: 'SATELLITE' | 'STREET') => {
        if (tileLayerRef.current) tileLayerRef.current.remove();

        if (type === 'SATELLITE') {
            // Esri World Imagery
            tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                attribution: 'Tiles &copy; Esri'
            }).addTo(map);
        } else {
            // CartoDB Voyager
            tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                subdomains: 'abcd',
                attribution: '&copy; CartoDB'
            }).addTo(map);
        }
    };

    const handleLocate = () => {
        if (!mapInstance.current) return;
        setIsLocating(true);
        triggerHaptic();
        
        mapInstance.current.locate({ setView: true, maxZoom: 19, enableHighAccuracy: true })
            .on('locationfound', (e: any) => {
                setIsLocating(false);
                L.circleMarker(e.latlng, {
                    radius: 8,
                    color: '#fff',
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    weight: 3
                }).addTo(mapInstance.current);
            })
            .on('locationerror', () => {
                setIsLocating(false);
            });
    };

    const handleAddCenterPoint = () => {
        if(!mapInstance.current) return;
        const center = mapInstance.current.getCenter();
        setPoints(prev => [...prev, { lat: center.lat, lng: center.lng }]);
        triggerHaptic();
    };

    const toggleMapType = () => {
        if (!mapInstance.current) return;
        const newType = mapType === 'SATELLITE' ? 'STREET' : 'SATELLITE';
        setMapType(newType);
        updateMapLayer(mapInstance.current, newType);
        triggerHaptic();
    };

    const undo = () => {
        setPoints(prev => prev.slice(0, -1));
        triggerHaptic();
    };

    const reset = () => {
        setPoints([]);
        setAreaSqM(0);
        triggerHaptic();
    };

    // Calculate Area using spherical math
    const calculateArea = (pts: {lat: number, lng: number}[]) => {
        if (pts.length < 3) {
            setAreaSqM(0);
            return;
        }
        const R = 6378137; 
        let area = 0;
        const radPts = pts.map(p => ({
            lat: p.lat * Math.PI / 180,
            lng: p.lng * Math.PI / 180
        }));

        if (radPts.length > 2) {
            for (let i = 0; i < radPts.length; i++) {
                const p1 = radPts[i];
                const p2 = radPts[(i + 1) % radPts.length];
                area += (p2.lng - p1.lng) * (2 + Math.sin(p1.lat) + Math.sin(p2.lat));
            }
            area = Math.abs(area * R * R / 2);
        }
        setAreaSqM(area);
    };

    // Conversions
    const sqMeter = areaSqM;
    const guntha = sqMeter / 101.17;
    const acre = sqMeter / 4046.86;
    const hectare = sqMeter / 10000;
    const bigha = sqMeter / 2529.28; // Standard approx Bigha

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col h-[100dvh] w-full animate-enter">
            
            {/* 1. Top Header */}
            <div className="absolute top-0 left-0 right-0 z-[500] p-4 pt-safe-top flex items-center justify-between pointer-events-none">
                <button 
                    onClick={onBack} 
                    className="pointer-events-auto w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <div className="pointer-events-auto bg-slate-900/60 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3">
                    <Ruler size={16} className="text-cyan-400"/>
                    <h1 className="text-sm font-bold text-white tracking-wide">{t.area_title}</h1>
                </div>
                
                <div className="w-10"></div>
            </div>

            {/* 2. Map Area */}
            <div className="flex-1 relative w-full h-full bg-slate-800 z-0">
                <div ref={mapRef} className="w-full h-full z-0 outline-none" style={{ background: '#0f172a' }}></div>

                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                    <div className="relative">
                        <Crosshair size={32} className="text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" strokeWidth={1.5} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]"></div>
                    </div>
                </div>

                {/* Floating Tools (Right) */}
                <div className="absolute top-28 right-4 flex flex-col gap-3 z-[400]">
                    <button 
                        onClick={handleLocate} 
                        className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border border-white/10 transition-all active:scale-95", 
                            isLocating ? "bg-cyan-500 text-white animate-pulse" : "bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-800"
                        )}
                    >
                        <MapPin size={22} />
                    </button>
                    <button 
                        onClick={toggleMapType} 
                        className="w-12 h-12 rounded-2xl bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white shadow-xl border border-white/10 hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        <Layers size={22} />
                    </button>
                </div>

                {/* Main Action: Add Point (Floating) */}
                <div className="absolute bottom-32 lg:bottom-40 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center gap-2 pointer-events-auto">
                    {points.length === 0 && (
                         <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] text-white font-medium mb-1 border border-white/10 animate-pulse shadow-lg">
                            Move map & tap (+) to mark corners
                         </div>
                    )}
                    <button 
                        onClick={handleAddCenterPoint}
                        className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.4)] border-4 border-slate-900/50 active:scale-90 transition-all"
                    >
                        <Plus size={32} className="text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
                        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-50"></div>
                    </button>
                </div>
            </div>

            {/* 3. Bottom Results Panel (Responsive Card) */}
            <div className="absolute bottom-6 left-4 right-4 z-[500] max-w-4xl mx-auto animate-enter">
                <div className={clsx("glass-panel rounded-[2rem] border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl transition-all duration-300 overflow-hidden", isExpanded ? "p-5" : "p-4")}>
                    
                    {/* Expand/Collapse Handle (Mobile) */}
                    <div className="flex justify-center md:hidden mb-2" onClick={() => setIsExpanded(!isExpanded)}>
                         <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        
                        {/* Main Stats */}
                        <div className="flex-1">
                           <div className="flex items-center justify-between md:justify-start gap-4 mb-1">
                               <div className="flex items-center gap-2">
                                   <Ruler size={14} className="text-cyan-400"/>
                                   <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t.total_area}</span>
                               </div>
                               <button onClick={reset} disabled={points.length === 0} className="text-[10px] font-bold text-red-400 uppercase bg-red-500/10 px-2 py-1 rounded hover:bg-red-500/20 disabled:opacity-0 transition-opacity md:hidden">
                                  Reset
                               </button>
                           </div>
                           
                           {/* Primary (Acre) */}
                           <div className="flex items-baseline gap-2 mb-4">
                               <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tighter font-mono">
                                   {acre.toFixed(2)}
                               </h2>
                               <span className="text-lg text-cyan-400 font-bold uppercase">{t.unit_acre}</span>
                           </div>

                           {/* Secondary Units Grid */}
                           <div className={clsx("grid grid-cols-2 sm:grid-cols-4 gap-3 transition-all", !isExpanded && "hidden md:grid")}>
                               <UnitBox label={t.unit_guntha} value={guntha.toFixed(2)} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                               <UnitBox label={t.unit_bigha} value={bigha.toFixed(2)} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
                               <UnitBox label={t.unit_hectare} value={hectare.toFixed(2)} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
                               <UnitBox label={t.unit_sqm} value={sqMeter.toFixed(0)} color="text-slate-300" bg="bg-slate-700/30" border="border-slate-600/30" />
                           </div>
                        </div>

                        {/* Actions (Desktop) */}
                        <div className="hidden md:flex flex-col gap-3 shrink-0 min-w-[140px]">
                            <button 
                                onClick={undo} 
                                disabled={points.length === 0}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 border border-white/10 text-slate-300 font-bold hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-30"
                            >
                                <Undo2 size={16} /> {t.undo_point}
                            </button>
                            <button 
                                onClick={reset}
                                disabled={points.length === 0} 
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-30"
                            >
                                <RotateCcw size={16} /> {t.reset_map}
                            </button>
                        </div>
                         
                         {/* Actions (Mobile Row) */}
                         <div className={clsx("grid grid-cols-2 gap-3 md:hidden pt-2 border-t border-white/5", !isExpanded && "hidden")}>
                            <button 
                                onClick={undo} 
                                disabled={points.length === 0}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 border border-white/10 text-slate-300 font-bold disabled:opacity-30"
                            >
                                <Undo2 size={16} /> {t.undo_point}
                            </button>
                             <button 
                                onClick={reset}
                                disabled={points.length === 0} 
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold disabled:opacity-30"
                            >
                                <RotateCcw size={16} /> {t.reset_map}
                            </button>
                         </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

const UnitBox = ({ label, value, color, bg, border }: { label: string, value: string, color: string, bg: string, border: string }) => (
    <div className={`flex flex-col p-2.5 rounded-xl border ${bg} ${border}`}>
        <span className={`text-[10px] font-bold uppercase opacity-80 mb-0.5 ${color}`}>{label}</span>
        <span className="text-lg font-mono font-bold text-white">{value}</span>
    </div>
);

export default AreaCalculator;
