import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setReceiptFilter, deleteReceipt } from "../redux/slices/receiptsSlice";
import { Link, useNavigate } from "react-router-dom";

export default function Receipts() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { items, filters } = useSelector(s => s.receipts);
  const q = (filters.q || "").toLowerCase();

  const filtered = items.filter(r =>
    [r.saleId, r.customer, String(r.amount), r.voucherNo]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q)
  );

  return (
    <div className="page">
      <h2>Receipts</h2>

      <div className="filters">
        <input
          className="input"
          placeholder="Search by sale id / customer / voucher"
          value={filters.q}
          onChange={(e)=>dispatch(setReceiptFilter({ q: e.target.value }))}
        />
        <Link className="btn primary" to="/receipts/new">New Receipt</Link>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>Receipt ID</th><th>Sale ID</th><th>Customer</th>
              <th>Amount</th><th>Date</th><th>Voucher</th><th>Type</th><th>Docs</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id}>
                <td>{i+1}</td>
                <td>{r.id}</td>
                <td>{r.saleId}</td>
                <td>{r.customer}</td>
                <td>{r.amount}</td>
                <td>{r.date}</td>
                <td>{r.voucherNo || "—"}</td>
                <td>{r.paymentType}</td>
                <td>{r.docs?.map((d, j)=><div key={j}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}</td>
                <td style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                  <button className="btn" onClick={()=>nav(`/receipts/new?saleId=${r.saleId}&editId=${r.id}`)}>Edit</button>
                  <button
                    className="btn danger"
                    onClick={()=>{
                      if (window.confirm("Delete this receipt?")) {
                        dispatch(deleteReceipt(r.id));
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td colSpan={10} className="muted">No receipts</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
