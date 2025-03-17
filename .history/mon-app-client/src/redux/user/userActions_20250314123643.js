import { SET_USER } from './actionTypes'; // ✅ Vérifie le chemin

export const setUser = (user) => {
    console.log("✅ setUser action dispatchée avec :", user); // Debug
    return {
      type: SET_USER,
      payload: user,
    };
};
