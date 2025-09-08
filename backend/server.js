const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Test database connection safely
let dbConnected = false;
let testConnection = null;

console.log("🔄 Loading database configuration...");
try {
  const dbConfig = require("./config/database");
  testConnection = dbConfig.testConnection;
  console.log("✅ Database config imported successfully");
  console.log("Available exports:", Object.keys(dbConfig));

  if (typeof testConnection === "function") {
    console.log("✅ testConnection function is available");
  } else {
    console.log("❌ testConnection is not a function:", typeof testConnection);
  }
} catch (error) {
  console.error("❌ Database config import failed:", error.message);
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." },
});
app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbConnected ? "Connected" : "Disconnected",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Store Rating Platform API",
    version: "1.0.0",
    status: "Running",
    database: dbConnected ? "Connected" : "Disconnected",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      users: "/api/users",
      admin: "/api/admin",
      stores: "/api/stores",
      ratings: "/api/ratings",
    },
  });
});

// API routes with error handling
console.log("🔄 Loading API routes...");

try {
  const authRoutes = require("./routes/auth");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.error("❌ Auth routes failed to load:", error.message);
  app.use("/api/auth", (req, res) => {
    res.status(500).json({
      success: false,
      message: "Auth routes not available",
      error: error.message,
    });
  });
}

try {
  const userRoutes = require("./routes/users");
  app.use("/api/users", userRoutes);
  console.log("✅ User routes loaded");
} catch (error) {
  console.error("❌ User routes failed to load:", error.message);
  app.use("/api/users", (req, res) => {
    res.json({ message: "User routes not available yet" });
  });
}

try {
  const storeRoutes = require("./routes/stores");
  app.use("/api/stores", storeRoutes);
  console.log("✅ Store routes loaded");
} catch (error) {
  console.error("❌ Store routes failed to load:", error.message);
  app.use("/api/stores", (req, res) => {
    res.json({ message: "Store routes not available yet" });
  });
}

try {
  const ratingRoutes = require("./routes/ratings");
  app.use("/api/ratings", ratingRoutes);
  console.log("✅ Rating routes loaded");
} catch (error) {
  console.error("❌ Rating routes failed to load:", error.message);
  app.use("/api/ratings", (req, res) => {
    res.json({ message: "Rating routes not available yet" });
  });
}

try {
  const adminRoutes = require("./routes/admin");
  app.use("/api/admin", adminRoutes);
  console.log("✅ Admin routes loaded");
} catch (error) {
  console.error("❌ Admin routes failed to load:", error.message);
  app.use("/api/admin", (req, res) => {
    res.status(500).json({ success: false, message: "Admin routes not available" });
  });
}


// Global error handler
app.use((error, req, res, next) => {
  console.error("Global Error Handler:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: error.errors,
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry. This record already exists.",
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection if available
    if (testConnection && typeof testConnection === "function") {
      console.log("🔄 Testing database connection...");
      try {
        await testConnection();
        dbConnected = true;
        console.log("✅ Database connection successful!");
      } catch (dbError) {
        console.log("⚠️  Database connection failed:", dbError.message);
        console.log("📝 Server will start anyway for testing...");
      }
    } else {
      console.log("⚠️  testConnection function not available");
    }

    app.listen(PORT, () => {
      console.log(`
🚀 Server is running on port ${PORT}
📍 Environment: ${process.env.NODE_ENV || "development"}
🔗 API URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
💾 Database: ${dbConnected ? "Connected" : "Disconnected"}
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
