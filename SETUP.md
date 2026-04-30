## Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm

## Backend Setup

1. Navigate to the server folder:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure PostgreSQL:
   - Create a new database named `wellness_academy`
   - Update `.env` with your PostgreSQL credentials

4. Run the server:
   ```
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## Frontend Setup

1. Navigate to the client folder:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## Database Tables

The server automatically creates the following tables on startup:
- `users` - User profiles and authentication
- `courses` - Course information
- `chapters` - Chapter details within courses
- `lectures` - Individual lecture videos
- `attachments` - Files attached to lectures
- `quizzes` - Quiz content
- `quiz_questions` - Questions for quizzes
- `quiz_answers` - Possible answers for questions
- `user_notes` - Saved notes for lectures

## API Endpoints

### Courses
- `GET /api/courses` - Fetch all courses
- `GET /api/courses/:id` - Fetch course with chapters and lectures

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Notes
- `POST /api/notes/save` - Save user notes for a lecture
- `GET /api/notes/:lectureId` - Fetch notes for a lecture
- `GET /api/notes` - Fetch all user notes

### User
- `GET /api/user/profile` - Fetch user profile
- `PUT /api/user/profile` - Update user profile

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT
