```markdown
# EventSync

![Next.js](https://img.shields.io/badge/-Next.js-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)

> **Real-Time Campus Event Intelligence & Optimization Platform**

EventSync is a next-generation smart campus event management platform that goes beyond traditional scheduling tools. Using real-time campus data, predictive analytics, and AI-assisted automation, it actively improves event success before, during, and after the event lifecycle.

## 🎯 What Makes EventSync Different

Unlike existing tools that only handle event creation and registration, EventSync functions as an **intelligent decision support system** that:

- **Predicts** event success using historical data and engagement patterns
- **Optimizes** timing, venue, and structure based on real-time campus intelligence
- **Prevents** failures through early risk detection and alerts
- **Matches** volunteers intelligently based on skills and reliability scores
- **Monitors** live events with crowd safety intelligence

---

## ✨ Core Features

### 🧠 1. Event Success Intelligence Engine (ESIE)

**Before Event — Planning Intelligence**
- Analyzes student timetables, transport patterns, and historical engagement
- Suggests optimal timing, venue selection, and session structure
- Generates attendance probability scores and risk alerts
- *Example: "Shift event by 30 minutes → Attendance may increase by 25%"*

**During Event — Live Optimization**
- Monitors real-time check-in rates, crowd density, and engagement signals
- Suggests dynamic adjustments (extend check-in, reorder sessions, targeted notifications)
- Tracks late arrival patterns and transport delays

**After Event — Learning Engine**
- Learns from attendance vs. predictions, engagement levels, and promotion effectiveness
- Automatically improves future event recommendations
- Analyzes volunteer performance impact and club collaboration success

### 🎪 2. Smart Event Discovery & Management

**Event Listing (Card Grid)**
- 🖼️ Event banner images with dark theme UI
- 🏷️ Event type labels (Event / Workshop / Competition / TV Show / Movie)
- 🎨 Category tags (Tech, Cultural, Sports, Drama, etc.)
- ✨ Hover effects with smooth zoom and shadow animations
- 📱 Fully responsive grid layout

**Event Detail View**
- Full-screen cover image with status badges
- Structured information: Rating, Platform/Organizer, Date, Format
- Rich description with optional notes/comments section
- Smooth open animations with data persistence

**Event Creation & Editing**
- Intuitive forms for instant event creation
- Real-time editing capabilities for coordinators
- Risk analysis integration during planning phase

### 👥 3. Volunteer Intelligence & Smart Talent Allocation

**Smart Onboarding**
- Role selection: Attendee, Volunteer, Organizer, Speaker, Competitor
- Interest profiling: Tech, Cultural, Sports, and custom categories
- Skill input for technical volunteers (development, design, AV, etc.)

**Volunteer Poll System**
- Targeted recruitment based on skills and experience level
- Priority-based volunteer requests
- Smart matching to avoid mass spam

**AI Volunteer Ranking**
- Reliability Score (attendance consistency)
- Skill Usage Score (relevance matching)
- Feedback Score (organizer ratings)
- Impact Score (event contribution)

**Volunteer Scoreboard**
- Public recognition of top volunteers
- Gamified achievement tracking
- Historical performance analytics

### 📊 4. Live Event Monitoring

**Real-Time Dashboard**
- Live participant list with check-in status
- Event Group Chat (GC) for instant coordination
- Crowd density monitoring and safety alerts
- Engagement signal tracking

**Safety Intelligence**
- Overcrowding zone prediction
- Entry bottleneck detection
- Exit congestion risk alerts
- Safety heatmaps for organizers

### 🔔 5. Smart Notification System

- Volunteer enrollment confirmations
- Feedback form notifications (post-event)
- Event failure prevention alerts
- Targeted promotional notifications
- Role-based notification filtering

### 🎮 6. Gamification & Engagement

- Volunteer scoreboards and rankings
- Achievement badges for participation
- Campus engagement pulse visualization
- Interest-based opportunity matching

### 🔮 7. Advanced Analytics & Simulation

**Smart Analytics Dashboard**
- Event success scores with prediction accuracy
- Engagement heatmaps and interest-based stats
- Volunteer performance metrics
- Club collaboration insights

**What-If Simulation Mode**
- Test timing changes before committing
- Predict attendance impact of venue changes
- Simulate format changes and their effects
- Forecast volunteer needs and crowd density

**Campus Digital Pulse System**
- Real-time campus activity measurement
- Activity levels: Low / Normal / Peak Event Activity
- Registration spike detection
- Platform usage analytics

---

## 🛠️ Tech Stack

| Category         | Technology                          |
|------------------|-------------------------------------|
| **Framework**    | Next.js 16 (App Router)             |
| **Frontend**     | React 19, TypeScript                |
| **Styling**      | Tailwind CSS, Radix UI              |
| **Backend**      | Firebase (Firestore, Auth, Storage) |
| **Analytics**    | Recharts                            |
| **Notifications**| Sonner                              |
| **Icons**        | Lucide React                        |

---

## 📦 Key Dependencies

```json
{
  "next": "16.1.6",
  "react": "19.2.3",
  "firebase": "12.8.0",
  "date-fns": "4.1.0",
  "recharts": "3.7.0",
  "lucide-react": "0.563.0",
  "sonner": "2.0.7",
  "@radix-ui/react-label": "2.1.8",
  "@radix-ui/react-slot": "1.2.4",
  "@radix-ui/react-tabs": "1.1.13",
  "class-variance-authority": "0.7.1",
  "tailwind-merge": "3.4.0"
}
```

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/1Manojkumar1/EventSync.git
cd EventSync

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with your Firebase config:
# NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Run development server
npm run dev
```

