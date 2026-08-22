<<<<<<< feature/hilda-contribution
# ISDP Platform
=======
#  ISDP Platform
>>>>>>> master

## Community Skills Development Platform

---

## Overview

<<<<<<< feature/hilda-contribution
The **ISDP Platform** (Integrated Skills Development Platform) is a full-stack web application that connects people with skills to those who need them.

The platform provides a centralized space where users can:

* Create professional profiles
* Showcase their skills
* Find skilled people
* Find mentors
* Volunteer their time
* Communicate in real-time
* Discover community opportunities

The platform solves the problem of skilled people being difficult to find within communities. Instead of relying on scattered platforms such as Facebook or WhatsApp, users can showcase their skills in one centralized platform and connect with people who need their expertise.

### Project Links

* **Live Demo:** [https://isdp-frontend.vercel.app](https://isdp-frontend.vercel.app/)
* **Backend API:** https://isdp-backend.onrender.com/api
* **GitHub Repository:** https://github.com/pius-kamau/isdp-platform
=======
The **ISDP Platform** (Integrated Skills Development Platform) is a full-stack web application that connects people with skills to those who need them. It provides a centralized space where users can create professional profiles, showcase their skills, find mentors, volunteer their time, and communicate in real-time.

The platform solves the problem of skilled people being hard to find in communities. Instead of posting on scattered platforms like Facebook or WhatsApp, users can now showcase their skills in one place and connect with others who need their expertise.

🔗 **Live Demo:** [https://isdp-frontend.vercel.app](https://isdp-frontend.vercel.app/)
🔗 **Backend API:** [https://isdp-backend.onrender.com/api](https://isdp-backend.onrender.com/api)
🔗 **GitHub:** [https://github.com/pius-kamau/isdp-platform](https://github.com/pius-kamau/isdp-platform)
>>>>>>> master

---

## Table of Contents

1. [Overview](#overview)
2. [Team Contributors](#team-contributors)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [Environment Variables](#environment-variables)
8. [Deployment Guide](#deployment-guide)
9. [API Documentation](#api-documentation)
10. [Security Features](#security-features)
11. [Challenges Faced and Solutions](#challenges-faced-and-solutions)
12. [Future Improvements](#future-improvements)
13. [Acknowledgments](#acknowledgments)
14. [Contact](#contact)
15. [License](#license)

<<<<<<< feature/hilda-contribution
---

# Team Contributors

| Name           | Role               | What They Did                                                                                      |
| -------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| **Pius Kamau** | Lead Developer     | Built the backend, database, APIs, authentication, [Socket.IO](https://socket.io/), and deployment |
| **Judy**       | Frontend Developer | Designed and built the login, registration, sidebar, navigation, and responsive UI                 |
| **Edwin**      | Frontend Developer | Built the search module, skill filters, location search, and discovery features                    |
| **Emma**       | Frontend Developer | Built user profiles, skills management, portfolio section, and photo upload                        |
| **Alice**      | Frontend Developer | Built the admin dashboard, statistics, charts, and user management                                 |
| **Hilda**      | Frontend Developer | Built the chat interface, real-time messaging, notifications, and read receipts                    |
| **Nancy**      | Frontend Developer | Built mentorship requests, volunteer opportunities, and community features                         |

---

# Features

## Authentication & Security

* **User Registration** — Sign up with email, password, and phone number.
* **Email Verification** — Verify the user's email address before accessing the platform.
* **Secure Login** — JWT-based authentication with refresh tokens.
* **Password Reset** — Forgot-password flow with an email reset link.
* **Protected Routes** — Restrict access to authenticated users.
* **Role-Based Access** — Different permissions for administrators and regular users.

---

## User Profiles

* **Profile Creation** — Add name, biography, occupation, and location.
* **Skills Management** — Add and remove skills with proficiency levels.
* **Experience** — Add work experience, company, and years of experience.
* **Qualifications** — Add certificates and upload supporting documents.
* **Profile Photo** — Upload and update a profile picture.
* **Portfolio** — Showcase personal work and projects.

---

## Search & Discovery

* **Search Users** — Find people by name, skill, or occupation.
* **Skill Filters** — Filter users based on specific skills.
* **Category Filters** — Filter skills by category.
* **Location Search** — Find skilled people by county.
* **Search Suggestions** — Get suggestions while typing.

---

## Mentorship

* **Request Mentorship** — Send mentorship requests to skilled users.
* **Accept or Decline Requests** — Mentors can accept or reject mentorship requests.
* **Session Scheduling** — Schedule mentorship sessions with specific dates and times.
* **Session Types** — Support video, phone, and in-person sessions.
* **Session Management** — View upcoming and previous mentorship sessions.
* **Mentor Status** — Users can indicate whether they are available to mentor others.

---

## Real-Time Messaging

* **Instant Chat** — Messages are delivered in real-time without refreshing the page.
* **Conversation List** — View conversations with the latest message preview.
* **Online Status** — See when another user is online.
* **Typing Indicator** — See when another user is typing.
* **Read Receipts** — Know when a message has been read.
* **Message History** — View complete conversation history.
* **Date Separation** — Messages are grouped by date.
* **Clear Chat** — Remove a conversation from the user's side.

---

## Admin Dashboard

* **User Management** — View, activate, and deactivate users.
* **Role Management** — Assign administrative or mentor-related roles.
* **Statistics** — View platform statistics such as users, mentors, skills, and activities.
* **Charts** — Display platform information visually.
* **Activity Monitoring** — Monitor recent user activity.

---

## Community Features

* **Volunteer Opportunities** — Find and post volunteer opportunities.
* **Community Events** — View and join community events.
* **Feedback System** — Submit feedback and report issues.
* **Help Center** — Access frequently asked questions and support resources.

---

## Responsive Design

* **Mobile Friendly** — Fully responsive on phones and tablets.
* **Sidebar Navigation** — Easy navigation on desktop devices.
* **Bottom Navigation** — Convenient navigation on mobile devices.
* **Touch Friendly** — Buttons, forms, and inputs are optimized for touch interaction.

---

# Technology Stack

## Frontend

| Technology                             | Version | Purpose                                |
| -------------------------------------- | ------- | -------------------------------------- |
| React                                  | 18.x    | UI library for building components     |
| Vite                                   | 4.x     | Fast build tool and development server |
| Tailwind CSS                           | 3.x     | Utility-first CSS framework            |
| React Router                           | 6.x     | Client-side routing                    |
| [Socket.IO Client](https://socket.io/) | 4.x     | Real-time WebSocket communication      |
| React Hot Toast                        | 2.x     | Toast notifications                    |
| Lucide React                           | Latest  | Icon library                           |

---

## Backend

| Technology                      | Version | Purpose                                           |
| ------------------------------- | ------- | ------------------------------------------------- |
| Node.js                         | 18.x    | JavaScript runtime                                |
| Express                         | 4.x     | Web framework                                     |
| PostgreSQL                      | 15.x    | Relational database                               |
| Prisma                          | 5.x     | Database ORM and migrations                       |
| JWT                             | 9.x     | Authentication tokens                             |
| [Socket.IO](https://socket.io/) | 4.x     | Real-time WebSocket server                        |
| bcryptjs                        | 2.x     | Password hashing                                  |
| Brevo                           | Latest  | Email sending for verification and password reset |
| Multer                          | Latest  | File upload handling                              |
| CORS                            | 2.x     | Cross-origin resource sharing                     |

---

## Deployment

| Platform          | Purpose                             |
| ----------------- | ----------------------------------- |
| Vercel            | Frontend hosting with automatic SSL |
| Render            | Backend hosting with health checks  |
| Render PostgreSQL | Production database                 |

---

## Development Tools

| Tool    | Purpose            |
| ------- | ------------------ |
| Git     | Version control    |
| GitHub  | Repository hosting |
| Postman | API testing        |
| VS Code | Code editor        |
| npm     | Package manager    |

---

# Project Structure

```text
=======
## Team Contributors

| **Name** | **Role** | **What They Did** |                                                                                                    |
| ------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| **Pius Kamau**            | Lead Developer     | Built the backend, database, APIs, authentication, [Socket.IO](https://socket.io/), and deployment |
| **Judy**                  | Frontend Developer | Designed and built the login, register, sidebar, navigation, and responsive UI                     |
| **Edwin**                 | Frontend Developer | Built the search module, skill filters, location search, and discovery features                    |
| **Emma**                  | Frontend Developer | Built user profiles, skills management, portfolio section, and photo upload                        |
| **Alice**                 | Frontend Developer | Built the admin dashboard, statistics, charts, and user management                                 |
| **Hilda**                 | Frontend Developer | Built the chat interface, real-time messaging, notifications, and read receipts                    |
| **Nancy**                 | Frontend Developer | Built mentorship requests, volunteer opportunities, and community features                         |

---

## Features

### Authentication & Security

- **User Registration** — Sign up with email, password, and phone number
- **Email Verification** — Verify email address before logging in
- **Secure Login** — JWT-based authentication with refresh tokens
- **Password Reset** — Forgot password flow with email reset link
- **Protected Routes** — Only logged-in users can access certain pages
- **Role-Based Access** — Admin and regular user roles

### User Profiles

- **Profile Creation** — Add name, bio, occupation, and location
- **Skills Management** — Add and remove skills with proficiency levels
- **Experience** — Add work experience with company and years
- **Qualifications** — Add certificates and upload supporting files
- **Profile Photo** — Upload and update profile picture
- **Portfolio** — Showcase your work and projects

### Search & Discovery

- **Search Users** — Find people by name, skill, or occupation
- **Skill Filters** — Filter search results by specific skills
- **Category Filters** — Filter by skill categories
- **Location Search** — Find people near you by county
- **Search Suggestions** — Auto-suggest as you type

### Mentorship

- **Request Mentorship** — Send a mentorship request to a skilled user
- **Accept/Decline** — Mentors can accept or decline requests
- **Session Scheduling** — Schedule mentorship sessions with date and time
- **Session Types** — Video, phone, or in-person sessions
- **Session Management** — View upcoming and past sessions
- **Mentor Status** — Users can mark themselves as available mentors

### Real-Time Messaging

- **Instant Chat** — Messages appear in real-time without page refresh
- **Conversation List** — View all your chats with last message preview
- **Online Status** — See who is currently online with a green dot
- **Typing Indicator** — See when the other person is typing
- **Read Receipts** — Know when your message has been read (✓✓)
- **Message History** — Full chat history with date separation
- **Clear Chat** — Delete conversation from your side only

### Admin Dashboard

- **User Management** — View, activate, deactivate users
- **Role Management** — Assign admin or mentor roles
- **Statistics** — View total users, mentors, skills, and activities
- **Charts** — Visual representation of platform data
- **Activity Monitoring** — See recent user activity

### Community Features

- **Volunteer Opportunities** — Find and post volunteer opportunities
- **Community Events** — View and join community events
- **Feedback System** — Submit feedback and report issues
- **Help Center** — FAQs and support resources

### Responsive Design

- **Mobile Friendly** — Full functionality on phones and tablets
- **Sidebar Navigation** — Clean sidebar on desktop
- **Bottom Navigation** — Easy access on mobile
- **Touch Friendly** — Buttons and inputs optimized for touch

---

## Technology Stack

### Frontend

| **Technology** | **Version** | **Purpose** |                                    |
| -------------------------------------- | ------ | ---------------------------------- |
| React                                  | 18.x   | UI library for building components |
| Vite                                   | 4.x    | Fast build tool and dev server     |
| Tailwind CSS                           | 3.x    | Utility-first CSS framework        |
| React Router                           | 6.x    | Client-side routing                |
| [Socket.IO](https://socket.io/) Client | 4.x    | Real-time WebSocket communication  |
| React Hot Toast                        | 2.x    | Toast notifications                |
| Lucide React                           | Latest | Icon library                       |

### Backend

| **Technology** | **Version** | **Purpose** |                                     |
| ------------------------------- | ------ | ----------------------------------- |
| Node.js                         | 18.x   | JavaScript runtime                  |
| Express                         | 4.x    | Web framework                       |
| PostgreSQL                      | 15.x   | Relational database                 |
| Prisma                          | 5.x    | Database ORM and migrations         |
| JWT                             | 9.x    | Authentication tokens               |
| [Socket.IO](https://socket.io/) | 4.x    | Real-time WebSocket server          |
| bcryptjs                        | 2.x    | Password hashing                    |
| Brevo                           | Latest | Email sending (verification, reset) |
| Multer                          | Latest | File uploads                        |
| CORS                            | 2.x    | Cross-origin resource sharing       |

### Deployment

| **Platform** | **Purpose** |
| ------------------- | ----------------------------------- |
| Vercel              | Frontend hosting with automatic SSL |
| Render              | Backend hosting with health checks  |
| Render PostgreSQL   | Production database                 |

### Development Tools

| **Tool** | **Purpose** |
| --------------- | ------------------ |
| Git             | Version control    |
| GitHub          | Repository hosting |
| Postman         | API testing        |
| VS Code         | Code editor        |
| npm             | Package manager    |

---

## Project Structure


```
>>>>>>> master
isdp-platform/
├── backend/
│   ├── src/
│   │   ├── config/
<<<<<<< feature/hilda-contribution
│   │   │   ├── database.js
│   │   │   ├── mail.js
│   │   │   └── socket.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── message.controller.js
│   │   │   ├── mentorship.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   ├── upload.js
│   │   │   └── validation.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── message.routes.js
│   │   │   └── mentorship.routes.js
│   │   │
│   │   ├── utils/
│   │   │   ├── errors.js
│   │   │   └── helpers.js
│   │   │
│   │   └── server.js
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── common/
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
=======
│   │   │   ├── database.js        # Database connection
│   │   │   ├── mail.js            # Email configuration
│   │   │   └── socket.js          # Socket.IO configuration
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # Authentication logic
│   │   │   ├── user.controller.js     # User management
│   │   │   ├── message.controller.js  # Messaging logic
│   │   │   ├── mentorship.controller.js # Mentorship logic
│   │   │   └── admin.controller.js    # Admin functions
│   │   ├── middlewares/
│   │   │   ├── auth.js             # JWT verification
│   │   │   ├── upload.js           # File upload handling
│   │   │   └── validation.js       # Request validation
│   │   ├── routes/
│   │   │   ├── auth.routes.js      # Auth endpoints
│   │   │   ├── user.routes.js      # User endpoints
│   │   │   ├── message.routes.js   # Message endpoints
│   │   │   └── mentorship.routes.js # Mentorship endpoints
│   │   ├── utils/
│   │   │   ├── errors.js           # Error handling
│   │   │   └── helpers.js          # Helper functions
│   │   └── server.js               # Entry point
│   ├── prisma/
│   │   └── schema.prisma           # Database schema
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   ├── BottomNav.jsx      # Mobile bottom navigation
│   │   │   └── common/             # Reusable components
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   ├── SocketContext.jsx   # WebSocket state
│   │   │   └── ThemeContext.jsx    # Dark/light mode
>>>>>>> master
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ResetPassword.jsx
<<<<<<< feature/hilda-contribution
│   │   │   │
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Mentorship.jsx
│   │   │   ├── Discover.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── AdminDashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── data/
│   │   │   └── counties.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   └── package.json
│
=======
│   │   │   ├── Home.jsx           # Dashboard
│   │   │   ├── Profile.jsx        # User profile
│   │   │   ├── Messages.jsx       # Chat
│   │   │   ├── Mentorship.jsx     # Mentorship
│   │   │   ├── Discover.jsx       # Search
│   │   │   ├── Settings.jsx       # User settings
│   │   │   └── AdminDashboard.jsx # Admin panel
│   │   ├── services/
│   │   │   └── api.js             # API service functions
│   │   ├── data/
│   │   │   └── counties.js        # Kenya counties data
│   │   ├── App.jsx                # Main app
│   │   └── main.jsx               # Entry point
│   ├── .env.example
│   └── package.json
>>>>>>> master
└── README.md
```

---

<<<<<<< feature/hilda-contribution
# Database Schema

## User

| Field                    | Type          | Description                                    |
| ------------------------ | ------------- | ---------------------------------------------- |
| `id`                     | String (UUID) | Primary key                                    |
| `email`                  | String        | Unique email used for login                    |
| `passwordHash`           | String        | Hashed password                                |
| `fullName`               | String        | User's full name                               |
| `phone`                  | String        | Unique phone number                            |
| `profilePhoto`           | String        | URL to profile photo                           |
| `bio`                    | String        | User biography                                 |
| `occupation`             | String        | Current occupation                             |
| `county`                 | String        | Location county                                |
| `subCounty`              | String        | Location sub-county                            |
| `role`                   | Enum          | `admin` / `user`                               |
| `isMentor`               | Boolean       | Whether the user is available as a mentor      |
| `isVolunteer`            | Boolean       | Whether the user is available for volunteering |
| `isActive`               | Boolean       | Account status                                 |
| `emailVerified`          | Boolean       | Whether the email has been verified            |
| `emailVerificationToken` | String        | Email verification token                       |
| `resetPasswordToken`     | String        | Password reset token                           |
| `resetPasswordExpires`   | DateTime      | Reset token expiry                             |
| `lastLogin`              | DateTime      | Last login time                                |
| `loginCount`             | Int           | Number of logins                               |
| `createdAt`              | DateTime      | Account creation date                          |
| `updatedAt`              | DateTime      | Last update date                               |

---

## Skill

| Field       | Type          | Description                 |
| ----------- | ------------- | --------------------------- |
| `id`        | String (UUID) | Primary key                 |
| `name`      | String        | Skill name                  |
| `category`  | String        | Skill category              |
| `isActive`  | Boolean       | Whether the skill is active |
| `createdAt` | DateTime      | Creation date               |

---

## UserSkill

The `UserSkill` table connects users with their skills.

| Field                | Type          | Description                              |
| -------------------- | ------------- | ---------------------------------------- |
| `id`                 | String (UUID) | Primary key                              |
| `userId`             | String        | Foreign key referencing `User`           |
| `skillId`            | String        | Foreign key referencing `Skill`          |
| `proficiencyLevel`   | Enum          | `beginner` / `intermediate` / `advanced` |
| `yearsExperience`    | Int           | Number of years of experience            |
| `isMentor`           | Boolean       | Whether the user mentors this skill      |
| `isVolunteer`        | Boolean       | Whether the user volunteers this skill   |
| `verificationStatus` | Enum          | `pending` / `verified` / `rejected`      |

---

## Message

| Field           | Type          | Description                       |
| --------------- | ------------- | --------------------------------- |
| `id`            | String (UUID) | Primary key                       |
| `senderId`      | String        | Foreign key referencing `User`    |
| `receiverId`    | String        | Foreign key referencing `User`    |
| `messageText`   | String        | Message content                   |
| `attachmentUrl` | String        | URL to attachment                 |
| `isRead`        | Boolean       | Whether the message has been read |
| `readAt`        | DateTime      | Time the message was read         |
| `createdAt`     | DateTime      | Message creation time             |

---

## MentorshipRequest

| Field         | Type          | Description                                       |
| ------------- | ------------- | ------------------------------------------------- |
| `id`          | String (UUID) | Primary key                                       |
| `mentorId`    | String        | Foreign key referencing the mentor                |
| `menteeId`    | String        | Foreign key referencing the mentee                |
| `skillIds`    | String[]      | Skills requested for mentorship                   |
| `message`     | String        | Mentorship request message                        |
| `status`      | Enum          | `pending` / `accepted` / `rejected` / `completed` |
| `requestedAt` | DateTime      | Time the request was submitted                    |
| `createdAt`   | DateTime      | Creation date                                     |

---

## MentorshipSession

| Field         | Type          | Description                                 |
| ------------- | ------------- | ------------------------------------------- |
| `id`          | String (UUID) | Primary key                                 |
| `requestId`   | String        | Foreign key referencing `MentorshipRequest` |
| `mentorId`    | String        | Foreign key referencing the mentor          |
| `menteeId`    | String        | Foreign key referencing the mentee          |
| `scheduledAt` | DateTime      | Scheduled session time                      |
| `duration`    | Int           | Session duration in minutes                 |
| `type`        | Enum          | `video` / `phone` / `in-person`             |
| `notes`       | String        | Session notes                               |
| `status`      | Enum          | `scheduled` / `completed` / `cancelled`     |
| `createdAt`   | DateTime      | Creation date                               |

---

## Experience

| Field       | Type          | Description                    |
| ----------- | ------------- | ------------------------------ |
| `id`        | String (UUID) | Primary key                    |
| `userId`    | String        | Foreign key referencing `User` |
| `title`     | String        | Job title                      |
| `company`   | String        | Company name                   |
| `years`     | String        | Years of experience            |
| `createdAt` | DateTime      | Creation date                  |

---

## Qualification

| Field       | Type          | Description                    |
| ----------- | ------------- | ------------------------------ |
| `id`        | String (UUID) | Primary key                    |
| `userId`    | String        | Foreign key referencing `User` |
| `name`      | String        | Qualification name             |
| `issuer`    | String        | Issuing institution            |
| `year`      | String        | Year obtained                  |
| `fileUrl`   | String        | Certificate file URL           |
| `createdAt` | DateTime      | Creation date                  |

---

## Volunteering

| Field          | Type          | Description                    |
| -------------- | ------------- | ------------------------------ |
| `id`           | String (UUID) | Primary key                    |
| `userId`       | String        | Foreign key referencing `User` |
| `title`        | String        | Volunteer role                 |
| `organization` | String        | Organization name              |
| `hours`        | String        | Number of volunteer hours      |
| `createdAt`    | DateTime      | Creation date                  |

---

## Availability

| Field       | Type          | Description                    |
| ----------- | ------------- | ------------------------------ |
| `id`        | String (UUID) | Primary key                    |
| `userId`    | String        | Foreign key referencing `User` |
| `day`       | String        | Day of the week                |
| `start`     | String        | Start time                     |
| `end`       | String        | End time                       |
| `createdAt` | DateTime      | Creation date                  |

---

# Environment Variables

## Backend

Create a `.env` file inside the `backend` directory:

```env
=======
## Database Schema

### User

| **Field** | **Type** | **Description** |               |                        |
| ------------------------ | ------------- | ---------------------- |
| id                       | String (UUID) | Primary key            |
| email                    | String        | Unique email (login)   |
| passwordHash             | String        | Hashed password        |
| fullName                 | String        | User's full name       |
| phone                    | String        | Unique phone number    |
| profilePhoto             | String        | URL to profile photo   |
| bio                      | String        | User biography         |
| occupation               | String        | Current occupation     |
| county                   | String        | Location county        |
| subCounty                | String        | Location sub-county    |
| role                     | Enum          | admin / user           |
| isMentor                 | Boolean       | Available as mentor    |
| isVolunteer              | Boolean       | Available to volunteer |
| isActive                 | Boolean       | Account status         |
| emailVerified            | Boolean       | Email verified         |
| emailVerificationToken   | String        | Verification token     |
| resetPasswordToken       | String        | Reset token            |
| resetPasswordExpires     | DateTime      | Token expiry           |
| lastLogin                | DateTime      | Last login time        |
| loginCount               | Int           | Number of logins       |
| createdAt                | DateTime      | Account creation       |
| updatedAt                | DateTime      | Last update            |

### Skill

| **Field** | **Type** | **Description** |               |                |
| ------------------------ | ------------- | -------------- |
| id                       | String (UUID) | Primary key    |
| name                     | String        | Skill name     |
| category                 | String        | Skill category |
| isActive                 | Boolean       | Active status  |
| createdAt                | DateTime      | Creation date  |

### UserSkill (Join Table)

| **Field** | **Type** | **Description** |               |                                    |
| ------------------------ | ------------- | ---------------------------------- |
| id                       | String (UUID) | Primary key                        |
| userId                   | String        | Foreign key to User                |
| skillId                  | String        | Foreign key to Skill               |
| proficiencyLevel         | Enum          | beginner / intermediate / advanced |
| yearsExperience          | Int           | Years of experience                |
| isMentor                 | Boolean       | Mentor for this skill              |
| isVolunteer              | Boolean       | Volunteer for this skill           |
| verificationStatus       | Enum          | pending / verified / rejected      |

### Message

| **Field** | **Type** | **Description** |               |                     |
| ------------------------ | ------------- | ------------------- |
| id                       | String (UUID) | Primary key         |
| senderId                 | String        | Foreign key to User |
| receiverId               | String        | Foreign key to User |
| messageText              | String        | Message content     |
| attachmentUrl            | String        | URL to attachment   |
| isRead                   | Boolean       | Read status         |
| readAt                   | DateTime      | Read time           |
| createdAt                | DateTime      | Creation date       |

### MentorshipRequest

| **Field** | **Type** | **Description** |               |                                           |
| ------------------------ | ------------- | ----------------------------------------- |
| id                       | String (UUID) | Primary key                               |
| mentorId                 | String        | Foreign key to User                       |
| menteeId                 | String        | Foreign key to User                       |
| skillIds                 | String[]      | Skills requested                          |
| message                  | String        | Request message                           |
| status                   | Enum          | pending / accepted / rejected / completed |
| requestedAt              | DateTime      | Request time                              |
| createdAt                | DateTime      | Creation date                             |

### MentorshipSession

| **Field** | **Type** | **Description** |               |                                   |
| ------------------------ | ------------- | --------------------------------- |
| id                       | String (UUID) | Primary key                       |
| requestId                | String        | Foreign key to MentorshipRequest  |
| mentorId                 | String        | Foreign key to User               |
| menteeId                 | String        | Foreign key to User               |
| scheduledAt              | DateTime      | Scheduled time                    |
| duration                 | Int           | Duration in minutes               |
| type                     | Enum          | video / phone / in-person         |
| notes                    | String        | Session notes                     |
| status                   | Enum          | scheduled / completed / cancelled |
| createdAt                | DateTime      | Creation date                     |

### Experience

| **Field** | **Type** | **Description** |               |                     |
| ------------------------ | ------------- | ------------------- |
| id                       | String (UUID) | Primary key         |
| userId                   | String        | Foreign key to User |
| title                    | String        | Job title           |
| company                  | String        | Company name        |
| years                    | String        | Years of experience |
| createdAt                | DateTime      | Creation date       |

### Qualification

| **Field** | **Type** | **Description** |               |                      |
| ------------------------ | ------------- | -------------------- |
| id                       | String (UUID) | Primary key          |
| userId                   | String        | Foreign key to User  |
| name                     | String        | Qualification name   |
| issuer                   | String        | Issuing institution  |
| year                     | String        | Year obtained        |
| fileUrl                  | String        | Certificate file URL |
| createdAt                | DateTime      | Creation date        |

### Volunteering

| **Field** | **Type** | **Description** |               |                     |
| ------------------------ | ------------- | ------------------- |
| id                       | String (UUID) | Primary key         |
| userId                   | String        | Foreign key to User |
| title                    | String        | Volunteer role      |
| organization             | String        | Organization name   |
| hours                    | String        | Hours volunteered   |
| createdAt                | DateTime      | Creation date       |

### Availability

| **Field** | **Type** | **Description** |               |                     |
| ------------------------ | ------------- | ------------------- |
| id                       | String (UUID) | Primary key         |
| userId                   | String        | Foreign key to User |
| day                      | String        | Day of week         |
| start                    | String        | Start time          |
| end                      | String        | End time            |
| createdAt                | DateTime      | Creation date       |

---

## Environment Variables

### Backend (.env)


```
>>>>>>> master
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/isdp

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

<<<<<<< feature/hilda-contribution
# Email - Brevo
=======
# Email (Brevo)
>>>>>>> master
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=ISDP Platform

# Client URL
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

<<<<<<< feature/hilda-contribution
---

## Frontend

Create a `.env` file inside the `frontend` directory:

```env
=======
### Frontend (.env)


```
>>>>>>> master
VITE_API_URL=https://isdp-backend.onrender.com/api
VITE_SOCKET_URL=https://isdp-backend.onrender.com
```

---

<<<<<<< feature/hilda-contribution
# Deployment Guide

## Deploy Backend to Render

1. Create a Render account at [render.com](https://render.com/).
2. Click **New Web Service**.
3. Connect your GitHub repository.
4. Configure the service:

| Setting       | Value          |
| ------------- | -------------- |
| Name          | `isdp-backend` |
| Branch        | `master`       |
| Build Command | `npm install`  |
| Start Command | `npm start`    |

5. Add the required environment variables.
6. Configure the production database.
7. Deploy the service.
8. Verify that the backend health endpoint and API are working correctly.

---

## Deploy Frontend to Vercel

1. Create a Vercel account at [vercel.com](https://vercel.com/).
2. Click **Add New Project**.
3. Import the GitHub repository.
4. Configure the project:

| Setting          | Value           |
| ---------------- | --------------- |
| Framework Preset | `Vite`          |
| Root Directory   | `frontend`      |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |

5. Add the required frontend environment variables.
6. Deploy the application.
7. Verify that the frontend can communicate with the backend API.

---

# API Documentation

## Authentication Routes

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `POST` | `/api/auth/register`        | Register a new user            |
| `POST` | `/api/auth/login`           | Login user                     |
| `GET`  | `/api/auth/me`              | Get current authenticated user |
| `POST` | `/api/auth/forgot-password` | Request password reset         |
| `POST` | `/api/auth/reset-password`  | Reset password                 |
| `POST` | `/api/auth/refresh-token`   | Refresh JWT token              |
| `POST` | `/api/auth/logout`          | Logout user                    |
| `GET`  | `/api/auth/verify-email`    | Verify email address           |

---

## User Routes

| Method   | Endpoint            | Description    |
| -------- | ------------------- | -------------- |
| `GET`    | `/api/users`        | Get all users  |
| `GET`    | `/api/users/:id`    | Get user by ID |
| `PUT`    | `/api/users/:id`    | Update user    |
| `DELETE` | `/api/users/:id`    | Delete user    |
| `GET`    | `/api/users/search` | Search users   |

---

## Message Routes

| Method   | Endpoint                      | Description              |
| -------- | ----------------------------- | ------------------------ |
| `GET`    | `/api/messages/conversations` | Get all conversations    |
| `GET`    | `/api/messages/:userId`       | Get messages with a user |
| `POST`   | `/api/messages`               | Send a message           |
| `DELETE` | `/api/messages/clear/:userId` | Clear a conversation     |

---

## Mentorship Routes

| Method | Endpoint                       | Description               |
| ------ | ------------------------------ | ------------------------- |
| `GET`  | `/api/mentorship/requests`     | Get mentorship requests   |
| `POST` | `/api/mentorship/requests`     | Create mentorship request |
| `PUT`  | `/api/mentorship/requests/:id` | Update mentorship request |
| `GET`  | `/api/mentorship/sessions`     | Get mentorship sessions   |
| `POST` | `/api/mentorship/sessions`     | Create mentorship session |
| `PUT`  | `/api/mentorship/sessions/:id` | Update mentorship session |

---

## Admin Routes

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| `GET`  | `/api/admin/users`     | Get all users           |
| `PUT`  | `/api/admin/users/:id` | Update user             |
| `GET`  | `/api/admin/stats`     | Get platform statistics |

> **Note:** Admin routes require appropriate administrative permissions.

---

# Security Features

The platform implements several security mechanisms to protect users, authentication credentials, APIs, and application resources.

### JWT Authentication

Uses JSON Web Tokens for secure authentication and session management.

### Password Hashing

Passwords are hashed using **bcryptjs** before being stored in the database.

### Email Verification

Users are required to verify their email addresses through an email verification process.

### Role-Based Access Control

Different permissions are applied depending on the user's role.

### Rate Limiting

Rate limiting helps prevent brute-force attacks and excessive API requests.

### CORS Protection

Cross-Origin Resource Sharing is configured to restrict unauthorized origins.

### Input Validation

Incoming user data is validated before being processed by the application.

### SQL Injection Protection

Prisma ORM provides parameterized database queries and helps protect against SQL injection.

### XSS Protection

User-generated content is handled carefully to reduce the risk of Cross-Site Scripting attacks.

---

# Challenges Faced and Solutions

## Challenge 1: Real-Time Messaging

### Problem

Messages were not appearing immediately without refreshing the page.

### Solution

Implemented [Socket.IO](https://socket.io/) to provide real-time bidirectional communication between the frontend and backend.

Messages can now be delivered instantly without requiring users to refresh the page.

---

## Challenge 2: Authentication

### Problem

The application needed a secure way to protect routes and manage authenticated user sessions.

### Solution

Implemented JWT-based authentication, authentication middleware, protected routes, and React authentication context.

---

## Challenge 3: Database Relationships

### Problem

The platform required complex relationships between users, skills, messages, mentorship requests, and other entities.

### Solution

Used **PostgreSQL** together with **Prisma ORM** to define structured database models and relationships using foreign keys and join tables.

---

## Challenge 4: File Uploads

### Problem

Users needed to upload profile photos and qualification documents.

### Solution

Implemented **Multer** for handling multipart file uploads and storing uploaded file references.

---

## Challenge 5: Deployment

### Problem

Development and production environments required different configurations, URLs, credentials, and database connections.

### Solution

Used `.env` environment variables during development and configured production environment variables through the hosting platforms.

---

# Future Improvements

The platform can be expanded with additional features in future versions.

## Mobile Application

Develop a dedicated mobile application for Android and iOS.

## Video Calls

Integrate WebRTC to allow mentors and mentees to conduct video mentorship sessions directly through the platform.

## AI Recommendations

Use machine learning and recommendation algorithms to match users with relevant skills, mentors, and opportunities.

## Push Notifications

Implement browser and mobile push notifications for messages, mentorship requests, sessions, and community activities.

## Payment Integration

Introduce secure payment processing for paid mentorship sessions and professional services.

## Advanced Search

Implement full-text and advanced search capabilities using technologies such as Elasticsearch.

## Live Streaming

Allow mentors and organizations to conduct live workshops, training sessions, and community events.

## Social Features

Introduce features such as:

* Following users
* Liking content
* Sharing projects
* Skill endorsements
* Community posts
* Comments

---

# Acknowledgments

This project was built as part of the **IYF Weekend Academy — Season 11** program.

### Special Thanks

* Our instructors for their guidance and support.
* All team members for their dedication and hard work.
* The open-source community for the libraries and technologies used in the project.

---

# Contact

**Project Lead:** Pius Kamau

**Email:** [pitechtechnologies@gmail.com](mailto:pitechtechnologies@gmail.com)

**GitHub:** [github.com/pius-kamau](https://github.com/pius-kamau)

**Location:** Nairobi, Kenya

---

# License

This project is developed for **educational purposes**.

---

 
 # #   C o n t r i b u t o r s 
 
 -   H i l d a 
 
 
=======
## Deployment Guide

### Deploy Backend to Render

1. **Create a Render account** at [render.com](https://render.com/)
2. **Click "New Web Service"**
3. **Connect your GitHub repository**
4. **Configure:**
   - Name: `isdp-backend`
   - Branch: `master`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables** (from .env)
6. **Click "Deploy"**

### Deploy Frontend to Vercel

1. **Create a Vercel account** at [vercel.com](https://vercel.com/)
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Add Environment Variables** (from .env)
6. **Click "Deploy"**

---

## API Documentation

### Auth Routes


```
POST /api/auth/register - Register a new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password - Reset password
POST /api/auth/refresh-token - Refresh JWT token
POST /api/auth/logout - Logout user
GET /api/auth/verify-email - Verify email
```

### User Routes


```
GET /api/users - Get all users
GET /api/users/:id - Get user by ID
PUT /api/users/:id - Update user
DELETE /api/users/:id - Delete user
GET /api/users/search - Search users
```

### Message Routes


```
GET /api/messages/conversations - Get all conversations
GET /api/messages/:userId - Get messages with user
POST /api/messages - Send a message
DELETE /api/messages/clear/:userId - Clear chat
```

### Mentorship Routes


```
GET /api/mentorship/requests - Get mentorship requests
POST /api/mentorship/requests - Create mentorship request
PUT /api/mentorship/requests/:id - Update request
GET /api/mentorship/sessions - Get sessions
POST /api/mentorship/sessions - Create session
PUT /api/mentorship/sessions/:id - Update session
```

### Admin Routes


```
GET /api/admin/users - Get all users (admin)
PUT /api/admin/users/:id - Update user (admin)
GET /api/admin/stats - Get platform statistics
```

---

## Security Features

- **JWT Authentication** — Secure token-based authentication
- **Password Hashing** — bcrypt for secure password storage
- **Email Verification** — Verify user email before full access
- **Role-Based Access Control** — Admin vs regular user permissions
- **Rate Limiting** — Prevent brute force attacks
- **CORS Protection** — Only allow trusted origins
- **Input Validation** — Validate all user inputs
- **SQL Injection Protection** — Prisma ORM prevents SQL injection
- **XSS Protection** — Escape user input in responses

---

## Challenges Faced and Solutions

### Challenge 1: Real-time Messaging

**Problem:** Messages weren't appearing without refreshing the page.

**Solution:** Implemented [Socket.IO](https://socket.io/) for real-time WebSocket communication. Messages are now delivered instantly.

### Challenge 2: Authentication

**Problem:** Protecting routes and managing user sessions.

**Solution:** JWT tokens stored in localStorage, middleware to verify tokens, and React context for auth state.

### Challenge 3: Database Relationships

**Problem:** Modeling complex relationships (users ↔ skills ↔ messages).

**Solution:** Used PostgreSQL with Prisma ORM and proper foreign key relationships.

### Challenge 4: File Uploads

**Problem:** Uploading profile photos and certificates.

**Solution:** Used Multer for file handling and stored files on the server.

### Challenge 5: Deployment

**Problem:** Environment variables and configuration between dev/production.

**Solution:** .env files for local development, Render dashboard for production environment variables.

---

## Future Improvements

- **Mobile App** — React Native version
- **Video Calls** — WebRTC integration for video mentorship
- **AI Recommendations** — Machine learning for skill matching
- **Push Notifications** — Web push notifications
- **Payment Integration** — For paid mentorship sessions
- **Advanced Search** — Full-text search with Elasticsearch
- **Live Streaming** — Live streaming for workshops
- **Social Features** — Following, liking, and sharing posts

---

## Acknowledgments

This project was built as part of the **IYF Weekend Academy - Season 11** program.

**Special Thanks To:**

- Our instructors for their guidance
- All team members for their dedication and hard work
- Open-source libraries and tools used in this project

---

## Contact

**Project Lead:** Pius Kamau
**Email:** pitechtechnologies\@gmail.com
**GitHub:** [github.com/pius-kamau](https://github.com/pius-kamau)
**Location:** Nairobi, Kenya

---

## License

This project is for educational purpose.
>>>>>>> master
