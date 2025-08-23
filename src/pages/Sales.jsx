import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import { useNavigate, Link } from "react-router-dom";

import { addSale, updateSale, deleteSale, setSalesFilter } from "../redux/slices/salesSlice";
// IMPORTANT: do NOT import createPaymentForSale anymore
import { pickFilesAsDataUrls } from "../utils/files";
import { exportToCsv, importFromCsv } from "../utils/csv";

import '../pages/invoice.css' // ✅ new stylesheet

const calcTotal = (items=[]) =>
  items.reduce((sum, li) => sum + (Number(li.qty||0) * Number(li.price||0)), 0);

const encodeItems = (items=[]) =>
  items.map(li => `${(li.name||"").replace(/\|/g,"/")}:${Number(li.qty||0)}@${Number(li.price||0)}`).join("|");

const decodeItems = (s="") => s.split("|").filter(Boolean).map(tok => {
  const [left, pricePart] = tok.split("@");
  const [name, qtyStr] = (left||"").split(":");
  return { name: (name||"").trim(), qty: Number(qtyStr||0), price: Number(pricePart||0) };
});

function ToolbarSales({ rows, onImportRows }) {
  const onExport = () => {
    const flat = rows.map(r => ({
      id:r.id, date:r.date, customer:r.customer,
      items: encodeItems(r.items || []),
      amount: r.amount,
      invoiceNumbers: Array.isArray(r.invoiceNumbers) ? r.invoiceNumbers.join("|") : (r.invoiceNumber || "")
    }));
    exportToCsv("sales.csv", flat);
  };
  const onImport = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rows = await importFromCsv(f);
    onImportRows(rows);
    e.target.value = "";
  };
  return (
    <div className="card inv-toolbar">
      <button className="btn" onClick={onExport}>Export CSV</button>
      <label className="btn" style={{ cursor:"pointer" }}>
        Import CSV
        <input type="file" accept=".csv" style={{ display:"none" }} onChange={onImport}/>
      </label>
    </div>
  );
}

