
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import { RotateCcw, Undo2, MapPin, Layers, Crosshair, Plus, ArrowLeft, Ruler, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
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
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

        // Add "Click to Add" listener (Optional backup)
        map.on('click', (e: any) => {
            // We rely on crosshair, but clicking map can also add point for desktop users
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
                weight: 3,
                opacity: 1,
                fillColor: '#0891b2', // Cyan-600
                fillOpacity: 0.25,
                dashArray: points.length < 3 ? '10, 10' : undefined
            }).addTo(map);

            // Draw Markers (Corners)
            points.forEach((p, i) => {
                const isFirst = i === 0;
                const isLast = i === points.length - 1;
                
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div class="relative w-4 h-4 group">
                            <div class="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75 ${isLast ? 'block' : 'hidden'}"></div>
                            <div class="relative w-4 h-4 bg-white border-2 ${isFirst ? 'border-green-500 bg-green-100 scale-125' : 'border-cyan-600'} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
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
            // CartoDB Voyager (Street)
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
    const bigha = sqMeter / 2529.28;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col h-[100dvh] w-full animate-enter">
            
            {/* 1. Header (Top Left) */}
            <div className="absolute top-4 left-4 z-[500] pt-safe-top pointer-events-none flex items-center gap-3">
                <button 
                    onClick={onBack} 
                    className="pointer-events-auto w-10 h-10 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center shadow-lg hover:bg-slate-900/60 transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="pointer-events-auto bg-slate-900/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Ruler size={16} className="text-cyan-400"/>
                    <span className="text-sm font-bold text-white tracking-wide">{t.area_title}</span>
                </div>
            </div>

            {/* 2. Map Tools (Top Right) */}
            <div className="absolute top-20 right-4 z-[400] flex flex-col gap-3 pt-safe-top">
                <button 
                    onClick={handleLocate} 
                    className={clsx(
                        "w-11 h-11 rounded-full flex items-center justify-center shadow-xl border border-white/10 transition-all active:scale-95 backdrop-blur-xl", 
                        isLocating ? "bg-cyan-500 text-white animate-pulse" : "bg-slate-900/40 text-white hover:bg-slate-900/60"
                    )}
                >
                    <MapPin size={20} />
                </button>
                <button 
                    onClick={toggleMapType} 
                    className="w-11 h-11 rounded-full bg-slate-900/40 backdrop-blur-xl flex items-center justify-center text-white shadow-xl border border-white/10 hover:bg-slate-900/60 active:scale-95 transition-all"
                >
                    <Layers size={20} />
                </button>
            </div>

            {/* 3. Map View (Full Screen) */}
            <div className="flex-1 relative w-full h-full bg-slate-800 z-0">
                <div ref={mapRef} className="w-full h-full z-0 outline-none bg-slate-900"></div>

                {/* Crosshair (Fixed Center) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                    <div className="relative">
                        <Crosshair size={32} className="text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]" strokeWidth={1.5} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]"></div>
                    </div>
                </div>
            </div>

            {/* 4. Controls & Results (Bottom Overlay) */}
            <div className="absolute bottom-0 inset-x-0 z-[500] flex flex-col items-center justify-end pointer-events-none pb-safe-bottom">
                
                {/* Result Card (Floating above controls) */}
                <div className="w-full max-w-md px-4 mb-4 pointer-events-auto">
                     <div className={clsx(
                         "glass-panel rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl transition-all duration-300 shadow-2xl overflow-hidden",
                         isDetailsOpen ? "p-5" : "p-4"
                     )}>
                         {/* Header / Collapsed View */}
                         <div 
                             className="flex items-center justify-between cursor-pointer" 
                             onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                         >
                             <div>
                                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{t.total_area}</p>
                                 <div className="flex items-baseline gap-2">
                                     <h2 className="text-4xl font-black text-white font-mono tracking-tight">{acre.toFixed(2)}</h2>
                                     <span className="text-sm font-bold text-cyan-400 self-end mb-1 uppercase">{t.unit_acre}</span>
                                 </div>
                             </div>
                             
                             <div className="flex items-center gap-3">
                                 {/* Mini Stats (Visible when collapsed) */}
                                 {!isDetailsOpen && (
                                     <div className="hidden sm:flex flex-col items-end text-right">
                                         <span className="text-xs font-mono text-white/90">{guntha.toFixed(2)} Guntha</span>
                                         <span className="text-[10px] font-mono text-white/60">{sqMeter.toFixed(0)} Sq.m</span>
                                     </div>
                                 )}
                                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                     {isDetailsOpen ? <ChevronDown size={18} className="text-slate-300"/> : <ChevronUp size={18} className="text-slate-300"/>}
                                 </div>
                             </div>
                         </div>

                         {/* Expanded Details Grid */}
                         <div className={clsx("grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-white/10", !isDetailsOpen && "hidden")}>
                             <UnitBox label={t.unit_guntha} value={guntha.toFixed(2)} />
                             <UnitBox label={t.unit_bigha} value={bigha.toFixed(2)} />
                             <UnitBox label={t.unit_hectare} value={hectare.toFixed(2)} />
                             <UnitBox label={t.unit_sqm} value={sqMeter.toFixed(0)} />
                         </div>
                     </div>
                </div>

                {/* Main Controls Row */}
                <div className="w-full max-w-md px-6 mb-6 flex items-center justify-between pointer-events-auto">
                    {/* Undo Button */}
                    <button 
                        onClick={undo}
                        disabled={points.length === 0}
                        className="w-12 h-12 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-300 shadow-lg active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 hover:text-white"
                    >
                        <Undo2 size={20} />
                    </button>

                    {/* Add Point Button (Center, Large) */}
                    <button 
                        onClick={handleAddCenterPoint}
                        className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.4)] border-[6px] border-slate-900/50 active:scale-90 transition-all z-10"
                    >
                        <Plus size={36} className="text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
                        {/* Ripple Hint if empty */}
                        {points.length === 0 && (
                             <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-50 pointer-events-none"></div>
                        )}
                    </button>

                    {/* Reset Button */}
                    <button 
                        onClick={reset}
                        disabled={points.length === 0}
                        className="w-12 h-12 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-red-400 shadow-lg active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none hover:bg-red-500/20"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

            </div>

        </div>
    );
};

const UnitBox = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/5">
        <span className="text-[9px] font-bold uppercase text-slate-400 mb-1">{label}</span>
        <span className="text-sm font-mono font-bold text-white leading-none">{value}</span>
    </div>
);

export default AreaCalculator;
