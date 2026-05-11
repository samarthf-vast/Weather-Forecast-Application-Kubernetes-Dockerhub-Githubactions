# Weather Forecast Application Grafana Monitoring Task

## Project Overview

This project implements a complete monitoring and logging solution for a Dockerized Weather Forecast Application using Prometheus, Grafana, Loki, Promtail, cAdvisor, and Node Exporter.

The goal of this project is to monitor:

* Container CPU usage
* Container Memory usage
* Host system metrics
* Docker container logs
* Real-time infrastructure monitoring
* Centralized log aggregation

The monitoring stack is fully containerized using Docker Compose.

---

# Technologies Used

| Tool            | Purpose                      |
| --------------- | ---------------------------- |
| Docker Compose  | Container orchestration      |
| Prometheus      | Metrics collection           |
| Grafana         | Visualization and dashboards |
| Loki            | Centralized log aggregation  |
| Promtail        | Log collection agent         |
| cAdvisor        | Container metrics exporter   |
| Node Exporter   | Host system metrics exporter |
| MongoDB         | Application database         |
| Nginx           | Reverse proxy                |
| React Frontend  | Frontend application         |
| Node.js Backend | Backend API                  |

---

# Monitoring Architecture

```plaintext
Docker Containers
        ↓
     cAdvisor
        ↓
   Prometheus
        ↓
     Grafana

Docker Logs
        ↓
    Promtail
        ↓
       Loki
        ↓
     Grafana

```

---

# Implemented Monitoring Features

## 1. Container Monitoring Dashboard

Implemented custom Grafana dashboard for:

* Container CPU utilization
* Container Memory utilization
* CPU core usage
* Memory usage in MiB
* CPU percentage usage
* Container-wise filtering
* Real-time monitoring

Implemented Grafana variables using:

* `container_label_com_docker_compose_service`
* `container_name_clean`

Used PromQL queries for:

* CPU usage percentage
* Memory usage percentage
* Total CPU usage
* Available CPU
* Container-wise metrics

  <img width="1266" height="683" alt="image" src="https://github.com/user-attachments/assets/60900d04-79e0-4916-aeee-8ee8dd9daf37" />

---

# 2. Node Exporter Dashboard

Integrated Node Exporter for host-level monitoring.

Monitored:

* Total CPU usage
* Memory usage
* Disk utilization
* Network traffic
* System load
* System uptime

Used official Grafana Node Exporter dashboard.

<img width="1266" height="683" alt="image" src="https://github.com/user-attachments/assets/0f9f0aef-9f73-4622-af1a-a1bc1ac24faa" />


---

# 3. Centralized Logging Dashboard

Integrated Loki + Promtail for centralized logging.

Implemented:

* Container-wise log filtering
* Dynamic container variables
* Real-time log streaming
* Docker log aggregation
* Log querying in Grafana

Used labels:

* `container_name`
* `container_name_clean`
* `job="docker"`

 <img width="1266" height="683" alt="image" src="https://github.com/user-attachments/assets/1bf1044f-caad-4a02-b0f1-58833e2636df" />


---

# 4. SMTP Email Configuration

Configured Grafana SMTP using Gmail SMTP server for:

* User invitations
* Email notifications
* Dashboard sharing

Configured:

* SMTP host
* SMTP authentication
* Root URL
* Domain configuration

---

# 5. Multi-User Grafana Access

Implemented:

* Viewer role access
* Dashboard permissions
* User invitation system
* Organization access management

  <img width="1266" height="683" alt="image" src="https://github.com/user-attachments/assets/4e1c18fd-f3e5-4bc3-ac6e-03b961d0d9d1" />

  ---
  
  <img width="1286" height="349" alt="image" src="https://github.com/user-attachments/assets/71bd36ee-9107-464c-b721-9dbdec883f33" />

  ---

  <img width="1286" height="364" alt="image" src="https://github.com/user-attachments/assets/a787ec1d-6e91-458b-bce6-b1c5f2944269" />

  ---

  <img width="1286" height="491" alt="image" src="https://github.com/user-attachments/assets/2347a2e1-6085-4651-affc-e74c29c1bcc5" />


---

# 6. Docker Resource Limits

Configured memory limits for containers using:

```yaml
mem_limit: 512m
```

Monitored actual container resource utilization using Docker metrics.

---

# 7. Custom Grafana Variables

Implemented dynamic Grafana variables for:

* Container selection
* Logs filtering
* CPU filtering
* Memory filtering

Used:

```promql
label_values(container_memory_usage_bytes, container_label_com_docker_compose_service)
```

<img width="1010" height="314" alt="image" src="https://github.com/user-attachments/assets/c77a7a78-93e2-419c-8a4c-9ef8c623122a" />


---

# 8. CPU Monitoring Queries

Implemented:

* Container CPU percentage
* Total CPU usage
* Available CPU percentage

Used PromQL queries with:

* `container_cpu_usage_seconds_total`
* `rate()`
* `sum()`
* `count()`
  
