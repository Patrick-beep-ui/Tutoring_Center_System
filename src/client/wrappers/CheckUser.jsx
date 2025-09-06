import { Navigate, Outlet, useOutletContext, useParams } from "react-router-dom";

const CheckUser = () => {
  const { user } = useOutletContext();
  const { user_id } = useParams();

  return user && String(user.user_id) === String(user_id)
    ? <Outlet context={{ user }} />
    : <Navigate to="/" replace />;
};

export default CheckUser;
