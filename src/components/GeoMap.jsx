import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { parseLoc } from "../lib/ip";

function Recenter({ loc }) {
  const map = useMap();

  useEffect(() => {
    const coords = parseLoc(loc);
    if (!coords) return;
    map.setView([coords.lat, coords.lng], map.getZoom(), { animate: true });
  }, [loc, map]);

  return null;
}

export default function GeoMap({ geo }) {
  const coords = parseLoc(geo?.loc);

  // Fallback center if loc missing
  const center = coords ? [coords.lat, coords.lng] : [14.5995, 120.9842]; // Manila fallback
  const zoom = coords ? 11 : 5;

  return (
    <div style={{ height: 360, borderRadius: 12, overflow: "hidden", border: "1px solid #eee" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Recenter the map whenever geo.loc changes */}
        <Recenter loc={geo?.loc} />

        {coords && (
          <Marker position={[coords.lat, coords.lng]}>
            <Popup>
              <div style={{ fontFamily: "system-ui" }}>
                <div style={{ fontWeight: 700 }}>{geo?.ip || "IP"}</div>
                <div>
                  {geo?.city || "-"}, {geo?.region || "-"}, {geo?.country || "-"}
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  {coords.lat}, {coords.lng}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