* Container Wise CPU usage: `sum(rate(container_cpu_usage_seconds_total{
                                      container_label_com_docker_compose_service=~"$container"
                                     }[1m])) * 100`

---

# 9. Memory Monitoring Queries

Implemented:

* Container memory usage in MiB
* Memory percentage utilization

Used:

* `container_memory_usage_bytes`
* `container_spec_memory_limit_bytes`

* Container Wise Memory Usage: `(
                                container_memory_working_set_bytes{container_label_com_docker_compose_service=~"$container"}
                                /
                                container_spec_memory_limit_bytes{container_label_com_docker_compose_service=~"$container"}
                                ) * 100`

---

# 10. Docker Compose Monitoring Stack

Integrated services:

* Backend
* Frontend
* MongoDB
* Nginx
* Prometheus
* Grafana
* Loki
* Promtail
* cAdvisor
* Node Exporter

---


# 11. Grafana Provisioning and Dashboard Backup Automation

Implemented Grafana provisioning for:

* Automatic datasource creation
* Automatic dashboard restoration
* Automatic alert provisioning
* Persistent monitoring configuration
* Dashboard backup using Grafana HTTP API
* Infrastructure-as-Code approach

This implementation ensures that after deleting Grafana volumes and restarting containers, all dashboards, datasources, and alerts are recreated automatically.

---

# Provisioning Folder Structure

```plaintext
grafana/
├── dashboards/
│   ├── container-monitoring.json
│   ├── logs-dashboard.json
│   └── node-exporter.json
│
└── provisioning/
    ├── dashboards/
    │   └── dashboard.yml
    │
    ├── datasources/
    │   └── datasource.yml
    │
    └── alerting/
        ├── alert-rules.yaml
        └── contact-points.yaml
        └── notification-policies.yaml
```

---

# Dashboard Provisioning Configuration

Created:

```yaml
grafana/provisioning/dashboards/dashboard.yml
```

```yaml
apiVersion: 1

providers:
  - name: Infrastructure
    orgId: 1
    folder: Infrastructure
    type: file
    disableDeletion: false
    editable: true
    updateIntervalSeconds: 10

    options:
      path: /etc/grafana/provisioning/dashboards/json
```

This configuration automatically loads all dashboard JSON files from:

```plaintext
/etc/grafana/provisioning/dashboards/json
```

inside the Grafana container.

---

# Datasource Provisioning

Created:

```yaml
grafana/provisioning/datasources/datasource.yml
```

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    uid: prometheus
    type: prometheus
    access: proxy
    url: ${PROMETHEUS_URL}
    isDefault: true

  - name: Loki
    uid: loki
    type: loki
    access: proxy
    url: ${LOKI_URL}
```

Configured datasource URLs using environment variables.

---

# Environment Variable Configuration

Configured Grafana SMTP and datasource variables inside:

```plaintext
.env
```
---

# Docker Compose Configuration for Grafana

Configured Grafana volumes and provisioning mount points:

```yaml
grafana:
  image: grafana/grafana
  container_name: grafana

  ports:
    - "3001:3000"

  env_file:
    - .env

  environment:
    - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER}
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}

    # SMTP SETTINGS
    - GF_SMTP_ENABLED=${GF_SMTP_ENABLED}
    - GF_SMTP_HOST=${GF_SMTP_HOST}
    - GF_SMTP_USER=${GF_SMTP_USER}
    - GF_SMTP_PASSWORD=${GF_SMTP_PASSWORD}
    - GF_SMTP_FROM_ADDRESS=${GF_SMTP_FROM_ADDRESS}
    - GF_SERVER_ROOT_URL=${GF_SERVER_ROOT_URL}
    - GF_SERVER_DOMAIN=${GF_SERVER_DOMAIN}
    - GF_SMTP_FROM_NAME=${GF_SMTP_FROM_NAME}
    - GF_SMTP_SKIP_VERIFY=${GF_SMTP_SKIP_VERIFY}

  restart: always

  mem_limit: 512m

  volumes:
    - grafana_data:/var/lib/grafana
    - ./grafana/provisioning:/etc/grafana/provisioning
    - ./grafana/dashboards:/etc/grafana/provisioning/dashboards/json
