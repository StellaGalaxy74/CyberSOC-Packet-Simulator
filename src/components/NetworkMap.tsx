import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { Packet } from '../types';
import { Shield } from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface NetworkMapProps {
  packets: Packet[];
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ packets }) => {
  // Aggregate packets by location to avoid rendering overlapping nodes
  const nodes = packets.reduce((acc, packet) => {
    if (!packet.location || packet.location.country === 'Unknown') return acc;
    const key = `${packet.location.lat},${packet.location.lon}`;
    if (!acc[key]) {
      acc[key] = {
        lat: packet.location.lat,
        lon: packet.location.lon,
        name: packet.location.city,
        country: packet.location.country,
        size: 0,
        hasThreat: false,
      };
    }
    acc[key].size += 1;
    if (packet.isSuspicious) {
      acc[key].hasThreat = true;
    }
    return acc;
  }, {} as Record<string, { lat: number; lon: number; name: string; country: string; size: number; hasThreat: boolean }>);

  const markers = Object.values(nodes);

  return (
    <div className="h-full w-full glass-panel rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-gray-800 bg-[#030712]">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-gray-200 font-bold uppercase tracking-wider text-sm flex items-center">
           Global Threat Map
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-mono">Live geo-location intelligence</p>
      </div>

      <div className="absolute top-4 right-4 z-10 flex space-x-4 bg-gray-900/60 p-2 rounded border border-gray-800 backdrop-blur">
          <div className="flex items-center space-x-2">
             <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
             <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Safe Node</span>
          </div>
          <div className="flex items-center space-x-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Threat Node</span>
          </div>
      </div>
      
      <div className="w-full h-full max-h-[800px]">
        <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400} style={{ width: "100%", height: "100%" }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography 
                  key={geo.rsmKey} 
                  geography={geo} 
                  fill="#111827" 
                  stroke="#1f2937" 
                  strokeWidth={0.5} 
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1f2937", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {markers.map((marker, i) => (
            <Marker key={i} coordinates={[marker.lon, marker.lat]}>
              <circle
                r={Math.min(3 + marker.size / 5, 8)} 
                fill={marker.hasThreat ? "#ef4444" : "#22d3ee"} 
                className={marker.hasThreat ? "animate-pulse" : ""}
                opacity={0.8}
              />
              <circle
                r={Math.min(3 + marker.size / 5, 8)} 
                fill="none"
                stroke={marker.hasThreat ? "#ef4444" : "#22d3ee"} 
                className="animate-ping"
                strokeWidth={1}
                opacity={0.5}
              />
               <text
                 textAnchor="middle"
                 y={15}
                 style={{ fontFamily: "JetBrains Mono", fontSize: "6px", fill: marker.hasThreat ? "#fca5a5" : "#6ee7b7", opacity: 0.8 }}
               >
                 {marker.name}
               </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
};
