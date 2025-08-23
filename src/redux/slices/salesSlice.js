// src/redux/slices/salesSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [], // list of sales invoices
  filters: { q: "" },
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setSalesFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    addSale: {
      prepare({ date, customer, items, invoiceNumbers, invoiceDocs }) {
        return {
          payload: {
            id: "S" + nanoid(6),
            date: date || new Date().toISOString().slice(0, 10),
            customer: customer || "",
            items: items || [],
            amount: (items || []).reduce(
              (sum, li) => sum + (Number(li.qty || 0) * Number(li.price || 0)),
              0
            ),
            invoiceNumbers: invoiceNumbers || [],
            invoiceDocs: invoiceDocs || [],
          },
        };
      },
      reducer(state, action) {
        state.items.push(action.payload);
      },
    },
    updateSale(state, action) {
      const sale = action.payload; // must include id
      const i = state.items.findIndex((s) => s.id === sale.id);
      if (i !== -1) state.items[i] = { ...state.items[i], ...sale };
    },
    deleteSale(state, action) {
      const id = action.payload;
      state.items = state.items.filter((s) => s.id !== id);
    },
  },
});

export const { setSalesFilter, addSale, updateSale, deleteSale } =
  salesSlice.actions;

export default salesSlice.reducer;
