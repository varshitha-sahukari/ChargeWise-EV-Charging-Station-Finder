# ⚡ ChargeWise India — EV Charging Station Finder & Smart Route Planner

![ChargeWise Banner](frontend/src/assets/hero.png)

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS_Map-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
Deployment link : https://charge-wise-ev-charging-station-fin.vercel.app/routes
**ChargeWise India** is a modern, production-grade full-stack web application designed to help Electric Vehicle (EV) owners locate, filter, and navigate to EV charging stations across India. It features real-time GIS mapping, AI-driven station recommendations, long-distance trip route planning, telemetry analytics, and roadside SOS emergency assistance.

---

## 🌟 Key Features

### 📍 Interactive GIS Map & Station Finder
- **Pan-India Coverage**: Pre-seeded with **550+ realistic EV charging stations** covering all major Indian states, union territories, and National Highways.
- **Geolocation & Auto-Detection**: Detects user's live location to pinpoint nearest stations within configurable radii (**2 km, 5 km, 10 km, 25 km, All India**).
- **Interactive Markers**: Visual status markers indicating station availability (**Available**, **Busy**, **Offline**).

### 🔍 Advanced Filtering & Search
- **Connector Compatibility**: Filter by CCS2, Type 2, CHAdeMO, AC001, and DC001 connectors.
- **Charging Networks**: Filter across major Indian networks including **Tata Power EZ Charge**, **Statiq**, **ChargeZone**, **Jio-bp Pulse**, **Ather Grid**, **Zeon Charging**, and **Shell Recharge**.
- **Power & Speed**: Filter fast-charging stations vs standard AC chargers.
- **Location Search**: Search instantly by city, state, PIN code, or station name.

### 🧭 EV Long-Distance Route Planner
- Calculate optimal multi-stop routes between Indian cities.
- Smart EV charging stop recommendations based on vehicle battery capacity (kWh) and range per charge.

### 🤖 AI Charging Recommendations
- Algorithmic station scoring based on connector match, current battery %, price/kWh, user reviews, and real-time station occupancy.

### 📊 Analytics & Admin Dashboard
- **Analytics**: Visualize station utilization, revenue metrics, peak usage hours, and energy consumption using interactive **Recharts**.
- **Admin Management**: Manage station status, update pricing, add new stations, and oversee user activity.

### 🚨 Emergency SOS Assistance
- One-touch roadside SOS emergency modal for immediate battery drain support and mobile charging unit dispatch.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8 | Modern component architecture & fast HMR |
| **Styling** | Tailwind CSS v4, Framer Motion | Dynamic theme styling & clean micro-animations |
| **Maps & GIS** | Leaflet.js, React-Leaflet | Open-source interactive map rendering without API key limits |
| **State & API** | TanStack React Query v5, Axios | Real-time caching, query management, and automatic refetching |
| **Backend** | Spring Boot 3.2.5, Java 21 | RESTful web services with enterprise architecture |
| **Security** | Spring Security, JJWT | Stateless JWT token authentication & role-based authorization |
| **Database** | H2 (Dev) / MySQL 8.0 (Prod) | Spring Profiles (`dev` & `prod`) with JPA/Hibernate ORM |
| **API Docs** | Swagger UI / OpenAPI 3 | Interactive API testing documentation at `/swagger-ui.html` |

---

## 📁 Repository Architecture

```
EVproject/
├── backend/                        # Spring Boot 3.2 Backend
│   ├── src/main/java/com/chargewise/
│   │   ├── config/                 # SecurityConfig, AppConfig, DatabaseSeeder (550+ stations)
│   │   ├── controller/             # REST Endpoints (Station, Route, Auth, Admin, AI)
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── entity/                 # JPA Entities (User, Station, Connector, Booking, etc.)
│   │   ├── repository/             # Spring Data JPA Repositories
│   │   ├── security/               # JWT Authentication Filters & Token Provider
│   │   └── service/                # Business Logic Layer
│   └── src/main/resources/
│       ├── application.yml         # Main Configuration (Active Profile & JWT settings)
│       ├── application-dev.yml     # H2 In-Memory DB Profile
│       └── application-prod.yml    # MySQL Production DB Profile
├── frontend/                       # React 19 + TypeScript Frontend
│   ├── public/                     # Static icons & SVGs
│   ├── src/
│   │   ├── api/                    # Axios client setup & interceptors
│   │   ├── components/             # Reusable UI components (Map, Filters, Dashboards)
│   │   ├── context/                # AuthContext & ThemeContext
│   │   ├── types/                  # TypeScript interfaces & types
│   │   ├── App.tsx                 # Main routing & application layout
│   │   └── main.tsx                # Entry point
│   ├── package.json
│   └── vite.config.ts
├── database/                       # SQL Schemas & Seed Data Scripts
│   ├── schema.sql
│   └── seed_data.sql
├── .gitignore                      # Git ignore rules for build binaries & modules
└── README.md                       # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **JDK 21** or higher
- **Maven 3.8+**
- **Node.js 18+** & **npm 9+**

---

### 1️⃣ Setting Up the Backend (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the application using Maven (default profile `dev` uses in-memory H2 database and auto-seeds 550+ stations):
   ```bash
   mvn spring-boot:run
   ```

   *The backend will start on **`http://localhost:8080`**.*

3. **Access Database Console & API Docs**:
   - **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - **H2 Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)  
     *(JDBC URL: `jdbc:h2:mem:chargewisedb`, Username: `sa`, Password: empty)*

#### Switching to MySQL (Production Profile)
To run with MySQL:
1. Update `backend/src/main/resources/application-prod.yml` with your MySQL credentials.
2. Run Spring Boot with the `prod` profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=prod
   ```

---

### 2️⃣ Setting Up the Frontend (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo Credentials

For quick login and testing during recruiter review or demonstration:

| User Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin User** | `admin@chargewise.in` | `admin123` |
| **EV Owner User** | `user@chargewise.in` | `user123` |

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new EV owner account |
| `POST` | `/api/auth/login` | Authenticate user & obtain JWT token |
| `GET` | `/api/stations` | List stations with search & filter parameters |
| `GET` | `/api/stations/{id}` | Get detailed station info, pricing & connectors |
| `POST` | `/api/routes/plan` | Calculate trip route with EV charging stop suggestions |
| `POST` | `/api/recommendations` | Get AI-backed station recommendations |
| `GET` | `/api/analytics` | Retrieve network telemetry & station usage stats |
| `POST` | `/api/admin/stations` | Create/update charging station (Admin only) |

---

## 🤝 Contributing & License

Developed as a full-stack engineering project by **[Varshitha Sahukari](https://github.com/varshitha-sahukari)**.  
Distributed under the **MIT License**.
