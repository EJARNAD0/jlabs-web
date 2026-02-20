import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("ej@jlabs.test");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });
      setToken(res.data.token);
      nav("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>JLabs Exam</h2>
        <p style={{ marginTop: 6, color: "#666" }}>
          Login using seeded credentials.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
            />
          </label>

          <button style={styles.btn} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
          Default: ej@jlabs.test / password123
        </div>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "#fafafa",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
  },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
  },
  btn: {
    padding: 12,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    background: "#111",
    color: "white",
    fontWeight: 600,
  },
  error: {
    background: "#ffe5e5",
    border: "1px solid #ffcccc",
    padding: 10,
    borderRadius: 10,
    margin: "12px 0",
  },
};
