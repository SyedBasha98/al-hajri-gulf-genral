import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [], // {id, date, supplier, item, qty, price, amount, billNumber, docs:[]}
  filters: { q: "" }
};

const slice = createSlice({
  name: "purchases",
  initialState,
  reducers: {
    addPurchase: {
      prepare(payload) {
        const id = payload.id || ("P" + nanoid(6));
        const amount = Number(payload.qty || 0) * Number(payload.price || 0);
        return { payload: { ...payload, id, amount } };
      },
      reducer(state, action) { state.items.push(action.payload); }
    },
    updatePurchase(state, action) {
      const i = state.items.findIndex(p => p.id === action.payload.id);
      if (i !== -1) state.items[i] = action.payload;
    },
    deletePurchase(state, action) {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    setPurchaseFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    }
  }
});

export const { addPurchase, updatePurchase, deletePurchase, setPurchaseFilter } = slice.actions;
export default slice.reducer;
