import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const items = [
    { to: "/bank-guarantee", label: "Bank Guarantee" },
    { to: "/sales", label: "Sales" },
    { to: "/purchase", label: "Purchase" },
    { to: "/payments", label: "Payments" },
    { to: "/letter-of-credit", label: "Letter of Credit" },
    { to: "/settings", label: "Settings" },
  ];
  return (
    <header className="hdr">
      <div className="hdr-left">My Company</div>
      <button className="hdr-toggle" onClick={() => setOpen(o => !o)}>☰</button>
      <nav className={`hdr-nav ${open ? "open" : ""}`}>
        {items.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => "hdr-link" + (isActive ? " active" : "")}
            onClick={() => setOpen(false)}
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
