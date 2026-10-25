# SkillProof – AI-Powered Recruitment & Skill Verification Platform

SkillProof is a modern AI-powered talent acquisition and skill verification platform that matches candidates to job positions based on verified skills, portfolio evidence, practical coding assessments, and transparent multi-factor matching.

---

## 🌟 Key Features & Capabilities

### 1. 🤖 AI-Powered Evaluation & Google Gemini Integration
- **Transparent Multi-Factor Matching Algorithm:**
  $$\text{Match Score} = 0.45 \times \text{Skills} + 0.20 \times \text{Requirements} + 0.20 \times \text{Experience} + 0.15 \times \text{Education}$$
- **Resume Skill Extraction & Gap Analysis:** Automatic skill parsing with customized action plans to bridge missing competencies.
- **AI Behavioral STAR Evaluator:** Analyzes behavioral interview responses with actionable suggestions using Google Gemini AI or semantic fallback.

### 2. 💻 Technical Coding Interview Preparation & Real Test Mode
- LeetCode-style problem suite categorized into **Easy**, **Medium**, and **Hard**.
- In-browser code runner supporting **Python, JavaScript, TypeScript, Java, and C++**.
- Logic and algorithmic analysis that reviews time complexity, edge cases, and provides targeted optimization tips.
- Real-time test simulator with progress tracking and submission history.

### 3. 🏅 Verified Achievements & Multi-Category Certificate Uploads
- Support for uploading certificate documents (PDF/PNG/JPG up to 25MB).
- Built-in classification into:
  - 🏆 **Hackathons & Competitions**
  - 🎓 **Learning & Course Certifications**
  - 💼 **Professional & Industry Certifications**
  - 📜 **Workshops & Honors**
- Embedded in-app document previewer and instant verification evidence.

### 4. 📲 Automated WhatsApp & SMS Candidate Notifications
- Automated notifications dispatched directly to candidate mobile numbers upon pipeline stage transitions:
  - ⭐ **Shortlisted:** Congratulatory alert with portal deep link.
  - 📅 **Interview Scheduled:** Exact date and time preservation (no timezone skew), mode, and meeting URL (`Google Meet` / `Zoom`).
  - ❌ **Rejection:** Professional update preserving candidate profile in active talent pool with feedback invitation.
  - 🎉 **Job Offer & Hired:** Congratulatory offer and onboarding messages.
- **Universal Click-to-Chat WhatsApp links** (`https://wa.me/...`) for instant recruiter-candidate communication.

### 5. 📊 Real-Time HR Pipeline & Live Synchronization
- **Kanban & List Pipeline Views:** Drag-and-drop or one-click status transitions across 7 stages (`applied`, `shortlisted`, `interview_scheduled`, `interviewed`, `offered`, `hired`, `rejected`).
- **Live Candidate Updates Feed:** Whenever candidates update skills, upload new certificates, or modify their experience, changes immediately sync and re-rank candidate match scores on the HR dashboard.
- Rejection feedback request and response loop between candidates and recruiters.

---

## 🚀 Quick Start Commands

Run these commands from the repository root:

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Backend and Frontend
```bash
# Build backend
npm run build --workspace @recruitment-platform/backend

# Build frontend
npm run build --workspace @recruitment-platform/frontend
```

### 3. Start Development Servers
```bash
# Option A: Run both concurrently
npm run dev

# Option B: Run separately in individual terminals
# Terminal 1 - Backend:
node apps/backend/dist/server.js
# Terminal 2 - Frontend:
npm run dev --workspace @recruitment-platform/frontend
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **Health Check:** [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)

---

## 🔑 Demo Login Credentials

All demo accounts use password: `password123`

| Role | Email | Name | Focus |
|------|-------|------|-------|
| **HR / Recruiter** | `sarah@techcorp.com` | Sarah Mitchell | TechCorp Solutions (Engineering) |
| **HR / Recruiter** | `james@innovate.io` | James Patel | Innovate.io (Fintech) |
| **Candidate** | `krijutom3@gmail.com` | Kriju Tom | Data Scientist & ML Researcher |
| **Candidate** | `alex@gmail.com` | Alex Johnson | Full Stack Developer |
| **Candidate** | `priya@gmail.com` | Priya Sharma | Data Scientist & ML |
| **Candidate** | `marcus@gmail.com` | Marcus Williams | DevOps & Cloud Engineer |
| **Candidate** | `emma@gmail.com` | Emma Chen | UX/UI Designer |
| **Candidate** | `daniel@gmail.com` | Daniel Torres | Backend Developer (Java/Spring) |

---

## 🛠️ Environment Variables Configuration

Copy `apps/backend/.env.example` to `apps/backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret_change_in_production

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<db_password>@cluster0.xxxxx.mongodb.net/fsdproject?retryWrites=true&w=majority

# Redis (optional - server runs smoothly without Redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# Google Gemini AI (AI Matching, STAR behavioral evaluations, code reviews)
GEMINI_API_KEY=your_gemini_api_key_here

# GitHub OAuth Integration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/v1/auth/github/callback

# Twilio SMS / WhatsApp Service
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_phone_number
```

---

## 🍃 Database Architecture & Data Models

The platform operates on **MongoDB Atlas** with an automatic in-memory fallback store:

- **User:** Authentication, roles (`hr` | `candidate`), profile fields, multi-category achievement evidence, coding assessment progress, and notification preferences.
- **Job:** Sourced from internal HR postings or external connectors with requirement lists and skills.
- **Application:** Candidate-to-job pairing with dynamic match scores, matched/missing skill arrays, resume feedback, and rejection-explanation feedback lifecycles.
- **Interview:** Application-linked scheduling holding exact date/time, meeting links, video platforms, and recruiter notes.
- **Notification:** Real-time in-app alerts mapped to frontend routing.

---

## 🐙 Integrations & Connectors

### GitHub Sync & OAuth
- Public repository scanning, primary language detection, and follower stats.
- Connect via official GitHub OAuth or instant direct username sync.

### Unstop Verification & Evidence
- Unstop username synchronization for competitive programming and contest stats.
- Direct PDF/image certificate evidence upload with categorical tagging.

### Communication (WhatsApp & Twilio SMS)
- Automated triggers on interview assignment, shortlisting, and rejections.
- Deduplication safety buffer preventing duplicate messages within 5 minutes.
- Development fallback safely logs full message payloads and direct click-to-chat links in console when Twilio credentials are not set.

---

## 📂 Project Architecture

```
fsd-project/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/       # Database, Redis, and environment configs
│   │   │   ├── db/           # MongoDB Atlas seeding & fallback store
│   │   │   ├── models/       # Mongoose schemas (User, Job, Application, Interview, Notification)
│   │   │   ├── routes/       # REST API endpoints (v1.ts)
│   │   │   ├── services/     # AI, Gemini, SMS, resume parser, and coding evaluators
│   │   │   └── server.ts     # Express server setup & middleware
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/
│       │   ├── context/      # AuthContext and state providers
│       │   ├── pages/        # Dashboard, Kanban, Profile, Coding Prep, Interview, Resume pages
│       │   ├── api.ts        # Axios API client & endpoints
│       │   └── styles.css    # Responsive theme & 3D styling
│       └── vite.config.ts
├── package.json
└── README.md
```
