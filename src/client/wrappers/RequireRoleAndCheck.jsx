import { Navigate, Outlet, useOutletContext, useParams } from "react-router-dom";

const RequireRoleAndCheck = ({ allowedRoles, rolesToCheck = [], paramName }) => {
    const { user } = useOutletContext();
    const params = useParams();

      // Check if role is allowed at all
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // Apply user check only if role is in rolesToCheck
    if (rolesToCheck.includes(user.role)) {
        if (String(user.user_id) !== String(params[paramName])) {
        return <Navigate to="/" replace />;
        }
    }

    // Otherwise, grant access
    return <Outlet context={{ user }} />;
}

export default RequireRoleAndCheck;