```

---

# Dashboard Backup Process

Implemented dashboard backup using Grafana HTTP API and `jq`.

Exported dashboards directly from Grafana using dashboard UID.

---

## Export Container Monitoring Dashboard

```bash
curl -s -u admin:samarth \
http://localhost:3001/api/dashboards/uid/adnbqw4 \
| jq '.dashboard | .id=null | .version=null' \
> grafana/dashboards/container-monitoring.json
```

---

## Export Logs Dashboard

```bash
curl -s -u admin:samarth \
http://localhost:3001/api/dashboards/uid/ad8brcf \
| jq '.dashboard | .id=null | .version=null' \
> grafana/dashboards/logs-dashboard.json
```

---

## Export Node Exporter Dashboard

```bash
curl -s -u admin:samarth \
http://localhost:3001/api/dashboards/uid/rYdddlPWk \
| jq '.dashboard | .id=null | .version=null' \
> grafana/dashboards/node-exporter.json
```

---

# JSON Validation

Validated exported dashboard JSON files using:

```bash
jq . grafana/dashboards/container-monitoring.json
```

If no error appears, the dashboard JSON is valid.

---

# Alerting System Implementation

Implemented Grafana alert provisioning for:

* CPU alerts
* Memory alerts
* Disk usage alerts
* Container down alerts
* Container-wise CPU alerts
* Container-wise memory alerts

Created:

```yaml
grafana/provisioning/alerting/alert-rules.yaml
```

Implemented PromQL-based alert rules.

---

# Configured Alert Queries

## CPU Usage Alert

```promql
100 - (avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

---

## Container Down Alert

```promql
time() - container_last_seen{name!=""} > 30
```

---

## Container Wise CPU Alert

```promql
sum(rate(container_cpu_usage_seconds_total{name!=""}[1m])) by (name) * 100
```

---

## Container Wise Memory Alert

```promql
(
container_memory_usage_bytes{name!=""}
/
container_spec_memory_limit_bytes{name!=""}
) * 100
```

---

## Disk Usage Alert

```promql
100 - (
(node_filesystem_avail_bytes{mountpoint="/"} * 100)
/
node_filesystem_size_bytes{mountpoint="/"}
)
```

---

## Memory Usage Alert

```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

---

# Contact Point Configuration

Created:

```yaml
grafana/provisioning/alerting/contact-points.yaml
```

```yaml
apiVersion: 1

contactPoints:
  - orgId: 1
    name: email-alert

    receivers:
      - uid: email1
        type: email

        settings:
          addresses: ${GMAIL}
```

Configured Gmail SMTP notifications for Grafana alerts.

---

# Dashboard Recovery Testing

Tested complete monitoring stack recovery using:

```bash
docker-compose down -v
docker-compose up -d
```

Verified automatic restoration of:

* Dashboards
* Datasources
* Alert rules
* Contact points
* Folder structure
* Monitoring configurations

without manual recreation.

---

# Volume Backup Process

Created Grafana volume backup using tar archive.

## Backup Grafana Volume

```bash
docker run --rm \
-v grafana_data:/source \
-v $(pwd):/backup \
alpine \
tar czf /backup/grafana-backup.tar.gz -C /source .
```

---

## Restore Grafana Volume

```bash
docker run --rm \
-v grafana_data:/target \
-v $(pwd):/backup \
alpine \
sh -c "cd /target && tar xzf /backup/grafana-backup.tar.gz"
```

This backup preserves:

* Dashboards
* Users
* Alert history
* Organizations
* Grafana database
* Settings

---

# Container Monitoring Dashboard Features

Implemented:

* Container-wise CPU monitoring
* Container-wise memory monitoring
* Total CPU utilization
* Remaining CPU
* Total memory usage
* Available memory
* Container filtering

Used Grafana variables:

```promql
label_values(container_memory_usage_bytes,container_label_com_docker_compose_service)
```

---

# Logging Dashboard Features

Implemented centralized logging using Loki and Promtail.

Used variable query:

```logql
{job="docker"}
```

Used panel query:

```logql
{job="docker", container_name_clean="$container"}
```

Implemented:

* Dynamic container selection
* Real-time log streaming
* Container-wise log filtering

---

# Infrastructure Monitoring Components

Integrated:

* Prometheus
* Grafana
* Loki
* Promtail
* cAdvisor
* Node Exporter

Monitored:

* Docker containers
* Host machine resources
* Container logs
* System metrics
* Resource utilization

---


# Key Learnings

This project helped in understanding:

* Docker monitoring and container observability
* Prometheus metrics collection
* PromQL query writing and optimization
* Grafana dashboard creation and visualization
* Loki centralized log aggregation
* Promtail log shipping
* cAdvisor container metrics monitoring
* Node Exporter host-level monitoring
* Docker resource management
* Grafana SMTP configuration
* Multi-user Grafana access management
* Grafana alerting system
* Grafana provisioning automation
* Dashboard backup and restoration
* Grafana dashboard JSON structure
* Infrastructure-as-Code concepts
* Docker volume backup and recovery
* Grafana HTTP API usage
* jq command usage for JSON processing
* End-to-end monitoring architecture design

---


# Final Outcome

Successfully built a production-style Docker monitoring and observability stack with:

* Metrics monitoring
* Centralized logging
* Alerting system
* Email notifications
* Dashboard provisioning
* Backup and recovery
* Multi-container monitoring
* Infrastructure automation

The monitoring stack is now capable of fully restoring dashboards, datasources, and alerts automatically after container or volume deletion.




---

# Reference Taken

https://oneuptime.com/blog/post/2026-01-30-grafana-provisioning-automation/view

---
