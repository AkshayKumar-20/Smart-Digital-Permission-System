# Smart Digital Permission System — Full Project Specification

> **Purpose:** This document is the single source of truth for building the Smart Digital Permission System.  
> Any AI assistant, developer, or team member reading this file should understand, plan, and build the full system from this document alone.

---

## 1. Project Overview

**Smart Digital Permission System** is a full-stack web application that digitalises the student permission/leave request process in a college. Students submit requests online, choose who to send them to, and the approver(s) can accept or reject. Once any approver accepts, a **QR code is generated** — the student shows it at the gate and the watchman scans it to verify approval.

| Item | Detail |
|------|--------|
| **Frontend** | React (Vite), JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs |
| **Charts** | Recharts or Chart.js |
| **File Uploads** | Multer (supporting documents) |
| **QR Code** | `qrcode` npm package (backend generation), `react-qr-code` (frontend display), `html5-qrcode` (watchman scanner) |
| **Notifications** | In-app + optional Email (Nodemailer) |

---

## 2. Tech Stack & Project Structure

```
Smart-Digital-Permission-System/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # register, login
│   │   ├── requestController.js     # CRUD + approval + QR generation
│   │   └── qrController.js          # QR scan verify + scan history
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification, role guard
│   ├── models/
│   │   ├── User.js                  # User schema (all roles)
│   │   ├── Request.js               # Permission request schema
│   │   └── ScanLog.js               # Watchman QR scan history schema
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/register, /login
│   │   ├── requestRoutes.js         # /api/requests/*
│   │   └── qrRoutes.js              # /api/qr/verify, /api/qr/history
│   ├── utils/
│   │   ├── sendEmail.js             # Nodemailer helper (optional)
│   │   └── generateQR.js            # QR code generation helper
│   ├── .env
│   └── server.js                    # Express entry point (port 5000)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/              # Reusable UI components
│   │   ├── context/                 # AuthContext (global user state)
│   │   ├── pages/                   # One file/folder per role dashboard
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   ├── hod/
│   │   │   ├── principal/
│   │   │   └── watchman/
│   │   ├── services/                # Axios API call helpers
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── specification.md                 # ← THIS FILE
├── todo.md                          # Development progress tracker
└── .gitignore
```

---

## 3. Environment Variables

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/permissionDB
JWT_SECRET=supersecretjwtkey123
QR_SECRET=qr_signing_secret_key       # Used to sign/verify QR token
NODE_ENV=development
EMAIL_USER=your_email@gmail.com        # optional
EMAIL_PASS=your_app_password           # optional
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. User Roles

The system has **6 roles**. Each role sees a completely different dashboard after login.

| Role | Who They Are | What They Can Do |
|------|-------------|-----------------|
| `student` | College student | Submit requests, choose recipients, track status, view QR, view attendance |
| `teacher` | Faculty member | Receive requests addressed to them, approve/reject, escalate to HOD/Principal |
| `hod` | Head of Department | Receive requests addressed to them or escalated by teachers, approve/reject, escalate |
| `principal` | College Principal | Receive requests addressed to them or escalated, final approve/reject |
| `watchman` | Gate security | Scan student QR code, verify approval, view scan history |
| `admin` | System admin | Manage users, departments, system settings |

---

## 5. Core Concept — How the System Works

### 5.1 Request Submission (Student Side)
1. Student fills in the request form (type, dates, reason, description, document).
2. Student **selects recipients** — who should receive and approve this request:
   - Specific faculty member(s) from their branch
   - All faculty of their branch
   - Their branch HOD
   - Principal
   - Any combination of the above (multi-select)
3. Request is sent to all selected recipients simultaneously. Status = `pending`.

### 5.2 Approval Flow (Flexible, Not Fixed Chain)
- **Any** selected recipient (teacher / HOD / principal) can approve or reject independently.
- The first person to **approve** triggers QR code generation immediately.
- Any person can **reject** — rejection is final unless student re-submits.
- An approver can **escalate** — approve and additionally forward to a higher authority (HOD / Principal) for secondary approval if they feel it is needed.
- If escalated, QR is only generated after the secondary approver also approves.

### 5.3 QR Code Generation
- Triggered automatically when a request reaches `approved` status.
- QR encodes a **signed JWT payload** (not plain request ID) to prevent tampering:
  ```json
  {
    "requestId": "abc123",
    "studentId": "student_obj_id",
    "approvedBy": "teacher_obj_id",
    "approvedAt": "2026-03-20T14:00:00Z",
    "validUntil": "2026-03-21T23:59:59Z"
  }
  ```
