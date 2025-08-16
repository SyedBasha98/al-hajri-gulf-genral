import { configureStore } from "@reduxjs/toolkit";
import { loadState, saveState } from "./localStorage";

import bankGuarantees from "./slices/bankGuaranteeSlice";
import sales from "./slices/salesSlice";
import purchases from "./slices/purchasesSlice";
import payments from "./slices/paymentsSlice";

const preloadedState = loadState();

const store = configureStore({
  reducer: { bankGuarantees, sales, purchases, payments },
  preloadedState
});

store.subscribe(() => {
  saveState({
    bankGuarantees: store.getState().bankGuarantees,
    sales: store.getState().sales,
    purchases: store.getState().purchases,
    payments: store.getState().payments,
  });
});

export default store;
