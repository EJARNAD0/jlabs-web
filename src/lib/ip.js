export const IPV4 =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export function parseLoc(loc) {
  // ipinfo loc: "LAT,LNG"
  if (!loc || typeof loc !== "string") return null;
  const [latStr, lngStr] = loc.split(",");
  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}
