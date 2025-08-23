import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentFilter, deletePayment } from "../redux/slices/paymentsSlice";
import { exportToCsv, importFromCsv } from "../utils/csv";
import { useNavigate } from "react-router-dom";

function ToolbarPayments({ rows, onImport }) {
  const fileRef = React.useRef(null);
  const onExport = () => {
    const flat = rows.map(r => ({
      id:r.id,
      purchaseId:r.purchaseId || "",
      supplier:r.supplier || "",
      amount:r.amount,
      status:r.status,
      date:r.date,
      voucherNo:r.receipt?.voucherNo || "",
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
  // Only purchase payments here (ignore any legacy sale rows if present)
  const filtered = items
    .filter(p => p.type !== "sale")
    .filter(p =>
      (filters.status==="ALL" || p.status===filters.status) &&
      [p.supplier, String(p.amount), p.purchaseId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );

  return (
    <div className="page">
      <h2>Payments (Purchases)</h2>

      <ToolbarPayments
        rows={filtered}
        onImport={(rows)=>alert(`Loaded ${rows.length} CSV row(s).`)}
      />

      <div className="filters">
        <select className="input" value={filters.status} onChange={e=>dispatch(setPaymentFilter({status:e.target.value}))}>
          <option value="ALL">All</option><option>Unpaid</option><option>Paid</option>
        </select>
        <input className="input" placeholder="Search by supplier / purchase id / amount" value={filters.q} onChange={e=>dispatch(setPaymentFilter({q:e.target.value}))}/>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Purchase ID</th><th>Supplier</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={p.id}>
                <td>{i+1}</td>
                <td>{p.purchaseId || "—"}</td>
                <td>{p.supplier || "—"}</td>
                <td>{p.amount}</td>
                <td>{p.status}</td>
                <td style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                  <button className="btn" onClick={()=>nav(`/payments/receive?paymentId=${p.id}`)}>
                    {p.status === "Unpaid" ? "Receive / Pay" : "Edit Payment"}
                  </button>
                  <button
                    className="btn danger"
                    onClick={()=>{
                      if (window.confirm("Delete this payment?")) {
                        dispatch(deletePayment(p.id));
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={6} className="muted">No payments</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
