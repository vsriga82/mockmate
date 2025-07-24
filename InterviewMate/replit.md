# Interview Practice Application

## Overview

This is a full-stack interview practice application that helps users prepare for various entry-level tech and business roles. The application generates AI-powered interview questions, collects user responses, and provides detailed feedback and analysis. Built with React frontend, Express backend, in-memory storage (no database required), and OpenAI integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (July 24, 2025)

### Rate Limiting & Cost Management Implementation
- **Daily Interview Limits**: 3 free interviews per user/IP per day
- **Resume Check Limits**: 2 resume checks per user/IP per day (placeholder for future feature)
- **Token Optimization**: Limited OpenAI responses to 400-800 tokens for cost control
- **Usage Tracking**: Real-time usage stats displayed on homepage
- **Graceful Error Handling**: Clean error messages for quota exceeded and rate limits

### Enhanced User Experience
- **Progress Indicators**: Question X of 5 display during interviews
- **Usage Stats Display**: Shows remaining interviews on homepage
- **Improved Feedback UI**: Visual score bars and enhanced feedback display
- **Error Type Handling**: Different error messages for rate limits vs server capacity issues

### Security & API Management
- **Secure API Key Handling**: OpenAI key properly configured via Replit Secrets
- **Demo Mode Fallback**: High-quality demo questions and feedback when API quota exceeded
- **Cost Structure**: Approximately $0.01-0.03 per interview session with optimized token usage

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI components with shadcn/ui styling
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Storage**: In-memory storage only (no database required)
- **Session Management**: Temporary session storage for active interviews
- **API Integration**: OpenAI GPT-4o for question generation and feedback analysis

### Data Storage
- **In-Memory Only**: No persistent database required
- **Interview Sessions**: Temporary storage during active interview sessions
- **User Feedback**: Temporarily stored for analytics (resets on server restart)
- **Cost Benefit**: Zero database costs, simplified deployment

## Key Components

### Frontend Components
1. **Pages**:
   - Home: Role selection and user feedback collection
   - Interview: Interactive question-answer interface with timer
   - Feedback: Detailed results and analysis display
   - 404: Error handling

2. **Reusable Components**:
   - RoleCard: Displays available interview roles with styling
   - QuestionCard: Interactive interview question interface
   - FeedbackCard: Comprehensive feedback display
   - ProgressBar: Visual progress tracking

3. **UI Foundation**:
   - Complete shadcn/ui component library
   - Toast notifications for user feedback
   - Responsive design with mobile-first approach

### Backend Services
1. **Route Handlers**:
   - `/api/roles`: Returns available interview roles
   - `/api/interview/start`: Creates new interview session
   - `/api/interview/:id`: Retrieves session details
   - `/api/interview/:id/answer`: Submits answers and updates progress
   - `/api/interview/:id/complete`: Finalizes session with AI feedback

2. **OpenAI Service**:
   - Question generation based on role requirements
   - Response analysis and scoring
   - Personalized feedback generation

3. **Storage Layer**:
   - Pure in-memory implementation
   - No database dependencies
   - Stateless design for simple deployment

## Data Flow

1. **Session Initialization**:
   - User selects role from predefined options
   - Backend creates session and generates AI questions
   - Frontend receives session with questions array

2. **Interview Process**:
   - Questions presented sequentially with progress tracking
   - 15-minute timer enforces time constraints
   - Responses stored and validated before progression

3. **Completion & Analysis**:
   - All responses submitted to OpenAI for analysis
   - AI generates detailed feedback including scores, strengths, improvements
   - Results stored and displayed with actionable insights

4. **Feedback Loop**:
   - Users can provide system feedback
   - Sessions can be retaken or new roles selected
   - Progress and results are tracked for user benefit

## External Dependencies

### Core Dependencies
- **AI Service**: OpenAI API (GPT-4o model) - Only external dependency
- **UI Framework**: React with TypeScript support
- **Styling**: Tailwind CSS with PostCSS processing
- **No Database**: Simplified deployment without database setup

### Development Tools
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict mode
- **Development Server**: Express with Vite middleware integration
- **No Migrations**: No database setup required

### Authentication & Sessions
- Currently using basic session management
- Prepared for enhanced authentication systems
- Session persistence through database storage

## Deployment Strategy

### Production Build Process
1. **Frontend Build**: Vite compiles React app to static assets
2. **Backend Build**: esbuild bundles Express server with externals
3. **Database Setup**: Drizzle migrations prepare PostgreSQL schema
4. **Environment Configuration**: API keys and database URL required

### Environment Variables Required
- `OPENAI_API_KEY`: OpenAI API access token (only required variable)
- `NODE_ENV`: Environment flag (development/production)

### Cost Structure
- **OpenAI Free Tier**: $5 in free credits for new accounts
- **Per Interview**: Approximately $0.01-0.03 per complete session (optimized with token limits)
- **Daily Limits**: 3 interviews per user to manage costs
- **Capacity**: 150-500 practice interviews with free tier (with rate limiting)
- **No Database Costs**: Zero ongoing storage or database fees
- **Token Optimization**: Max 400 tokens for questions, 800 tokens for feedback

### Hosting Considerations
- **Static Assets**: Frontend built to `dist/public`
- **Server**: Express app bundled to `dist/index.js`
- **No Database**: Serverless-friendly, no persistent storage needed
- **File Structure**: Monorepo with clear client/server separation

The application is designed for minimal cost deployment with clean separation of concerns, type safety throughout, and a modern development experience. The serverless architecture eliminates database costs and complexity while maintaining full functionality for the target use case.