import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteGuarantee, startEdit, setFilters, toggleSelected,
} from '../redux/slices/bankGuaranteeSlice';

const daysBetween = (a, b) => Math.ceil((a - b) / (1000 * 60 * 60 * 24));
const isExpiringSoon = expiry => daysBetween(new Date(expiry), new Date()) <= 110;

const textSearch = row => [
  row.beneficiary, row.guaranteeNo, row.poNo, row.clientPoNo, row.rfq, row.remarks,
].filter(Boolean).join(' ').toLowerCase();

const matches = (row, f) => {
  const bankOk = f.bank === 'ALL' || row.bank === f.bank;
  const typeOk = f.type === 'ALL' || row.type === f.type;
  const plantOk = f.plant === 'ALL' || row.plant === f.plant;
  const computedStatus = new Date(row.expiryDate) < new Date() ? 'Expired' : row.status || 'Active';
  const statusOk = f.status === 'ALL' || computedStatus === f.status;
  const soonOk = !f.expiringSoonOnly || isExpiringSoon(row.expiryDate);
  const qOk = f.q === '' || textSearch(row).includes(f.q.trim().toLowerCase());
  return bankOk && typeOk && plantOk && statusOk && soonOk && qOk;
};

const sorters = {
  expiryDate: (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
  issueDate:  (a, b) => new Date(a.issueDate) - new Date(b.issueDate),
  beneficiary:(a, b) => (a.beneficiary||'').localeCompare(b.beneficiary||''),
  amount:     (a, b) => Number(a.amount||0) - Number(b.amount||0),
  createdAt:  (a, b) => (a.createdAt||0) - (b.createdAt||0),
};

const BGTable = ({ items }) => {
  const dispatch = useDispatch();
  const { filters, selectedIds } = useSelector(s => s.bankGuarantees);

  // Filter + sort
  const filtered = items.filter(i => matches(i, filters));
  const sorter = sorters[filters.sortBy] || sorters.expiryDate;
  const sorted = [...filtered].sort(sorter);
  if (filters.sortDir === 'desc') sorted.reverse();

  // Pagination
  const { pageSize, page } = filters;
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  if (clampedPage !== page) dispatch(setFilters({ page: clampedPage }));
  const pageRows = sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const changePage = delta => dispatch(setFilters({ page: Math.min(totalPages, Math.max(1, page + delta)) }));

  const toggle = id => dispatch(toggleSelected(id));
  const allOnPageSelected = pageRows.every(r => selectedIds.includes(r.id));
  const toggleAll = () => {
    if (allOnPageSelected) {
      pageRows.forEach(r => selectedIds.includes(r.id) && toggle(r.id));
    } else {
      pageRows.forEach(r => !selectedIds.includes(r.id) && toggle(r.id));
    }
  };

  return (
    <div className="bg-table-wrap">
      <table className="bg-table">
        <thead>
          <tr>
            <th><input type="checkbox" checked={allOnPageSelected && pageRows.length>0} onChange={toggleAll} /></th>
            <th>#</th>
            <th>BENEFICIARY NAME</th>
            <th>Guarantee Number</th>
            <th>Issue Date</th>
            <th>Expiry Date</th>
            <th>Guarantee Amount</th>
            <th>PO Value</th>
            <th>PO No.</th>
            <th>Client PO No.</th>
            <th>RFQ#</th>
            <th>Bank</th>
            <th>Type</th>
            <th>Plant</th>
            <th>Status</th>
            <th>Upload</th>
            <th>Remarks</th>
            <th style={{ width: 140 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 ? (
            <tr><td colSpan={18} style={{ textAlign: 'center', padding: 16 }}>No records</td></tr>
          ) : pageRows.map((row, idx) => {
            const expSoon = isExpiringSoon(row.expiryDate);
            const computedStatus = new Date(row.expiryDate) < new Date() ? 'Expired' : row.status || 'Active';
            const checked = selectedIds.includes(row.id);

            return (
              <tr key={row.id} className={expSoon ? 'bg-row-warn' : ''}>
                <td><input type="checkbox" checked={checked} onChange={() => toggle(row.id)} /></td>
                <td>{(page-1)*pageSize + idx + 1}</td>
                <td>{row.beneficiary}</td>
                <td>{row.guaranteeNo}</td>
                <td>{row.issueDate}</td>
                <td>{row.expiryDate}</td>
                <td>{row.amount}</td>
                <td>{row.poValue}</td>
                <td>{row.poNo}</td>
                <td>{row.clientPoNo}</td>
                <td>{row.rfq}</td>
                <td>{row.bank}</td>
                <td>{row.type}</td>
                <td>{row.plant}</td>
                <td className={computedStatus === 'Expired' ? 'bg-status-expired' : ''}>
                  {computedStatus}{expSoon && computedStatus!=='Expired' ? ' • Expiring ≤110d' : ''}
                </td>
                <td>
                  {row.documents?.length
                    ? row.documents.map((d, i) => (
                        <div key={i}><a href={d.dataUrl} download={d.name}>{d.name}</a></div>
                      ))
                    : '—'}
                </td>
                <td>{row.remarks}</td>
                <td className="bg-actions-cell">
                  <button className="bg-btn sm" onClick={() => dispatch(startEdit(row.id))}>Edit</button>
                  <button className="bg-btn sm danger" onClick={() => dispatch(deleteGuarantee(row.id))}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px' }}>
        <div>Total: {total} • Page {page} / {totalPages}</div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="bg-btn" onClick={() => changePage(-1)} disabled={page<=1}>Prev</button>
          <button className="bg-btn" onClick={() => changePage(+1)} disabled={page>=totalPages}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default BGTable;
