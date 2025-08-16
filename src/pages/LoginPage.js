import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const USERS = {
  "admin@2025": { password: "admin@$2025", role: "admin" },
  ase: { password: "ase", role: "ase" },
  "contract operation": { password: "contract", role: "contract operation" },
  "energy industry": { password: "energy", role: "energy industry" },
};

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = USERS[username];
    if (user && user.password === password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", user.role);
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div>
      <h2>Login Page</h2>
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LoginPage;
