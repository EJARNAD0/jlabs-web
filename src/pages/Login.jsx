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
    <div className="login-shell">
      <div className="card login-card">
        <h2 style={{ marginBottom: '0.5rem' }}>JLabs Exam</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          Login using seeded credentials.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={submit} className="login-form">
          <label className="label">
            Email
            <input
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
          </label>

          <label className="label">
            Password
            <input
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
            />
          </label>

          <button className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Default: ej@jlabs.test / password123
        </div>
      </div>
    </div>
  );
}