- QR is displayed on the student's dashboard (accepted requests page).
- Student can **download QR as image** or show on screen.

### 5.4 QR Scanning (Watchman Side)
- Watchman opens the scanner page on their dashboard.
- Points camera at student's QR code.
- System verifies the token signature and expiry.
- Shows approval details: student name, photo, department, leave type, dates, approved by, remarks.
- Scan is logged in `ScanLog` with timestamp and watchman ID.
- Watchman can view their **scan history**.

---

## 6. Database Schemas

### 6.1 User Schema (`backend/models/User.js`)
```js
{
  name:        String,    // Full name
  collegeId:   String,    // Unique ID (e.g. "CS2024001") — login username
  email:       String,    // Unique email
  password:    String,    // bcrypt hashed
  role:        String,    // "student"|"teacher"|"hod"|"principal"|"watchman"|"admin"
  department:  String,    // "CSE"|"ECE"|"MECH" etc.
  year:        String,    // "1"|"2"|"3"|"4" — students only
  section:     String,    // "A"|"B"|"C" — students only
  phone:       String,    // Contact number
  photo:       String,    // Profile photo URL/path
  timestamps              // createdAt, updatedAt (auto)
}
```

### 6.2 Request Schema (`backend/models/Request.js`)
```js
{
  student:       ObjectId → User,     // Who submitted the request

  requestType:   String,              // "Medical"|"Personal"|"Event"|"Campus Exit"|"Other"
  reason:        String,              // Short summary (required)
  description:   String,              // Detailed explanation (optional)
  fromDate:      Date,                // Leave/exit start
  toDate:        Date,                // Leave/exit end
  document:      String,              // Uploaded file path (optional)

  // Recipients — whom the student chose to send the request to
  recipients: [{
    user:        ObjectId → User,     // Individual teacher/HOD/principal
    role:        String,              // Their role
    action:      String,              // "pending"|"approved"|"rejected"|"escalated"
    remarks:     String,              // Their comment
    actionAt:    Date                 // When they acted
  }],

  // Escalation — if an approver wants a higher authority to also review
  escalatedTo:   ObjectId → User,     // Who it was escalated to (optional)
  escalatedBy:   ObjectId → User,     // Who escalated (optional)

  // Overall request status
  status:        String,              // "pending"|"approved"|"rejected"
  approvedBy:    ObjectId → User,     // First person who approved
  approvedAt:    Date,

  // QR Code
  qrToken:       String,              // Signed JWT for QR — generated on approval
  qrValidUntil:  Date,                // Expiry time of QR (e.g., end of toDate)

  timestamps                          // createdAt, updatedAt
}
```

### 6.3 Scan Log Schema (`backend/models/ScanLog.js`)
```js
{
  request:    ObjectId → Request,   // Which request was scanned
  student:    ObjectId → User,      // Which student
  scannedBy:  ObjectId → User,      // Watchman who scanned
  scannedAt:  Date,                 // Timestamp
  result:     String,               // "valid"|"expired"|"invalid"
  details:    String                // Any extra notes
}
```

---

## 7. API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login → returns JWT | No |