export default function Sales() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { items: sales, filters } = useSelector(s => s.sales);
  const q = (filters.q || "").toLowerCase();

  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    date:"", customer:"",
    items:[{ name:"", qty:"", price:"" }],
    invoiceNumbers:[""],
    invoiceDocs:[]
  });

  React.useEffect(() => {
    if (editing) {
      setForm({
        date: editing.date || "",
        customer: editing.customer || "",
        items: editing.items?.length ? editing.items : [{ name:"", qty:"", price:"" }],
        invoiceNumbers: Array.isArray(editing.invoiceNumbers)
          ? editing.invoiceNumbers
          : (editing.invoiceNumber ? [editing.invoiceNumber] : [""]),
        invoiceDocs: editing.invoiceDocs || []
      });
    }
  }, [editing]);

  const onChange = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const onFiles = async e => {
    const docs = await pickFilesAsDataUrls(e.target.files);
    setForm(p=>({...p, invoiceDocs:[...(p.invoiceDocs||[]), ...docs]}));
  };

  const setLine = (idx, key, val) => setForm(p=>{
    const arr = [...p.items]; arr[idx] = { ...arr[idx], [key]: val }; return { ...p, items: arr };
  });
  const addLine = () => setForm(p=>({ ...p, items:[...p.items, { name:"", qty:"", price:"" }] }));
  const rmLine = (idx) => setForm(p=>({ ...p, items: p.items.filter((_,i)=>i!==idx) }));

  const setInv = (idx, val) => setForm(p=>{
    const arr = [...(p.invoiceNumbers||[""])]; arr[idx] = val; return { ...p, invoiceNumbers: arr };
  });
  const addInv = () => setForm(p=>({...p, invoiceNumbers:[...(p.invoiceNumbers||[]), ""]}));
  const rmInv = (idx) => setForm(p=>({...p, invoiceNumbers:(p.invoiceNumbers||[]).filter((_,i)=>i!==idx)}));

  const submit = e => {
    e.preventDefault();
    const saleId = editing?.id || ("S" + nanoid(6));
    const amount = calcTotal(form.items);

    const payload = {
      id: saleId,
      date: form.date,
      customer: form.customer,
      items: form.items.map(li => ({ name: li.name, qty: Number(li.qty||0), price: Number(li.price||0) })),
      amount,
      invoiceNumbers: form.invoiceNumbers,
      invoiceNumber: (form.invoiceNumbers||[])[0] || "",
      invoiceDocs: form.invoiceDocs
    };

    if (editing) {
      dispatch(updateSale(payload));
      setEditing(null);
    } else {
      dispatch(addSale(payload));
      // ❌ no createPaymentForSale here
      // ✅ go to create receipt
      nav(`/receipts/new?saleId=${saleId}`, { replace: true });
    }

    setForm({ date:"", customer:"", items:[{ name:"", qty:"", price:"" }], invoiceNumbers:[""], invoiceDocs:[] });
  };

  const filtered = sales.filter(x => {
    const invs = Array.isArray(x.invoiceNumbers) ? x.invoiceNumbers : [x.invoiceNumber];
    const itemsStr = (x.items||[]).map(li=>`${li.name} ${li.qty} ${li.price}`).join(" ");
    return [x.customer, itemsStr, ...invs].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  return (
    <div className="page inv">
      <h2 className="inv-title">Sales — Invoice</h2>

      <ToolbarSales
        rows={sales}
        onImportRows={(rows)=>{
          rows.forEach(r => {
            const id = r.id || ("S" + nanoid(6));
            const invs = typeof r.invoiceNumbers === "string" && r.invoiceNumbers.includes("|")
              ? r.invoiceNumbers.split("|").map(s=>s.trim()).filter(Boolean)
              : (r.invoiceNumber ? [r.invoiceNumber] : []);
            const items = r.items ? decodeItems(r.items) : [];
            const amount = r.amount ? Number(r.amount) : calcTotal(items);
            dispatch(addSale({
              id, date:r.date, customer:r.customer,
              items, amount, invoiceNumbers: invs, invoiceNumber: invs[0] || "", invoiceDocs:[]
            }));
          });
          alert("Imported sales.");
        }}
      />

      {/* Invoice Card */}
      <form className="card inv-card" onSubmit={submit}>
        <div className="inv-grid">
          <input className="input" type="date" name="date" value={form.date} onChange={onChange} required />
          <input className="input" name="customer" placeholder="Customer" value={form.customer} onChange={onChange} required />

          <div className="span-2 inv-lines">
            <div className="inv-sec-title">Products</div>
            {form.items.map((li, idx)=>(
              <div key={idx} className="inv-line">
                <input className="input" placeholder="Product name" value={li.name} onChange={e=>setLine(idx,"name",e.target.value)} />
                <input className="input" type="number" placeholder="Qty" value={li.qty} onChange={e=>setLine(idx,"qty",e.target.value)} />
                <input className="input" type="number" placeholder="Price" value={li.price} onChange={e=>setLine(idx,"price",e.target.value)} />
                {form.items.length>1 && (
                  <button type="button" className="btn danger" onClick={()=>rmLine(idx)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" className="btn" onClick={addLine}>+ Add product</button>
          </div>

          <div className="span-2">
            <div className="inv-sec-title">Invoice Numbers</div>
            {form.invoiceNumbers?.map((val, idx)=>(
              <div key={idx} className="inv-row">
                <input className="input" placeholder={`Invoice #${idx+1}`} value={val} onChange={(e)=>setInv(idx, e.target.value)} />
                {form.invoiceNumbers.length > 1 && (
                  <button type="button" className="btn danger" onClick={()=>rmInv(idx)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" className="btn" onClick={addInv}>+ Add invoice</button>
          </div>

          <label className="file-label">Upload Invoices<input type="file" multiple onChange={onFiles}/></label>
          <div className="span-2">
            {form.invoiceDocs?.map((d,i)=><div key={i}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}
          </div>
        </div>

        <div className="inv-footer">
          <div className="muted">Total: <strong>{calcTotal(form.items)}</strong></div>
          <div className="actions">
            <button className="btn primary" type="submit">{editing ? "Update Sale" : "Save & Go to Receipt"}</button>
            {editing && <button className="btn" type="button" onClick={() => { setEditing(null); setForm({ date:"", customer:"", items:[{name:"",qty:"",price:""}], invoiceNumbers:[""], invoiceDocs:[] }); }}>Cancel</button>}
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="table-wrap inv-table">
        <table className="table">
          <thead><tr>
            <th>#</th><th>Date</th><th>Sale ID</th><th>Customer</th>
            <th>Products</th><th>Amount</th><th>Invoices</th><th>Docs</th><th>Receipt</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id}>
                <td>{i+1}</td><td>{s.date}</td><td>{s.id}</td><td>{s.customer}</td>
                <td>
                  {(s.items||[]).map((li, j)=>(
                    <div key={j}>{li.name} — {li.qty} × {li.price} = {(Number(li.qty||0)*Number(li.price||0))}</div>
                  ))}
                </td>
                <td>{s.amount}</td>
                <td>{Array.isArray(s.invoiceNumbers) ? s.invoiceNumbers.join(" / ") : (s.invoiceNumber || "—")}</td>
                <td>{s.invoiceDocs?.map((d,j)=><div key={j}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}</td>
                <td><Link to={`/receipts/new?saleId=${s.id}`}>Add Receipt</Link></td>
                <td>
                  <button className="btn" onClick={()=>setEditing(s)}>Edit</button>
                  <button className="btn danger" onClick={()=>dispatch(deleteSale(s.id))}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={10} className="muted">No sales</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
