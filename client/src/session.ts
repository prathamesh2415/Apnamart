import { createContext, useContext } from "react";
import type { User } from "./api";

export type Session = {
  user: User | null;
  sellerStatus: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
};

export const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return value;
}
