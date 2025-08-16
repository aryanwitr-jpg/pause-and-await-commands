# Overview

ImpactBoard is a sustainability-focused team engagement platform built by Givetastic. It's a full-stack web application that combines event management, habit tracking, team competition, and coaching features. The app allows users to join events, track daily eco-habits, compete in teams, and work toward sustainability goals with guidance from expert coaches.

The platform supports multiple user roles (admin, coach, user) with role-based access to different features. Users can book events, track habits for points, join teams, and compete on leaderboards. Coaches can create and manage events, while admins have full system control.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: React Router for client-side navigation with protected routes based on user roles
- **State Management**: React Query (TanStack Query) for server state management and Auth Context for authentication state
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Component Structure**: Organized into feature-based folders (auth, events, habits, navigation) with reusable UI components

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with `/api` prefix for all routes
- **Middleware**: Express middleware for JSON parsing, request logging, and error handling
- **Development Setup**: Hot reloading with Vite integration for seamless full-stack development

## Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless connection pooling
- **Schema Management**: Centralized schema definition in `/shared/schema.ts` with automatic TypeScript type generation
- **Migrations**: Drizzle Kit for database migrations and schema changes

## Authentication & Authorization
- **Provider**: Supabase for authentication and user management
- **Authorization**: Role-based access control with three tiers (admin, coach, user)
- **Session Management**: Supabase session handling with React Context for state management
- **Route Protection**: Protected routes component that validates user authentication and role permissions

## Data Storage Strategy
- **Development**: In-memory storage implementation for rapid prototyping
- **Production**: PostgreSQL database with connection pooling
- **Storage Interface**: Abstract storage interface allowing easy switching between storage implementations
- **Data Models**: Strongly typed schemas for users, events, habits, teams, and bookings

## Project Structure
- **Monorepo Layout**: Client and server code in separate directories with shared types
- **Shared Code**: Common schemas and types in `/shared` directory accessible to both client and server
- **Asset Management**: Static assets served through Vite with path resolution for images and resources
- **Build Process**: Separate build processes for client (Vite) and server (esbuild) with production optimization

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: WebSocket support for serverless database connections

## Authentication & User Management
- **Supabase**: Complete authentication solution with user profiles, session management, and security features
- **User Profiles**: Extended profile data storage in Supabase with role-based permissions

## Email Services
- **SendGrid**: Email delivery service for notifications and communications
- **Email Templates**: Integration for sending event confirmations and user communications

## Development Tools
- **Replit Integration**: Development environment support with runtime error overlays and debugging tools
- **Cartographer**: Code navigation and development assistance for Replit environment

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible UI primitives for complex components
- **Lucide Icons**: Icon library for consistent iconography
- **Form Handling**: React Hook Form with Zod schema validation

## Build & Development
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Full TypeScript support across the entire stack
- **ESBuild**: Production server bundling for optimized deployment