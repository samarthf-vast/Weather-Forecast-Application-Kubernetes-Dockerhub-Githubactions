# Weather Forecast App — Kubernetes Deployment

A full-stack weather application deployed on Kubernetes (Minikube) with a complete observability stack: metrics, logs, dashboards, and alerting.

---

## Project Overview

The application lets users search for weather by city name. It stores search history in MongoDB and exposes Prometheus metrics from the backend. The monitoring stack collects container metrics (cAdvisor), host metrics (Node Exporter), and pod logs (Grafana Alloy → Loki), all visualized in Grafana.

---

## Architecture

```plaintext
Browser
   ↓
nginx (NodePort :31252)
   ├── /weather/* → backend:5000 → Open-Meteo API
   └── /          → frontend:3000

backend → MongoDB (StatefulSet)

Monitoring:
  cAdvisor (DaemonSet) → Prometheus → Grafana
  Node Exporter (DaemonSet) → Prometheus → Grafana
  Alloy (DaemonSet) → Loki → Grafana
```

---

## Tech Stack

| Component        | Tool / Image                        | Purpose                          |
|------------------|-------------------------------------|----------------------------------|
| Frontend         | React (samarthfunde45/weather-frontend) | Weather search UI             |
| Backend          | Node.js (samarthfunde45/weather-backend) | REST API + Prometheus metrics |
| Database         | MongoDB 6                           | Weather search history           |
| Reverse Proxy    | Nginx 1.29.8                        | Routes frontend + backend        |
| Metrics          | Prometheus v3.5.3                   | Metrics scraping and storage     |
| Dashboards       | Grafana 13.0.1                      | Visualization and alerting       |
| Log Aggregation  | Loki 3.7.2                          | Centralized log storage          |
| Log Collection   | Grafana Alloy v1.16.1               | Pod log shipping to Loki         |
| Container Metrics| cAdvisor v0.51.0                    | Container CPU/memory metrics     |
| Host Metrics     | Node Exporter                       | Node CPU/memory/disk metrics     |
| Orchestration    | Kubernetes (Minikube)               | Container orchestration          |

---

## Namespaces

| Namespace           | Contents                                            |
|---------------------|-----------------------------------------------------|
| `weather-app`       | backend, frontend, mongo, nginx                     |
| `weather-monitoring`| prometheus, grafana, loki, alloy, cadvisor, node-exporter |

---

## Folder Structure

```plaintext
k8s/
├── namespace.yml                        ← Creates both namespaces
│
├── app/
│   ├── backend-deployment.yml
│   ├── backend-service.yml
│   ├── frontend-deployment.yml
│   ├── frontend-service.yml
│   ├── mongo-statefulset.yml
│   ├── mongo-pvc.yml
│   ├── mongo-service.yml
│   ├── nginx-deployment.yml
│   ├── nginx-service.yml
│   └── ingress.yml
│
├── monitoring/
│   ├── prometheus-deployment.yml
│   ├── prometheus-service.yml
│   ├── prometheus-pvc.yml
│   ├── prometheus-rbac.yml
│   ├── grafana-deployment.yml
│   ├── grafana-service.yml
│   ├── grafana-pvc.yml
│   ├── loki-deployment.yml
│   ├── loki-service.yml
│   ├── loki-pvc.yml
│   ├── alloy-daemonset.yml
│   ├── alloy-rbac.yml
│   ├── cadvisor-daemonset.yml
│   ├── cadvisor-service.yml
│   ├── node-exporter-daemonset.yml
│   ├── node-exporter-service.yml
│   └── ingress.yml
│
├── configmaps/
│   ├── prometheus-config.yml
│   ├── nginx-config.yml
│   ├── loki-config.yml
│   ├── alloy-config.yml
│   ├── grafana-datasources.yml
│   ├── grafana-dashboards-config.yml
│   ├── grafana-dashboards.yml
│   ├── grafana-dashboard-node.yml
│   ├── grafana-alerting.yml
│   ├── grafana-email-template.yml
│   └── grafana-user-setup.yml
│
└── secrets/
    ├── app-secrets.yml                  ← MongoDB credentials
    └── grafana-secrets.yml              ← Grafana admin + SMTP password
```

