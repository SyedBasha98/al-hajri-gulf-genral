import { createSlice, nanoid, createSelector } from "@reduxjs/toolkit";

/**
 * Receipt shape:
 * {
 *   id: "RCPTxxxxxx",
 *   saleId: string,
 *   customer: string,
 *   amount: number,
 *   date: "YYYY-MM-DD",
 *   voucherNo: string,
 *   paymentType: "Cash" | "Cheque" | "LC" | "Bank" | "Online",
 *   chequeNo?: string,
 *   chequeBank?: string,
 *   lcNo?: string,
 *   lcBank?: string,
 *   docs: [{ name, dataUrl }]  // optional attachments
 * }
 */

const initialState = {
  items: [],
  filters: { q: "" },
};

/** Small helpers */
const normStr = (v) => String(v || "").trim();
const todayISO = () => new Date().toISOString().slice(0, 10);
const toAmount = (v) => Number(v || 0);

/** Find index helpers */
const findIndexById = (arr, id) => arr.findIndex((r) => r.id === id);
const findIndexBySaleId = (arr, saleId) =>
  arr.findIndex((r) => normStr(r.saleId) === normStr(saleId));

const receiptsSlice = createSlice({
  name: "receipts",
  initialState,
  reducers: {
    /** Filters */
    setReceiptFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearReceiptFilters(state) {
      state.filters = { q: "" };
    },

    /**
     * addReceipt — original API (kept for compatibility)
     * Adds a brand-new receipt.
     * If you want “one receipt per sale”, use upsertReceiptBySaleId instead.
     */
    addReceipt: {
      prepare({
        saleId,
        customer,
        amount,
        date,
        voucherNo,
        paymentType,
        chequeNo,
        chequeBank,
        lcNo,
        lcBank,
        docs,
      }) {
        return {
          payload: {
            id: "RCPT" + nanoid(6),
            saleId: normStr(saleId),
            customer: normStr(customer),
            amount: toAmount(amount),
            date: normStr(date) || todayISO(),
            voucherNo: normStr(voucherNo),
            paymentType: normStr(paymentType) || "Cash",
            chequeNo: normStr(chequeNo),
            chequeBank: normStr(chequeBank),
            lcNo: normStr(lcNo),
            lcBank: normStr(lcBank),
            docs: Array.isArray(docs) ? docs : [],
          },
        };
      },
      reducer(state, action) {
        state.items.push(action.payload);
      },
    },

    /**
     * upsertReceiptById — add if new, replace if same id
     */
    upsertReceiptById: {
      prepare(rec) {
        return {
          payload: {
            ...rec,
            id: rec.id || "RCPT" + nanoid(6),
            saleId: normStr(rec.saleId),
            customer: normStr(rec.customer),
            amount: toAmount(rec.amount),
            date: normStr(rec.date) || todayISO(),
            voucherNo: normStr(rec.voucherNo),
            paymentType: normStr(rec.paymentType) || "Cash",
            chequeNo: normStr(rec.chequeNo),
            chequeBank: normStr(rec.chequeBank),
            lcNo: normStr(rec.lcNo),
            lcBank: normStr(rec.lcBank),
            docs: Array.isArray(rec.docs) ? rec.docs : [],
          },
        };
      },
      reducer(state, action) {
        const idx = findIndexById(state.items, action.payload.id);
        if (idx === -1) state.items.push(action.payload);
        else state.items[idx] = action.payload;
      },
    },

    /**
     * upsertReceiptBySaleId — enforce one receipt per sale (replace existing).
     * If a receipt with the same saleId exists, it will be replaced.
     */
    upsertReceiptBySaleId: {
      prepare(rec) {
        return {
          payload: {
            ...rec,
            id: rec.id || "RCPT" + nanoid(6),
            saleId: normStr(rec.saleId),
            customer: normStr(rec.customer),
            amount: toAmount(rec.amount),
            date: normStr(rec.date) || todayISO(),
            voucherNo: normStr(rec.voucherNo),
            paymentType: normStr(rec.paymentType) || "Cash",
            chequeNo: normStr(rec.chequeNo),
            chequeBank: normStr(rec.chequeBank),
            lcNo: normStr(rec.lcNo),
            lcBank: normStr(rec.lcBank),
            docs: Array.isArray(rec.docs) ? rec.docs : [],
          },
        };
      },
      reducer(state, action) {
        const idx = findIndexBySaleId(state.items, action.payload.saleId);
        if (idx === -1) state.items.push(action.payload);
        else state.items[idx] = { ...state.items[idx], ...action.payload, id: state.items[idx].id };
      },
    },

    /**
     * updateReceipt — original API (kept)
     * Requires `id` in payload.
     */
    updateReceipt(state, action) {
      const rec = action.payload;
      const i = findIndexById(state.items, rec.id);
      if (i !== -1) state.items[i] = { ...state.items[i], ...rec };
    },

    /**
     * deleteReceipt — remove by id
     */
    deleteReceipt(state, action) {
      const id = action.payload;
      state.items = state.items.filter((r) => r.id !== id);
    },

    /**
     * attachDoc — push a single doc to a receipt
     * payload: { id, doc: {name, dataUrl} }
     */
    attachDoc(state, action) {
      const { id, doc } = action.payload || {};
      const i = findIndexById(state.items, id);
      if (i !== -1 && doc) {
        const docs = Array.isArray(state.items[i].docs) ? state.items[i].docs : [];
        state.items[i].docs = [...docs, doc];
      }
    },

    /**
     * removeDoc — remove doc by index
     * payload: { id, index }
     */
    removeDoc(state, action) {
      const { id, index } = action.payload || {};
      const i = findIndexById(state.items, id);
      if (i !== -1 && Array.isArray(state.items[i].docs)) {
        state.items[i].docs = state.items[i].docs.filter((_, idx) => idx !== index);
      }
    },
  },
});

/* Actions */
export const {
  setReceiptFilter,
  clearReceiptFilters,
  addReceipt,
  upsertReceiptById,
  upsertReceiptBySaleId,
  updateReceipt,
  deleteReceipt,
  attachDoc,
  removeDoc,
} = receiptsSlice.actions;

/* Reducer */
export default receiptsSlice.reducer;

/* ---------- Selectors ---------- */
export const selectReceipts = (state) => state.receipts.items;
export const selectReceiptFilters = (state) => state.receipts.filters;

export const selectReceiptById = (id) =>
  createSelector(selectReceipts, (items) => items.find((r) => r.id === id));

export const selectReceiptsBySaleId = (saleId) =>
  createSelector(selectReceipts, (items) =>
    items.filter((r) => String(r.saleId) === String(saleId))
  );

export const selectFilteredReceipts = createSelector(
  [selectReceipts, selectReceiptFilters],
  (items, filters) => {
    const q = (filters.q || "").toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      [r.saleId, r.customer, String(r.amount), r.voucherNo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
);
