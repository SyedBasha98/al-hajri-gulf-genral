import { configureStore } from "@reduxjs/toolkit";
import { loadState, saveState } from "./localStorage";

import bankGuarantees from "./slices/bankGuaranteeSlice";
import sales from "./slices/salesSlice";
import purchases from "./slices/purchasesSlice";
import payments from "./slices/paymentsSlice";
import receipts from "./slices/receiptsSlice"; // <-- add this

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    bankGuarantees,
    sales,
    purchases,
    payments, // purchase payments
    receipts, // sales receipts
  },
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  saveState({
    bankGuarantees: state.bankGuarantees,
    sales: state.sales,
    purchases: state.purchases,
    payments: state.payments,
    receipts: state.receipts,
  });
});

export default store;
