# Test Plan for AI-Powered Educational Platform

## 1. Authentication Features
- [ ] User can access the signup page at /signup
- [ ] Signup form collects structured profile questions:
  - [ ] Software background (beginner, intermediate, advanced)
  - [ ] Programming languages known (text input)
  - [ ] Robotics experience (none, simulation-only, real hardware)
  - [ ] Hardware access (GPU, Jetson, robot kits, none)
- [ ] User can sign in at /signin
- [ ] User profile is persisted after signup
- [ ] User can view and edit their profile at /profile

## 2. RAG Chatbot Features
- [ ] Chatbot page is accessible at /chat
- [ ] Contextual chat component is embedded in chapter pages
- [ ] Chatbot responses are personalized based on user profile
- [ ] API server runs on port 3001
- [ ] RAG endpoint accepts queries and returns contextual responses

## 3. Integration
- [ ] Authentication state is maintained across the application
- [ ] Profile information is used to personalize chatbot responses
- [ ] Contextual chat works within documentation pages
- [ ] Navigation updates based on authentication status

## 4. Build and Deployment
- [ ] Docusaurus site builds without errors
- [ ] API server builds and runs without errors
- [ ] Concurrent startup of both frontend and API works

## Test Commands

### To run the application:
1. Terminal 1: `npm run api` (starts the API server on port 3001)
2. Terminal 2: `npm run start` (starts Docusaurus on port 3000)
3. Or both together: `npm run dev`

### To build the application:
- Frontend: `npm run build`
- API: The API server would be built separately in a production environment

### Key Files Created/Modified:
- src/auth/config.ts - Better Auth configuration
- src/contexts/AuthContext.tsx - Authentication context
- src/theme/Root.tsx - Root wrapper for auth context
- src/components/SignupForm.tsx - Signup form with profile questions
- src/components/SigninForm.tsx - Signin form
- src/pages/signup.tsx - Signup page
- src/pages/signin.tsx - Signin page
- src/pages/profile.tsx - Profile management page
- src/components/RAGChatbot.tsx - Main chatbot component
- src/components/ContextualChat.tsx - Contextual chat for docs
- src/components/AuthNavbar.tsx - Authentication-aware navbar
- src/css/chatbot.css - Styles for chatbot components
- api-server/index.ts - API server with Better Auth and RAG endpoints
- api-server/server.ts - Server entry point
- docs/chapter-1-introduction-to-physical-ai.md - Updated with contextual chat