---

## Prerequisites

- Docker Desktop installed and running
- Minikube installed
- kubectl installed
- Images already built in Minikube's Docker context (see Build Images section)

---

## Step 1 — Start Minikube

```bash
minikube start --driver=docker --cpus=4 --memory=6144
```

Verify it is running:

```bash
minikube status
kubectl get nodes
```

---

## Step 2 — Build Docker Images Inside Minikube

Since `imagePullPolicy: Never` is used, images must be built directly inside Minikube's Docker daemon (no registry push needed).

```bash
# Point your shell to Minikube's Docker daemon
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

---

## Step 3 — Create Namespaces

```bash
kubectl apply -f k8s/namespace.yml
```

Verify:

```bash
kubectl get namespaces | grep weather
```

---

## Step 4 — Apply Secrets

Edit the secret files with your values before applying. Secrets must be base64 encoded.

Encode a value:

```bash
echo -n "your-value" | base64
```

Apply:

```bash
kubectl apply -f k8s/secrets/app-secrets.yml
kubectl apply -f k8s/secrets/grafana-secrets.yml
```

---

## Step 5 — Apply ConfigMaps

```bash
kubectl apply -f k8s/configmaps/
```

This applies all ConfigMaps at once: Prometheus config, Nginx config, Loki config, Alloy config, and all Grafana provisioning configs.

---

## Step 6 — Deploy the Application Stack

```bash
kubectl apply -f k8s/app/
```

Wait for all pods to be running:

```bash
kubectl get pods -n weather-app -w
```

Expected output:

```
NAME                        READY   STATUS    RESTARTS
backend-xxx                 1/1     Running   0
frontend-xxx                1/1     Running   0
mongo-0                     1/1     Running   0
nginx-xxx                   1/1     Running   0
```

---

## Step 7 — Deploy the Monitoring Stack

```bash
kubectl apply -f k8s/monitoring/
```

Wait for all monitoring pods:

```bash
kubectl get pods -n weather-monitoring -w
```

Expected output:

```
NAME                        READY   STATUS    RESTARTS
alloy-xxx                   1/1     Running   0
cadvisor-xxx                1/1     Running   0
grafana-xxx                 1/1     Running   0
loki-xxx                    1/1     Running   0
node-exporter-xxx           1/1     Running   0
prometheus-xxx              1/1     Running   0
```

---

## Step 8 — Access the Application

Get the Minikube IP:

```bash
minikube ip
```

The Nginx service is exposed as NodePort on port `31252`:

```
http://<minikube-ip>:31252
```

Example: `http://192.168.49.2:31252`

---

## Step 9 — Access Grafana

Get the Grafana NodePort:

```bash
kubectl get svc grafana -n weather-monitoring
```

Or use Minikube's tunnel:

```bash
minikube service grafana -n weather-monitoring
```

Default credentials: `admin / admin`

---

## Resource Limits

| Container     | Memory Request | Memory Limit | CPU Request | CPU Limit |
|---------------|---------------|-------------|-------------|-----------|
| backend       | 256Mi         | 512Mi       | 250m        | 500m      |
| frontend      | 512Mi         | 1Gi         | 250m        | 500m      |
| mongo         | 256Mi         | 512Mi       | 250m        | 500m      |
| nginx         | 64Mi          | 128Mi       | 100m        | 200m      |
| prometheus    | 256Mi         | 512Mi       | 250m        | 500m      |
| grafana       | 256Mi         | 512Mi       | 250m        | 500m      |
| loki          | 256Mi         | 512Mi       | 250m        | 500m      |
| alloy         | 128Mi         | 512Mi       | 100m        | 300m      |
| cadvisor      | 256Mi         | 512Mi       | 250m        | 500m      |

