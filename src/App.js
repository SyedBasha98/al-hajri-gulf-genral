import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";

import BankGuaranteeTab from "./pages/BankGuaranteeTab";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";
import Payments from "./pages/Payments";
import ReceiptNew from "./pages/ReceiptNew";        // (optional if still used)
import ReceivePayment from "./pages/ReceivePayment"; // if you added it
import LetterOfCredit from "./pages/LetterOfCredit";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <div className="app-wrap">
      <Header />
      <div className="page-wrap">
        <Routes>
          <Route path="/" element={<Navigate to="/bank-guarantee" />} />
          <Route path="/bank-guarantee" element={<BankGuaranteeTab />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/receipts/new" element={<ReceiptNew />} />
          <Route path="/payments/receive" element={<ReceivePayment />} />
          <Route path="/letter-of-credit" element={<LetterOfCredit />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}
