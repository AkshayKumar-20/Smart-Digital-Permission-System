# Smart Digital Permission System — Development Todo

> **Instructions for AI / Developer:**  
> Mark `[ ]` → `[/]` when starting a task, `[x]` when completed.  
> Add new tasks under the relevant section as the project grows.  
> Never delete completed items — keep them for reference.

---

## 🗄️ Backend — Models

- [x] `User.js` — Basic schema (name, email, password, role, department, year, section)
- [ ] `User.js` — Add `watchman` to role enum
- [ ] `User.js` — Add `phone` and `photo` fields
- [x] `Request.js` — Basic schema (student, requestType, reason, status)
- [ ] `Request.js` — Add `recipients[]` array (user, role, action, remarks, actionAt)
- [ ] `Request.js` — Add `fromDate`, `toDate`, `document` fields
- [ ] `Request.js` — Add `qrToken` and `qrValidUntil` fields
- [ ] `Request.js` — Add `escalatedTo`, `escalatedBy` fields
- [ ] `Request.js` — Add `approvedAt` field
- [ ] `ScanLog.js` — New model (request, student, scannedBy, scannedAt, result, details)

---

## 🔧 Backend — Config & Utils

- [ ] `config/db.js` — MongoDB connection
- [ ] `utils/generateQR.js` — QR token generation using `jsonwebtoken` + `QR_SECRET`
- [ ] `utils/sendEmail.js` — Nodemailer helper for status-change email notifications

---

## 🔒 Backend — Middleware

- [ ] `middleware/authMiddleware.js` — JWT verify (basic)
- [ ] `middleware/authMiddleware.js` — Role-based guard (e.g., `allowRoles("teacher","hod")`)

---

## 🛣️ Backend — Routes & Controllers

### Auth
- [ ] `POST /api/auth/register` — Create new user
- [ ] `POST /api/auth/login` — Login, return JWT

### Requests
- [ ] `POST /api/requests/add` — Student submits request (basic)
- [ ] `POST /api/requests/add` — Update to support `recipients[]` multi-select
- [ ] `POST /api/requests/add` — Validate that chosen recipients belong to student's department
- [ ] `GET /api/requests/all` — List requests (basic)
- [ ] `GET /api/requests/all` — Filter by recipient (for teacher/hod/principal inbox)
- [ ] `GET /api/requests/:id` — Full detail of one request including approval trail
- [ ] `PUT /api/requests/update/:id` — Approve/reject (basic)
- [ ] `PUT /api/requests/approve/:id` — Flexible approve: update recipient action, check if QR should be generated
- [ ] `PUT /api/requests/approve/:id` — Optional escalation: add new entry to recipients[]
- [ ] `PUT /api/requests/reject/:id` — Reject: update recipient action, set overall status to rejected
- [ ] `GET /api/requests/stats` — Summary stats for dashboard charts

### QR
- [ ] `GET /api/qr/verify/:token` — Verify QR JWT, return full approval details
- [ ] `POST /api/qr/scan-log` — Save scan record to ScanLog
- [ ] `GET /api/qr/scan-history` — Return watchman's scan history

---

## 🎨 Frontend — Foundation

- [x] React + Vite project scaffold
- [x] `App.jsx` — Basic routing
- [ ] `App.jsx` — Add role-based route guards (`<RoleRoute />` component)
- [ ] `App.jsx` — Add `/watchman/*` routes
- [x] `AuthContext` — Global auth state
- [ ] `index.css` / `App.css` — Design system: CSS variables, colors, typography (Inter font)
- [ ] Reusable components: `Sidebar`, `TopHeader`, `StatusBadge`, `StatCard`, `DataTable`, `Modal`, `Toast`

---

## 🎓 Frontend — Student Dashboard

- [ ] Dashboard Home — welcome, summary cards, pie chart, bar chart, recent activity
- [ ] My Profile — display + edit mode + photo upload
- [ ] Attendance — gauge, calendar view, leave deduction notice
- [ ] New Permission Request form
  - [ ] Request Type dropdown
  - [ ] From / To date pickers
  - [ ] Reason + Description fields
  - [ ] Document upload (PDF/image)
  - [ ] **"Send To" multi-select** — filtered to student's branch (teachers, HOD, principal)
  - [ ] Submit button with loading state + success toast
- [ ] Request History — table, filters, pagination, "View Details" modal
- [ ] Accepted Requests — filtered table + **QR Code display card** + QR download button
- [ ] Rejected Requests — filtered table, rejection remarks, "Re-Submit" button
- [ ] Analytics — pie, bar, line charts + stat cards
- [ ] Notifications — list, read/unread, mark all read, unread badge

---

## 👨‍🏫 Frontend — Teacher Dashboard

- [ ] Dashboard Home — pending count card, approved today, rejected today, recent list
- [ ] Inbox (Pending Requests addressed to this teacher)
  - [ ] Table with student info + request details
  - [ ] "View Student Profile" action (show photo, attendance, details)
  - [ ] Approve action — modal with remarks + optional escalate selector
  - [ ] Reject action — modal with mandatory remarks
- [ ] Approved Requests history
- [ ] Rejected Requests history
- [ ] Analytics — requests acted on per month, approval rate
- [ ] Notifications

---

## 🏢 Frontend — HOD Dashboard

- [ ] Dashboard Home
- [ ] Inbox — requests addressed to HOD or escalated by teachers
  - [ ] Approve (+ optional escalate to Principal)
  - [ ] Reject
  - [ ] View student profile
- [ ] Approved / Rejected history
- [ ] Department-level analytics
- [ ] Notifications

---

## 👑 Frontend — Principal Dashboard

- [ ] Dashboard Home
- [ ] Inbox — requests addressed to Principal or escalated from HOD/Teacher
  - [ ] Approve (no further escalation)
  - [ ] Reject
  - [ ] View student profile
- [ ] Approved / Rejected history
- [ ] College-wide analytics (all departments)
- [ ] Download reports (CSV / PDF)
- [ ] Notifications

---

## 🔐 Frontend — Watchman Dashboard

- [ ] **Scan QR Page**
  - [ ] Camera QR scanner (`html5-qrcode`)
  - [ ] Valid result card (student info, request info, approved by, valid until)
  - [ ] Expired warning display
  - [ ] Invalid/tampered error display
  - [ ] "Mark as Scanned" button → POST to scan-log
- [ ] **Scan History Page**
  - [ ] Table: date/time, student, request type, approved by, scan result
  - [ ] Filter by date range
  - [ ] Search by student name or roll number
- [ ] Notifications

---

## 🔑 Frontend — Auth Pages

- [x] Login Page — collegeId + password form
- [ ] Login Page — polish UI, error handling, loading state
- [ ] Register Page — all fields, role selector (admin-controlled in production)
- [ ] Redirect logic: after login → go to role-specific dashboard

---

## 📦 npm Packages

### Backend
- [x] `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `cors`
- [ ] `multer` — file uploads
- [ ] `qrcode` — QR generation
- [ ] `nodemailer` — email notifications (low priority)

### Frontend
- [x] `react`, `react-router-dom`, `axios`
- [ ] `recharts` — charts
- [ ] `react-qr-code` — display QR
- [ ] `html5-qrcode` — camera scanner
- [ ] `react-hot-toast` — toast notifications

---

## 🧪 Testing & QA

- [ ] Test login for each role (student, teacher, hod, principal, watchman)
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
