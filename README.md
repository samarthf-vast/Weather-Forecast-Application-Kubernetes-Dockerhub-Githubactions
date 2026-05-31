# Weather Forecast App

A full-stack weather application where users can search weather by city name. The app stores search history in MongoDB, exposes Prometheus metrics from the backend, and ships logs to Loki via Grafana Alloy. Everything runs on Kubernetes (Minikube) with a complete monitoring stack.

---

## What This App Does

- Search weather for any city using the Open-Meteo API
- Stores search history in MongoDB
- Exposes backend metrics to Prometheus
- Full observability — metrics, logs, dashboards, and email alerts via Grafana

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 |
| Backend | Node.js + Express |
| Database | MongoDB 6 |
| Reverse Proxy | Nginx |
| Metrics | Prometheus |
| Dashboards & Alerts | Grafana |
| Log Storage | Loki |
| Log Collection | Grafana Alloy |
| Container Metrics | cAdvisor |
| Host Metrics | Node Exporter |
| Orchestration | Kubernetes (Minikube) |
| CI/CD | GitHub Actions |

---

## Architecture

```
Browser
   │
   ▼
Nginx (NodePort :31252)
   ├── /weather/*  →  Backend (Node.js :5000)  →  Open-Meteo API
   │                       │
   │                   MongoDB (search history)
   │
   └── /           →  Frontend (React :3000)

Monitoring Stack:
   cAdvisor       →  Prometheus  →  Grafana (dashboards + alerts)
   Node Exporter  →  Prometheus  →  Grafana
   Grafana Alloy  →  Loki        →  Grafana (logs)
```

---

## Folder Structure

```
Weather-Forecast-App/
├── backend/
│   ├── index.js               ← Express API + Prometheus metrics
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── k8s/
│   ├── namespace.yml          ← Creates weather-app and weather-monitoring namespaces
│   │
│   ├── app/                   ← Application manifests
│   │   ├── backend-deployment.yml
│   │   ├── backend-service.yml
│   │   ├── frontend-deployment.yml
│   │   ├── frontend-service.yml
│   │   ├── mongo-statefulset.yml
│   │   ├── mongo-pvc.yml
│   │   ├── mongo-service.yml
│   │   ├── nginx-deployment.yml
│   │   ├── nginx-service.yml
│   │   └── ingress.yml
│   │
│   ├── monitoring/            ← Monitoring stack manifests
│   │   ├── prometheus-deployment.yml
│   │   ├── grafana-deployment.yml
│   │   ├── loki-deployment.yml
│   │   ├── alloy-daemonset.yml
│   │   ├── cadvisor-daemonset.yml
│   │   ├── node-exporter-daemonset.yml
│   │   └── *-service.yml files
│   │
│   ├── configmaps/            ← All configuration
│   │   ├── prometheus-config.yml
│   │   ├── nginx-config.yml
│   │   ├── loki-config.yml
│   │   ├── alloy-config.yml
│   │   ├── grafana-datasources.yml
│   │   ├── grafana-dashboards.yml
│   │   ├── grafana-alerting.yml
│   │   └── grafana-email-template.yml
│   │
│   └── secrets/
│       ├── app-secrets.yml    ← MongoDB credentials
│       └── grafana-secrets.yml ← Grafana admin + SMTP password
│
└── .github/
    └── workflows/
        └── app-deploy.yml     ← CI/CD pipeline
```

---

## Namespaces

| Namespace | What runs here |
|-----------|---------------|
| `weather-app` | backend, frontend, mongo, nginx |
| `weather-monitoring` | prometheus, grafana, loki, alloy, cadvisor, node-exporter |

---

## Prerequisites

Before you start, make sure these are installed on your machine:

```bash
# Check Docker
docker --version

# Check Minikube
minikube version

# Check kubectl
kubectl version --client
```

If anything is missing:
- Docker: https://docs.docker.com/get-docker
- Minikube: https://minikube.sigs.k8s.io/docs/start
- kubectl: https://kubernetes.io/docs/tasks/tools

---

## Full Setup — From Scratch to Running

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/Weather-Forecast-App.git
cd Weather-Forecast-App
```

---

### Step 2 — Start Minikube

```bash
minikube start --driver=docker --cpus=4 --memory=6144
```

Verify it started properly:

```bash
minikube status
kubectl get nodes
```

Expected output:
```
NAME       STATUS   ROLES           AGE
minikube   Ready    control-plane   30s
```

---

### Step 3 — Build Docker Images Inside Minikube

The Kubernetes manifests use `imagePullPolicy: Never` which means images must be built directly inside Minikube's Docker daemon. No registry push is needed for local setup.

```bash
# Point your terminal to Minikube's Docker daemon
eval $(minikube docker-env)

