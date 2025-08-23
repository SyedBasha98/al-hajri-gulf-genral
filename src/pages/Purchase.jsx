import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";

import { addPurchase, updatePurchase, deletePurchase, setPurchaseFilter } from "../redux/slices/purchasesSlice";
import { createPaymentForPurchase } from "../redux/slices/paymentsSlice";
import { pickFilesAsDataUrls } from "../utils/files";
import { exportToCsv, importFromCsv } from "../utils/csv";

const calcTotal = (items=[]) =>
  items.reduce((sum, li) => sum + (Number(li.qty||0) * Number(li.price||0)), 0);

const encodeItems = (items=[]) =>
  items.map(li => `${(li.name||"").replace(/\|/g,"/")}:${Number(li.qty||0)}@${Number(li.price||0)}`).join("|");

const decodeItems = (s="") => s.split("|").filter(Boolean).map(tok => {
  const [left, pricePart] = tok.split("@");
  const [name, qtyStr] = (left||"").split(":");
  return { name: (name||"").trim(), qty: Number(qtyStr||0), price: Number(pricePart||0) };
});

function ToolbarPurchases({ rows, onImportRows }) {
  const onExport = () => {
    const flat = rows.map(r => ({
      id:r.id, date:r.date, supplier:r.supplier,
      items: encodeItems(r.items || []),
      amount: r.amount,
      billNumbers: Array.isArray(r.billNumbers) ? r.billNumbers.join("|") : (r.billNumber || "")
    }));
    exportToCsv("purchases.csv", flat);
  };
  const onImport = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rows = await importFromCsv(f);
    onImportRows(rows);
    e.target.value = "";
  };
  return (
    <div className="card" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      <button className="btn" onClick={onExport}>Export CSV</button>
      <label className="btn" style={{ cursor:"pointer" }}>
        Import CSV
        <input type="file" accept=".csv" style={{ display:"none" }} onChange={onImport}/>
      </label>
    </div>
  );
}

