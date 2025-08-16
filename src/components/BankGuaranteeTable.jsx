import React, { useState } from "react";

const BankGuaranteeTable = ({ data, onEdit, onDelete }) => {
  const [filter, setFilter] = useState("");

  const getDaysLeft = (expiryDate) => {
    const now = new Date();
    const exp = new Date(expiryDate);
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredData = data.filter((g) => {
    return (
      g.beneficiary.toLowerCase().includes(filter.toLowerCase()) ||
      g.bank.toLowerCase().includes(filter.toLowerCase()) ||
      g.type.toLowerCase().includes(filter.toLowerCase())
    );
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Filter by name, bank or type"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="bg-filter"
      />
      <table className="bg-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Beneficiary</th>
            <th>Amount</th>
            <th>Bank</th>
            <th>Type</th>
            <th>Issue Date</th>
            <th>Expiry Date</th>
            <th>Days Left</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((g) => {
            const daysLeft = getDaysLeft(g.expiryDate);
            const warn = daysLeft <= 120;
            return (
              <tr key={g.id} className={warn ? "bg-warning" : ""}>
                <td>{g.id}</td>
                <td>{g.beneficiary}</td>
                <td>{g.amount}</td>
                <td>{g.bank}</td>
                <td>{g.type}</td>
                <td>{g.issueDate}</td>
                <td>{g.expiryDate}</td>
                <td>{daysLeft} days</td>
                <td>{g.remarks}</td>
                <td>
                  <button onClick={() => onEdit(g)}>Edit</button>
                  <button onClick={() => onDelete(g.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BankGuaranteeTable;
