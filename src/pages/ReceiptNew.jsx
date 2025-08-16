import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { markPaid } from "../redux/slices/paymentsSlice";
import { pickFilesAsDataUrls } from "../utils/files";

export default function ReceiptNew() {
  const nav = useNavigate();
  const saleId = new URLSearchParams(useLocation().search).get("saleId");
  const dispatch = useDispatch();
  const payment = useSelector(s => s.payments.items.find(p => p.saleId === saleId));

  const [form, setForm] = React.useState({
    voucherNo:"", paymentType:"Cash", chequeNo:"", chequeBank:"", lcNo:"", lcBank:"",
    date:new Date().toISOString().slice(0,10), docs:[]
  });

  if (!payment) {
    return <div className="page"><h2>Create Receipt</h2><div className="card">No payment found for this sale.</div></div>;
  }

  const onChange = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const onFiles = async e => {
    const docs = await pickFilesAsDataUrls(e.target.files);
    setForm(p=>({...p, docs:[...(p.docs||[]), ...docs]}));
  };

  const submit = e => {
    e.preventDefault();
    const updated = { ...payment, status:"Paid", receipt:{ ...form } };
    dispatch(markPaid(updated));
    alert("Payment marked as Paid with receipt.");
    nav("/payments");
  };

  return (
    <div className="page">
      <h2>Create Receipt (Sale: {saleId})</h2>
      <form className="card" onSubmit={submit}>
        <div className="grid-4">
          <input className="input" name="voucherNo" placeholder="Voucher No" value={form.voucherNo} onChange={onChange} required/>
          <select className="input" name="paymentType" value={form.paymentType} onChange={onChange}>
            <option>Cash</option><option>Cheque</option><option>LC</option><option>Bank</option><option>Online</option>
          </select>
          <input className="input" type="date" name="date" value={form.date} onChange={onChange}/>

          {form.paymentType==="Cheque" && (
            <>
              <input className="input" name="chequeNo" placeholder="Cheque No" value={form.chequeNo} onChange={onChange} required/>
              <input className="input" name="chequeBank" placeholder="Cheque Bank" value={form.chequeBank} onChange={onChange} required/>
            </>
          )}
          {form.paymentType==="LC" && (
            <>
              <input className="input" name="lcNo" placeholder="LC No" value={form.lcNo} onChange={onChange} required/>
              <input className="input" name="lcBank" placeholder="LC Bank" value={form.lcBank} onChange={onChange} required/>
            </>
          )}

          <label className="file-label">Upload Receipt Docs<input type="file" multiple onChange={onFiles}/></label>
          <div className="span-4">{form.docs?.map((d,i)=><div key={i}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}</div>
        </div>
        <div className="actions">
          <button className="btn primary" type="submit">Save Receipt</button>
          <button className="btn" type="button" onClick={()=>nav(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
