import { Navigate, Outlet, useOutletContext } from "react-router-dom";

const RequireRole = ({ allowedRoles }) => {
  const { user } = useOutletContext(); 
  return allowedRoles.includes(user.role)
    ? <Outlet context={{ user }} />
    : <Navigate to="/" replace />;
};

export default RequireRole;
