import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPurchase, updatePurchase, deletePurchase, setPurchaseFilter } from "../redux/slices/purchasesSlice"; // adjust path if needed
import { pickFilesAsDataUrls } from "../utils/files";
import { exportToCsv, importFromCsv } from "../utils/csv";
import { nanoid } from "@reduxjs/toolkit";

function ToolbarPurchases({ rows, onImportRows }) {
  const fileRef = React.useRef(null);
  const onExport = () => {
    const flat = rows.map(r => ({
      id:r.id, date:r.date, supplier:r.supplier, item:r.item,
      qty:r.qty, price:r.price, amount:r.amount, billNumber:r.billNumber
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
    <div className="card" style={{ display:"flex", gap:8 }}>
      <button className="btn" onClick={onExport}>Export CSV</button>
      <label className="btn" style={{ cursor:"pointer" }}>
        Import CSV
        <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={onImport}/>
      </label>
    </div>
  );
}

export default function Purchase() {
  const dispatch = useDispatch();
  const { items, filters } = useSelector(s => s.purchases);
  const q = (filters.q || "").toLowerCase();

  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    date:"", supplier:"", item:"", qty:"", price:"", billNumber:"", docs:[]
  });

  React.useEffect(() => { if (editing) setForm(editing); }, [editing]);

  const onChange = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const onFiles = async e => {
    const docs = await pickFilesAsDataUrls(e.target.files);
    setForm(p=>({...p, docs:[...(p.docs||[]), ...docs]}));
  };

  const submit = e => {
    e.preventDefault();
    if (editing) {
      dispatch(updatePurchase(form));
      setEditing(null);
      setForm({ date:"", supplier:"", item:"", qty:"", price:"", billNumber:"", docs:[] });
      alert("Purchase updated.");
      return;
    }
    const id = "P" + nanoid(6);
    dispatch(addPurchase({ ...form, id }));
    setForm({ date:"", supplier:"", item:"", qty:"", price:"", billNumber:"", docs:[] });
  };

  const filtered = items.filter(x =>
    [x.supplier, x.item, x.billNumber].filter(Boolean).join(" ").toLowerCase().includes(q)
  );

  return (
    <div className="page">
      <h2>Purchase</h2>

      <ToolbarPurchases
        rows={items}
        onImportRows={(rows)=>{
          rows.forEach(r=>{
            const id = r.id || ("P" + nanoid(6));
            const qty = Number(r.qty||0), price = Number(r.price||0);
            const amount = qty*price;
            dispatch(addPurchase({
              id, date:r.date, supplier:r.supplier, item:r.item,
              qty, price, amount, billNumber:r.billNumber, docs:[]
            }));
          });
          alert("Imported purchases.");
        }}
      />

      <form className="card" onSubmit={submit}>
        <div className="grid-4">
          <input className="input" type="date" name="date" value={form.date} onChange={onChange} required/>
          <input className="input" name="supplier" placeholder="Supplier" value={form.supplier} onChange={onChange} required/>
          <input className="input" name="item" placeholder="Item" value={form.item} onChange={onChange} required/>
          <input className="input" type="number" name="qty" placeholder="Qty" value={form.qty} onChange={onChange} required/>
          <input className="input" type="number" name="price" placeholder="Price" value={form.price} onChange={onChange} required/>
          <input className="input" name="billNumber" placeholder="Bill/Invoice Number" value={form.billNumber} onChange={onChange}/>
          <label className="file-label">Upload Docs<input type="file" multiple onChange={onFiles}/></label>
          <div className="span-2">{form.docs?.map((d,i)=><div key={i}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}</div>
        </div>
        <div className="actions">
          <button className="btn primary" type="submit">{editing ? "Update Purchase" : "Add Purchase"}</button>
          {editing && <button className="btn" type="button" onClick={() => { setEditing(null); setForm({ date:"", supplier:"", item:"", qty:"", price:"", billNumber:"", docs:[] }); }}>Cancel</button>}
        </div>
      </form>

      <div className="filters">
        <input className="input" placeholder="Search by supplier / item / bill #"
          value={filters.q} onChange={e=>dispatch(setPurchaseFilter({q:e.target.value}))}/>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>#</th><th>Date</th><th>Purchase ID</th><th>Supplier</th><th>Item</th><th>Qty</th>
            <th>Price</th><th>Amount</th><th>Bill #</th><th>Docs</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={p.id}>
                <td>{i+1}</td><td>{p.date}</td><td>{p.id}</td><td>{p.supplier}</td><td>{p.item}</td>
                <td>{p.qty}</td><td>{p.price}</td><td>{p.amount}</td><td>{p.billNumber || "—"}</td>
                <td>{p.docs?.map((d,j)=><div key={j}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}</td>
                <td>
                  <button className="btn" onClick={()=>setEditing(p)}>Edit</button>
                  <button className="btn danger" onClick={()=>dispatch(deletePurchase(p.id))}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={11} className="muted">No purchases</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
