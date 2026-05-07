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
  
* Container Wise CPU usage: sum(rate(container_cpu_usage_seconds_total{
                                      container_label_com_docker_compose_service=~"$container"
                                     }[1m])) * 100

---

# 9. Memory Monitoring Queries

Implemented:

* Container memory usage in MiB
* Memory percentage utilization

Used:

* `container_memory_usage_bytes`
* `container_spec_memory_limit_bytes`

* Container Wise Memory Usage: (
                                container_memory_working_set_bytes{container_label_com_docker_compose_service=~"$container"}
                                /
                                container_spec_memory_limit_bytes{container_label_com_docker_compose_service=~"$container"}
                                ) * 100

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

# Current Automation Status

## Already Automated

* Dockerized infrastructure
* Monitoring stack deployment
* Metrics collection
* Log collection
* SMTP configuration
* Multi-container monitoring

---

# Future Improvements

## 1. Grafana Provisioning Automation

Planned implementation:

* Automatic datasource provisioning
* Automatic dashboard provisioning
* Dashboard restoration after volume deletion
* Infrastructure-as-Code approach

---

## 2. Alerting System

Planned implementation:

* CPU alerts
* Memory alerts
* Container down alerts
* Email notifications
* Grafana alert rules

---

# Key Learnings

This project helped in understanding:

* Docker monitoring
* Prometheus metrics
* PromQL queries
* Grafana dashboard creation
* Loki log aggregation
* Container observability
* Monitoring architecture
* SMTP integration
* Multi-user Grafana management
* Infrastructure monitoring

---

# Project Objective

The main objective of this project is to build a production-style observability stack for monitoring Dockerized applications with:

* Metrics monitoring
* Log aggregation
* Dashboard visualization
* Resource monitoring
* User access management
* Future automation support

---

# Future Goal

The future goal is to make the entire monitoring stack fully automated so that after running:

```bash
docker-compose down -v
docker-compose up -d
```

all dashboards, datasources, alerts, and monitoring configurations are recreated automatically without manual setup.
