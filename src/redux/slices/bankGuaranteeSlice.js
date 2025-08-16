import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [],                 // each item is a bank guarantee record
  filters: {
    q: "", bank: "ALL", type: "ALL", plant: "ALL", status: "ALL", expSoon: false
  }
};

const slice = createSlice({
  name: "bankGuarantees",
  initialState,
  reducers: {
    addGuarantee: {
      prepare(payload) {
        return { payload: { ...payload, id: "BG" + nanoid(6), createdAt: Date.now() } };
      },
      reducer(state, action) { state.items.push(action.payload); }
    },
    updateGuarantee(state, action) {
      const i = state.items.findIndex(x => x.id === action.payload.id);
      if (i !== -1) state.items[i] = action.payload;
    },
    deleteGuarantee(state, action) {
      state.items = state.items.filter(x => x.id !== action.payload);
    },
    setBGFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  }
});

export const { addGuarantee, updateGuarantee, deleteGuarantee, setBGFilters } = slice.actions;
export default slice.reducer;
