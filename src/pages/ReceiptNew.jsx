import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addReceipt, updateReceipt } from "../redux/slices/receiptsSlice";
import { pickFilesAsDataUrls } from "../utils/files";

export default function ReceiptNew() {
  const nav = useNavigate();
  const qs = new URLSearchParams(useLocation().search);
  const saleId = qs.get("saleId") || "";
  const editId = qs.get("editId") || "";

  const dispatch = useDispatch();

  // Find sale info to prefill customer/amount
  const sale = useSelector(s => s.sales.items.find(x => x.id === saleId));
  // If editing, find existing receipt
  const existing = useSelector(s => s.receipts.items.find(r => r.id === editId));

  const [form, setForm] = React.useState({
    voucherNo: existing?.voucherNo || "",
    paymentType: existing?.paymentType || "Cash",
    chequeNo: existing?.chequeNo || "",
    chequeBank: existing?.chequeBank || "",
    lcNo: existing?.lcNo || "",
    lcBank: existing?.lcBank || "",
    date: existing?.date || new Date().toISOString().slice(0,10),
    docs: existing?.docs || [],
  });

  const onChange = e => setForm(p=>({...p, [e.target.name]: e.target.value}));
  const onFiles = async e => {
    const docs = await pickFilesAsDataUrls(e.target.files);
    setForm(p=>({...p, docs:[...(p.docs||[]), ...docs]}));
  };
  const removeDoc = (i) => setForm(p => ({ ...p, docs: p.docs.filter((_,idx)=>idx!==i) }));

  // guard
  if (!sale && !existing) {
    return (
      <div className="page">
        <h2>{editId ? "Edit Receipt" : "Create Receipt"}</h2>
        <div className="card">No sale selected and no receipt to edit.</div>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();

    if (existing) {
      dispatch(updateReceipt({
        id: existing.id,
        voucherNo: form.voucherNo,
        paymentType: form.paymentType,
        chequeNo: form.chequeNo,
        chequeBank: form.chequeBank,
        lcNo: form.lcNo,
        lcBank: form.lcBank,
        date: form.date,
        docs: form.docs,
      }));
      alert("Receipt updated.");
      nav("/receipts");
      return;
    }

    // Adding new receipt for a sale
    const payload = {
      saleId: sale.id,
      customer: sale.customer,
      amount: sale.amount,
      date: form.date,
      voucherNo: form.voucherNo,
      paymentType: form.paymentType,
      chequeNo: form.chequeNo,
      chequeBank: form.chequeBank,
      lcNo: form.lcNo,
      lcBank: form.lcBank,
      docs: form.docs,
    };
    dispatch(addReceipt(payload));
    alert("Receipt saved.");
    nav("/receipts");
  };

  return (
    <div className="page">
      <h2>{editId ? `Edit Receipt (${existing?.saleId})` : `Create Receipt (Sale: ${sale?.id})`}</h2>
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

        {/* read-only sale info */}
        {!editId && sale && (
          <div className="muted" style={{marginTop:8}}>
            Sale #{sale.id} · Customer: <strong>{sale.customer}</strong> · Amount: <strong>{sale.amount}</strong>
          </div>
        )}

        <div className="actions">
          <button className="btn primary" type="submit">{editId ? "Update" : "Save Receipt"}</button>
          <button className="btn" type="button" onClick={()=>nav(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
