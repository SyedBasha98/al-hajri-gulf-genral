import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../images/Screenshot_2025-08-22_122335-removebg-preview.png";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);

  const items = [
    { to: "/bank-guarantee", label: "Bank Guarantee" },
    { to: "/sales", label: "Sales" },
    { to: "/purchase", label: "Purchase" },
    { to: "/receipts", label: "Receipts" },   // ✅ sales money received
    { to: "/payments", label: "Payments" },   // ✅ purchase money paid
    { to: "/letter-of-credit", label: "Letter of Credit" },
    { to: "/settings", label: "Settings" },
 //    { to: "/accounting", key:"accounting", label: "Accounting" },
  ];

  return (
    <header className="hdr">
      <div className="hdr-inner">
        <div className="hdr-brand">
          <img className="hdr-logo" src={logo} alt="AL HAJRI Gulf Logo" />
          <div className="hdr-title">
            AL HAJRI Gulf General Trading & Contracting Company
          </div>
        </div>

        <button
          className="hdr-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>

        <nav className={`hdr-nav ${open ? "open" : ""}`}>
          {items.map((it) => (
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
      </div>
    </header>
  );
}
