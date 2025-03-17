// userReducer.js
import { SET_USER } from './actionTypes';

const initialState = {
  userData: null,
};

const userReducer = (state = initialState, action) => {
  console.log('Action reçue dans le reducer:', action); // Debug

  switch (action.type) {
    case SET_USER:
      console.log("✅ Nouvel état utilisateur:", action.payload);
      return {
        ...state,
        userData: action.payload,
      };
    default:
      return state;
  }
};


export default userReducer;
