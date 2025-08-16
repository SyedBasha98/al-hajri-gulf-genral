import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addGuarantee, updateGuarantee, cancelEdit } from '../redux/slices/bankGuaranteeSlice';

const readAsDataURL = file =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

const emptyForm = {
  guaranteeNo: '',
  beneficiary: '',
  issueDate: '',
  expiryDate: '',
  amount: '',
  poValue: '',
  poNo: '',
  clientPoNo: '',
  rfq: '',
  bank: 'Gulf Bank',
  type: 'Initial',
  plant: 'ASE',
  status: 'Active',
  documents: [],  // array of {name, dataUrl}
  remarks: '',
};

const BGForm = () => {
  const dispatch = useDispatch();
  const { items, editingId } = useSelector(s => s.bankGuarantees);
  const editingItem = items.find(i => i.id === editingId) || null;
  const [form, setForm] = React.useState(editingItem || emptyForm);

  React.useEffect(() => {
  setForm(editingItem || emptyForm);
}, [editingItem?.id]);

  const onChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onFiles = async e => {
    const files = Array.from(e.target.files || []);
    const encoded = await Promise.all(files.map(async f => ({ name: f.name, dataUrl: await readAsDataURL(f) })));
    setForm(prev => ({ ...prev, documents: [...(prev.documents || []), ...encoded] }));
  };

  const removeDoc = idx => {
    setForm(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }));
  };

  const submit = e => {
    e.preventDefault();
    if (editingItem) dispatch(updateGuarantee({ ...editingItem, ...form }));
    else dispatch(addGuarantee(form));
    setForm(emptyForm);
  };

  return (
    <form className="bg-form" onSubmit={submit}>
      <div className="bg-grid">
        <input className="bg-input" name="beneficiary" placeholder="Beneficiary Name" value={form.beneficiary} onChange={onChange} required />
        <input className="bg-input" name="guaranteeNo" placeholder="Guarantee Number" value={form.guaranteeNo} onChange={onChange} required />
        <input className="bg-input" type="date" name="issueDate" value={form.issueDate} onChange={onChange} required />
        <input className="bg-input" type="date" name="expiryDate" value={form.expiryDate} onChange={onChange} required />
        <input className="bg-input" type="number" name="amount" placeholder="Guarantee Amount" value={form.amount} onChange={onChange} required />
        <input className="bg-input" type="number" name="poValue" placeholder="PO Value" value={form.poValue} onChange={onChange} />
        <input className="bg-input" name="poNo" placeholder="PO No." value={form.poNo} onChange={onChange} />
        <input className="bg-input" name="clientPoNo" placeholder="Client PO No." value={form.clientPoNo} onChange={onChange} />
        <input className="bg-input" name="rfq" placeholder="RFQ#" value={form.rfq} onChange={onChange} />

        <select className="bg-input" name="bank" value={form.bank} onChange={onChange}>
          <option>Gulf Bank</option>
          <option>Warba Bank</option>
        </select>

        <select className="bg-input" name="type" value={form.type} onChange={onChange}>
          <option>Initial</option>
          <option>Performance</option>
        </select>

        <select className="bg-input" name="plant" value={form.plant} onChange={onChange}>
          <option>ASE</option>
          <option>Energy & Industry</option>
          <option>Contract Operation</option>
        </select>

        <select className="bg-input" name="status" value={form.status} onChange={onChange}>
          <option>Active</option>
          <option>Expired</option>
          <option>Cancelled</option>
        </select>

        {/* Multi-upload */}
        <div className="bg-file" style={{ gridColumn: 'span 2' }}>
          <label className="bg-file-label">
            {form.documents?.length ? `Files: ${form.documents.length}` : 'Upload Documents (multi)'}
            <input className="bg-file-input" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={onFiles} />
          </label>
          {!!form.documents?.length && (
            <div style={{ marginTop: 6 }}>
              {form.documents.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <a href={d.dataUrl} download={d.name}>{d.name}</a>
                  <button type="button" className="bg-btn sm danger" onClick={() => removeDoc(idx)}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <input className="bg-input" name="remarks" placeholder="Remarks" value={form.remarks} onChange={onChange} />
      </div>

      <div className="bg-actions">
        <button className="bg-btn primary" type="submit">
          {editingItem ? 'Update Guarantee' : 'Add Guarantee'}
        </button>
        {editingItem && (
          <button className="bg-btn" type="button" onClick={() => dispatch(cancelEdit())}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default BGForm;
