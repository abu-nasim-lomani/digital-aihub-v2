# UNDP Digital & AI Hub

A modern, responsive website for the UNDP Digital & AI Hub, built with React, Tailwind CSS, and Firebase.

## Features

- **Modern Frontend**: Built with React.js and Vite for fast development and performance
- **Responsive Design**: Tailwind CSS for beautiful, mobile-first UI
- **UNDP Branding**: Strict adherence to UNDP visual identity guidelines
- **Firebase Backend**: Firestore database, Firebase Auth, and Firebase Storage
- **Admin Dashboard**: Complete CMS for managing all content
- **File Uploads**: Support for images, PDFs, and documents
- **Protected Routes**: Secure admin area with authentication

## Tech Stack

- **Frontend**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Backend**: Google Firebase (Firestore, Auth, Storage)
- **Routing**: React Router DOM
- **Carousel**: Swiper.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Digital&AIHub_V2
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database, Authentication (Email/Password), and Storage
   - Copy your Firebase configuration

4. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

5. Add your Firebase configuration to `.env`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

6. Set up Firestore Collections:
   Create the following collections in Firestore:
   - `projects`
   - `initiatives`
   - `learningModules`
   - `events`
   - `standards`
   - `team`

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:5173](http://localhost:5173) in your browser

## Firebase Setup

### Firestore Database Structure

#### Projects Collection
```
{
  title: string,
  supportType: string,
  documentUrl: string,
  duration: string,
  impact: string,
  status: 'draft' | 'published'
}
```

#### Initiatives Collection
```
{
  title: string,
  description: string,
  imageUrl: string,
  type: string,
  result: string,
  impact: string,
  status: 'draft' | 'published'
}
```

#### Learning Modules Collection
```
{
  moduleTitle: string,
  content: string,
  videoUrl: string (optional),
  resources: string[],
  curriculum: string (optional)
}
```

#### Events Collection
```
{
  title: string,
  date: Timestamp,
  type: 'upcoming' | 'archive',
  description: string,
  outcome: string,
  location: string,
  videoUrl: string (optional),
  galleryImages: string[]
}
```

#### Standards Collection
```
{
  title: string,
  category: 'DPI' | 'LGI',
  description: string,
  fileUrl: string
}
```

#### Team Collection
```
{
  name: string,
  designation: string,
  photoUrl: string,
  email: string (optional),
  linkedin: string (optional)
}
```

### Firebase Security Rules

Set up Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to published content
    match /{collection}/{document} {
      allow read: if resource.data.status == 'published' || 
                     !('status' in resource.data);
    }
    
    // Allow write access only to authenticated users
    match /{collection}/{document} {
      allow write: if request.auth != null;
    }
  }
}
```

Set up Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Admin Dashboard

Access the admin dashboard at `/admin/login`. You'll need to:

1. Create an admin user in Firebase Authentication
2. Log in with your credentials
3. Manage all content through the CMS interface

## Deployment

### Vercel Deployment (Recommended)

This project is configured for Vercel deployment. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

**Quick Steps:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Sign up at [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

The `vercel.json` configuration file is already set up for optimal Vercel deployment with:
- Automatic Vite detection
- SPA routing support
- Asset caching optimization

**Environment Variables Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── firebase/          # Firebase configuration
│   └── config.js
├── pages/             # Page components
│   ├── Home.jsx
│   ├── Initiatives.jsx
│   ├── Learning.jsx
│   ├── Projects.jsx
│   ├── Events.jsx
│   ├── Standards.jsx
│   ├── Team.jsx
│   └── admin/         # Admin pages
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── ManageProjects.jsx
│       ├── ManageInitiatives.jsx
│       ├── ManageLearning.jsx
│       ├── ManageEvents.jsx
│       ├── ManageStandards.jsx
│       └── ManageTeam.jsx
├── App.jsx           # Main app component with routing
└── main.jsx          # Entry point
```

## UNDP Branding

The site follows UNDP visual identity guidelines:
- **Primary Color**: UNDP Blue (#006EB0)
- **Secondary Colors**: White, Light Grey (#F7F7F7), Dark Blue (#003D6B)
- **Typography**: Open Sans / Roboto (Google Fonts)
- **Layout**: Clean, minimalist with abundant whitespace

## License

This project is created for UNDP Digital & AI Hub.

## Support

For issues or questions, please contact the development team.
