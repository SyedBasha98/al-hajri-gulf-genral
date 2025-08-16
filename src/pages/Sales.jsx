import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSale, updateSale, deleteSale, setSalesFilter } from "../redux/slices/salesSlice"; // adjust path if needed
import { createPaymentForSale } from "../redux/slices/paymentsSlice";
import { pickFilesAsDataUrls } from "../utils/files";
import { exportToCsv, importFromCsv } from "../utils/csv";
import { Link } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";

function ToolbarSales({ rows, onImportRows }) {
  const fileRef = React.useRef(null);
  const onExport = () => {
    const flat = rows.map(r => ({
      id:r.id, date:r.date, customer:r.customer, product:r.product,
      qty:r.qty, price:r.price, amount:r.amount, invoiceNumber:r.invoiceNumber
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
    <div className="card" style={{ display:"flex", gap:8 }}>
      <button className="btn" onClick={onExport}>Export CSV</button>
      <label className="btn" style={{ cursor:"pointer" }}>
        Import CSV
        <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={onImport}/>
      </label>
    </div>
  );
}

export default function Sales() {
  const dispatch = useDispatch();
  const { items, filters } = useSelector(s => s.sales);
  const q = (filters.q || "").toLowerCase();

  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    date:"", customer:"", product:"", qty:"", price:"",
    invoiceNumber:"", invoiceDocs:[]
  });

  React.useEffect(() => { if (editing) setForm(editing); }, [editing]);

  const onChange = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const onFiles = async e => {
    const docs = await pickFilesAsDataUrls(e.target.files);
    setForm(p=>({...p, invoiceDocs:[...(p.invoiceDocs||[]), ...docs]}));
  };

  const submit = e => {
    e.preventDefault();
    if (editing) {
      dispatch(updateSale(form));
      setEditing(null);
      setForm({ date:"", customer:"", product:"", qty:"", price:"", invoiceNumber:"", invoiceDocs:[] });
      alert("Sale updated.");
      return;
    }
    const saleId = "S" + nanoid(6);
    const payload = { ...form, id: saleId };
    const amount = Number(form.qty)*Number(form.price);
    dispatch(addSale(payload));
    dispatch(createPaymentForSale({ id: saleId, customer: form.customer, amount, date: form.date }));
    setForm({ date:"", customer:"", product:"", qty:"", price:"", invoiceNumber:"", invoiceDocs:[] });
    alert("Sale added and Unpaid payment created.");
  };

  const filtered = items.filter(x =>
    [x.customer, x.product, x.invoiceNumber].filter(Boolean).join(" ").toLowerCase().includes(q)
  );

  return (
    <div className="page">
      <h2>Sales</h2>

      <ToolbarSales
        rows={items}
        onImportRows={(rows)=>{
          rows.forEach(r => {
            const id = r.id || ("S" + nanoid(6));
            const qty = Number(r.qty||0), price = Number(r.price||0);
            const amount = qty*price;
            dispatch(addSale({
              id, date:r.date, customer:r.customer, product:r.product,
              qty, price, amount, invoiceNumber:r.invoiceNumber, invoiceDocs:[]
            }));
            // Optionally also create Unpaid payment:
            dispatch(createPaymentForSale({ id, customer: r.customer, amount, date: r.date }));
          });
          alert("Imported sales.");
        }}
      />

      <form className="card" onSubmit={submit}>
        <div className="grid-4">
          <input className="input" type="date" name="date" value={form.date} onChange={onChange} required />
          <input className="input" name="customer" placeholder="Customer" value={form.customer} onChange={onChange} required />
          <input className="input" name="product" placeholder="Product" value={form.product} onChange={onChange} required />
          <input className="input" type="number" name="qty" placeholder="Qty" value={form.qty} onChange={onChange} required />
          <input className="input" type="number" name="price" placeholder="Price" value={form.price} onChange={onChange} required />
          <input className="input" name="invoiceNumber" placeholder="Invoice Number" value={form.invoiceNumber} onChange={onChange} />
          <label className="file-label">Upload Invoices<input type="file" multiple onChange={onFiles}/></label>
          <div className="span-2">
            {form.invoiceDocs?.map((d,i)=><div key={i}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}
          </div>
        </div>
        <div className="actions">
          <button className="btn primary" type="submit">{editing ? "Update Sale" : "Add Sale"}</button>
          {editing && <button className="btn" type="button" onClick={() => { setEditing(null); setForm({ date:"", customer:"", product:"", qty:"", price:"", invoiceNumber:"", invoiceDocs:[] }); }}>Cancel</button>}
        </div>
      </form>

      <div className="filters">
        <input className="input" placeholder="Search by customer / product / invoice #"
          value={filters.q} onChange={e=>dispatch(setSalesFilter({q:e.target.value}))}/>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>#</th><th>Date</th><th>Sale ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Price</th>
            <th>Amount</th><th>Invoice #</th><th>Invoices</th><th>Receipt</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id}>
                <td>{i+1}</td><td>{s.date}</td><td>{s.id}</td><td>{s.customer}</td><td>{s.product}</td>
                <td>{s.qty}</td><td>{s.price}</td><td>{s.amount}</td><td>{s.invoiceNumber || "—"}</td>
                <td>{s.invoiceDocs?.map((d,j)=><div key={j}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>)}</td>
                <td><Link to={`/receipts/new?saleId=${s.id}`}>Add Receipt</Link></td>
                <td>
                  <button className="btn" onClick={()=>setEditing(s)}>Edit</button>
                  <button className="btn danger" onClick={()=>dispatch(deleteSale(s.id))}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={12} className="muted">No sales</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