# Build backend image
docker build -t samarthfunde45/weather-backend:latest ./backend

# Build frontend image
docker build -t samarthfunde45/weather-frontend:latest ./frontend
```

Verify images are available:

```bash
docker images | grep samarthfunde45
```

Expected output:
```
samarthfunde45/weather-frontend   latest   abc123   2 minutes ago   45MB
samarthfunde45/weather-backend    latest   def456   2 minutes ago   180MB
```

---

### Step 4 — Create Namespaces

```bash
kubectl apply -f k8s/namespace.yml
```

Verify:

```bash
kubectl get namespaces | grep weather
```

Expected output:
```
weather-app          Active   5s
weather-monitoring   Active   5s
```

---

### Step 5 — Create Secrets

Secrets store sensitive values like MongoDB credentials and Grafana SMTP password. Values must be base64 encoded.

To encode any value:

```bash
echo -n "your-value" | base64
```

Edit the secret files with your own values:

```bash
nano k8s/secrets/app-secrets.yml
nano k8s/secrets/grafana-secrets.yml
```

Apply secrets:

```bash
kubectl apply -f k8s/secrets/app-secrets.yml
kubectl apply -f k8s/secrets/grafana-secrets.yml
```

Verify:

```bash
kubectl get secrets -n weather-app
kubectl get secrets -n weather-monitoring
```

---

### Step 6 — Apply ConfigMaps

ConfigMaps hold all configuration files — Nginx routing, Prometheus scrape config, Loki config, Grafana dashboards, and alerting rules.

```bash
kubectl apply -f k8s/configmaps/
```

Verify:

```bash
kubectl get configmaps -n weather-app
kubectl get configmaps -n weather-monitoring
```

---

### Step 7 — Deploy the Application

```bash
kubectl apply -f k8s/app/
```

Watch pods come up (Ctrl+C to stop watching):

```bash
kubectl get pods -n weather-app -w
```

Wait until all pods show `Running`:

```
NAME                        READY   STATUS    RESTARTS   AGE
backend-6d8f9b-xxx          1/1     Running   0          30s
frontend-7c4d5b-xxx         1/1     Running   0          30s
mongo-0                     1/1     Running   0          45s
nginx-5b8c9d-xxx            1/1     Running   0          30s
```

---

### Step 8 — Deploy the Monitoring Stack

```bash
kubectl apply -f k8s/monitoring/
```

Watch monitoring pods:

```bash
kubectl get pods -n weather-monitoring -w
```

Wait until all show `Running`:

```
NAME                        READY   STATUS    RESTARTS   AGE
alloy-xxx                   1/1     Running   0          40s
cadvisor-xxx                1/1     Running   0          40s
grafana-xxx                 1/1     Running   0          40s
loki-xxx                    1/1     Running   0          40s
node-exporter-xxx           1/1     Running   0          40s
prometheus-xxx              1/1     Running   0          40s
```

---

### Step 9 — Open the Application

Get Minikube IP:

```bash
minikube ip
```

Open in browser:
```
http://<minikube-ip>:31252
```

Example: `http://192.168.49.2:31252`

---

### Step 10 — Open Grafana

```bash
minikube service grafana -n weather-monitoring
```

This opens Grafana in your browser automatically.

Default login:
```
Username: admin
Password: admin
```

Grafana comes pre-provisioned with:
- Container monitoring dashboard
- Node Exporter dashboard
- Logs dashboard (Loki)
- Alert rules for CPU, memory, disk, container down

---

## CI/CD Pipeline

The pipeline runs on every push to the `master` branch and does the following:

```
Push to master
      │
      ▼
1. Detect changes (backend / frontend / k8s)
      │
      ▼
2. SonarCloud code quality scan
      │
      ▼
3. Build Docker images (backend + frontend)
      │
      ▼
4. Trivy security scan (blocks on CRITICAL/HIGH CVEs)
      │
      ▼
5. Push images to DockerHub
      │
      ▼
6. Deploy to Kubernetes (kubectl apply)
```

### Pipeline Secrets Required