---

## Key Implementation Details

### Nginx — Reverse Proxy via ConfigMap

Nginx is configured via a ConfigMap mounted at `/etc/nginx/conf.d/default.conf`. This routes:
- `/weather/*` → `backend.weather-app.svc.cluster.local:5000`
- `/` → `frontend.weather-app.svc.cluster.local:3000`

```yaml
# k8s/configmaps/nginx-config.yml
location /weather/ {
    proxy_pass http://backend.weather-app.svc.cluster.local:5000;
}
location / {
    proxy_pass http://frontend.weather-app.svc.cluster.local:3000;
}
```

### cAdvisor — Container Metrics

cAdvisor v0.51.0 is required (not v0.49.x). Docker 29.x requires Docker API v1.44 minimum. v0.49.x only supports API v1.41 and fails to register the Docker factory.

```yaml
image: gcr.io/cadvisor/cadvisor:v0.51.0
args:
  - --store_container_labels=false
  - --whitelisted_container_labels=io.kubernetes.container.name,io.kubernetes.pod.name,io.kubernetes.pod.namespace
```

Docker socket and containerd socket are mounted so cAdvisor can read Kubernetes container labels.

Prometheus relabels the `container_label_io_kubernetes_*` labels into clean `container`, `pod`, `namespace` labels:

```yaml
metric_relabel_configs:
  - source_labels: [container_label_io_kubernetes_container_name]
    regex: (.+)
    target_label: container
    replacement: $1
  - source_labels: [container_label_io_kubernetes_pod_name]
    regex: (.+)
    target_label: pod
    replacement: $1
  - source_labels: [container_label_io_kubernetes_pod_namespace]
    regex: (.+)
    target_label: namespace
    replacement: $1
```

### Prometheus — No Lock File

Prometheus uses `strategy: Recreate` and `--storage.tsdb.no-lockfile` because Minikube uses the Docker driver with overlayfs, which does not support file locking.

```yaml
strategy:
  type: Recreate
args:
  - --storage.tsdb.no-lockfile
```

### Grafana Alloy — Kubernetes Log Collection

Alloy uses `loki.source.kubernetes` (not `loki.source.file`) to collect pod logs. The file-based source fails in Kubernetes because Go's `stat()` does not expand glob patterns on filesystem paths like `/var/log/pods/*uuid*/container/*.log`.

`loki.source.kubernetes` uses the Kubernetes API directly to stream logs from all pods.

Alloy RBAC requires `pods/log` permission:

```yaml
resources: ["pods", "pods/log", "nodes", "namespaces", "endpoints"]
verbs: ["get", "list", "watch"]
```

Alloy must also bind to `0.0.0.0` (not `127.0.0.1`) for liveness/readiness probes to work:

```yaml
args:
  - run
  - /etc/alloy/config.alloy
  - --server.http.listen-addr=0.0.0.0:12345
```

### Grafana — Auto-Provisioned via ConfigMaps

All Grafana configuration is provisioned at startup through mounted ConfigMaps:

| ConfigMap                    | Mounted at                                    |
|------------------------------|-----------------------------------------------|
| grafana-datasources          | `/etc/grafana/provisioning/datasources`       |
| grafana-dashboards-config    | `/etc/grafana/provisioning/dashboards`        |
| grafana-alerting             | `/etc/grafana/provisioning/alerting`          |
| grafana-dashboards           | `/var/lib/grafana/dashboards/`                |
| grafana-dashboard-node       | `/var/lib/grafana/dashboards/node-exporter.json` |
| grafana-email-template       | Custom HTML email template for alerts         |
| grafana-user-setup           | `/scripts/grafana-user-setup.sh`              |

---

## Grafana Dashboards

### 1. Container Monitoring Dashboard

Monitors all containers in `weather-app` and `weather-monitoring` namespaces.

