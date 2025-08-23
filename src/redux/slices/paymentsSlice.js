import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  filters: { status: "ALL", q: "" },
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setPaymentFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Create payment for a SALE
    createPaymentForSale: {
      prepare({ id, customer, amount, date }) {
        return {
          payload: {
            id: "PAY" + nanoid(6),
            type: "sale",
            saleId: id,
            customer: customer || "",
            amount: Number(amount || 0),
            date: date || new Date().toISOString().slice(0, 10),
            status: "Unpaid",
            receipt: null,
          },
        };
      },
      reducer(state, action) {
        state.items.push(action.payload);
      },
    },

    // Create payment for a PURCHASE
    createPaymentForPurchase: {
      prepare({ id, supplier, amount, date }) {
        return {
          payload: {
            id: "PAY" + nanoid(6),
            type: "purchase",
            purchaseId: id,
            supplier: supplier || "",
            amount: Number(amount || 0),
            date: date || new Date().toISOString().slice(0, 10),
            status: "Unpaid",
            receipt: null,
          },
        };
      },
      reducer(state, action) {
        state.items.push(action.payload);
      },
    },

    // Mark a payment Paid + save receipt/details
    markPaid(state, action) {
      const updated = action.payload; // should include { id, status, receipt, ... }
      const idx = state.items.findIndex(p => p.id === updated.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...updated };
    },

    // NEW: delete a payment (used for purchases "delete")
    deletePayment(state, action) {
      const id = action.payload;
      state.items = state.items.filter(p => p.id !== id);
    },
  },
});

export const {
  setPaymentFilter,
  createPaymentForSale,
  createPaymentForPurchase,
  markPaid,
  deletePayment,            // <- export
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
