# Infra (ola 2 sketch)

Maak production target is **AWS ECS Fargate** (web + api + worker), not Vercel for the full stack.

| Surface | Ola 1 (now) | Ola 2+ (intended) |
| --- | --- | --- |
| Prototype UI | Vercel | Optional / retired |
| App + API | — | ECS Fargate behind ALB |
| Async work | — | ECS worker (outbox, adapters) |
| Data | In-memory mock | RDS Postgres |
| Evidence blobs | — | S3 |
| Secrets | Vercel env | Secrets Manager / SSM |

See [`ecs-fargate.sketch.md`](./ecs-fargate.sketch.md) for the intended resource layout.

**Not in this repo yet:** Terraform/CDK modules. Treat sketches as planning only until infra PRs land.

## Local / CI Docker

```bash
docker build -t maak-web .
docker run --rm -p 3000:3000 \
  -e SITE_PASSWORD=dev \
  -e SESSION_SECRET=dev-session-secret-at-least-32-chars \
  maak-web
```

Health check: `GET /api/health` (public; no login).
