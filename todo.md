# Smart Digital Permission System — Development Todo

> **Instructions for AI / Developer:**  
> Mark `[ ]` → `[/]` when starting a task, `[x]` when completed.  
> Add new tasks under the relevant section as the project grows.  
> Never delete completed items — keep them for reference.

---

## 🗄️ Backend — Models

- [x] `User.js` — Basic schema (name, email, password, role, department, year, section)
- [x] `User.js` — Add `watchman` to role enum
- [x] `User.js` — Add `phone` and `photo` fields
- [x] `Request.js` — Basic schema (student, requestType, reason, status)
- [x] `Request.js` — Add `recipients[]` array (user, role, action, remarks, actionAt)
- [x] `Request.js` — Add `fromDate`, `toDate`, `document` fields
- [x] `Request.js` — Add `qrToken` and `qrValidUntil` fields
- [x] `Request.js` — Add `escalatedTo`, `escalatedBy` fields
- [x] `Request.js` — Add `approvedAt` field
- [x] `ScanLog.js` — New model (request, student, scannedBy, scannedAt, result, details)

---

## 🔧 Backend — Config & Utils

- [x] `config/db.js` — MongoDB connection (with retry logic & DNS fallback)
- [x] `utils/generateQR.js` — QR token generation using `jsonwebtoken` + `QR_SECRET`
- [ ] `utils/sendEmail.js` — Nodemailer helper for status-change email notifications

---

## 🔒 Backend — Middleware

- [x] `middleware/authMiddleware.js` — JWT verify (basic)
- [x] `middleware/authMiddleware.js` — Role-based guard (`allowRoles("teacher","hod")`)

---

## 🛣️ Backend — Routes & Controllers

### Auth
- [x] `POST /api/auth/register` — Create new user
- [x] `POST /api/auth/login` — Login, return JWT
- [x] `GET /api/auth/profile` — Get logged-in user profile
- [x] `PUT /api/auth/profile` — Update profile (with photo upload)
- [x] `GET /api/auth/recipients` — Get faculty/HOD/principal by department
- [x] `GET /api/auth/users` — Admin: list all users
- [x] `DELETE /api/auth/users/:id` — Admin: delete user

### Requests
- [x] `POST /api/requests/add` — Student submits request (with `recipients[]` multi-select)
- [x] `POST /api/requests/add` — Validate that chosen recipients belong to student's department
- [x] `GET /api/requests/all` — List requests (role-filtered: student sees own, faculty sees inbox)
- [x] `GET /api/requests/:id` — Full detail of one request including approval trail
- [x] `PUT /api/requests/approve/:id` — Flexible approve: update recipient, generate QR, optional escalation
- [x] `PUT /api/requests/reject/:id` — Reject: update recipient action, set overall status
- [x] `GET /api/requests/stats` — Summary stats for dashboard charts (with monthly breakdown)

### QR
- [x] `GET /api/qr/verify/:token` — Verify QR JWT, return full approval details (handles valid/expired/invalid)
- [x] `POST /api/qr/scan-log` — Save scan record to ScanLog
- [x] `GET /api/qr/scan-history` — Return watchman's scan history

---

## 🎨 Frontend — Foundation

- [x] React + Vite project scaffold
- [x] `App.jsx` — Role-based routing with `<RoleRoute />` component
- [x] `App.jsx` — Routes for student, teacher, hod, principal, watchman, admin
- [x] `AuthContext` — Global auth state (login/logout/localStorage)
- [x] `index.css` — Full design system: CSS variables, colors, typography (Inter font)
- [x] `index.css` — Mobile responsive with hamburger menu sidebar
- [x] Reusable patterns: `StatusBadge`, `StatCard`, `DataTable`, `Modal`, inline Sidebar per dashboard
- [x] `services/api.js` — Axios instance with auto JWT, auth/request/QR services

---

## 🎓 Frontend — Student Dashboard

- [x] Dashboard Home — welcome greeting, summary cards, pie chart, recent activity
- [x] My Profile — display + edit mode (name, email, phone) + Save/Cancel
- [x] New Permission Request form
  - [x] Request Type dropdown (Medical/Personal/Event/Campus Exit/Other)
  - [x] From / To date pickers
  - [x] Reason + Description fields
  - [x] Document upload (PDF/image ≤ 5MB)
  - [x] **"Send To" multi-select** — filtered to student's branch (teachers, HOD, principal)
  - [x] Submit button with loading state + success toast
