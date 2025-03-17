// userReducer.js
import { SET_USER } from './actionTypes';

const initialState = {
  userData: null,
};

const userReducer = (state = initialState, action) => {
  console.log('Action reçue dans le reducer:', action); // Log de l'action reçue

  switch (action.type) {
    case SET_USER:
      const newState = {
        ...state,
        userData: action.payload,
      };
      console.log('Nouvel état après SET_USER:', newState); // Log du nouvel état
      return newState;
    default:
      return state;
  }
};

export default userReducer;
