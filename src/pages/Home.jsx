import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../lib/api";
import { clearToken } from "../lib/auth";
import { IPV4 } from "../lib/ip";
import GeoMap from "../components/GeoMap";

export default function Home() {
  const [me, setMe] = useState(null);

  const [myGeo, setMyGeo] = useState(null);
  const [geo, setGeo] = useState(null);

  const [ipInput, setIpInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [histories, setHistories] = useState([]);
  const [selected, setSelected] = useState({});

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => Number(k)),
    [selected]
  );

  async function fetchGeo(ipOrEmpty) {
    const url = ipOrEmpty
      ? `https://ipinfo.io/${ipOrEmpty}/geo`
      : `https://ipinfo.io/geo`;

    const res = await axios.get(url);
    return res.data;
  }

  async function loadMe() {
    const res = await api.get("/me");
    setMe(res.data.user);
  }

  async function loadHistories() {
    const res = await api.get("/histories");
    setHistories(res.data);
  }

  async function init() {
    setBusy(true);
    setError("");

    try {
      await loadMe();
      await loadHistories();

      const g = await fetchGeo("");
      setMyGeo(g);
      setGeo(g);
    } catch {
      setError("Failed to load data.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSearch() {
    const ip = ipInput.trim();
    setError("");

    if (!IPV4.test(ip)) {
      setError("Invalid IP address.");
      return;
    }

    setBusy(true);
    try {
      const g = await fetchGeo(ip);
      setGeo(g);

      await api.post("/histories", { ip, payload: g });
      await loadHistories();

      setIpInput("");
    } catch {
      setError("Unable to fetch IP information.");
    } finally {
      setBusy(false);
    }
  }

  function onClear() {
    setError("");
    setIpInput("");
    setGeo(myGeo);
  }

  async function onClickHistory(h) {
    setError("");

    if (h?.payload) {
      setGeo(h.payload);
      return;
    }

    setBusy(true);
    try {
      const g = await fetchGeo(h.ip);
      setGeo(g);
    } catch {
      setError("Unable to load history.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteSelected() {
    if (selectedIds.length === 0) return;

    setBusy(true);
    setError("");

    try {
      await api.delete("/histories", { data: { ids: selectedIds } });
      setSelected({});
      await loadHistories();
    } catch {
      setError("Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    try {
      await api.post("/logout");
    } catch {}
    clearToken();
    window.location.href = "/login";
  }

  const displayGeo = geo
    ? Object.fromEntries(Object.entries(geo).filter(([k]) => k !== "readme"))
    : null;

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Home</h2>
          <div style={{ color: "#666", marginTop: 4 }}>
            Logged in as: <b>{me?.email || "..."}</b>
          </div>
        </div>

        <button onClick={onLogout} style={styles.secondaryBtn}>
          Logout
        </button>
      </header>

      <section style={styles.searchRow}>
        <input
          style={styles.input}
          placeholder="Enter IP (e.g. 8.8.8.8)"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          disabled={busy}
        />
        <button onClick={onSearch} style={styles.btn} disabled={busy}>
          {busy ? "Working..." : "Search"}
        </button>
        <button onClick={onClear} style={styles.secondaryBtn} disabled={busy}>
          Clear
        </button>
      </section>

      {error && <div style={styles.error}>{error}</div>}

      <main style={styles.grid}>
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>IP & Geolocation</h3>

          {displayGeo ? (
            <>
              <pre style={styles.pre}>{JSON.stringify(displayGeo, null, 2)}</pre>
              <div style={{ marginTop: 12 }}>
                <GeoMap geo={geo} />
              </div>
            </>
          ) : (
            <div style={{ color: "#666" }}>
              {busy ? "Loading..." : "No data"}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.historyHeader}>
            <h3 style={{ margin: 0 }}>History</h3>
            <button
              onClick={onDeleteSelected}
              style={styles.dangerBtn}
              disabled={busy || selectedIds.length === 0}
            >
              Delete
            </button>
          </div>

          {histories.length === 0 ? (
            <div style={{ color: "#666", marginTop: 10 }}>No searches yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {histories.map((h) => (
                <div key={h.id} style={styles.historyItem}>
                  <input
                    type="checkbox"
                    checked={!!selected[h.id]}
                    onChange={(e) =>
                      setSelected((prev) => ({
                        ...prev,
                        [h.id]: e.target.checked,
                      }))
                    }
                    disabled={busy}
                  />

                  <button
                    onClick={() => onClickHistory(h)}
                    style={styles.historyBtn}
                    disabled={busy}
                  >
                    <div style={{ fontWeight: 600 }}>{h.ip}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {new Date(h.created_at).toLocaleString()}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  shell: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "10px 0 18px",
  },
  searchRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.75fr",
    gap: 14,
    alignItems: "start",
  },
  card: {
    background: "white",
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
  },
  input: {
    flex: 1,
    minWidth: 240,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
  },
  btn: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    background: "#111",
    color: "white",
    fontWeight: 600,
  },
  secondaryBtn: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    background: "white",
    fontWeight: 600,
  },
  dangerBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ffb3b3",
    cursor: "pointer",
    background: "#ffe5e5",
    fontWeight: 700,
  },
  error: {
    background: "#ffe5e5",
    border: "1px solid #ffcccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    background: "#fafafa",
    border: "1px solid #eee",
    padding: 12,
    borderRadius: 12,
    maxHeight: 360,
    overflow: "auto",
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  historyItem: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  historyBtn: {
    flex: 1,
    textAlign: "left",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #eee",
    background: "white",
    cursor: "pointer",
  },
};
