# Environment Variables Setup

Copy the following variables to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Application
NODE_ENV=development
```

## How to generate NEXTAUTH_SECRET:

Run this command in your terminal:
```bash
openssl rand -base64 32
```

## Firebase Setup:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password and Google providers)
3. Enable Firestore Database
4. Copy your Firebase configuration from Project Settings > General > Your apps
5. Add the configuration values to your `.env.local` file
