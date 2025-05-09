/**
 * Server-side token service
 * This file should only be imported by server components or API routes
 */

import { getServerToken, validateServerToken, generateTemporaryToken, getSessionExpiration } from "../server-env"

// Re-export the functions from server-env
export { getServerToken, validateServerToken, generateTemporaryToken, getSessionExpiration }
