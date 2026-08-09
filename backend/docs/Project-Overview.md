# ISDP - Invisible Skills Discovery Platform

## Project Overview

### What is ISDP?

ISDP is a community-driven platform designed to discover, organize, and connect hidden talents within communities. It addresses the challenge of valuable skills, knowledge, and expertise that remain unknown because there is no centralized platform where these abilities can be discovered.

### Problem Statement

Every community contains individuals with valuable skills that often remain undiscovered:
- Retired engineers willing to mentor students
- Talented tailors with no online presence
- Software developers looking to volunteer
- Mechanics available after work
- Farmers experienced in sustainable agriculture
- Musicians willing to teach children

These talents remain invisible, causing communities to miss opportunities, young people to lack mentors, local businesses to struggle finding skilled workers, and NGOs to be unable to identify volunteers.

### Solution

ISDP provides a digital skills directory that:
- Creates digital talent profiles
- Helps users discover nearby skilled people
- Promotes mentorship
- Increases collaboration
- Encourages volunteerism
- Supports local economic growth
- Preserves community knowledge

### Target Users

| Role | Description |
|------|-------------|
| Community Members | Anyone with skills to share or seek |
| Mentors | Experts willing to teach others |
| Mentees | Learners seeking guidance |
| Volunteers | People offering time to help |
| Community Leaders | Tracking community development |
| Administrators | Platform management |

### Key Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Admin, Mentor, Volunteer, User)
   - Email verification
   - Password reset

2. **User Management**
   - Profile creation and management
   - Skill addition and verification
   - Location-based discovery

3. **Skills Management**
   - Skill categorization
   - Proficiency levels (Beginner, Intermediate, Advanced, Expert)
   - Skill verification

4. **Search & Discovery**
   - Search by skill, location, availability
   - Filter by mentor/volunteer status
   - Talent map visualization

5. **Mentorship Module**
   - Request mentorship
   - Accept/reject requests
   - Schedule sessions
   - Rate and review

6. **Messaging System**
   - Real-time messaging with Socket.IO
   - Conversation history
   - Online status
   - Typing indicators

7. **Notifications**
   - In-app notifications
   - Email notifications
   - Real-time alerts

8. **Recommendation Engine**
   - Weighted algorithm based on:
     - Skills (40%)
     - Proximity (30%)
     - Availability (15%)
     - Experience (10%)
     - Reputation (5%)

9. **Analytics Dashboard**
   - Community statistics
   - Skill distribution
   - User engagement metrics

### Technology Stack

| Layer | Technology |
|-------|------------|
| Backend Framework | Node.js + Express.js |
| Database | PostgreSQL 16.x |
| ORM | Prisma |
| Cache | Redis |
| Queue | BullMQ |
| Real-time | Socket.IO |
| Authentication | JWT + bcrypt |
| Validation | Zod |
| Logging | Winston |
| Testing | Jest + Supertest |
| Documentation | Swagger/OpenAPI |

### Project Goals

1. Create a production-grade backend API
2. Enable community skill discovery and connection
3. Provide intelligent matching between mentors and learners
4. Support volunteerism and community development
5. Demonstrate professional software engineering practices

---

**Date:** August 2026
**Author:** Pius Kamau & Project Group
**Version:** 2.0