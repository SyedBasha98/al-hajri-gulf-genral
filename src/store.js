// store.js
import { createStore } from "redux";

const rootReducer = (state = {}, action) => {
  return state;
};

const store = createStore(rootReducer);

export default store;
