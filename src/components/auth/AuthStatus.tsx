import {useAuth} from "./hooks/useAuth";
import React from "react";
import {Link} from "react-router-dom";

export function AuthStatus() {
  const {user, loading, error, logout} = useAuth();

  return (
    <div>
      <div>Status: {loading ? "Loading" : error ? error.message : user ? `Logged in as ${user?.displayName}` : "Not logged in"}</div>
      {!loading && (
        <div>
          {user &&
          <button onClick={() => logout()} disabled={loading}>Logout</button>}
          <ul>
            {!user && <li><Link to="/login">Login</Link></li>}
            <li><Link to="/queues">Queues</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
}