# GoalSync - MERN Stack Sports Club & Team Management System

GoalSync is a comprehensive, premium-designed MERN stack web portal for sports clubs and team management. It supports multi-role user dashboards, player rosters, tactical lineups, real-time match statistics logging, training logs, attendance reports, tournament fixtures, and club announcements.

---

===========================================Work in Progress====================================================

## 🌟 Key Features

1. **User Authentication**
   - User Registration, Secure Login, Logout, Forgot Password, Change Password.
   - Session protection and dynamic UI layout adjustment depending on roles.
2. **Team Management**
   - Create, edit, and delete teams.
   - Assign tactical coaches, upload Base64 team logos, and browse squad listings.
3. **Interactive Line-up Board**
   - Select the starting XI (max 11) and substitutes.
   - Assign Captain (C) & Vice Captain (VC) flags.
   - **Custom CSS Football Pitch Layout** that dynamically maps and visualizes the starting roster based on defensive/midfield positions.
4. **Player Directory**
   - Register player profiles (jersey number, date of birth, photo upload).
   - Toggle status indicators: `Active`, `Injured`, `Suspended`.
   - Automated performance scorecards (Goals, Assists, Appearance Counts, Yellow/Red cards).
5. **Coach Profiles**
   - Record Specialties (Goalkeeping, Tactical, Fitness) and years of experience.
6. **Fixture Schedule & Real-Time Statistics**
   - Schedule local matches or associate them with registered tournaments.
   - **Real-Time Score Logger:** Interactive dashboard widget for coaches to log minute-by-minute match events (Goals, Assists, Cards, Substitutions) that instantly updates player profile statistics.
7. **Training & Attendance Logs**
   - Schedule practices, track attendance (`Present`, `Absent`, `Excused`), and calculate squad attendance percentages.
8. **Tournament Fixtures Generator**
   - Enroll participating teams.
   - Automatically generate round-robin schedules/fixtures.
   - Mark winners and transition tournament standings.
9. **Club News Feed**
   - Publish, edit, and remove official announcements.
10. **Reports Center (Print Ready)**
    - Generate tabular print-optimized reports for Roster, Matches, Attendance Percentages, Tournaments, and Goalscorer Leaderboards.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Vanilla CSS (Premium Dark Theme, Glassmorphism, Micro-animations), Lucide React (Icons).
- **Backend:** Node.js, Express.js (ES Modules), JWT Auth, Mongoose.
- **Database:** MongoDB (Local server or MongoDB Atlas).

---

## 📂 Project Directory Structure

```
GoalSync/
├── backend/                  # Node & Express API
│   ├── config/               # DB Connection
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # JWT Guards & Error Handlers
│   ├── models/               # MongoDB Schemas
│   ├── routes/               # Express endpoints
│   ├── .env                  # Configuration keys
│   └── server.js             # Main server entry
├── frontend/                 # React client
│   ├── src/
│   │   ├── components/       # Pages & UI blocks
│   │   │   ├── Auth/         # Auth pages
│   │   │   ├── Common/       # Sidebar
│   │   │   └── Views/        # Dashboard tabs
│   │   ├── context/          # State providers
│   │   ├── styles/           # Theme styling
│   │   └── utils/            # API call client
│   ├── index.html
│   └── vite.config.js        # API Proxy configs
└── README.md                 # Project handbook
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` (default) or a MongoDB Atlas connection string.

---

### Step 1: Initialize the Database
Before booting the servers, you can seed the database with mock coaches, players, matches with completed timelines, news, and training schedules.

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the database seed script:
   ```bash
   node seed.js
   ```

---

### Step 2: Running the Backend API
1. Inside the `backend` directory, check your `.env` configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/goalsync
   JWT_SECRET=goalsyncsupersecretkey999
   NODE_ENV=development
   ```
2. Start the API server in development mode:
   ```bash
   npm run dev
   ```
   The backend will start running at `http://localhost:5000`.

---

### Step 3: Running the React Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Start the Vite React client:
   ```bash
   npm run dev
   ```
   The application will start running at `http://localhost:5173`. Open this URL in your web browser.

---

## 🔐 Default Seeding Accounts

To test the application, log in using any of the following pre-configured credentials:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@goalsync.com` | `password123` |
| **Coach** | `coach@goalsync.com` | `password123` |
| **Player** | `player@goalsync.com` | `password123` |
