import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "../../auth/hooks/useAuth";

export function RequireAuth({children}: any) {
  const {user} = useAuth();
  const location = useLocation();

  if (user) {
    return children;
  } else {
    const searchParams = new URLSearchParams({from: location.pathname}).toString();
    const loginPath = `/login?${searchParams}`;
    return <Navigate to={loginPath} replace/>;
  }
}