Go to: **GitHub → Repository → Settings → Secrets and variables → Actions**

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Your DockerHub username |
| `DOCKER_PASSWORD` | Your DockerHub access token |
| `SONAR_TOKEN` | SonarCloud project token |
| `MONGO_USER` | MongoDB username |
| `MONGO_PASS` | MongoDB password |
| `MONGO_HOST` | MongoDB host |
| `MONGO_PORT` | MongoDB port |
| `MONGO_DB` | MongoDB database name |
| `MONGO_AUTH_DB` | MongoDB auth database |

---

## Day-to-Day Commands

### Check pod status

```bash
kubectl get pods -n weather-app
kubectl get pods -n weather-monitoring
```

### View logs of a pod

```bash
# Backend logs
kubectl logs deployment/backend -n weather-app

# Frontend logs
kubectl logs deployment/frontend -n weather-app

# Grafana logs
kubectl logs deployment/grafana -n weather-monitoring

# Prometheus logs
kubectl logs deployment/prometheus -n weather-monitoring

# Alloy logs
kubectl logs daemonset/alloy -n weather-monitoring
```

### Rebuild and redeploy backend after code change

```bash
eval $(minikube docker-env)
docker build -t samarthfunde45/weather-backend:latest ./backend
kubectl rollout restart deployment/backend -n weather-app
kubectl rollout status deployment/backend -n weather-app
```

### Rebuild and redeploy frontend after code change

```bash
eval $(minikube docker-env)
docker build -t samarthfunde45/weather-frontend:latest ./frontend
kubectl rollout restart deployment/frontend -n weather-app
kubectl rollout status deployment/frontend -n weather-app
```

### Apply a changed ConfigMap and restart affected pod

```bash
# Example: Prometheus config changed
kubectl apply -f k8s/configmaps/prometheus-config.yml
kubectl rollout restart deployment/prometheus -n weather-monitoring

# Example: Nginx config changed
kubectl apply -f k8s/configmaps/nginx-config.yml
kubectl rollout restart deployment/nginx -n weather-app
```

### Restart any deployment

```bash
kubectl rollout restart deployment/<name> -n <namespace>
```

### Test the weather API directly

```bash
NODEIP=$(minikube ip)
curl http://$NODEIP:31252/weather/London
```

### Check Prometheus targets

```bash
minikube service prometheus -n weather-monitoring
# Then open: Status → Targets in the Prometheus UI
```

### Exec into a running pod

```bash
kubectl exec -it deployment/backend -n weather-app -- sh
kubectl exec -it deployment/grafana -n weather-monitoring -- sh
```

### Describe a pod (useful for debugging startup issues)

```bash
kubectl describe pod <pod-name> -n weather-app
kubectl describe pod <pod-name> -n weather-monitoring
```

### Delete and redeploy everything cleanly

```bash
# Delete
kubectl delete -f k8s/app/
kubectl delete -f k8s/monitoring/
kubectl delete -f k8s/configmaps/
kubectl delete -f k8s/secrets/

# Reapply in order
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/app/
kubectl apply -f k8s/monitoring/
```

### Stop and restart Minikube

```bash
minikube stop
minikube start --driver=docker --cpus=4 --memory=6144
```

---

## Monitoring

### Grafana Dashboards

Three dashboards are pre-provisioned:

**1. Container Monitoring**
- CPU and memory usage per container (gauge + time series)
- Container-wise CPU and memory bar gauges
- Namespace filter: `weather-app` and `weather-monitoring`

**2. Node Exporter**
- Host CPU, memory, disk, and network usage
- Based on standard Grafana dashboard ID 1860

**3. Logs**
- Real-time pod logs from Loki
- Filter by container name

---

### Alert Rules

| Alert | Triggers When |
|-------|-------------|
| Container Down | Container not seen for 2 minutes |
| Container Started | Container comes back up within 90 seconds |
| Container CPU High | Container CPU > 80% for 5 minutes |
| Container Memory High | Container memory > 80% for 5 minutes |
| Monitoring Pod Down | Monitoring container not seen for 2 minutes |
| Host CPU High | Host CPU > 80% for 5 minutes |
| Host Memory High | Host RAM > 80% for 5 minutes |
| Disk Usage High | Disk at `/` > 80% |

All alerts send email via Gmail SMTP. Firing alerts send red emails, resolved alerts send green emails.

---

## Resource Limits

