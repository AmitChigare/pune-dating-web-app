# Frontend Setup & Development Guide

## Prerequisites
- Node.js 18 or higher (v20+ recommended)
- npm or yarn

## Initial Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env.local` file in the `frontend/` root directory:

```env
# The URL pointing to your local FastAPI backend instance
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# The WebSocket URL mapped to your local FastAPI backend instance
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1
```

## Running the Application Locally

1. **Start the Development Server:**
   ```bash
   npm run dev
   ```

2. **Access the Application:**
   Open your browser and navigate to **`http://localhost:3000`**.

## Architecture & Conventions

### App Router
The application uses the modern Next.js 14 App Router.
- Public routes: `/`, `/login`, `/register`, `/about`, `/blog`
- Protected routes: `/discover`, `/matches`, `/chat/[id]`, `/profile`, `/settings`, `/onboarding`

### State Management
We use **Zustand** (`store/useAuthStore.ts`) for managing global client state.
- It stores the authentication `token`, `user` profile data, and `unreadMatches`.
- It synchronizes perfectly with LocalStorage to persist authenticated sessions across browser refreshes.

### Making API Calls
All external requests to the backend are routed through the custom Axios instance located at `utils/axios.ts`. 

- **Token Injection**: The Axios instance is configured with Interceptors that automatically inject the JWT `Bearer` token into every outgoing request header.
- **Global Error Handling**: If the backend returns a `401 Unauthorized` or `403` response, the interceptor catches the error and automatically triggers `useAuthStore.setState({ token: null })`, logging the user out and redirecting them to the `/login` screen.

### Routing & Protection Rules
The `hooks/useAuth.ts` hook protects pages that require a user to be logged in. It will push unauthenticated sessions away.
Similarly, the backend strictly requires `latitude` and `longitude` during registration. If a user bypasses the UI and registers via the API but omits location, they will be forcibly redirected to `/onboarding`.
