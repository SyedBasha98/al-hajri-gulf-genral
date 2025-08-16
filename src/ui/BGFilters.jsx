import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, importRows, deleteMany, clearSelected } from '../redux/slices/bankGuaranteeSlice';
import { exportToCsv } from '../utils/csv';

const BGFilters = () => {
  const dispatch = useDispatch();
  const { q, bank, type, plant, status, expiringSoonOnly, sortBy, sortDir, pageSize } = useSelector(
    s => s.bankGuarantees.filters
  );
  const selectedIds = useSelector(s => s.bankGuarantees.selectedIds);
  const items = useSelector(s => s.bankGuarantees.items);

  const fileRef = useRef(null);
  const upd = patch => dispatch(setFilters(patch));

  const handleExport = () => {
    exportToCsv(
      'bank_guarantees.csv',
      items.map(r => ({
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
      }))
    );
  };

  const readCsv = file =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        const [header, ...rows] = text.split(/\r?\n/).filter(Boolean);
        const cols = header.split(',').map(h => h.trim());
        const data = rows.map(r => {
          const vals = r.split(',').map(v => v.trim());
          const obj = {};
          cols.forEach((c, idx) => (obj[c] = vals[idx]));
          return obj;
        });
        resolve(data);
      };
      reader.readAsText(file);
    });

  const handleImport = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const rows = await readCsv(file);
    dispatch(importRows(rows));
    fileRef.current.value = '';
    alert('Imported successfully.');
  };

  const bulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected record(s)?`)) return;
    dispatch(deleteMany(selectedIds));
    dispatch(clearSelected());
  };

  return (
    <div className="bg-filters">
      <input
        className="bg-input"
        placeholder="Search (beneficiary / guarantee no / PO / RFQ)"
        value={q}
        onChange={e => upd({ q: e.target.value })}
      />

      <select className="bg-input" value={bank} onChange={e => upd({ bank: e.target.value })}>
        <option value="ALL">All Banks</option>
        <option value="Gulf Bank">Gulf Bank</option>
        <option value="Warba Bank">Warba Bank</option>
      </select>

      <select className="bg-input" value={type} onChange={e => upd({ type: e.target.value })}>
        <option value="ALL">All Types</option>
        <option value="Initial">Initial</option>
        <option value="Performance">Performance</option>
      </select>

      <select className="bg-input" value={plant} onChange={e => upd({ plant: e.target.value })}>
        <option value="ALL">All Plants</option>
        <option value="ASE">ASE</option>
        <option value="Energy & Industry">Energy & Industry</option>
        <option value="Contract Operation">Contract Operation</option>
      </select>

      <select className="bg-input" value={status} onChange={e => upd({ status: e.target.value })}>
        <option value="ALL">All Status</option>
        <option value="Active">Active</option>
        <option value="Expired">Expired</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <label className="bg-checkbox">
        <input
          type="checkbox"
          checked={expiringSoonOnly}
          onChange={e => upd({ expiringSoonOnly: e.target.checked })}
        />
        ≤110 days
      </label>

      {/* Sorting */}
      <select className="bg-input" value={sortBy} onChange={e => upd({ sortBy: e.target.value })}>
        <option value="expiryDate">Sort by Expiry</option>
        <option value="issueDate">Sort by Issue</option>
        <option value="beneficiary">Sort by Beneficiary</option>
        <option value="amount">Sort by Amount</option>
        <option value="createdAt">Sort by Created</option>
      </select>

      <select className="bg-input" value={sortDir} onChange={e => upd({ sortDir: e.target.value })}>
        <option value="asc">Asc</option>
        <option value="desc">Desc</option>
      </select>

      {/* Page size */}
      <select className="bg-input" value={pageSize} onChange={e => upd({ pageSize: Number(e.target.value) })}>
        <option value={5}>5 / page</option>
        <option value={10}>10 / page</option>
        <option value={20}>20 / page</option>
        <option value={50}>50 / page</option>
      </select>

      {/* Import/Export + Bulk */}
      <div className="bg-actions">
        <button className="bg-btn" onClick={handleExport}>Export CSV</button>
        <label className="bg-btn" style={{ cursor: 'pointer' }}>
          Import CSV
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
        </label>
        <button className="bg-btn danger" onClick={bulkDelete} disabled={selectedIds.length === 0}>
          Delete Selected ({selectedIds.length})
        </button>
      </div>
    </div>
  );
};

export default BGFilters;
