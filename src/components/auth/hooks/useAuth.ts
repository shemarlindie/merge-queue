import {useCallback, useEffect, useMemo, useState} from "react";
import {auth} from "../../../config/firebase-config";
import {User} from "firebase/auth";
import {LocalStorage} from "../../../utils/LocalStorage";
import {Auth} from "../models";

export function useAuth() {
  const initialUser = LocalStorage.get<User | null>("auth_user", null);
  const [user, setUser] = useState<User | null>(initialUser);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(!initialUser);
  const logout = useCallback(() => {
    LocalStorage.remove("auth_user");
    return auth.signOut();
  }, []);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      LocalStorage.set("auth_user", user?.toJSON());
      setLoading(false);
      setError(null);
      setUser(user);
      // console.log('auth', user)
    }, (error) => {
      setLoading(false);
      setError(error);
      console.error("auth error", error?.message);
    });
  }, []);

  return useMemo<Auth>(() => {
    return {loading, error, user, logout};
  }, [loading, error, user, logout]);
}