- [x] Request History — table, status filter, "View Details" modal with approval trail
- [x] Accepted Requests — filtered table + **QR Code display card** + QR download as PNG
- [x] Rejected Requests — filtered table, rejection remarks, "Re-Submit" button
- [x] Analytics — pie chart + bar chart (monthly breakdown)
- [x] Notifications — list with status indicators and timestamps
- [ ] Attendance — gauge, calendar view (requires backend Attendance model — 🟡 Medium)

---

## 👨‍🏫 Frontend — Teacher Dashboard

- [x] Dashboard Home — pending/approved/rejected count cards, recent pending list
- [x] Inbox (Pending Requests addressed to this teacher)
  - [x] Table with student info + request details
  - [x] "View Student Profile" action (photo, name, dept, year, section, email, phone)
  - [x] Approve action — modal with remarks + optional escalate to HOD/Principal
  - [x] Reject action — modal with mandatory remarks
- [x] Approved Requests history (with remarks)
- [x] Rejected Requests history (with remarks)
- [x] Analytics — bar chart of actions per month (approved/rejected/escalated)
- [x] Notifications

---

## 🏢 Frontend — HOD Dashboard

- [x] Dashboard Home — pending/approved/rejected cards, recent pending (incl. escalated)
- [x] Inbox — requests addressed to HOD or escalated by teachers
  - [x] Approve with optional escalate to Principal
  - [x] Reject
- [x] Approved / Rejected history
- [x] Department-level analytics (stat cards + bar chart)
- [x] Notifications

---

## 👑 Frontend — Principal Dashboard

- [x] Dashboard Home — total/pending/approved/rejected cards, all-department pending list
- [x] Inbox — requests addressed to Principal or escalated
  - [x] Final approve (no further escalation)
  - [x] Reject
- [x] Approved / Rejected history (college-wide)
- [x] College-wide analytics (monthly volume + department breakdown charts)
- [x] Download reports (CSV)
- [x] Notifications

---

## 🔐 Frontend — Watchman Dashboard

- [x] **Scan QR Page**
  - [x] Camera QR scanner (`html5-qrcode`)
  - [x] Valid result card (student info, request info, approved by, valid until)
  - [x] Expired warning display
  - [x] Invalid/tampered error display
  - [x] "Mark as Scanned" button → POST to scan-log
- [x] **Scan History Page**
  - [x] Table: date/time, student, request type, scan result
  - [x] Filter by date
  - [x] Search by student name or roll number

---

## 🛡️ Frontend — Admin Dashboard

- [x] Dashboard Home — stat cards (total users, students, faculty, requests), role breakdown, system info
- [x] Manage Users — table with search + role filter + delete action
- [x] Settings — department list, role list

---

## 🔑 Frontend — Auth Pages

- [x] Login Page — collegeId + password, loading state, error handling, success toast
- [x] Register Page — all fields, role selector, department, year/section for students
- [x] Redirect logic: after login → go to role-specific dashboard

---

## 📦 npm Packages

### Backend
- [x] `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `cors`
- [x] `multer` — file uploads
- [x] `qrcode` — QR generation (installed, used via JWT-based token)
- [x] `pdfkit` — PDF generation
- [ ] `nodemailer` — email notifications (low priority)

### Frontend
- [x] `react`, `react-router-dom`, `axios`
- [x] `recharts` — charts
- [x] `react-qr-code` — display QR
- [x] `html5-qrcode` — camera scanner
- [x] `react-hot-toast` — toast notifications
- [x] `lucide-react` — icons

---

## 🧪 Testing & QA

- [ ] Test login for each role (student, teacher, hod, principal, watchman, admin)
- [ ] Test request creation with single recipient
- [ ] Test request creation with multiple recipients (broadcast)
- [ ] Test teacher approve → QR generated → student can see QR
- [ ] Test HOD approve for escalated request
- [ ] Test principal final approval
- [ ] Test rejection at each level
- [ ] Test watchman QR scan — valid QR
- [ ] Test watchman QR scan — expired QR
- [ ] Test watchman QR scan — invalid/fake QR
- [ ] Test scan history is saved correctly
- [ ] Test role guards (wrong role cannot access another role's dashboard)
- [ ] Mobile responsiveness test

---

## 🚀 Deployment

- [ ] Configure `backend/.env` for production (MongoDB Atlas URI, strong JWT secrets)
- [ ] Configure `frontend/.env` with production API URL
- [ ] Deploy backend to Render / Railway
- [ ] Deploy frontend to Vercel / Netlify
- [ ] Test all flows end-to-end on production

---

*Last updated: March 2026 — update this file as features are built*
