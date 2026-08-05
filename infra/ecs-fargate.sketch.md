# ECS Fargate sketch (not Terraform)

Intended AWS layout for Maak ola 2+. Resource names are placeholders.

```
                    Internet
                       |
                   [ ALB ]
                       |
          +------------+------------+
          |                         |
     [ ECS web ]              [ ECS api ]
     (Next standalone)        (same image or
                               split service)
          |                         |
          +------------+------------+
                       |
              [ ECS worker ]
              (outbox, SICLI
               handoff, recheck)
                       |
     +--------+--------+--------+
     |        |        |        |
  [ RDS ]  [ S3 ]  [ Secrets ] [ VPC endpoints ]
  Postgres evidence Manager/SSM
```

## VPC

- Public subnets: ALB
- Private subnets: ECS tasks, RDS
- NAT for egress (adapters, OAuth token, vendor webhooks outbound)
- Security groups: ALB→ECS:3000; ECS→RDS:5432; ECS→S3/Secrets via VPCE or NAT

## ALB

- HTTPS listener (ACM cert)
- Target group → ECS `maak-web` (and optionally `maak-api` if split)
- Health check: `GET /api/health` → 200 `{ ok: true, service: "maak-web" }`

## ECS services

| Service | Role | Notes |
| --- | --- | --- |
| `maak-web` | Next.js standalone (`Dockerfile`) | HOSTNAME `0.0.0.0`, PORT `3000` |
| `maak-api` | Same image or dedicated API process | May start colocated in web until split |
| `maak-worker` | Outbox publisher, Adapter SICLI, recheck stubs | Scale on queue depth later |

Task IAM: read Secrets Manager; read/write S3 evidence prefix; CloudWatch logs.

## RDS

- Postgres 16+ (see `docs/schema/p0_entities.sql`)
- Multi-AZ for prod; single-AZ ok for early ola 2
- Credentials in Secrets Manager; inject as task env / runtime fetch

## S3

- Bucket for `evidence_objects.storage_uri`
- Block public access; signed URLs or private VPC access only
- Lifecycle rules TBD (retention / legal hold)

## Secrets / config

| Secret / env | Purpose |
| --- | --- |
| `SITE_PASSWORD` / `SESSION_SECRET` | Prototype gate (may retire) |
| DB URL | RDS |
| OAuth client credentials | API machine auth |
| `FACE_BINDING` | Face adapter selection (`stub` default) |
| `SICLI_ADAPTER` | SICLI adapter selection (`stub` default) |
| Vendor keys | Only inside face/sicli adapter runtime |

## Out of scope for this sketch

- Full Terraform/CDK
- EKS (see ADR-003)
- SPEI / CLABE / Account services (not Maak)
- Production FaceTec/Onfido wiring (port only; stub default)