export default function Purchase() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { items: purchases, filters } = useSelector(s => s.purchases);
  const q = (filters.q || "").toLowerCase();

  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    date:"", supplier:"",
    items:[{ name:"", qty:"", price:"" }],
    billNumbers:[""],
    docs:[]
  });

  React.useEffect(() => {
    if (editing) {
      setForm({
        date: editing.date || "",
        supplier: editing.supplier || "",
        items: editing.items?.length ? editing.items : [{ name:"", qty:"", price:"" }],
        billNumbers: Array.isArray(editing.billNumbers)
          ? editing.billNumbers
          : (editing.billNumber ? [editing.billNumber] : [""]),
        docs: editing.docs || []
      });
    }
  }, [editing]);

  const onChange = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const onFiles = async e => {
    const docs = await pickFilesAsDataUrls(e.target.files);
    setForm(p=>({...p, docs:[...(p.docs||[]), ...docs]}));
  };

  const setLine = (idx, key, val) => setForm(p=>{
    const arr = [...p.items]; arr[idx] = { ...arr[idx], [key]: val }; return { ...p, items: arr };
  });
  const addLine = () => setForm(p=>({ ...p, items:[...p.items, { name:"", qty:"", price:"" }] }));
  const rmLine = (idx) => setForm(p=>({ ...p, items: p.items.filter((_,i)=>i!==idx) }));

  const setBill = (idx, val) => setForm(p=>{
    const arr = [...(p.billNumbers||[""])]; arr[idx] = val; return { ...p, billNumbers: arr };
  });
  const addBill = () => setForm(p=>({...p, billNumbers:[...(p.billNumbers||[]), ""]}));
  const rmBill = (idx) => setForm(p=>({...p, billNumbers:(p.billNumbers||[]).filter((_,i)=>i!==idx)}));

  const submit = e => {
    e.preventDefault();
    const id = editing?.id || ("P" + nanoid(6));
    const amount = calcTotal(form.items);

    const payload = {
      id,
      date: form.date,
      supplier: form.supplier,
      items: form.items.map(li => ({ name: li.name, qty: Number(li.qty||0), price: Number(li.price||0) })),
      amount,
      billNumbers: form.billNumbers,
      billNumber: (form.billNumbers||[])[0] || "",
      docs: form.docs
    };

    if (editing) {
      dispatch(updatePurchase(payload));
      setEditing(null);
    } else {
      dispatch(addPurchase(payload));
      // create an UNPAID payment for this purchase and go to Payments
      dispatch(createPaymentForPurchase({ id, supplier: form.supplier, amount, date: form.date }));
      nav("/payments", { replace: true });
    }

    setForm({ date:"", supplier:"", items:[{name:"",qty:"",price:""}], billNumbers:[""], docs:[] });
  };

  const filtered = purchases.filter(x => {
    const bills = Array.isArray(x.billNumbers) ? x.billNumbers : [x.billNumber];
    const itemsStr = (x.items||[]).map(li=>`${li.name} ${li.qty} ${li.price}`).join(" ");
    return [x.supplier, itemsStr, ...bills].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  return (
    <div className="page">
      <h2>Purchase</h2>

      <ToolbarPurchases
        rows={purchases}
        onImportRows={(rows)=>{
          rows.forEach(r=>{
            const id = r.id || ("P" + nanoid(6));
            const bills = typeof r.billNumbers === "string" && r.billNumbers.includes("|")
              ? r.billNumbers.split("|").map(s=>s.trim()).filter(Boolean)
              : (r.billNumber ? [r.billNumber] : []);
            const items = r.items ? decodeItems(r.items) : [];
            const amount = r.amount ? Number(r.amount) : calcTotal(items);
            dispatch(addPurchase({
              id, date:r.date, supplier:r.supplier,
              items, amount, billNumbers:bills, billNumber:bills[0] || "", docs:[]
            }));
          });
          alert("Imported purchases.");
        }}
      />

      <form className="card" onSubmit={submit}>
        <div className="grid-4">
          <input className="input" type="date" name="date" value={form.date} onChange={onChange} required/>
          <input className="input" name="supplier" placeholder="Supplier" value={form.supplier} onChange={onChange} required/>

          <div className="span-4">
            <label className="login-label">Products (multiple)</label>
            {form.items.map((li, idx)=>(
              <div key={idx} style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr auto", gap:8, marginBottom:6}}>
                <input className="input" placeholder="Product name" value={li.name} onChange={e=>setLine(idx,"name",e.target.value)} />
                <input className="input" type="number" placeholder="Qty" value={li.qty} onChange={e=>setLine(idx,"qty",e.target.value)} />
                <input className="input" type="number" placeholder="Price" value={li.price} onChange={e=>setLine(idx,"price",e.target.value)} />
                <div style={{display:"flex", gap:6}}>
                  {form.items.length>1 && <button type="button" className="btn danger" onClick={()=>rmLine(idx)}>Remove</button>}
                </div>
              </div>
            ))}
            <button type="button" className="btn" onClick={addLine}>+ Add product</button>
          </div>

          <div className="span-2">
            <label className="login-label">Bill / Invoice Numbers</label>
            {form.billNumbers?.map((val, idx)=>(
              <div key={idx} style={{display:"flex", gap:8, marginBottom:6}}>
                <input className="input" placeholder={`Bill #${idx+1}`} value={val} onChange={(e)=>setBill(idx, e.target.value)} />
                {form.billNumbers.length > 1 && (
                  <button type="button" className="btn danger" onClick={()=>rmBill(idx)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" className="btn" onClick={addBill}>+ Add bill</button>
          </div>

          <label className="file-label">Upload Docs<input type="file" multiple onChange={onFiles}/></label>
          <div className="span-2">{form.docs?.map((d,i)=><div key={i}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}</div>
        </div>

        <div className="actions">
          <div className="muted">Total: <strong>{calcTotal(form.items)}</strong></div>
          <button className="btn primary" type="submit">{editing ? "Update Purchase" : "Add Purchase"}</button>
          {editing && <button className="btn" type="button" onClick={() => { setEditing(null); setForm({ date:"", supplier:"", items:[{name:"",qty:"",price:""}], billNumbers:[""], docs:[] }); }}>Cancel</button>}
        </div>
      </form>

      <div className="filters">
        <input className="input" placeholder="Search by supplier / product / bill #"
          value={filters.q} onChange={e=>dispatch(setPurchaseFilter({q:e.target.value}))}/>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>#</th><th>Date</th><th>Purchase ID</th><th>Supplier</th>
            <th>Products</th><th>Amount</th><th>Bills</th><th>Docs</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {purchases.filter(Boolean).length===0 && filtered.length===0 && (
              <tr><td colSpan={9} className="muted">No purchases</td></tr>
            )}
            {filtered.map((p,i)=>(
              <tr key={p.id}>
                <td>{i+1}</td><td>{p.date}</td><td>{p.id}</td><td>{p.supplier}</td>
                <td>
                  {(p.items||[]).map((li, j)=>(
                    <div key={j}>{li.name} — {li.qty} × {li.price} = {(Number(li.qty||0)*Number(li.price||0))}</div>
                  ))}
                </td>
                <td>{p.amount}</td>
                <td>{Array.isArray(p.billNumbers) ? p.billNumbers.join(" / ") : (p.billNumber || "—")}</td>
                <td>{p.docs?.map((d,j)=><div key={j}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}</td>
                <td>
                  <button className="btn" onClick={()=>setEditing(p)}>Edit</button>
                  <button className="btn danger" onClick={()=>dispatch(deletePurchase(p.id))}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
