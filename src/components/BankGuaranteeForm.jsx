import React, { useState, useEffect } from "react";

const BankGuaranteeForm = ({ onSubmit, editingData, clearEdit }) => {
  const [form, setForm] = useState({
    beneficiary: "",
    amount: "",
    bank: "Warba",
    type: "Initial",
    issueDate: "",
    expiryDate: "",
    remarks: "",
  });

  useEffect(() => {
    if (editingData) setForm(editingData);
  }, [editingData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      beneficiary: "",
      amount: "",
      bank: "Warba",
      type: "Initial",
      issueDate: "",
      expiryDate: "",
      remarks: "",
    });
    if (editingData) clearEdit();
  };

  return (
    <form className="bg-form" onSubmit={handleSubmit}>
      <input type="text" name="beneficiary" placeholder="Beneficiary" value={form.beneficiary} onChange={handleChange} required />
      <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required />
      <select name="bank" value={form.bank} onChange={handleChange}>
        <option value="Warba">Warba Bank</option>
        <option value="Gulf">Gulf Bank</option>
      </select>
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="Initial">Initial Guarantee</option>
        <option value="Performance">Performance Guarantee</option>
      </select>
      <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} required />
      <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required />
      <textarea name="remarks" placeholder="Remarks" value={form.remarks} onChange={handleChange}></textarea>
      <button type="submit">{editingData ? "Update" : "Add"} Guarantee</button>
      {editingData && <button onClick={clearEdit}>Cancel</button>}
    </form>
  );
};

export default BankGuaranteeForm;
