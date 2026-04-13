# FitTrack - Fitness Accountability Dashboard

A clean, modern, high-performance web app for private fitness accountability and weight tracking. Built for a small group of 4 users focused on achieving their fitness goals together.

## Features

- **Dashboard**: View your current weight, goal weight, progress percentage, and weekly changes with motivational UI
- **Profile Management**: Set your starting weight, goal weight, goal type (cut/bulk/maintain), and focus areas
- **Weekly Check-ins**: Log your weight once per week with spam prevention
- **Personal Progress Graph**: Visualize your weight journey over time with smooth line charts
- **Group Progress Graph**: Compare progress with all 4 users on one graph with toggle visibility
- **Group View**: See all users' progress sorted by progress or consistency
- **Dark Mode**: Beautiful dark theme by default for a premium feel
- **Smooth Animations**: Framer Motion for delightful transitions and interactions
- **Responsive Design**: Works seamlessly on mobile and desktop

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: React Router

## Project Structure

```
fitnessTrack/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── PersonalGraph.tsx
│   │   ├── GroupGraph.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── Navigation.tsx
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── pages/              # Page components
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   ├── CheckIn.tsx
│   │   ├── Progress.tsx
│   │   └── GroupView.tsx
│   ├── services/           # Firestore services
│   │   └── firestore.ts
│   ├── lib/                # Firebase configuration
│   │   └── firebase.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind CSS
├── .env.example            # Environment variables template
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set rules to allow authenticated users to read/write
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Register a web app
   - Copy the configuration values

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

## Usage

### Getting Started

1. **Sign Up**: Create an account with your name, email, and password
2. **Set Profile**: Go to Profile page to set your:
   - Starting weight
   - Goal weight
   - Goal type (cut/bulk/maintain)
   - Focus areas (e.g., Fat Loss, Muscle Gain, Consistency)
3. **Check In**: Visit the Check-in page to log your weekly weight
4. **Track Progress**: View your progress on the Dashboard and Progress pages
5. **Group View**: See how everyone in the group is progressing

### Features Breakdown

- **Dashboard**: Shows your current stats, progress bar, and focus areas
- **Profile**: Edit your fitness goals and focus areas
- **Check-in**: Submit weekly weight with 7-day cooldown between check-ins
- **Progress**: View personal and group progress graphs
- **Group**: See all users sorted by progress or consistency

## Data Structure

### User Document (Firestore)
```typescript
{
  id: string;
  name: string;
  email: string;
  startingWeight: number;
  currentWeight: number;
  goalWeight: number;
  goalType: 'cut' | 'bulk' | 'maintain';
  focusAreas: string[];
  createdAt: Date;
}
```

### CheckIn Document (Firestore)
```typescript
{
  id: string;
  userId: string;
  weight: number;
  date: Date;
}
```

## Firestore Security Rules

For development, use these rules (update for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /checkins/{checkInId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ },
      dark: { /* your dark theme colors */ }
    }
  }
}
```

### User Limit

The app is designed for 4 users. To change this limit, modify the signup logic in `AuthContext.tsx` to add user count validation.

## Performance

- Vite for fast development and optimized builds
- React 19 with automatic optimizations
- Framer Motion with GPU-accelerated animations
- Recharts for efficient chart rendering
- Firebase real-time updates

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private fitness accountability group application.

## Support

For issues or questions, please contact the group administrator.
