// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   user: null,
//   loading: true,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setUser(state, action) {
//       state.user = action.payload;
//       state.loading = false;
//     },
//     logout(state) {
//       state.loading = false;
//       state.user = null;
//     },
//   },
// });

// export const { setUser, logout, logIn } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.loading = false;
    },
    logout(state) {
      state.user = null;
      state.loading = false;
    },
    // Optional
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
