# Weather Forecast App (MERN + Docker + GitHub Actions)

This project is a **full-stack MERN application** containerized using Docker and integrated with a CI pipeline using GitHub Actions.

---

##  Project Overview

This project demonstrates:

* Building a MERN stack app (MongoDB, Express, React, Node.js)
* Containerizing frontend and backend using Docker
* Managing multi-container setup using Docker Compose
* Automating build & push using GitHub Actions
* Publishing Docker images to Docker Hub

---

## Step-by-Step Implementation 

## 1️Clone the Repository

```bash
git clone https://github.com/samarthfunde/Weather-Forecast-Application---MERN-Stack-with-Docker.git
cd Weather-Forecast-App
```

---

## 2️Run Application Locally (Without Docker)

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

his verifies that the app works before containerization.

---

## 3️ Dockerization

###  Backend Dockerfile

* Created inside `/backend`
* Uses Node.js base image
* Installs dependencies and starts server...

###  Frontend Dockerfile

* Created inside `/frontend`
* Runs React app inside container

---

## 4️Docker Compose Setup

Created `docker-compose.yml` in root directory:

* Runs **3 services**:

  * frontend
  * backend
  * mongo

### Why Docker Compose i Used?

* Manages multiple containers
* Enables communication between services
* Simplifies startup with one command

---

## 5️ Environment Configuration

Created `.env` file in root:

```env
MONGO_URI=mongodb://mongo:27017/weather
```

### Why?

* Backend connects to MongoDB using this variable
* Avoids hardcoding database connection

---

## 6️ Run Full App with Docker in Locally (Vs Code)

```bash
docker-compose up --build 
```

This will:

* Build images
* Create containers
* Start frontend, backend, and MongoDB

---

##  Access Application

After running containers:

* Frontend → http://localhost:3000
* Backend → http://localhost:5000

---

## 7 CI/CD Pipeline (GitHub Actions).... also i have taken some Reference from Documentation

Workflow file:

```bash
.github/workflows/docker.yml

```
---

## 8 Git Commands Used
1. git init
2. git add .
3. git commit -m "Initial commit"
4. git remote add origin https://github.com/samarthf-vast/github_actions_project.git
5. git push -u origin master

---

##  Pipeline Steps

1. Checkout code
2. Setup Docker Buildx
3. Login to Docker Hub
4. Build Docker images
5. Push images to Docker Hub

---

##  GitHub Secrets Used

* `DOCKER_USERNAME`
* `DOCKER_PASSWORD`
* `MONGO_URI` (optional)

---


##  Docker Hub Images

Images are pushed to Docker Hub:

* `docker push samarthfunde45/backend`
* `docker push samarthfunde45/frontend`

---


##  My Key Learnings

* Docker containerization of MERN apps
* Multi-container orchestration using Docker Compose
* CI/CD pipeline with GitHub Actions
* Secure secrets handling
* Difference between build vs runtime environments

---


