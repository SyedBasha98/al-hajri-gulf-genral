import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentFilter /*, createPaymentForSale*/ } from "../redux/slices/paymentsSlice"; // adjust path if needed
import { exportToCsv, importFromCsv } from "../utils/csv";
import { useNavigate, Link } from "react-router-dom";

function ToolbarPayments({ rows, onImport }) {
  const fileRef = React.useRef(null);
  const onExport = () => {
    const flat = rows.map(r => ({
      id:r.id, saleId:r.saleId, customer:r.customer, amount:r.amount,
      status:r.status, date:r.date, voucherNo:r.receipt?.voucherNo || "",
      paymentType:r.receipt?.paymentType || ""
    }));
    exportToCsv("payments.csv", flat);
  };
  return (
    <div className="card" style={{ display:"flex", gap:8 }}>
      <button className="btn" onClick={onExport}>Export CSV</button>
      <label className="btn" style={{ cursor:"pointer" }}>
        Import CSV
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display:"none" }}
          onChange={async (e)=>{
            const f = e.target.files?.[0];
            if (!f) return;
            const rows = await importFromCsv(f);
            onImport(rows);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

export default function Payments() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { items, filters } = useSelector(s => s.payments);
  const q = (filters.q || "").toLowerCase();

  const filtered = items.filter(p =>
    (filters.status==="ALL" || p.status===filters.status) &&
    [p.customer, String(p.amount), p.saleId].join(" ").toLowerCase().includes(q)
  );

  return (
    <div className="page">
      <h2>Payments</h2>

      <ToolbarPayments
        rows={items}
        onImport={(rows)=>{
          // Example: You can convert CSV rows into payments here if desired.
          // For safety, leaving as no-op with an alert.
          alert(`Loaded ${rows.length} CSV row(s). Map to create payments if you want.`);
        }}
      />

      <div className="filters">
        <select className="input" value={filters.status} onChange={e=>dispatch(setPaymentFilter({status:e.target.value}))}>
          <option value="ALL">All</option><option>Unpaid</option><option>Paid</option>
        </select>
        <input className="input" placeholder="Search" value={filters.q} onChange={e=>dispatch(setPaymentFilter({q:e.target.value}))}/>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>#</th><th>Sale ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Receipt</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={p.id}>
                <td>{i+1}</td>
                <td>{p.saleId}</td>
                <td>{p.customer}</td>
                <td>{p.amount}</td>
                <td>{p.status}</td>
                <td>
                  {p.status==="Unpaid"
                    ? <Link to={`/receipts/new?saleId=${p.saleId}`}>Create Receipt</Link>
                    : (p.receipt?.voucherNo ? `Voucher: ${p.receipt.voucherNo}` : "—")}
                </td>
                <td>
                  <button
                    className="btn primary"
                    onClick={() => nav(`/payments/receive?paymentId=${p.id}`)}
                  >
                    {p.status === "Unpaid" ? "Receive" : "Edit Receipt"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={7} className="muted">No payments</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
