import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';


const useUser = () => {
  const location = useLocation();
  const reduxUser = useSelector((state) => state.user.userData);
  const navigationUser = location.state?.user;

  // 🔥 Priorité : Redux > Navigation
  const user = reduxUser || navigationUser || null;

  return user;
};

export default useUser;
