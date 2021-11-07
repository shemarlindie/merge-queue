import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

export interface DummyUser {
  email: string;
}

export interface DummyAuth {
  loading?: boolean,
  user?: DummyUser,
  login: () => Promise<void>
  logout: () => Promise<void>
}

const initialAuthContext = {
  loading: false,
  login: Promise.reject,
  logout: Promise.reject
};

export const DummyAuthContext = createContext<DummyAuth>(initialAuthContext);

export function useDummyAuth() {
  return useContext(DummyAuthContext);
}

export function DummyAuthProvider(props: React.PropsWithChildren<ReactNode>) {
  const [user, setUser] = useState<DummyUser | undefined>();
  const [loading, setLoading] = useState(false);
  const delay = 1000;

  const login = useCallback(() => {
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        setUser({email: "shemar@example.com"});
        setLoading(false);
        resolve();
      }, delay);
    });
  }, []);

  const logout = useCallback(() => {
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        setUser(undefined);
        setLoading(false);
        resolve();
      }, delay);
    });
  }, []);

  const checkAuth = () => {
    setLoading(true);
    const handle = setTimeout(() => {
      setLoading(false);
    }, delay);

    return () => {
      clearTimeout(handle);
    };
  };

  useEffect(() => {
    return checkAuth();
  }, []);

  return (
    <DummyAuthContext.Provider value={{loading, user, login, logout}}>
      {props.children}
    </DummyAuthContext.Provider>
  );
}