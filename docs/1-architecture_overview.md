# Architecture Overview

## Introduction
The Pune Dating App is a full-stack, hyper-local dating web application tailored specifically for residents of Pune, Maharashtra. It connects users based on real-time location, shared interests, and intelligent matching algorithms.

## Technology Stack

### Frontend (User Interface)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (for Global Auth and real-time UI state)
- **Icons**: Lucide React
- **Location API**: HTML5 Geolocation API
- **Deployment**: Vercel

### Backend (API Server)
- **Framework**: FastAPI (Python)
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy (Async mode)
- **Database Migrations**: Alembic
- **Real-Time Communication**: WebSockets (FastAPI)
- **Deployment**: Render (Docker containerized)

### Database & Caching
- **Primary Database**: PostgreSQL (via Supabase) with pgvector for advanced queries if needed
- **In-Memory Cache & Rate Limiting**: Redis (via Upstash)

## Core Components

### 1. Authentication & Security
- **JWT (JSON Web Tokens)**: Used for stateless authentication. 
- **Bcrypt**: Used for hashing user passwords securely.
- **Role-Based Access Control (RBAC)**: Supports roles (`user`, `admin`) to determine access to routes (e.g., Admin Dashboard).
- **Middleware**: 
  - `RateLimitMiddleware`: Protects against brute-force attacks by limiting requests per IP address using Redis.
  - CORS Middleware: Secures API requests to allow only authorized frontend origins in production.

### 2. Matching Engine (`matching.py`)
- Automatically curates match feeds based on:
  - **Location Bounds**: Ensures users are strictly within Pune (Lat: 18.25-18.85, Long: 73.55-74.25).
  - **Gender Preferences**: Matches generated according to the user's `interested_in` criteria.
  - **Elo Rating**: Experimental rating system based on user activity to serve higher-quality profiles.
- Supports actions like `swipe_right` (Like), `swipe_left` (Pass).
- Detects mutual likes and generates `Match` records to enable chat.

### 3. Real-Time Chat System (`chat.py`)
- Uses WebSockets to establish a persistent connection between two matched users.
- Connects clients to `/api/v1/chat/ws/{match_id}`.
- Messages are persisted to PostgreSQL upon receipt and broadcasted immediately to connected peers.
- Notifications for unread messages are sent to the frontend state via Zustand updating local UI (Red Dot indicators).

### 4. Admin Dashboard
- A protected route returning aggregated data (Total Users, Active Matches, Revenue proxy).
- Facilitates the moderation of specific user profiles, providing capabilities to ban/unban users remotely.

## Folder Structure

```
pune-dating-web-app/
├── backend/
│   ├── alembic/              # Database Migrations
│   ├── config/               # Settings, DB, Redis config
│   ├── middleware/           # Rate limiting and request interception
│   ├── models/               # SQLAlchemy DB Models (schemas)
│   ├── routes/               # FastAPI Endpoints (Auth, Users, Matches, Chat)
│   ├── schemas/              # Pydantic validation schemas (Input/Output data)
│   ├── services/             # Core business logic
│   └── main.py               # FastAPI Application Entry Point
├── frontend/
│   ├── app/                  # Next.js App Router Pages
│   ├── components/           # Reusable React UI Components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # Axios API calls mapping to Backend
│   ├── store/                # Zustand State management
│   ├── types/                # TypeScript Interfaces
│   └── utils/                # Helper functions (Axios instance, location utils)
└── docs/                     # Project Architecture & Documentation
```
