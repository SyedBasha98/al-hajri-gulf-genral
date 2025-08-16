import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [], // {id, date, customer, product, qty, price, amount, invoiceNumber, invoiceDocs:[]}
  filters: { q: "" }
};

const slice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    addSale: {
      prepare(payload) {
        const id = payload.id || ("S" + nanoid(6));
        const amount = Number(payload.qty || 0) * Number(payload.price || 0);
        return { payload: { ...payload, id, amount } };
      },
      reducer(state, action) { state.items.push(action.payload); }
    },
    updateSale(state, action) {
      const i = state.items.findIndex(s => s.id === action.payload.id);
      if (i !== -1) state.items[i] = action.payload;
    },
    deleteSale(state, action) {
      state.items = state.items.filter(s => s.id !== action.payload);
    },
    setSalesFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    }
  }
});

export const { addSale, updateSale, deleteSale, setSalesFilter } = slice.actions;
export default slice.reducer;
