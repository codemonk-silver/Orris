import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: EXPRESS MIDDLEWARE ARCHITECTURE
 * ============================================================================
 * What is Middleware?
 * Middleware is code that runs sequentially in the middle of receiving a request
 * and sending a response. Think of it as an assembly line or security checkpoints.
 *
 * Each middleware function has access to:
 * - req: The Request object (incoming data, headers, body)
 * - res: The Response object (used to send data back to the client)
 * - next: A function that, when called, hands off execution to the NEXT checkpoint.
 *
 * If a middleware doesn't call `next()`, the pipeline freezes right there. This
 * is extremely useful for authentication, validation, and rate-limiting!
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. DATA MODELS & TYPES
// ----------------------------------------------------------------------------

export interface Session {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  expiresAt: number;
}

export interface RecoveryCode {
  code: string;
  expiresAt: number;
}

/**
 * IN-MEMORY DATA STORES
 * In a small or medium-scale application, we can use simple JavaScript Maps
 * to keep track of concurrent user sessions or temporary verification tokens.
 *
 * NOTE: For multi-server production environments, you would replace these
 * with a centralized store like Redis!
 */
export const sessions = new Map<string, Session>();
export const recoveryCodes = new Map<string, RecoveryCode>();

// ----------------------------------------------------------------------------
// 2. HELPER UTILITIES
// ----------------------------------------------------------------------------

/**
 * Utility to safe-extract specific cookie values from incoming HTTP headers.
 * e.g., "orris_session_token=xyz123; other_cookie=abc" -> "xyz123"
 */
export function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const c of cookies) {
    const [k, v] = c.trim().split('=');
    if (k === name) return decodeURIComponent(v);
  }
  return null;
}

/**
 * Reads the bearer token from the 'Authorization' header or session maps
 * to verify if a valid, unexpired active session exists for this user.
 */
export function getSessionUser(req: Request): Session | null {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  
  const session = sessions.get(token);
  if (!session) return null;
  
  // If the session has run out of time, discard it immediately.
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

// ----------------------------------------------------------------------------
// 3. SECURITY & HEADERS MIDDLEWARE
// ----------------------------------------------------------------------------

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "wss:", "ws:"],
      frameAncestors: [
        "'self'", 
        "https://ai.studio.google.com", 
        "https://ai.studio", 
        "https://aistudio.google.com", 
        "https://*.google.com",
        "https://*.run.app"
      ],
      frameSrc: ["'self'", "https:"]
    }
  },
  frameguard: false, // delegated to CSP frame-ancestors to permit embedded dashboard preview
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

/**
 * Adds secure trade HTTP response headers.
 * Guarding the web app from Clickjacking, XSS, content-sniffing, etc.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Always enforce HTTP Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Hand off response decoration to the robust Helmet engine
  helmetMiddleware(req, res, next);
}

// ----------------------------------------------------------------------------
// 4. RATE LIMITER MIDDLEWARE (DDoS & Abuse Shield)
// ----------------------------------------------------------------------------

const rateLimitMap = new Map<string, { requests: number; resetTime: number }>();

/**
 * Rate Limiter Factory
 * Generates a middleware that blocks clients which send too many requests.
 * Uses a basic sliding window based on the client IP address.
 */
export function rateLimiter(limit: number, timeframeMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Determine user's IP (accounting for proxies we are behind)
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let rate = rateLimitMap.get(ip);

    // If client is new, or the time window has restarted, init rate limit entry
    if (!rate || now > rate.resetTime) {
      rate = { requests: 1, resetTime: now + timeframeMs };
      rateLimitMap.set(ip, rate);
      return next();
    }

    rate.requests++;
    // If requests exceed the specific safe limit, halt execution and reply with Status 429
    if (rate.requests > limit) {
      res.status(429).json({ error: 'Too many requests. Please throttle your client connections.' });
      return;
    }
    next();
  };
}

// ----------------------------------------------------------------------------
// 5. AUTHORIZATION RULES MIDDLEWARE
// ----------------------------------------------------------------------------

/**
 * Require Auth Guard:
 * Blocks any request that doesn't have a valid unexpired session token.
 * Appends the validated session details to `req.user` for downstream routes to use!
 */
export function requireAuth(req: any, res: Response, next: NextFunction) {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Secure authentication required. Please login.' });
    return;
  }
  req.user = user;
  next();
}

/**
 * Require Admin Guard:
 * Blocks any request that is not from an authenticated administrator (curator role).
 */
export function requireAdmin(req: any, res: Response, next: NextFunction) {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access restricted. Admin credentials required.' });
    return;
  }
  req.user = user;
  next();
}

// ----------------------------------------------------------------------------
// 6. FRONTEND ROUTE-PROTECTION DIRECT OVERVIEW
// ----------------------------------------------------------------------------

/**
 * Global Route Protection:
 * Handles automatic HTTP intercepts & clean redirects for page requests
 * when dealing with active, expired, or missing session tokens.
 */
export function routeProtection(req: Request, res: Response, next: NextFunction) {
  // Skip backend API actions, asset file bundles, and anything other than GET
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/@') ||
    req.path.includes('.') ||
    req.method !== 'GET'
  ) {
    return next();
  }

  const token = getCookie(req, 'orris_session_token');
  const session = token ? sessions.get(token) : null;

  // Clear cookie and redirect back to homepage if session expired
  if (session && session.expiresAt < Date.now()) {
    sessions.delete(token!);
    res.clearCookie('orris_session_token');
    if (req.path === '/admin' || req.path === '/profile') {
      return res.redirect('/');
    }
    return next();
  }

  const userRole = session ? session.role : null;

  // Enforce access barriers on matching dashboard views
  if (req.path === '/admin') {
    if (!session) {
      return res.redirect('/?login=true');
    }
    if (userRole !== 'ADMIN') {
      return res.redirect('/profile');
    }
  }

  if (req.path === '/profile') {
    if (!session) {
      return res.redirect('/?login=true');
    }
    if (userRole === 'ADMIN') {
      return res.redirect('/admin');
    }
  }

  // Automatic redirect if a logged-in user visits the landing root
  if (req.path === '/' || req.path === '/home') {
    if (session) {
      if (userRole === 'ADMIN') {
        return res.redirect('/admin');
      } else {
        return res.redirect('/profile');
      }
    }
  }

  next();
}
