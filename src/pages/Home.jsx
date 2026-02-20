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
    <div className="container">
      <header className="home-header">
        <div>
          <h2>Home</h2>
          <div style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Logged in as: <b>{me?.email || "..."}</b>
          </div>
        </div>

        <button onClick={onLogout} className="btn btn-secondary">
          Logout
        </button>
      </header>

      <section className="search-row">
        <div className="search-input-group">
          <input
            className="input-field"
            placeholder="Enter IP (e.g. 8.8.8.8)"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            disabled={busy}
          />
        </div>
        <button onClick={onSearch} className="btn btn-primary" disabled={busy}>
          {busy ? "Working..." : "Search"}
        </button>
        <button onClick={onClear} className="btn btn-secondary" disabled={busy}>
          Clear
        </button>
      </section>

      {error && <div className="error-message">{error}</div>}

      <main className="grid-layout">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>IP & Geolocation</h3>

          {displayGeo ? (
            <>
              <pre className="pre-code">{JSON.stringify(displayGeo, null, 2)}</pre>
              <div style={{ marginTop: '0.75rem' }}>
                <GeoMap geo={geo} />
              </div>
            </>
          ) : (
            <div style={{ color: "var(--text-muted)" }}>
              {busy ? "Loading..." : "No data"}
            </div>
          )}
        </div>

        <div className="card">
          <div className="history-header">
            <h3 style={{ margin: 0 }}>History</h3>
            <button
              onClick={onDeleteSelected}
              className="btn btn-danger"
              disabled={busy || selectedIds.length === 0}
            >
              Delete
            </button>
          </div>

          {histories.length === 0 ? (
            <div style={{ color: "var(--text-muted)", marginTop: '0.625rem' }}>No searches yet.</div>
          ) : (
            <div className="history-list">
              {histories.map((h) => (
                <div key={h.id} className="history-item">
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
                    className="history-btn"
                    disabled={busy}
                  >
                    <div style={{ fontWeight: 600 }}>{h.ip}</div>
                    <div style={{ fontSize: '0.75rem', color: "var(--text-muted)" }}>
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
