// This serves as a simple in-memory storage accessible across API routes
// Note that in production, you would use a database for persistence

// Storage for tokens
export const tokens = {};

// Helper functions for tokens
export function storeToken(session, tokenData) {
  tokens[session] = tokenData;
  return true;
}

export function getToken(session) {
  return tokens[session] || null;
}

export function hasToken(session) {
  return !!tokens[session];
}

export function removeToken(session) {
  if (tokens[session]) {
    delete tokens[session];
    return true;
  }
  return false;
} 