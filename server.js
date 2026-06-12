const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * Security Middlewares
 */
// 1. Helmet helps secure Express apps by setting various HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'"],
      },
    },
  }),
);

// 2. Enable CORS
app.use(cors());

// 3. Rate limiting (prevent DDoS / brute force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

/**
 * Efficiency Middlewares
 */
// 4. Compress all responses
app.use(compression());

/**
 * Static File Serving
 */
// Serve static assets with caching headers
app.use(
  express.static(__dirname, {
    maxAge: "1d", // Cache static assets for 1 day
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        // Don't cache HTML to ensure latest version is always served
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);

/**
 * Routes
 */
// Direct all requests to index.html for SPA-like behavior
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Export the app for testing
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Terralife server running on port ${PORT}`);
  });
} else {
  module.exports = app;
}
