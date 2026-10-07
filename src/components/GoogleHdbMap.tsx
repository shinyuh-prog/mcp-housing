import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Briefcase,
  Home,
  Train,
  School,
  ShoppingBag,
  Navigation,
  Compass,
  Layers,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { HDBTown, TownMatchScore, Workplace, CommuteMode, FlatType } from '../types/hdb';

interface GoogleHdbMapProps {
  apiKey: string;
  towns: HDBTown[];
  scores: TownMatchScore[];
  workplace: Workplace;
  commuteMode: CommuteMode;
  preferredFlatType: FlatType;
  focusedTownId: string | null;
  onSelectTown: (townId: string) => void;
  onViewTownDetail: (townId: string) => void;
}

// Sub-component to center map when focusedTownId or workplace changes
const MapController: React.FC<{
  focusedTown: HDBTown | null;
  workplace: Workplace;
}> = ({ focusedTown, workplace }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (focusedTown) {
      map.panTo({ lat: focusedTown.lat, lng: focusedTown.lng });
      map.setZoom(13);
    } else {
      map.panTo({ lat: 1.3521, lng: 103.8198 });
      map.setZoom(11);
    }
  }, [map, focusedTown]);

  return null;
};

export const GoogleHdbMap: React.FC<GoogleHdbMapProps> = ({
  apiKey,
  towns,
  scores,
  workplace,
  commuteMode,
  preferredFlatType,
  focusedTownId,
  onSelectTown,
  onViewTownDetail,
}) => {
  const [selectedTownForInfoWindow, setSelectedTownForInfoWindow] = useState<HDBTown | null>(null);
  const [showSchoolsLayer, setShowSchoolsLayer] = useState<boolean>(true);
  const [showMallsLayer, setShowMallsLayer] = useState<boolean>(true);

  // Sync focusedTownId with info window
  useEffect(() => {
    if (focusedTownId) {
      const match = towns.find((t) => t.id === focusedTownId);
      if (match) setSelectedTownForInfoWindow(match);
    }
  }, [focusedTownId, towns]);

  // Map scores by town ID for quick lookup
  const scoreMap = React.useMemo(() => {
    const dict: Record<string, TownMatchScore> = {};
    scores.forEach((s) => {
      dict[s.town.id] = s;
    });
    return dict;
  }, [scores]);

  const focusedTown = towns.find((t) => t.id === focusedTownId) || null;

  const formatSgd = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[550px] relative">
      {/* Map Header & Overlays Control */}
      <div className="p-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold tracking-tight">Interactive Singapore HDB Map</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Workplace: {workplace.name.split('/')[0]}
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setShowSchoolsLayer(!showSchoolsLayer)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 border ${
              showSchoolsLayer
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <School className="w-3 h-3" />
            <span>Schools</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMallsLayer(!showMallsLayer)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 border ${
              showMallsLayer
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Malls</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full min-h-[480px] h-full relative">
        <APIProvider apiKey={apiKey} region="SG" language="en">
          <Map
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            defaultCenter={{ lat: 1.3521, lng: 103.8198 }}
            defaultZoom={11}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            <MapController focusedTown={focusedTown} workplace={workplace} />

            {/* 1. WORKPLACE PIN */}
            <AdvancedMarker
              position={{ lat: workplace.lat, lng: workplace.lng }}
              title={`Workplace: ${workplace.name}`}
            >
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="px-2 py-0.5 rounded-full bg-slate-950 text-white border border-rose-500 text-[10px] font-bold shadow-lg flex items-center gap-1 whitespace-nowrap mb-1">
                  <Briefcase className="w-3 h-3 text-rose-400" />
                  <span>Work: {workplace.name.split('/')[0]}</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow-lg animate-bounce">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
            </AdvancedMarker>

            {/* 2. TOWN PINS */}
            {towns.map((town) => {
              const scoreObj = scoreMap[town.id];
              const scoreVal = scoreObj?.overallScore || 50;
              const commuteMins = scoreObj?.commuteMinutes || 40;
              const isSelected = town.id === focusedTownId;

              // Color classes based on match score
              const pinBg =
                scoreVal >= 85
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : scoreVal >= 70
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-slate-700 border-slate-500 text-white';

              return (
                <AdvancedMarker
                  key={town.id}
                  position={{ lat: town.lat, lng: town.lng }}
                  onClick={() => {
                    onSelectTown(town.id);
                    setSelectedTownForInfoWindow(town);
                  }}
                  title={`${town.displayName}: ${scoreVal}% Match`}
                >
                  <div
                    className={`cursor-pointer transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-xl shadow-lg border text-xs font-bold ${pinBg}`}
                    >
                      <Home className="w-3 h-3" />
                      <span>{town.displayName}</span>
                      <span className="text-[10px] font-normal opacity-90">({scoreVal}%)</span>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* 3. INFO WINDOW FOR SELECTED TOWN */}
            {selectedTownForInfoWindow && (
              <InfoWindow
                position={{
                  lat: selectedTownForInfoWindow.lat,
                  lng: selectedTownForInfoWindow.lng,
                }}
                onCloseClick={() => setSelectedTownForInfoWindow(null)}
              >
                <div className="p-2 max-w-xs text-xs text-slate-800">
                  {(() => {
                    const s = scoreMap[selectedTownForInfoWindow.id];
                    const commuteMins = s?.commuteMinutes || 35;
                    const median =
                      selectedTownForInfoWindow.medianPrices[preferredFlatType] || 600000;
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b pb-1.5">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">
                              {selectedTownForInfoWindow.displayName}
                            </h4>
                            <span className="text-[10px] text-slate-500">
                              {selectedTownForInfoWindow.region} Region
                            </span>
                          </div>
                          {s && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                              {s.overallScore}% Match
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px] py-1 bg-slate-50 rounded-lg p-1.5">
                          <div>
                            <span className="text-slate-500 block text-[9px]">Work Commute:</span>
                            <span className="font-semibold text-slate-800">
                              {commuteMins} mins {commuteMode === 'driving' ? 'drive' : 'transit'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px]">
                              Median {preferredFlatType}:
                            </span>
                            <span className="font-semibold text-slate-900">
                              {formatSgd(median)}
                            </span>
                          </div>
                        </div>

                        {showSchoolsLayer && selectedTownForInfoWindow.notableSchools[0] && (
                          <div className="text-[11px] flex items-center gap-1.5 text-slate-700">
                            <School className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">
                              Top School: {selectedTownForInfoWindow.notableSchools[0].name}
                            </span>
                          </div>
                        )}

                        {showMallsLayer && selectedTownForInfoWindow.shoppingMalls[0] && (
                          <div className="text-[11px] flex items-center gap-1.5 text-slate-700">
                            <ShoppingBag className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="truncate">
                              Mall: {selectedTownForInfoWindow.shoppingMalls[0].name}
                            </span>
                          </div>
                        )}

                        <div className="pt-2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewTownDetail(selectedTownForInfoWindow.id)}
                            className="w-full py-1.5 px-2 bg-slate-900 text-white rounded-lg font-medium text-[11px] hover:bg-slate-800 transition-colors"
                          >
                            Live Data.gov.sg Records
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Map Floating Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-md text-[10px] space-y-1.5 pointer-events-none hidden sm:block">
        <span className="font-bold text-slate-700 block text-[11px]">Match Rating</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>Best Match (&ge; 85%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>Good Match (70 - 84%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
          <span>Moderate (&lt; 70%)</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
          <span>Selected Workplace</span>
        </div>
      </div>
    </div>
  );
};
