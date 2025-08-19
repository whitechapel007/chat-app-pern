# Cookie Handling Best Practices in Express.js

## ❌ **Why You CANNOT Skip cookie-parser**

### Manual Cookie Parsing Issues
```javascript
// DON'T DO THIS - Manual parsing is dangerous
const cookieHeader = req.headers.cookie; // "token=abc123; user=john%20doe"
const cookies = {};
cookieHeader.split(';').forEach(cookie => {
  const [key, value] = cookie.trim().split('=');
  cookies[key] = value; // Missing URL decoding, validation, etc.
});
```

**Problems:**
- ❌ No URL decoding (`%20` remains as `%20`)
- ❌ No signed cookie support
- ❌ No security validation
- ❌ No error handling for malformed cookies
- ❌ Vulnerable to cookie injection attacks
- ❌ No support for complex cookie values

## ✅ **Industry Best Practices**

### 1. **Always Use cookie-parser**
```javascript
import cookieParser from 'cookie-parser';
import express from 'express';

const app = express();

// Essential for secure cookie handling
app.use(cookieParser(process.env.COOKIE_SECRET)); // Optional signing secret
```

### 2. **Secure Cookie Configuration**
```javascript
// Setting secure cookies
res.cookie('token', jwtToken, {
  httpOnly: true,                    // Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',               // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',                        // Available on all paths
  domain: process.env.COOKIE_DOMAIN // Restrict to specific domain
});
```

### 3. **Multiple Token Sources (Defense in Depth)**
```javascript
export const authenticateToken = async (req, res, next) => {
  let token;
  
  // 1. Authorization header (for APIs)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // 2. HTTP-only cookie (for web apps)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }
  
  // 3. Custom header (for mobile apps)
  if (!token && req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  // Verify token...
};
```

## 🔒 **Security Best Practices**

### 1. **Cookie Attributes**
```javascript
const cookieOptions = {
  httpOnly: true,     // Prevents JavaScript access (XSS protection)
  secure: true,       // HTTPS only (production)
  sameSite: 'strict', // CSRF protection
  maxAge: 86400000,   // 24 hours
  path: '/',          // Cookie scope
  domain: '.example.com' // Domain scope
};
```

### 2. **Environment-Specific Settings**
```javascript
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
  domain: process.env.NODE_ENV === 'production' 
    ? process.env.COOKIE_DOMAIN 
    : undefined
});
```

### 3. **Signed Cookies for Sensitive Data**
```javascript
// Setup with secret
app.use(cookieParser(process.env.COOKIE_SECRET));

// Set signed cookie
res.cookie('user_id', userId, { signed: true, ...cookieOptions });

// Read signed cookie
const userId = req.signedCookies.user_id; // Automatically verified
```

## 🛡️ **Security Considerations**

### 1. **SameSite Attribute**
```javascript
// Strict: Best security, may break some legitimate cross-site requests
sameSite: 'strict'

// Lax: Good balance, allows some cross-site requests
sameSite: 'lax'

// None: Least secure, requires secure=true
sameSite: 'none' // Only use with secure: true
```

### 2. **Cookie Prefixes**
```javascript
// __Secure- prefix (requires secure=true)
res.cookie('__Secure-token', token, { secure: true, httpOnly: true });

// __Host- prefix (requires secure=true, path='/', no domain)
res.cookie('__Host-session', sessionId, { 
  secure: true, 
  httpOnly: true, 
  path: '/' 
});
```

### 3. **Cookie Clearing**
```javascript
// Proper cookie clearing
res.clearCookie('token', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
});
```

## 📱 **Multi-Platform Support**

### Web Applications
```javascript
// Primary: HTTP-only cookies
res.cookie('token', jwt, cookieOptions);

// Fallback: Local storage (less secure)
res.json({ token: jwt }); // Client stores in localStorage
```

### Mobile Applications
```javascript
// Custom header approach
app.use((req, res, next) => {
  const token = req.headers['x-auth-token'] || 
                req.headers['authorization']?.replace('Bearer ', '') ||
                req.cookies.token;
  
  if (token) {
    req.token = token;
  }
  next();
});
```

## 🔄 **Token Refresh Strategy**
```javascript
// Dual token approach
res.cookie('accessToken', shortLivedToken, {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000 // 15 minutes
});

res.cookie('refreshToken', longLivedToken, {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth/refresh' // Restrict scope
});
```

## 🚨 **Common Mistakes to Avoid**

1. **Manual Cookie Parsing**: Always use cookie-parser
2. **Missing httpOnly**: Vulnerable to XSS attacks
3. **No secure flag**: Cookies sent over HTTP
4. **Wrong sameSite**: CSRF vulnerabilities
5. **No expiration**: Cookies persist indefinitely
6. **Broad domain**: Cookies accessible to subdomains
7. **No path restriction**: Cookies sent to all endpoints

## ✅ **Implementation Checklist**

- [ ] Install and configure cookie-parser
- [ ] Set httpOnly=true for sensitive cookies
- [ ] Use secure=true in production
- [ ] Configure appropriate sameSite value
- [ ] Set reasonable maxAge/expires
- [ ] Restrict path and domain when possible
- [ ] Implement proper cookie clearing
- [ ] Use signed cookies for sensitive data
- [ ] Support multiple token sources
- [ ] Test cookie behavior across browsers

## 🔧 **Testing Cookies**

```javascript
// Test cookie setting
const response = await request(app)
  .post('/api/auth/signin')
  .send({ email: 'test@example.com', password: 'password' });

expect(response.headers['set-cookie']).toBeDefined();
expect(response.headers['set-cookie'][0]).toMatch(/httpOnly/);
expect(response.headers['set-cookie'][0]).toMatch(/secure/);

// Test cookie reading
const protectedResponse = await request(app)
  .get('/api/auth/profile')
  .set('Cookie', response.headers['set-cookie']);

expect(protectedResponse.status).toBe(200);
```

Remember: **Never skip cookie-parser** - it's essential for secure, reliable cookie handling in Express.js applications!
