import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Customer } from "../types";
import { supabase, readLocal, writeLocal } from "./backend";
type Auth = {
  user: Customer | null;
  loading: boolean;
  owner: boolean;
  demoLogin: (email: string, name: string) => void;
  logout: () => Promise<void>;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(
    supabase ? null : readLocal("session", null),
  );
  const [loading, setLoading] = useState(!!supabase);
  const [owner, setOwner] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const client = supabase;
    function apply(
      u:
        | { id: string; email?: string; user_metadata: Record<string, string> }
        | undefined,
    ) {
      if (!active) return;
      setUser(
        u
          ? { id: u.id, email: u.email || "", name: u.user_metadata.name || "" }
          : null,
      );
      setOwner(false);
      setLoading(false);
      if (u)
        void client.rpc("is_owner").then(({ data }) => {
          if (active) setOwner(data === true);
        });
    }
    void client.auth.getSession().then(({ data }) => apply(data.session?.user));
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      apply(session?.user);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  const demoLogin = (email: string, name: string) => {
    const customer = {
      id: email.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      name,
    };
    writeLocal("session", customer);
    setUser(customer);
  };
  const logout = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      writeLocal("session", null);
      setUser(null);
    }
  };
  return (
    <Context.Provider value={{ user, loading, owner, demoLogin, logout }}>
      {children}
    </Context.Provider>
  );
}
// This hook shares the authentication context across page modules.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing AuthProvider");
  return value;
}
