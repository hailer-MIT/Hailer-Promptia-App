const crypto = require("crypto");

console.log("=== Environment Variables Setup ===\n");

// Generate NextAuth secret
const nextAuthSecret = crypto.randomBytes(32).toString("base64");

console.log(
  "Create a file named .env.local in your project root with the following content:\n"
);

console.log("# Google OAuth Configuration");
console.log("GOOGLE_CLIENT_ID=your_google_client_id_here");
console.log("GOOGLE_CLIENT_SECRET=your_google_client_secret_here");
console.log("");
console.log("# NextAuth Configuration");
console.log(`NEXTAUTH_URL=http://localhost:3000`);
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);
console.log("");
console.log("# MongoDB Configuration");
console.log("MONGODB_URI=your_mongodb_connection_string_here\n");

console.log("=== Setup Instructions ===");
console.log("1. Go to https://console.cloud.google.com/");
console.log("2. Create a new project or select existing one");
console.log("3. Enable Google+ API and Google Identity");
console.log("4. Create OAuth 2.0 credentials (Web application)");
console.log("5. Add these Authorized Redirect URIs:");
console.log("   - http://localhost:3000/api/auth/callback/google");
console.log("   - http://localhost:3000/api/auth/callback/google/");
console.log("6. Copy your Client ID and Client Secret to .env.local");
console.log(
  "7. Replace your_mongodb_connection_string_here with your MongoDB URI"
);
