import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addGuarantee, updateGuarantee, deleteGuarantee, setBGFilters } from "../redux/slices/bankGuaranteeSlice"; // adjust path if needed
import { pickFilesAsDataUrls } from "../utils/files";
import { exportToCsv, importFromCsv } from "../utils/csv";

const daysDiff = (dateStr) => {
  const end = new Date(dateStr);
  const now = new Date();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};
const expiryText = (dateStr) => {
  const d = daysDiff(dateStr);
  if (isNaN(d)) return "—";
  if (d > 0) return `in ${d} day${d === 1 ? "" : "s"}`;
  if (d === 0) return "today";
  return `${Math.abs(d)} day${d === -1 ? "" : "s"} ago`;
};

function ToolbarBG({ rows, onImportRows }) {
  const fileRef = React.useRef(null);
  const onExport = () => {
    const flat = rows.map(r => ({
      beneficiary: r.beneficiary,
      guaranteeNo: r.guaranteeNo,
      issueDate: r.issueDate,
      expiryDate: r.expiryDate,
      amount: r.amount,
      poValue: r.poValue,
      poNo: r.poNo,
      clientPoNo: r.clientPoNo,
      rfq: r.rfq,
      bank: r.bank,
      type: r.type,
      plant: r.plant,
      status: r.status,
      remarks: r.remarks,
    }));
    exportToCsv("bank_guarantees.csv", flat);
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

export default function BankGuaranteeTab() {
  const dispatch = useDispatch();
  const { items, filters } = useSelector(s => s.bankGuarantees);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    beneficiary:"", guaranteeNo:"", issueDate:"", expiryDate:"",
    amount:"", poValue:"", poNo:"", clientPoNo:"", rfq:"",
    bank:"Gulf Bank", type:"Initial", plant:"ASE", status:"Active",
    documents:[], remarks:""
  });
  React.useEffect(()=>{ if(editing) setForm(editing); },[editing]);

  const onChange = e => setForm(p=>({ ...p, [e.target.name]: e.target.value }));
  const onFiles = async e => {
    const docs = await pickFilesAsDataUrls(e.target.files);
    setForm(p=>({ ...p, documents:[...(p.documents||[]), ...docs] }));
  };
  const removeDoc = idx => setForm(p=>({ ...p, documents: p.documents.filter((_,i)=>i!==idx) }));

  const submit = e => {
    e.preventDefault();
    if (editing) {
      dispatch(updateGuarantee(form));
      setEditing(null);
    } else {
      dispatch(addGuarantee(form));
    }
    setForm({
      beneficiary:"", guaranteeNo:"", issueDate:"", expiryDate:"",
      amount:"", poValue:"", poNo:"", clientPoNo:"", rfq:"",
      bank:"Gulf Bank", type:"Initial", plant:"ASE", status:"Active",
      documents:[], remarks:""
    });
  };

  const f = filters;
  const q = (f.q||"").toLowerCase();
  const filtered = items.filter(r=>{
    const text = [r.beneficiary,r.guaranteeNo,r.poNo,r.clientPoNo,r.rfq,r.remarks].filter(Boolean).join(" ").toLowerCase();
    const bankOk = f.bank==="ALL" || r.bank===f.bank;
    const typeOk = f.type==="ALL" || r.type===f.type;
    const plantOk= f.plant==="ALL"|| r.plant===f.plant;
    const expired = new Date(r.expiryDate) < new Date();
    const liveStatus = expired ? "Expired" : (r.status||"Active");
    const statusOk = f.status==="ALL" || liveStatus===f.status;
    const qOk = !q || text.includes(q);
    return bankOk && typeOk && plantOk && statusOk && qOk;
  });

  return (
    <div className="page">
      <h2>Bank Guarantee</h2>

      <ToolbarBG
        rows={filtered}
        onImportRows={(rows)=>{
          rows.forEach(r=>{
            dispatch(addGuarantee({
              beneficiary:r.beneficiary, guaranteeNo:r.guaranteeNo,
              issueDate:r.issueDate, expiryDate:r.expiryDate, amount:r.amount,
              poValue:r.poValue, poNo:r.poNo, clientPoNo:r.clientPoNo, rfq:r.rfq,
              bank:r.bank||"Gulf Bank", type:r.type||"Initial", plant:r.plant||"ASE",
              status:r.status||"Active", documents:[], remarks:r.remarks||""
            }));
          });
          alert("Imported bank guarantees.");
        }}
      />

      {/* Filters */}
      <div className="card grid-4">
        <input className="input" placeholder="Search (beneficiary / guarantee / PO / RFQ)" value={f.q} onChange={e=>dispatch(setBGFilters({q:e.target.value}))}/>
        <select className="input" value={f.bank} onChange={e=>dispatch(setBGFilters({bank:e.target.value}))}>
          <option value="ALL">All Banks</option><option>Gulf Bank</option><option>Warba Bank</option>
        </select>
        <select className="input" value={f.type} onChange={e=>dispatch(setBGFilters({type:e.target.value}))}>
          <option value="ALL">All Types</option><option>Initial</option><option>Performance</option>
        </select>
        <select className="input" value={f.plant} onChange={e=>dispatch(setBGFilters({plant:e.target.value}))}>
          <option value="ALL">All Plants</option><option>ASE</option><option>Energy & Industry</option><option>Contract Operation</option>
        </select>
        <select className="input" value={f.status} onChange={e=>dispatch(setBGFilters({status:e.target.value}))}>
          <option value="ALL">All Status</option><option>Active</option><option>Expired</option><option>Cancelled</option>
        </select>
      </div>

      {/* Form */}
      <form className="card" onSubmit={submit}>
        <div className="grid-4">
          <input className="input" name="beneficiary" placeholder="Beneficiary Name" value={form.beneficiary} onChange={onChange} required/>
          <input className="input" name="guaranteeNo" placeholder="Guarantee Number" value={form.guaranteeNo} onChange={onChange} required/>
          <input className="input" type="date" name="issueDate" value={form.issueDate} onChange={onChange} required/>
          <input className="input" type="date" name="expiryDate" value={form.expiryDate} onChange={onChange} required/>
          <input className="input" type="number" name="amount" placeholder="Guarantee Amount" value={form.amount} onChange={onChange} required/>
          <input className="input" type="number" name="poValue" placeholder="PO Value" value={form.poValue} onChange={onChange}/>
          <input className="input" name="poNo" placeholder="PO No." value={form.poNo} onChange={onChange}/>
          <input className="input" name="clientPoNo" placeholder="Client PO No." value={form.clientPoNo} onChange={onChange}/>
          <input className="input" name="rfq" placeholder="RFQ#" value={form.rfq} onChange={onChange}/>
          <select className="input" name="bank" value={form.bank} onChange={onChange}><option>Gulf Bank</option><option>Warba Bank</option></select>
          <select className="input" name="type" value={form.type} onChange={onChange}><option>Initial</option><option>Performance</option></select>
          <select className="input" name="plant" value={form.plant} onChange={onChange}><option>ASE</option><option>Energy & Industry</option><option>Contract Operation</option></select>
          <select className="input" name="status" value={form.status} onChange={onChange}><option>Active</option><option>Expired</option><option>Cancelled</option></select>

          <label className="file-label">Upload Documents<input type="file" multiple onChange={onFiles}/></label>
          <div className="span-2">
            {form.documents?.map((d,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
                <a href={d.dataUrl} download={d.name}>{d.name}</a>
                <button type="button" className="btn danger" onClick={()=>removeDoc(i)}>Remove</button>
              </div>
            ))}
          </div>
          <input className="input" name="remarks" placeholder="Remarks" value={form.remarks} onChange={onChange}/>
        </div>
        <div className="actions">
          <button className="btn primary" type="submit">{editing ? "Update Guarantee" : "Add Guarantee"}</button>
          {editing && <button className="btn" type="button" onClick={()=>setEditing(null)}>Cancel</button>}
        </div>
      </form>

      {/* Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>BENEFICIARY NAME</th><th>Guarantee #</th><th>Issue</th><th>Expiry</th><th>Amount</th>
              <th>PO Value</th><th>PO No</th><th>Client PO No</th><th>RFQ#</th><th>Bank</th><th>Type</th><th>Plant</th><th>Status</th><th>Docs</th><th>Remarks</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r,i)=>{
              const expired = new Date(r.expiryDate) < new Date();
              const liveStatus = expired ? "Expired" : (r.status||"Active");
              return (
                <tr key={r.id}>
                  <td>{i+1}</td>
                  <td>{r.beneficiary}</td>
                  <td>{r.guaranteeNo}</td>
                  <td>{r.issueDate}</td>
                  <td>{r.expiryDate} • {expiryText(r.expiryDate)}</td>
                  <td>{r.amount}</td>
                  <td>{r.poValue}</td>
                  <td>{r.poNo}</td>
                  <td>{r.clientPoNo}</td>
                  <td>{r.rfq}</td>
                  <td>{r.bank}</td>
                  <td>{r.type}</td>
                  <td>{r.plant}</td>
                  <td className={liveStatus==="Expired"?"bg-status-expired":""}>{liveStatus}</td>
                  <td>{r.documents?.length ? r.documents.map((d,idx)=><div key={idx}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>):"—"}</td>
                  <td>{r.remarks}</td>
                  <td>
                    <button className="btn" onClick={()=>setEditing(r)}>Edit</button>
                    <button className="btn danger" onClick={()=>dispatch(deleteGuarantee(r.id))}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length===0 && <tr><td colSpan={17} className="muted">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
