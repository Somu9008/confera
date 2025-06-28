// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   currentRoom: null,
// };

// const roomSlice = createSlice({
//   name: "room",
//   initialState,
//   reducers: {
//     setCurrentRoom: (state, action) => {
//       state.currentRoom = action.payload;
//     },
//   },
// });

// export const { setCurrentRoom } = roomSlice.actions;
// export default roomSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentRoom: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    clearRoom: (state) => {
      state.currentRoom = null;
    },
  },
});

export const { setCurrentRoom, clearRoom } = roomSlice.actions;
export default roomSlice.reducer;
