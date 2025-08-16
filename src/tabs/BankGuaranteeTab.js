import React, { useState, useEffect } from "react";
import BankGuaranteeForm from "../components/BankGuaranteeForm";
import BankGuaranteeTable from "../components/BankGuaranteeTable";
import "../styles/bankGuarantee.css";

const BankGuaranteeTab = () => {
  const [guarantees, setGuarantees] = useState(() => {
    const stored = localStorage.getItem("bankGuarantees");
    return stored ? JSON.parse(stored) : [];
  });

  const [editingGuarantee, setEditingGuarantee] = useState(null);

  useEffect(() => {
    localStorage.setItem("bankGuarantees", JSON.stringify(guarantees));
  }, [guarantees]);

  const addGuarantee = (data) => {
    setGuarantees([...guarantees, { ...data, id: generateRandomId() }]);
  };

  const updateGuarantee = (updated) => {
    setGuarantees(guarantees.map((g) => (g.id === updated.id ? updated : g)));
    setEditingGuarantee(null);
  };

  const deleteGuarantee = (id) => {
    setGuarantees(guarantees.filter((g) => g.id !== id));
  };

  const generateRandomId = () => {
    return "BG" + Math.floor(100000 + Math.random() * 900000);
  };

  return (
    <div className="bank-guarantee-tab">
      <h2>Bank Guarantee Manager</h2>
      <BankGuaranteeForm
        onSubmit={editingGuarantee ? updateGuarantee : addGuarantee}
        editingData={editingGuarantee}
        clearEdit={() => setEditingGuarantee(null)}
      />
      <BankGuaranteeTable
        data={guarantees}
        onEdit={setEditingGuarantee}
        onDelete={deleteGuarantee}
      />
    </div>
  );
};

export default BankGuaranteeTab;