| Container | Memory Request | Memory Limit | CPU Request | CPU Limit |
|-----------|--------------|-------------|-------------|-----------|
| backend | 256Mi | 512Mi | 250m | 500m |
| frontend | 512Mi | 1Gi | 250m | 500m |
| mongo | 256Mi | 512Mi | 250m | 500m |
| nginx | 64Mi | 128Mi | 100m | 200m |
| prometheus | 256Mi | 512Mi | 250m | 500m |
| grafana | 256Mi | 512Mi | 250m | 500m |
| loki | 256Mi | 512Mi | 250m | 500m |
| alloy | 128Mi | 512Mi | 100m | 300m |
| cadvisor | 256Mi | 512Mi | 250m | 500m |

---

## Troubleshooting

### Pod stuck in CrashLoopBackOff

```bash
# Check logs from the crashed container
kubectl logs <pod-name> -n <namespace> --previous

# Check events
kubectl describe pod <pod-name> -n <namespace>
```

---

### Prometheus fails with lock error

**Error:**
```
lock DB directory: resource temporarily unavailable
```

**Fix:** Ensure `--storage.tsdb.no-lockfile` flag is set and deployment strategy is `Recreate` (not `RollingUpdate`) in `prometheus-deployment.yml`. This is required on Minikube because overlayfs does not support POSIX file locks.

---

### cAdvisor shows no container data

**Error in logs:**
```
Registration of the docker container factory failed:
client version 1.41 is too old. Minimum supported API version is 1.44
```

**Fix:** Use `gcr.io/cadvisor/cadvisor:v0.51.0` or later. Versions below v0.51.0 do not support Docker 29.x.

---

### Alloy logs not appearing in Grafana

Check two things:

1. Alloy ClusterRole must include `pods/log`:
```yaml
resources: ["pods", "pods/log", "nodes", "namespaces", "endpoints"]
verbs: ["get", "list", "watch"]
```

2. Alloy config must use `loki.source.kubernetes` not `loki.source.file`. The file-based source fails in Kubernetes because Go does not expand glob patterns in `stat()` calls.

---

### Grafana dashboard shows No Data

- **Container metrics missing:** Check cAdvisor is running and Prometheus has `container` labels in its targets page
- **CPU panel wrong values:** Use `rate(...[2m])` not `[1m]` — `rate()` needs at least 2 data points in the window
- **Memory limit panel empty:** Do not put value comparisons like `!=0` inside `{}` in PromQL — move them outside the label selector

---

### Frontend weather search not working

The React app runs in the browser. `localhost` in the browser means the user's machine, not any Kubernetes pod. All API calls must go through relative URLs (`/weather/...`) so Nginx can proxy them to the backend. Never hardcode `localhost` in frontend API calls.

---

### Images not found in Minikube

If pods show `ErrImageNeverPull` or `ImagePullBackOff` with `imagePullPolicy: Never`:

```bash
# Make sure you built images inside Minikube's Docker context
eval $(minikube docker-env)
docker images | grep samarthfunde45
```

If images are missing, rebuild them (Step 3).

---

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `production` in Dockerfile |
| `MONGO_USER` | MongoDB username (from Kubernetes secret) |
| `MONGO_PASS` | MongoDB password (from Kubernetes secret) |
| `MONGO_HOST` | MongoDB service name |
| `MONGO_PORT` | MongoDB port (default 27017) |
| `MONGO_DB` | Database name |
| `MONGO_AUTH_DB` | Auth database (usually `admin`) |

---

## Key Design Decisions

**Why Nginx as reverse proxy?**
Frontend JavaScript runs in the browser. The browser cannot reach Kubernetes pod IPs directly. Nginx sits in front of both services and routes `/weather/*` to backend and `/` to frontend — all from one URL.

**Why StatefulSet for MongoDB?**
MongoDB needs a stable pod name and persistent storage. StatefulSets guarantee both. A regular Deployment would lose data on pod restart.

**Why `imagePullPolicy: Never` locally?**
Avoids pushing to DockerHub during development. Images are built directly into Minikube's Docker daemon with `eval $(minikube docker-env)`.

**Why `--storage.tsdb.no-lockfile` for Prometheus?**
Minikube uses Docker driver which uses overlayfs. This filesystem does not support POSIX file locking. Without this flag, Prometheus crashes on restart.

**Why Grafana Alloy instead of Promtail?**
Promtail uses file-based log collection with glob paths. Kubernetes pod log paths contain UUIDs which Go's `stat()` cannot expand. Alloy uses the Kubernetes API directly to stream logs, which works reliably.
