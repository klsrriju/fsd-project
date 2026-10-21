# SkillProof – AI-Powered Recruitment & Skill Verification Platform

SkillProof is an AI-powered talent acquisition and verification platform that matches candidates to job positions based on verified skills, practical project demonstrations, assessments, and transparent multi-factor matching.

---

## 🚀 Quick Start Commands

Run these commands from the repository root (`D:/FSD/fsd project`):

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

- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **Health Check:** [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)

---

## 🔑 Demo Login Credentials

All demo accounts use password: `password123`

| Role | Email | Name | Focus |
|------|-------|------|-------|
| **HR / Recruiter** | `sarah@techcorp.com` | Sarah Mitchell | TechCorp Solutions (Engineering) |
| **HR / Recruiter** | `james@innovate.io` | James Patel | Innovate.io (Fintech) |
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

# GitHub OAuth (Phase 6)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/v1/auth/github/callback

# Twilio SMS Service (Phase 8)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

---

## 🍃 MongoDB Atlas Setup & IP Whitelist Guide

The application connects to MongoDB Atlas using Mongoose with resilient fallback:

1. Log into your [MongoDB Atlas Dashboard](https://cloud.mongodb.com).
2. Select your project and cluster.
3. In the left navigation, click **Network Access** under **Security**.
4. Click **Add IP Address**.
5. Choose one of the following:
   - **Recommended for development:** Click **Add Current IP Address** to whitelist your workstation IP.
   - **Unrestricted development access:** Click **Allow Access from Anywhere** (`0.0.0.0/0`).
6. Click **Confirm**. Wait 1–2 minutes for the changes to deploy across the cluster.
7. Restart the backend server. The startup log will switch from `In-Memory Demo Mode` to `✅ Connected to MongoDB Atlas (fsdproject)`.

*Note:* When the client IP is not yet whitelisted, the system automatically runs in high-resilience **In-Memory Demo Mode** so that testing and development can proceed without downtime or crashes.

---

## 🐙 GitHub Account Integration (OAuth)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) > **OAuth Apps** > **New OAuth App**.
2. Set:
   - **Application name:** `SkillProof Platform`
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:3001/api/v1/auth/github/callback`
3. Generate a Client Secret and copy both `Client ID` and `Client Secret` to `apps/backend/.env`.
4. In the candidate profile, click **Connect via GitHub OAuth**. Your public repositories, primary programming languages, and followers will be imported into your Skill Passport.
5. Candidates can disconnect anytime using the **Disconnect** button.
6. *Instant alternative:* Candidates can also enter their GitHub username directly to synchronize public skill signals without requiring OAuth credentials.

---

## 🎯 Unstop Account Integration

1. Unstop does not offer a public OAuth endpoint for third-party platforms.
2. SkillProof provides an honest, transparent alternative:
   - **Username Sync:** Candidates link their Unstop username to track public contest badges and competitions.
   - **Voluntary Evidence Submission:** Candidates can submit specific certificates, contest rankings, and hackathon awards via the **Add Certificate / Proof** modal.
   - **Transparency:** All self-submitted awards are explicitly badged as `Self-Reported` to employers, preventing unverified claims while allowing candidates to demonstrate their credentials.

---

## 📱 SMS Notifications (Twilio)

1. Sign up for a [Twilio Account](https://www.twilio.com).
2. Copy your **Account SID**, **Auth Token**, and assigned **Twilio Phone Number** into `apps/backend/.env`.
3. Candidate SMS flow:
   - Candidates enter their mobile number in their profile and check the explicit consent checkbox.
   - Candidates can toggle preferences for:
     * 📅 Interview invitations & schedule changes
     * 📊 Application status updates & job offers
     * 💬 Rejection feedback responses from HR
     * 🎯 Future job availability alerts for rejected candidates
4. *Safe Development Fallback:* If Twilio credentials are not configured, all SMS dispatches are safely simulated and logged in the terminal with full message context, without throwing errors or blocking in-app notifications.

---

## 🤖 AI Resume Analyser & Multi-Factor Matching

The AI analyser (`/resume-analyzer`) provides transparent, explainable evaluations:
- **Factor Weights:**
  - 45% Core Skills Match
  - 20% Requirements Alignment
  - 20% Experience Signals
  - 15% Education Foundation
- **Skill-Gap Analysis:** Lists confirmed matched skills alongside missing skills.
- **Action Plan:** Prioritizes high-impact learning recommendations to close identified skill gaps.
- **No Blind Rejections:** The AI score is strictly informational and assistive; candidates are never automatically rejected based on an algorithmic score alone.
