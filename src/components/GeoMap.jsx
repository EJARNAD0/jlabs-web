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
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Recenter the map whenever geo.loc changes */}
        <Recenter loc={geo?.loc} />

        {coords && (
          <Marker position={[coords.lat, coords.lng]}>
            <Popup>
              <div style={{ fontFamily: "var(--font-family)" }}>
                <div style={{ fontWeight: 600 }}>{geo?.ip || "IP"}</div>
                <div>
                  {geo?.city || "-"}, {geo?.region || "-"},{" "}
                  {geo?.country || "-"}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "0.25rem",
                  }}
                >
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
