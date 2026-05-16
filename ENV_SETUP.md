# Environment Variables Setup

Copy the following variables to your `.env.local` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/skytech_ecommerce

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application
NODE_ENV=development
```

## How to generate NEXTAUTH_SECRET:

Run this command in your terminal:
```bash
openssl rand -base64 32
```

## MongoDB Setup:

Make sure MongoDB is running locally on port 27017, or update the MONGODB_URI with your MongoDB Atlas connection string.
