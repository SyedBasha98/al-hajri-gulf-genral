export const loadState = () => {
  try {
    const s = localStorage.getItem("appState");
    return s ? JSON.parse(s) : undefined;
  } catch { return undefined; }
};
export const saveState = (state) => {
  try {
    localStorage.setItem("appState", JSON.stringify(state));
  } catch {}
};
