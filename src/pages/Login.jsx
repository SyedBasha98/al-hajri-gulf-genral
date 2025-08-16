import React from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

/** Static users (demo only) */
const USERS = {
  "admin2025": { password: "admin@$2025", role: "admin" },
  "ase": { password: "ase", role: "ase" },
  "contract operation": { password: "contract", role: "contract operation" },
  "energy industry": { password: "energy", role: "energy industry" },
};

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = React.useState({ username: "", password: "", remember: true });
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const saved = localStorage.getItem("userName") || "";
    if (saved) setForm((p) => ({ ...p, username: saved }));
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");

    const key = form.username?.trim();
    const user = USERS[key];
    if (!key || !form.password || !user || user.password !== form.password) {
      setError("Invalid credentials");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", user.role);
    if (form.remember) localStorage.setItem("userName", key);
    else localStorage.removeItem("userName");

    // ✅ Redirect directly to Bank Guarantee page
    nav("/bank-guarantee", { replace: true });
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h2>Sign in</h2>

        <label className="login-label">Username</label>
        <input
          className="login-input"
          name="username"
          value={form.username}
          onChange={onChange}
          placeholder="Username"
          autoFocus
        />

        <label className="login-label" style={{ marginTop: 10 }}>Password</label>
        <input
          className="login-input"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="••••••••"
        />

        <label className="login-check">
          <input type="checkbox" name="remember" checked={form.remember} onChange={onChange} />
          Remember me
        </label>

        {error && <div className="login-error">{error}</div>}

        <div className="login-actions">
          <button className="btn primary" type="submit">Login</button>
        </div>

        {/* Helper for testers (matches USERS above) */}
        <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
          Demo users: admin2025/admin@$2025 • ase/ase • contract operation/contract • energy industry/energy
        </div>
      </form>
    </div>
  );
}
