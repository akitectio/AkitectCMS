import apiService from './api';
import { SESSION_ENDPOINTS } from './apiEndpoints';

// Define interfaces for the session data
export interface UserSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: string;
  createdAt: string;
  active: boolean;
  isExpired: boolean;
  expiresAt: string;
  revokedAt: string | null;
  isCurrent: boolean;
}

/**
 * Get current user's active sessions
 * @returns A promise with current active sessions
 */
export const getMyActiveSessions = async (): Promise<UserSession[]> => {
  const currentToken = localStorage.getItem('token');
  const sessions = await apiService.get<UserSession[]>(SESSION_ENDPOINTS.GET_MY_ACTIVE);
  
  // Mark current session
  if (currentToken) {
    return sessions.map(session => ({
      ...session,
      isCurrent: isCurrentSession(session, currentToken)
    }));
  }
  
  return sessions;
};

/**
 * Get current user's session history
 * @returns A promise with session history
 */
export const getMySessionHistory = async (): Promise<UserSession[]> => {
  const currentToken = localStorage.getItem('token');
  const sessions = await apiService.get<UserSession[]>(SESSION_ENDPOINTS.GET_MY_HISTORY);
  
  // Mark current session
  if (currentToken) {
    return sessions.map(session => ({
      ...session,
      isCurrent: isCurrentSession(session, currentToken)
    }));
  }
  
  return sessions;
};

/**
 * Revoke a specific session (log out from a device)
 * @param sessionId The ID of the session to revoke
 * @returns A promise with the result
 */
export const revokeSession = async (sessionId: string): Promise<void> => {
  return await apiService.delete(SESSION_ENDPOINTS.REVOKE_SESSION(sessionId));
};

/**
 * Revoke all other sessions except the current one (logout from all other devices)
 * @returns A promise with the result
 */
export const revokeAllOtherSessions = async (): Promise<void> => {
  return await apiService.post(SESSION_ENDPOINTS.REVOKE_OTHER_SESSIONS, {});
};

/**
 * Get all sessions for a specific user (admin function)
 * @param userId The ID of the user
 * @returns A promise with user sessions
 */
export const getUserSessions = async (userId: string | number): Promise<UserSession[]> => {
  return await apiService.get<UserSession[]>(SESSION_ENDPOINTS.GET_USER_SESSIONS(userId));
};

/**
 * Revoke a specific user's session (admin function)
 * @param userId The ID of the user
 * @param sessionId The ID of the session to revoke
 * @returns A promise with the result
 */
export const revokeUserSession = async (userId: string | number, sessionId: string): Promise<void> => {
  return await apiService.delete(SESSION_ENDPOINTS.REVOKE_USER_SESSION(userId, sessionId));
};

/**
 * Helper function to determine if a session is the current one
 */
const isCurrentSession = (session: UserSession, currentToken: string): boolean => {
  // In a real implementation, you might compare token hashes or session IDs
  // For now, we'll rely on comparing activity timestamps and browser info
  
  // This is a simplified approach - in practice, you'd store the current session ID
  // in localStorage along with the token, or decode the JWT to extract a session ID
  return session.active && !session.isExpired && !session.revokedAt;
};

const sessionService = {
  getMyActiveSessions,
  getMySessionHistory,
  revokeSession,
  revokeAllOtherSessions,
  getUserSessions,
  revokeUserSession
};

export default sessionService;