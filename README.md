# Weather Forecast App — MERN + Docker + GitHub Actions

Full-stack MERN application containerized using Docker with CI/CD via GitHub Actions.

---

## Step 1 — Clone the Repository

**Task:** Get the source code locally.

```bash
git clone https://github.com/samarthfunde/Weather-Forecast-Application---MERN-Stack-with-Docker.git
cd Weather-Forecast-App
```

---

## Step 2 — Run Locally Without Docker

**Task:** Verify the app works before containerization.

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## Step 3 — Dockerize Frontend and Backend

**Task:** Create Dockerfiles for each service.

- `/backend/Dockerfile` — Uses Node.js base image, installs dependencies, starts server.
- `/frontend/Dockerfile` — Builds and runs the React app inside a container.

---

## Step 4 — Set Up Docker Compose

**Task:** Orchestrate all services with a single command.

File: `docker-compose.yml` (root directory)

Services defined:
- `frontend`
- `backend`
- `mongo`

```bash
docker-compose up --build
```

Access:
- Frontend → http://localhost:3000
- Backend  → http://localhost:5000

---

## Step 5 — Configure Environment Variables

**Task:** Avoid hardcoding credentials and isolate config per environment.

Create a `.env` file:

```env
MONGO_USER=dev_user
MONGO_PASS=dev123
MONGO_PORT=27017
MONGO_DB=weather_dev
MONGO_AUTH_DB=weather_dev
```

---

## Step 6 — Set Up CI/CD with GitHub Actions

**Task:** Automate build and push of Docker images on every push.

File: `.github/workflows/docker.yml`

Pipeline steps:
1. Checkout code
2. Setup Docker Buildx
3. Login to Docker Hub
4. Build Docker images
5. Push images to Docker Hub

GitHub Secrets required:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`


---

## Step 7 — Docker Image Versioning

**Task:** Tag images with build number and latest for easy rollback.

Images pushed to Docker Hub:

```
samarthfunde45/backend:<run_number>

samarthfunde45/frontend:<run_number>
```

---

## Step 8 — Configure Local DNS

**Task:** Set up a production-like custom domain for local development.

Edit `/etc/hosts`:

```
127.0.0.1   weatherapp.com
```

Access app at: http://weatherapp.com

---

## Step 9 — Add Nginx Reverse Proxy

**Task:** Route traffic through port 80 using Nginx.

Add to `docker-compose.yml`:

```yaml
nginx:
  image: nginx:latest
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf
  depends_on:
    - frontend
```

---

## Step 10 — Secure Database Authentication

**Task:** Isolate database access per environment with dedicated users.

Databases:
- `weather_dev`
- `weather_test`
- `weather_prod`

Users and access:

| User       | weather_dev | weather_test | weather_prod |
|------------|-------------|--------------|--------------|
| dev_user   | Yes         | No           | No           |
| test_user  | No          | Yes          | No           |
| prod_user  | No          | No           | Yes          |

Unauthorized access test:
```js
use weather_prod
db.users.find()
// MongoServerError: not authorized
```

---

## Author

Samarth Funde  
Associate DevOps Engineer — ValueAdd Softtech & Systems Pvt. Ltd.  
Email: samarthf@valueaddsofttech.com  
Phone: +91-9604156915  
LinkedIn: https://in.linkedin.com/in/samarth-funde-084425277
