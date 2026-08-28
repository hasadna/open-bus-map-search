import { Navigate, useLocation } from 'react-router'

// Backward-compatibility shim for a page that moved to a new path. The query string
// and hash are carried over, so a link shared under the old path still lands on the
// same state — the params are what make those links worth keeping alive.
export const LegacyPathRedirect = ({ to }: { to: string }) => {
  const { search, hash } = useLocation()

  return <Navigate to={{ pathname: to, search, hash }} replace />
}
