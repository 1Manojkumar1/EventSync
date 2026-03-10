# EventSync

![Next.js](https://img.shields.io/badge/-Next.js-blue?logo=nextjs&logoColor=white) ![React](https://img.shields.io/badge/-React-blue?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-blue?logo=typescript&logoColor=white)

## 📝 Description

EventSync is a high-performance web application designed to streamline event management and synchronization through a seamless digital experience. Built using a cutting-edge technology stack featuring Next.js, React, and TypeScript, the platform offers a robust and scalable environment for users to coordinate schedules and track events with precision. By leveraging server-side rendering and static generation, EventSync ensures lightning-fast load times and superior responsiveness, providing a modern solution for efficient real-time event coordination.

## ✨ Features

- 🕸️ Web


## 🛠️ Tech Stack

- next.js Next.js
- ⚛️ React
- 📜 TypeScript


## 📦 Key Dependencies

```
@radix-ui/react-label: ^2.1.8
@radix-ui/react-slot: ^1.2.4
@radix-ui/react-tabs: ^1.1.13
class-variance-authority: ^0.7.1
clsx: ^2.1.1
date-fns: ^4.1.0
firebase: ^12.8.0
lucide-react: ^0.563.0
next: 16.1.6
react: 19.2.3
react-dom: 19.2.3
recharts: ^3.7.0
sonner: ^2.0.7
tailwind-merge: ^3.4.0
```

## 🚀 Run Commands

- **dev**: `npm run dev`
- **build**: `npm run build`
- **start**: `npm run start`
- **lint**: `npm run lint`


## 📁 Project Structure

```
.
├── .agent
│   └── rules
│       ├── ignore.md
│       ├── project-structure.md
│       ├── response-style.md
│       └── tech-stack.md
├── app
│   ├── (dashboard)
│   │   ├── admin
│   │   │   ├── analytics
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── users
│   │   │       └── page.tsx
│   │   ├── coordinator
│   │   │   ├── create
│   │   │   │   └── page.tsx
│   │   │   ├── edit
│   │   │   │   └── [id]
│   │   │   │       └── page.tsx
│   │   │   ├── monitor
│   │   │   │   └── [id]
│   │   │   │       └── page.tsx
│   │   │   ├── my-events
│   │   │   │   └── page.tsx
│   │   │   └── volunteers
│   │   │       └── page.tsx
│   │   ├── events
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── my-registrations
│   │   │   └── page.tsx
│   │   ├── settings
│   │   │   └── page.tsx
│   │   └── volunteer-inbox
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── login
│   │   └── page.tsx
│   ├── onboarding
│   │   └── page.tsx
│   └── page.tsx
├── eslint.config.mjs
├── firestore.rules
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── components
│   │   ├── analytics
│   │   │   ├── AttendanceForecasting.tsx
│   │   │   ├── EngagementHeatmap.tsx
│   │   │   ├── InterestEngagementPlot.tsx
│   │   │   └── SuccessScoreChart.tsx
│   │   ├── dashboard
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   ├── events
│   │   │   ├── event-card.tsx
│   │   │   ├── event-form.tsx
│   │   │   ├── event-group-chat.tsx
│   │   │   ├── event-list.tsx
│   │   │   ├── event-review-form.tsx
│   │   │   ├── pending-reviews-notification.tsx
│   │   │   ├── review-list.tsx
│   │   │   └── risk-indicator.tsx
│   │   └── ui
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── scroll-area.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── context
│   │   └── auth-context.tsx
│   └── lib
│       ├── analytics.ts
│       ├── data-service.ts
│       ├── firebase.ts
│       ├── firestore.ts
│       ├── risk-analysis-service.ts
│       ├── store.ts
│       ├── types.ts
│       ├── utils.ts
│       └── volunteer-service.ts
└── tsconfig.json
```

## 🛠️ Development Setup

### Node.js/JavaScript Setup
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install` or `yarn install`
3. Start development server: (Check scripts in `package.json`, e.g., `npm run dev`)


## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/1Manojkumar1/EventSync.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.

---
*This README was generated with ❤️ by ReadmeBuddy*
