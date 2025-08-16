import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { markPaid } from "../redux/slices/paymentsSlice"; // adjust path if needed
import { pickFilesAsDataUrls } from "../utils/files";

export default function ReceivePayment() {
  const nav = useNavigate();
  const paymentId = new URLSearchParams(useLocation().search).get("paymentId");
  const dispatch = useDispatch();
  const payment = useSelector(s => s.payments.items.find(p => p.id === paymentId));

  const [form, setForm] = React.useState({
    voucherNo: payment?.receipt?.voucherNo || "",
    paymentType: payment?.receipt?.paymentType || "Cash",
    chequeNo: payment?.receipt?.chequeNo || "",
    chequeBank: payment?.receipt?.chequeBank || "",
    lcNo: payment?.receipt?.lcNo || "",
    lcBank: payment?.receipt?.lcBank || "",
    date: payment?.receipt?.date || new Date().toISOString().slice(0,10),
    docs: payment?.receipt?.docs || [],
  });

  if (!payment) {
    return <div className="page"><h2>Receive Payment</h2><div className="card">Payment not found.</div></div>;
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const onFiles = async e => {
    const docs = await pickFilesAsDataUrls(e.target.files);
    setForm(p => ({ ...p, docs: [...(p.docs || []), ...docs] }));
  };
  const removeDoc = (i) => setForm(p => ({ ...p, docs: p.docs.filter((_,idx)=>idx!==i) }));

  const submit = (e) => {
    e.preventDefault();
    const updated = { ...payment, status: "Paid", receipt: { ...form } };
    dispatch(markPaid(updated));
    alert("Payment saved.");
    nav("/payments");
  };

  return (
    <div className="page">
      <h2>Receive Payment (Payment: {paymentId})</h2>
      <form className="card" onSubmit={submit}>
        <div className="grid-4">
          <input className="input" name="voucherNo" placeholder="Voucher No" value={form.voucherNo} onChange={onChange} required />
          <select className="input" name="paymentType" value={form.paymentType} onChange={onChange}>
            <option>Cash</option><option>Cheque</option><option>LC</option><option>Bank</option><option>Online</option>
          </select>
          <input className="input" type="date" name="date" value={form.date} onChange={onChange} />

          {form.paymentType === "Cheque" && (
            <>
              <input className="input" name="chequeNo" placeholder="Cheque No" value={form.chequeNo} onChange={onChange} required />
              <input className="input" name="chequeBank" placeholder="Cheque Bank" value={form.chequeBank} onChange={onChange} required />
            </>
          )}
          {form.paymentType === "LC" && (
            <>
              <input className="input" name="lcNo" placeholder="LC No" value={form.lcNo} onChange={onChange} required />
              <input className="input" name="lcBank" placeholder="LC Bank" value={form.lcBank} onChange={onChange} required />
            </>
          )}

          <label className="file-label">Upload Receipt Docs
            <input type="file" multiple onChange={onFiles} />
          </label>
          <div className="span-4">
            {form.docs?.map((d,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <a href={d.dataUrl} download={d.name}>{d.name}</a>
                <button type="button" className="btn danger" onClick={()=>removeDoc(i)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
        <div className="actions">
          <button className="btn primary" type="submit">Save</button>
          <button className="btn" type="button" onClick={()=>nav(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
