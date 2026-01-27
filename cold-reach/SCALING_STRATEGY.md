# Production Scaling Strategy, Design & Implementation Guide

This document is the definitive guide for engineering, hosting, and scaling Cold Reach. It includes architectural trade-offs, step-by-step guides for interns, and "LLM-Ready" specifications for automated code generation.

---

# Part 1: Design Decisions & Trade-offs
Before implementing, understanding the *why* is crucial.

## 1. Database: Relational vs. NoSQL
| Feature | **PostgreSQL (Selected)** | MongoDB |
|:---|:---|:---|
| **Data Structure** | Structured (Clients have specific fields like email, name). | Flexible JSON documents. |
| **Relationships** | Strong foreign keys (Tasks belong to Clients). | Embedding or manual references. |
| **Consistency** | ACID compliant (Critical for financial/business data). | Eventual consistency options. |
| **Trade-off** | **Pros**: Data integrity, complex joins (analytics). <br>**Cons**: Harder to scale horizontally (sharding is complex). | **Pros**: Easy horizontal scaling. <br>**Cons**: Weaker data integrity guarantees. |
| **Decision** | **PostgreSQL**. Client data is highly structured, and strong consistency is required for email status tracking to prevent double-sending.

## 2. Async Queue: Redis vs. RabbitMQ vs. Kafka
| Feature | **Redis (Phase 1/2)** | RabbitMQ | Kafka (Phase 3) |
|:---|:---|:---|:---|
| **Pattern** | Simple Pub/Sub or List push/pop. | Complex routing (AMQP). | Log-based streaming. |
| **Persistence** | In-memory (Risk of data loss on crash). | Disk-based (Durable). | Disk-based (Durable, Replayable). |
| **Throughput** | High (for simple tasks). | Medium/High. | Extremely High (Millions/sec). |
| **Decision** | **Redis** for Phase 2 (Simple, fast setup). **Kafka** for Phase 3 (Event sourcing, analytics pipeline).

## 3. Compute: PaaS vs. K8s
| Feature | **PaaS (Render/Railway)** | **Kubernetes (EKS)** |
|:---|:---|:---|
| **Complexity** | Low. "Push to Deploy". | High. Manage control plane, nodes, networking. |
| **Cost** | Higher per CPU cycle. | Lower at scale (Spot instances). |
| **Control** | Limited. | Full control over networking/resources. |
| **Decision** | **PaaS** for Phase 1/2 to minimize ops overhead. **K8s** for Phase 3 when cost optimization and complex microservices orchestration become critical.

---

# Part 2: Implementation Roadmap (Phase by Phase)

## 🟢 Phase 1: MVP (Support ~1,000 Users)
**Architecture**: Monolithic codebase, PaaS hosting, Single DB.

### 👷 Intern's Setup Guide
1.  **Repo**: Clone `cold-reach`.
2.  **Database**:
    *   Go to [Supabase](https://supabase.com) -> New Project.
    *   Get `DATABASE_URL`.
    *   Update `default_api_impl.py` to use `SQLAlchemy` instead of the in-memory list.
3.  **Backend**:
    *   Deploy to [Render](https://render.com).
    *   Set build command: `pip install -r requirements.txt`.
    *   Set start command: `uvicorn openapi_server.main:app --host 0.0.0.0 --port $PORT`.
4.  **Frontend**:
    *   Deploy to [Vercel](https://vercel.com).
    *   Add env var `NEXT_PUBLIC_API_BASE_URL` pointing to Render URL.

---

## 🟡 Phase 2: Growth (Support ~10,000 Users)
**Trigger**: Email sending times out, uploads freeze server.
**Architecture**: Service + Worker separation, Redis Queue, Read Replicas.

### 🤖 LLM Implementation Spec: "Migrate to Async Workers"
*Copy-paste this prompt to an AI to generate the module:*

> **Prompt**: "Refactor a FastAPI backend to use Celery for background tasks.
> 1.  **Context**: Current app sends emails synchronously in the API route, blocking the thread.
> 2.  **Requirement**: Create a `worker.py` file using Celery with Redis as the broker.
> 3.  **Task**: Define `send_email_task(recipient_id, subject, body)`. It should simulate sending (sleep 1s) and update the DB status.
> 4.  **API Change**: Update `POST /email/send` in `default_api_impl.py` to call `send_email_task.delay()` instead of processing immediately. Return 202 Accepted.
> 5.  **Docker**: Provide a `docker-compose.yml` that runs `web` (FastAPI), `worker` (Celery), and `redis`."

### 🤖 LLM Implementation Spec: "Infrastructure as Code"
> **Prompt**: "Generate Terraform code for AWS.
> 1.  **Resources**: ECS Fargate Cluster, RDS PostgreSQL (db.t3.medium) with 1 Read Replica, ElastiCache Redis (cache.t3.micro).
> 2.  **Networking**: VPC with Public Subnets for ALB, Private Subnets for ECS/RDS.
> 3.  **Security**: RDS allows access only from ECS Security Group."

---

## 🔴 Phase 3: Scale (Support ~100,000+ Users)
**Trigger**: Postgres connection limit hit, team size > 10 devs (merge conflicts).
**Architecture**: Microservices, Sharding, Kafka, Kubernetes.

### 🤖 LLM Implementation Spec: "Microservices Split"
> **Prompt**: "Split a monolithic FastAPI app into microservices using gRPC.
> 1.  **Service A (Client Service)**: Manages CRUD for Clients.
> 2.  **Service B (Campaign Service)**: Manages Tasks and Email Sending.
> 3.  **Communication**: Define a `clients.proto` file.
>     - `rpc GetClient(ClientId) returns (Client)`
> 4.  **Implementation**:
>     - Generate Python gRPC code.
>     - In Campaign Service, when creating a Task, call `GetClient` via gRPC to validate the user exists."

### 🤖 LLM Implementation Spec: "Database Sharding"
> **Prompt**: "Implement Application-Level Sharding in Python SQLAlchemy.
> 1.  **Config**: Define two DB URIs: `DB_SHARD_1` and `DB_SHARD_2`.
> 2.  **Router**: Create a function `get_db_session(client_id)`.
>     - Hash `client_id`. If even -> return Session(DB_SHARD_1).
>     - If odd -> return Session(DB_SHARD_2).
> 3.  **Migration Script**: Write a script to iterate checking all rows in a source DB and copy them to the correct shard based on the ID hash."

---

# Part 3: Infrastructure Checklist Summary

| Component | Phase 1 (MVP) | Phase 2 (Growth) | Phase 3 (Scale) |
|:---|:---|:---|:---|
| **Hosting** | Vercel + Render | AWS ECS / DigitalOcean | AWS EKS (Kubernetes) |
| **Database** | Shared Postgres | Dedicated Postgres + Read Replica | Sharded / Distributed SQL |
| **Async Tasks** | In-memory | Redis + Celery | Apache Kafka |
| **Email Sending** | Direct API Call | Background Worker | Distributed Worker Fleet |
| **Monitoring** | App Logs | Datadog / New Relic | Distributed Tracing (Jaeger) |
