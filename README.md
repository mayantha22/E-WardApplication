# 🏥 E-Ward Application
### Hospital Ward Management System

A full-stack web application for managing hospital ward operations efficiently. Built with **Spring Boot** (backend) and **React** (frontend).

---

## 📋 Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)

---

## 📌 About

E-Ward is a Hospital Ward Management System designed for **Hospital Administrators, Doctors, and Nurses** to manage day-to-day ward operations including patients, staff, duty rosters, inventory, and shift swap requests — all in one place.

---

## ✨ Features

### 👤 Patient Management
- Add, update, and view patients
- Patient profiles with daily updates
- Generate patient reports

### 👨‍⚕️ Staff Management
- Manage doctors and nurses
- Staff profiles and details
- Role-based access control

### 📅 Duty Roster
- Create and manage duty schedules
- View rosters by date and ward

### 🔄 Swap Requests
- Staff can request duty swap
- Direct and indirect swap support
- Swap audit log tracking

### 💊 Medicine Inventory
- Track medicine stock levels
- Add and update medicine inventory
- Generate inventory reports

### 🔧 Equipment Inventory
- Manage hospital equipment
- Track equipment availability
- Generate equipment reports

### 🔔 Notifications
- Real-time notifications for staff
- System alerts and updates

### 📧 Email Service
- Automated email notifications
- Password reset via email
- Staff communication support

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 17 | Programming Language |
| Spring Boot | Backend Framework |
| Spring Security + JWT | Authentication & Authorization |
| Spring Data JPA | Database ORM |
| Flyway | Database Migration |
| MySQL | Database |
| Maven | Build Tool |

### Frontend
| Technology | Purpose |
|------------|---------|
| React | Frontend Framework |
| React Router | Navigation |
| Axios | API Calls |
| CSS | Styling |

---

## 📁 Project Structure

```
E-WardApplication/
│
├── src/                          # Backend Source Code
│   └── main/
│       ├── java/
│       │   └── com/example/E_WardApplication/
│       │       ├── controller/   # REST API Controllers
│       │       ├── service/      # Business Logic
│       │       ├── repository/   # Database Queries
│       │       ├── entity/       # Database Models
│       │       ├── dto/          # Data Transfer Objects
│       │       ├── security/     # JWT & Security Config
│       │       ├── enums/        # Enumerations
│       │       └── exception/    # Exception Handling
│       └── resources/
│           ├── application.yml   # App Configuration
│           └── db/migration/     # Flyway SQL Migrations
│
├── e-ward-frontend/              # Frontend Source Code
│   └── src/
│       ├── pages/                # React Pages
│       ├── components/           # Reusable Components
│       ├── services/             # API Service Calls
│       ├── context/              # Auth Context
│       └── utils/                # Helper Functions
│
└── pom.xml                       # Backend Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8+
- Maven

---

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/mayantha22/E-WardApplication.git
cd E-WardApplication
```

2. **Configure Database**

Edit `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/eward_db
    username: your_username
    password: your_password
```

3. **Run the Backend**
```bash
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`

---

### Frontend Setup

1. **Navigate to frontend folder**
```bash
cd e-ward-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the Frontend**
```bash
npm start
```
Frontend runs on: `http://localhost:3000`

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| **Hospital Admin** | Full access to all features |
| **Doctor** | Patient management, duty roster, swap requests |
| **Nurse** | Patient updates, duty roster, swap requests |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/forgot-password` | Forgot password |
| POST | `/api/auth/reset-password` | Reset password |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all patients |
| POST | `/api/patients` | Add new patient |
| PUT | `/api/patients/{id}` | Update patient |
| DELETE | `/api/patients/{id}` | Delete patient |

### Staff
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff` | Get all staff |
| POST | `/api/staff` | Add new staff |
| PUT | `/api/staff/{id}` | Update staff |
| DELETE | `/api/staff/{id}` | Delete staff |

### Duty Roster
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/duty-roster` | Get all rosters |
| POST | `/api/duty-roster` | Create roster |
| PUT | `/api/duty-roster/{id}` | Update roster |

### Swap Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/swap-requests` | Get all swap requests |
| POST | `/api/swap-requests` | Create swap request |
| PUT | `/api/swap-requests/{id}` | Update swap request |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | Get medicine inventory |
| POST | `/api/medicines` | Add medicine |
| GET | `/api/equipment` | Get equipment inventory |
| POST | `/api/equipment` | Add equipment |

---

## 👨‍💻 Author

**mayantha22**
- GitHub: [@mayantha22](https://github.com/mayantha22)

---

## 📄 License

This project is for academic purposes.
