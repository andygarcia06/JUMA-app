import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.userData = action.payload;
    },
    logoutUser: (state) => {
      state.userData = null; // 🔥 Supprime `userData`
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
