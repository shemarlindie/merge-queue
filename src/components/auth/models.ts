import { User } from "firebase/auth";

export interface Auth {
  loading: boolean
  error: Error | null
  user: User | null
  logout: () => Promise<void>
}

export interface UserProxy {
  uid: string
  displayName?: string | null
  email?: string | null
}