### Request Routes (`/api/requests`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/requests/add` | Student submits new request | Student |
| GET | `/api/requests/all` | List requests (filtered by caller's role) | All |
| GET | `/api/requests/:id` | Full detail of one request | All |
| PUT | `/api/requests/approve/:id` | Approve a request (+ optional escalate) | Teacher/HOD/Principal |
| PUT | `/api/requests/reject/:id` | Reject a request | Teacher/HOD/Principal |
| GET | `/api/requests/stats` | Summary stats for charts | All |

### QR Routes (`/api/qr`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/qr/verify/:token` | Verify a scanned QR token → return request details | Watchman/Teacher/Faculty |
| POST | `/api/qr/scan-log` | Save a scan record to ScanLog | Watchman |
| GET | `/api/qr/scan-history` | Watchman's own scan history | Watchman |

> All protected routes require `Authorization: Bearer <JWT>` header.

---

## 8. Frontend Pages & Routing

```
/                   → Redirect to /login
/login              → Login Page (all roles)
/register           → Register Page

/student/*          → Student Dashboard   (role guard: student)
/teacher/*          → Teacher Dashboard   (role guard: teacher)
/hod/*              → HOD Dashboard       (role guard: hod)
/principal/*        → Principal Dashboard (role guard: principal)
/watchman/*         → Watchman Dashboard  (role guard: watchman)
/admin/*            → Admin Dashboard     (role guard: admin)
```

---

## 9. Student Dashboard

### Layout
```
┌────────────────────────────────────────────────────────────────┐
│  [Logo] Smart Permission System   [Student Name] [Photo] [Sign Out] │
├─────────────┬──────────────────────────────────────────────────┤
│  Sidebar    │  Main Content (changes with sidebar selection)   │
│             │                                                  │
│  🏠 Dashboard│                                                  │
│  👤 My Profile│                                                 │
│  📅 Attendance│                                                 │
│  ➕ New Request                                                 │
│  📋 History  │                                                  │
│  ✅ Accepted │                                                  │
│  ❌ Rejected │                                                  │
│  📊 Analytics│                                                  │
│  🔔 Notifs   │                                                  │
└─────────────┴──────────────────────────────────────────────────┘
```

### 9.1 Dashboard Home
- Welcome message: "Good Morning, [Name] 👋"
- Summary cards: Total Requests | Approved | Pending | Rejected
- Pie Chart — request status distribution
- Bar Chart — monthly request trend
- Recent Activity — last 5 requests with status badges

### 9.2 My Profile
- Display: photo, name, roll number (collegeId), department, year, section, email, phone
- Edit mode: all fields editable, profile photo upload, Save/Cancel buttons

### 9.3 Attendance
- Circular attendance percentage gauge
- Total / Attended / Missed classes
- Calendar view (optional — highlight present/absent days)
- Leave deduction notice if approved leaves reduced attendance

### 9.4 New Permission Request
**Form Fields:**

| Field | Type | Validation |
|-------|------|------------|
| Request Type | Dropdown | Required — Medical / Personal / Event / Campus Exit / Other |
| From Date | Date Picker | Required, not in past |
| To Date | Date Picker | Required, ≥ From Date |
| Reason | Text Input | Required, max 100 chars |
| Description | Textarea | Optional, max 500 chars |
| Supporting Document | File Upload | Optional, PDF/Image ≤ 5 MB |
| **Send To** | Multi-select | Required — see options below |
| Submit | Button | Disabled until required fields are filled |

**"Send To" Options (multi-select, student picks one or more):**
- Specific teacher(s) — dropdown shows only teachers from student's own branch
- All teachers of my branch (broadcasts to all branch faculty)
- My HOD (auto-selects HOD of student's department)
- Principal

> The student can select any combination. At least one recipient is required.

**After Submit:**
- Success toast: "Request submitted! Waiting for approval."
- Auto-redirect to Request History after 2s

### 9.5 Request History
Table: # | Date | Type | From | To | Sent To | Status | Actions
- Color-coded status badges (Pending=Amber, Approved=Green, Rejected=Red)
- Filter by: Status | Date Range | Request Type
- "View Details" modal — full request info + per-recipient action trail
- Pagination (10 per page)

### 9.6 Accepted Requests
- Pre-filtered to `status = "approved"`
- **QR Code display** for each approved request
  - Show QR on screen
  - Download QR as PNG button
  - Shows: Approved by [Name], Approved on [Date], Valid until [Date]

### 9.7 Rejected Requests
- Pre-filtered to `status = "rejected"`
- Shows rejection remarks prominently
- "Re-Submit" button — opens New Request form with pre-filled data

### 9.8 Analytics
- Pie Chart: Total / Approved / Rejected / Pending
- Bar Chart: Requests per month
- Line Chart: Attendance trend over months
- Stat summary cards

### 9.9 Notifications
- List sorted newest-first; each item: icon, message, timestamp, read/unread dot
- Triggers: request approved, rejected, escalated, QR generated
- Mark all as read; unread count badge on sidebar icon

---

## 10. Teacher Dashboard

### Sidebar
Dashboard | Inbox (Pending) | Approved | Rejected | Student Profiles | Analytics | Notifications

### 10.1 Dashboard Home
Cards: Pending for Me | Approved Today | Rejected Today | Total Acted On  
Recent pending requests list

### 10.2 Inbox — Requests Addressed to This Teacher
- Table: Student Name | Roll No | Type | Dates | Reason | Sent At | Actions
- **Action options per request:**
  - **View Student Profile** — see photo, name, dept, attendance summary
  - **Approve** → modal: add remarks → optionally tick "Escalate to HOD / Principal" → Confirm
  - **Reject** → modal: remarks required → Confirm
- If escalated: request is marked `approved` for this teacher but forwarded to chosen higher authority

### 10.3 Approved / Rejected History
- Requests this teacher has acted on, pre-filtered by status
- Shows their remarks

---

## 11. HOD Dashboard

Same layout as Teacher. Differences:
- Inbox shows requests that were **directly addressed to HOD** OR **escalated by a teacher** to HOD
- Department filter (sees only their department's students)
- Can approve / reject / escalate to Principal
- Department-level analytics

---

## 12. Principal Dashboard

Same layout. Differences:
- Inbox shows requests **directly addressed to Principal** OR **escalated** from Teacher/HOD
- Sees ALL departments
- No further escalation (highest authority)
- Final approval → QR is generated
- Download reports (CSV/PDF) for all requests
- College-wide statistics

---

## 13. Watchman Dashboard

### Sidebar
Scan QR | Scan History | Notifications

### 13.1 Scan QR Page (`/watchman/scan`)
- Camera view with QR scanner (using `html5-qrcode`)
- On scan success → call `GET /api/qr/verify/:token`
- **If valid:** Show green success card:
  - Student photo, name, roll number, department
  - Request type, from/to dates
  - Approved by (name + role), approved on date
  - Valid until date
  - "Mark as Scanned" button (saves to ScanLog)
- **If expired:** Show amber warning — "QR expired on [date]"
- **If invalid/tampered:** Show red alert — "Invalid QR — Not authorised"

### 13.2 Scan History Page (`/watchman/history`)
Table: # | Date & Time | Student Name | Roll No | Request Type | Approved By | Scan Result (Valid/Expired/Invalid)
- Filter by date range
- Search by student name or roll number

---

## 14. QR Code — Technical Details

### Generation (Backend)
```js
// When request status changes to "approved":
const payload = {
  requestId:  request._id,
  studentId:  request.student,
  approvedBy: approver._id,
  approvedAt: new Date(),
  validUntil: request.toDate  // QR expires after the leave end date
};
const qrToken = jwt.sign(payload, process.env.QR_SECRET, {
  expiresIn: /* duration until toDate */
});
request.qrToken = qrToken;
request.qrValidUntil = request.toDate;
await request.save();
```

### Display (Frontend — Student)
```jsx
import QRCode from "react-qr-code";
// The value is the full verify URL so any scanner (phone camera) also works:
<QRCode value={`${BASE_URL}/api/qr/verify/${request.qrToken}`} size={200} />
```

### Verification (Backend)
```js
// GET /api/qr/verify/:token
const decoded = jwt.verify(token, process.env.QR_SECRET); // throws if expired/invalid
const request = await Request.findById(decoded.requestId).populate("student approvedBy");
// Return full approval details
```

### What the QR Contains (for the scanner)
After verification, the watchman sees:
- Student: Name, Photo, Roll No, Department, Year, Section
- Request: Type, Reason, From Date, To Date
- Approval: Approved By (name + role), Approved At, Valid Until
- Status: VALID ✅ / EXPIRED ⚠️ / INVALID ❌

---

## 15. Authentication & Security Flow

```
User opens app
     ↓
/login → collegeId + password
     ↓
POST /api/auth/login
     ↓
Server verifies credentials → returns { token, user: { role, department, ... } }
     ↓
Frontend stores token in localStorage
     ↓
AuthContext reads role → redirects to correct dashboard
     ↓
All API calls: Authorization: Bearer <token>
     ↓
Logout → clear localStorage → redirect to /login
```

**Role Guards:**
- Every dashboard route is wrapped in a `<RoleRoute allowedRole="..." />` component
- Wrong role → redirect to own dashboard
- No token → redirect to `/login`

---

## 16. UI/UX Design Guidelines

### Color Palette
| Element | Color |
|---------|-------|
| Primary | `#4F46E5` (Indigo) |
| Success / Approved | `#10B981` (Green) |
| Pending / Warning | `#F59E0B` (Amber) |
| Rejected / Danger | `#EF4444` (Red) |
| QR Valid | `#10B981` (Green) |
| QR Expired | `#F59E0B` (Amber) |
| QR Invalid | `#EF4444` (Red) |
| Background | `#F9FAFB` |
| Sidebar bg | `#1E1B4B` (Dark Indigo) |
| Card bg | `#FFFFFF` |
| Text primary | `#111827` |
| Text secondary | `#6B7280` |

### Typography
- **Font:** Inter (Google Fonts)
- Heading: 600 weight | Body: 400 weight | Labels: 500 weight

### Component Patterns
- **Cards:** `border-radius: 12px`, subtle shadow, white bg
- **Buttons:** Rounded, hover scale, loading spinner on submit
- **Sidebar:** Dark bg, active item left accent border
- **Tables:** Striped rows, hover highlight, sticky header
- **Status Badges:** Pill shape, color-coded
- **QR Display Card:** Large QR centred, meta info below, download button
- **Scanner View:** Full-width camera viewport, result overlay card
- **Modals:** Centered, backdrop blur
- **Toasts:** Slide-in from top-right

### Responsive Design
- Mobile: Sidebar collapses to hamburger menu (especially useful for watchman on phone)
- Tablet: Narrow sidebar
- Desktop: Full sidebar + content split

### Dark / Light Mode
- Toggle in header; persisted in localStorage; CSS variables for theming

---

## 17. Key Implementation Notes

1. **Flexible recipients:** On request creation, `recipients[]` is populated from the student's "Send To" selection. The backend resolves "All teachers of my branch" to individual user IDs at creation time.
2. **Any approver can approve:** The approval endpoint checks that the calling user is in `recipients[]` for that request.
3. **First approval generates QR:** As soon as one recipient marks `action = "approved"`, the overall `request.status` becomes `"approved"` and `qrToken` is generated.
4. **Escalation:** When an approver approves + escalates, a new entry is added to `recipients[]` for the escalation target, and the request stays `"approved"` (QR already valid) but the escalatee also receives it in their inbox for awareness/secondary approval.
5. **QR token is a signed JWT** — not just the request ID. The watchman's verify endpoint uses `jwt.verify()` with `QR_SECRET` to ensure it hasn't been forged or tampered with.
6. **QR expiry = leave end date** (toDate). After that date, scanning returns `expired`.
7. **ScanLog** records every scan — valid, expired, or invalid — for audit purposes.
8. **Student can only see teachers/HOD/principal of their own department** in the recipient selector. Backend validates this on submission.
9. **File uploads** use `multipart/form-data` with Multer middleware.
10. **Stats endpoint** returns counts grouped by status for chart rendering.
11. **Always validate** on both frontend (UX) and backend (security).

---

## 18. npm Packages Required

### Backend
```json
"dependencies": {
  "express": "^4.x",
  "mongoose": "^7.x",
  "bcryptjs": "^2.x",
  "jsonwebtoken": "^9.x",
  "dotenv": "^16.x",
  "cors": "^2.x",
  "multer": "^1.x",
  "qrcode": "^1.x",
  "nodemailer": "^6.x"
}
```

### Frontend
```json
"dependencies": {
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "recharts": "^2.x",
  "react-qr-code": "^2.x",
  "html5-qrcode": "^2.x",
  "react-hot-toast": "^2.x"
}
```

---

## 19. What Is Already Built

| Item | Status |
|------|--------|
| Backend Express server | ✅ Done |
| MongoDB connection | ✅ Done |
| User model | ✅ Done |
| Request model (basic) | ✅ Done — needs QR fields + recipients[] added |
| Auth routes (login/register) | ✅ Done |
| Request routes (add/all/update/stats) | ✅ Done — needs approval logic update |
| React + Vite frontend scaffold | ✅ Done |
| AuthContext | ✅ Done |
| App.jsx routing | ✅ Done — needs role guards + new routes |

## 20. What Still Needs To Be Built

| Item | Priority |
|------|----------|
| Update Request model — add `recipients[]`, `qrToken`, `qrValidUntil`, `escalatedTo` | 🔴 High |
| Add `watchman` role to User model | 🔴 High |
| Flexible approval logic in `requestController.js` | 🔴 High |
| QR generation on approval (`utils/generateQR.js`) | 🔴 High |
| QR routes & controller (`qrController.js`, `qrRoutes.js`) | 🔴 High |
| ScanLog model | 🔴 High |
| JWT role-based middleware (role guard) | 🔴 High |
| Student Dashboard — all pages incl. QR display | 🔴 High |
| Teacher Dashboard — inbox with approve/reject/escalate | 🔴 High |
| HOD Dashboard | 🔴 High |
| Principal Dashboard | 🔴 High |
| Watchman Dashboard — QR scanner + scan history | 🔴 High |
| "Send To" multi-select (filter by student's branch) | 🔴 High |
| Attendance model + routes | 🟡 Medium |
| File upload (Multer) | 🟡 Medium |
| Notification system (in-app) | 🟡 Medium |
| QR download as PNG | 🟡 Medium |
| Email notifications | 🟢 Low |
| PDF export of approved request | 🟢 Low |
| Dark mode toggle | 🟢 Low |
| Admin dashboard | 🟢 Low |
| Mobile responsive (hamburger sidebar) | 🟡 Medium |

---

*Last updated: March 2026 — Smart Digital Permission System*