Panels:
- Container CPU Usage % (gauge)
- Container Memory Usage % (gauge)
- Container Memory Usage in MB (time series)
- Container Wise Memory Utilization — Used / Limit / Remaining (bar gauge)
- Container wise Used CPU & Remaining CPU (bar gauge)

Variable:
```promql
label_values(
  container_cpu_usage_seconds_total{
    container!="",container!="POD",
    namespace=~"weather-app|weather-monitoring"
  },
  container
)
```

Key PromQL queries:

```promql
# Memory usage % of container limit
(
  container_memory_working_set_bytes{container=~"$container",...}
  /
  container_spec_memory_limit_bytes{container=~"$container",...}
) * 100

# CPU usage %
rate(container_cpu_usage_seconds_total{container=~"$container",...,cpu="total"}[2m]) * 100

# Remaining CPU %
100 - (
  sum(rate(container_cpu_usage_seconds_total{...,cpu="total"}[2m]))
  / count(node_cpu_seconds_total{mode="idle"})
) * 100
```

> `cpu="total"` filter is required — cAdvisor exposes per-core and total CPU counters. Without this filter, values are multiplied by the number of cores.

> `[2m]` window is used instead of `[1m]` — `rate()` requires at least 2 data points within the window. Newly scraped series may not have enough points in a 1-minute window.

### 2. Node Exporter Dashboard

Standard Grafana Node Exporter dashboard (ID: `1860`) monitoring host CPU, memory, disk, and network.

### 3. Logs Dashboard

Real-time pod log streaming from Loki.

Variable:
```logql
label_values({namespace=~".+"}, container)
```

Panel query:
```logql
{container=~"$container"}
```

---

## Alerting System

Grafana alerts are provisioned via `k8s/configmaps/grafana-alerting.yml` using the Grafana alerting API format.

### Alert Rules

| Alert | Condition | Threshold |
|-------|-----------|-----------|
| Container Down Alert | Container not seen | > 120s |
| Container Start Alert | Container running after being down | within 90s |
| Container Wise CPU Alert | Container CPU usage | > 80% for 5m |
| Container Wise Memory Alert | Container memory usage | > 80% for 5m |
| Monitoring Container Down Alert | Monitoring pod not seen | > 120s |
| CPU Alert | Host CPU usage | > 80% for 5m |
| Memory Usage Alert | Host RAM usage | > 80% for 5m |
| Disk Usage Alert | Disk usage at `/` | > 80% for 5m |

### Alert Email Behavior

- Firing and resolved emails are never mixed in the same email
- Multiple containers down in the same evaluation window → one grouped email
- Continuous repeat emails while an alert is still firing
- Custom HTML email template with colored headers (red for firing, green for resolved)

### SMTP Configuration

Gmail SMTP is configured in the Grafana deployment via environment variables (credentials stored in `grafana-secrets`):

```yaml
GF_SMTP_ENABLED: "true"
GF_SMTP_HOST: "smtp.gmail.com:587"
GF_SMTP_SKIP_VERIFY: "true"
```

---

## Useful Commands

### Check pod status

```bash
kubectl get pods -n weather-app
kubectl get pods -n weather-monitoring
```

### View pod logs

```bash
kubectl logs deployment/backend -n weather-app
kubectl logs deployment/grafana -n weather-monitoring
kubectl logs deployment/prometheus -n weather-monitoring
```

### Restart a deployment after config change

```bash
kubectl rollout restart deployment/grafana -n weather-monitoring
kubectl rollout restart deployment/prometheus -n weather-monitoring
```

### Apply a single changed ConfigMap

```bash
kubectl apply -f k8s/configmaps/prometheus-config.yml
kubectl rollout restart deployment/prometheus -n weather-monitoring
```

### Rebuild and redeploy frontend after code change

```bash
eval $(minikube docker-env)
docker build -t samarthfunde45/weather-frontend:latest ./frontend
kubectl rollout restart deployment/frontend -n weather-app
```