---

## 📁 Project Structure

```
.
├── app/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── analytics/         # System-wide analytics
│   │   │   ├── users/             # User management
│   │   │   └── page.tsx           # Admin dashboard
│   │   ├── coordinator/
│   │   │   ├── create/            # Event creation
│   │   │   ├── edit/[id]/         # Event editing
│   │   │   ├── monitor/[id]/      # Live event monitoring
│   │   │   ├── my-events/         # Coordinator's events
│   │   │   └── volunteers/        # Volunteer management
│   │   ├── events/
│   │   │   ├── [id]/              # Event detail view
│   │   │   └── page.tsx           # Event grid listing
│   │   ├── my-registrations/      # User's registered events
│   │   ├── settings/              # User preferences
│   │   ├── volunteer-inbox/       # Volunteer notifications
│   │   └── layout.tsx             # Dashboard layout
│   ├── login/                     # Authentication
│   ├── onboarding/                # First-time user setup
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Landing page
├── src/
│   ├── components/
│   │   ├── analytics/             # Analytics charts & visualizations
│   │   ├── dashboard/             # Header & sidebar
│   │   ├── events/                # Event cards, forms, reviews
│   │   └── ui/                    # Reusable UI components
│   ├── context/
│   │   └── auth-context.tsx       # Authentication state
│   └── lib/
│       ├── analytics.ts           # Analytics calculations
│       ├── data-service.ts        # Data operations
│       ├── firebase.ts            # Firebase configuration
│       ├── firestore.ts           # Database operations
│       ├── risk-analysis-service.ts # Event risk assessment
│       ├── store.ts               # State management
│       ├── types.ts               # TypeScript definitions
│       ├── utils.ts               # Utility functions
│       └── volunteer-service.ts   # Volunteer matching logic
├── public/                        # Static assets
├── firestore.rules                # Security rules
├── next.config.ts
└── package.json
```

---

## 📋 Event Schema

```typescript
{
  id: string;
  title: string;
  image: string;
  type: 'Event' | 'Workshop' | 'Competition' | 'TV Show' | 'Movie';
  categories: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  rating?: number;
  platform: string;
  date: Date;
  format: string;
  description: string;
  // ... extended fields for ESIE
}
```
```
