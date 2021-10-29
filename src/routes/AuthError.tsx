import { Link } from "react-router-dom";

export interface AuthErrorProps {
  error: Error
}

export function AuthError({ error }: AuthErrorProps) {
  return (
    <div>
      <h2>Auth Error</h2>
      <p>{error.message}</p>
      <Link to='/login'>Login</Link>
    </div>
  )
}