### Rebuild and redeploy backend after code change

```bash
eval $(minikube docker-env)
docker build -t samarthfunde45/weather-backend:latest ./backend
kubectl rollout restart deployment/backend -n weather-app
```

### Describe a pod for troubleshooting

```bash
kubectl describe pod <pod-name> -n weather-app
kubectl describe pod <pod-name> -n weather-monitoring
```

### Exec into a pod

```bash
kubectl exec -it deployment/backend -n weather-app -- sh
kubectl exec -it deployment/grafana -n weather-monitoring -- sh
```

### Test the weather API directly

```bash
NODEIP=$(minikube ip)
curl http://$NODEIP:31252/weather/London
```

### Check Prometheus targets

```bash
minikube service prometheus -n weather-monitoring
# Then open: http://<ip>:<port>/targets
```

### Delete and redeploy everything

```bash
# Delete app stack
kubectl delete -f k8s/app/

# Delete monitoring stack
kubectl delete -f k8s/monitoring/

# Reapply
kubectl apply -f k8s/app/
kubectl apply -f k8s/monitoring/
```

---

## Troubleshooting

### Pod stuck in CrashLoopBackOff

```bash
kubectl logs <pod-name> -n <namespace> --previous
kubectl describe pod <pod-name> -n <namespace>
```

### Prometheus lock error on restart

If Prometheus fails with `lock DB directory: resource temporarily unavailable`, ensure `--storage.tsdb.no-lockfile` is set and `strategy: Recreate` is configured (not `RollingUpdate`). This is required on Minikube with the Docker driver because overlayfs does not support file locking.

### cAdvisor shows no container data

Ensure the image is `v0.51.0` or later. Earlier versions fail to register the Docker factory on Docker 29.x:

```
Registration of the docker container factory failed:
client version 1.41 is too old. Minimum supported API version is 1.44
```

Fix: update the image in `k8s/monitoring/cadvisor-daemonset.yml` to `gcr.io/cadvisor/cadvisor:v0.51.0`.

### Alloy logs not appearing in Grafana

Check that the Alloy ClusterRole includes `pods/log`:

```yaml
resources: ["pods", "pods/log", "nodes", "namespaces", "endpoints"]
```

Also verify Alloy is using `loki.source.kubernetes`, not `loki.source.file`.

### Grafana dashboard shows "No data"

- For container metrics: verify cAdvisor is running and Prometheus has `container` labels in its targets
- For CPU bargauge: use `rate(...[2m])` not `rate(...[1m])`
- For memory limit panels: ensure `container_spec_memory_limit_bytes` filter does not include `container_spec_memory_limit_bytes!=0` inside `{}` (this is not valid PromQL — value comparisons must be outside the label selector)

---

## Key Learnings

- Kubernetes pod-to-pod communication uses DNS: `<service>.<namespace>.svc.cluster.local`
- Frontend JavaScript runs in the browser — `localhost` means the user's machine, not any pod. All API calls must use relative URLs and be proxied through nginx
- cAdvisor Docker API version must match the host Docker version — v0.51.0+ required for Docker 29.x
- `rate()` in PromQL needs at least 2 data points — use a longer window (`[2m]`) for freshly scraped metrics
- Label selectors `{}` in PromQL only accept label name/value comparisons — metric name comparisons like `metric_name!=0` inside `{}` are invalid and silently return no data
- `loki.source.file` in Alloy calls OS `stat()` with glob paths — Go does not expand globs in `stat()`, so file discovery fails. `loki.source.kubernetes` uses the K8s API instead and works correctly
- Prometheus on Minikube (Docker driver) requires `--storage.tsdb.no-lockfile` because overlayfs does not support POSIX file locks
- `imagePullPolicy: Never` with `eval $(minikube docker-env)` allows building images directly into Minikube's Docker daemon without pushing to a registry
