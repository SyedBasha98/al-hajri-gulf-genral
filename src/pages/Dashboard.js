import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <ul>
          <li><Link to="/bank-guarantee">Bank Guarantee</Link></li>
          <li><Link to="/sales">Sales</Link></li>
          <li><Link to="/purchase">Purchase</Link></li>
          <li><Link to="/payments">Payments</Link></li>
          <li><Link to="/letter-of-credit">Letter of Credit</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Dashboard;
