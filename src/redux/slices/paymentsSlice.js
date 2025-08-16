import { createSlice, nanoid } from "@reduxjs/toolkit";

/**
 * payments.items
 * { id, saleId, customer, amount, status:'Unpaid'|'Paid', date,
 *   receipt?: { voucherNo, paymentType, date, docs[], chequeNo?, chequeBank?, lcNo?, lcBank? } }
 */
const initialState = {
  items: [],
  filters: { status: "ALL", q: "" }
};

const slice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    createPaymentForSale: {
      prepare(sale) {
        return {
          payload: {
            id: "PM" + nanoid(6),
            saleId: sale.id,
            customer: sale.customer,
            amount: sale.amount,
            status: "Unpaid",
            date: sale.date
          }
        };
      },
      reducer(state, action) {
        if (!state.items.find(p => p.saleId === action.payload.saleId)) {
          state.items.push(action.payload);
        }
      }
    },
    markPaid(state, action) {
      const i = state.items.findIndex(p => p.id === action.payload.id);
      if (i !== -1) state.items[i] = action.payload;
    },
    deletePayment(state, action) {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    setPaymentFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    }
  }
});

export const { createPaymentForSale, markPaid, deletePayment, setPaymentFilter } = slice.actions;
export default slice.reducer;
