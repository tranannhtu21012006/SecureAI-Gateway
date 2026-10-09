# SecureAI Gateway

**A self-hosted API gateway that sits between your users/apps and LLM providers.**
Instead of handing out real OpenAI or Gemini keys, you issue gateway-owned API keys. The gateway authenticates every request, enforces rate limits, scans prompts, caches responses, tracks usage and cost, and only then calls the provider with your real key.

> **Status:** 🚧 In active development. Core gateway features are working; see the [Roadmap](#roadmap) for what is next.

![SecureAI Gateway demo](docs/images/gif1.gif)

---

## Why this exists

Letting every teammate or app call LLM providers directly causes three problems:

| Problem | How the gateway addresses it |
|---|---|
| **Leaked provider keys and surprise bills** | Clients only ever see gateway keys. Real provider keys stay on the server. Gateway keys can be revoked or rate-limited individually. |
| **No visibility** | Every request is logged with model, provider, token counts, latency, and cost. |
| **Risky or wasteful prompts** | Prompts are scanned before leaving your network, and repeated questions are served from cache. |

---

## Features

**Gateway core**
- **OpenAI-compatible API** (`/api/v1/chat/completions`): a drop-in replacement. Change the `base_url` and keep your existing OpenAI SDK code.
- **Multi-provider routing** to OpenAI, Google Gemini, and local Ollama models.
- **Streaming** responses via Server-Sent Events (SSE).

**Security and access control**
- **JWT authentication** with role-based access control (`admin` / `user`).
- **Gateway API keys**: create, revoke, and set per-key limits. Keys are stored hashed in the database.
- **Prompt Guard**: scans prompts before they are sent upstream and rejects malicious content with HTTP 400.
- **Rate limiting** per API key using a Redis-backed **Token Bucket**.

**Performance and cost**
- **Response caching** in Redis: repeated prompts return immediately without calling the provider.
- **Usage logs**: model, provider, prompt/completion tokens, latency, and cost for every request.

**Web console** (React + TypeScript)
- Landing page with a guided onboarding wizard
- Dashboard with request, cost, and latency charts
- API key management
- Request Logs viewer
- Model Arena: stream two models side by side to compare speed and answer quality

---

## Architecture

```mermaid
flowchart TD
    User([User / API Client]) --> Ingress(Ingress / NGINX)
    Ingress --> Frontend(Frontend - React)
    Ingress --> Backend(Backend - FastAPI)
    Backend --> Redis[(Redis: Cache + Rate Limiting)]
    Backend --> DB[(PostgreSQL)]
    Backend --> LLMs(External LLM APIs - OpenAI / Gemini / Ollama)
```

### Request lifecycle

1. The client sends a request to the gateway with a **gateway API key**.
2. **Auth and rate limit**: the key is validated and checked against its Token Bucket in Redis.
3. **Prompt Guard** scans the prompt; unsafe prompts get HTTP 400.
4. **Cache lookup**: on a hit, the stored response is returned immediately.
5. **Routing**: the request is translated to the target provider's format and sent with the server-side provider key.
6. **Logging**: tokens, latency, and cost are written to PostgreSQL.
7. The response is returned to the client (streamed if requested).

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI (async), SQLAlchemy 2.0 + asyncpg |
| Data | PostgreSQL, Redis |
| Frontend | React (Vite), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts |
| LLM providers | OpenAI, Google Gemini, Ollama (local) |
| DevOps | Docker, Docker Compose, Kubernetes (k3d / k3s), Helm, NGINX Ingress, Make |

---

## Getting started

### Option 1: Local development (Docker Compose)

```bash
cp .env.example .env     # then fill in your provider keys and secrets
make dev
```

- Frontend: <http://localhost:5173>
- Backend API docs (Swagger): <http://localhost:8000/docs>

### Option 2: Kubernetes (k3d + Helm)

Requires [`k3d`](https://k3d.io), `kubectl`, and Docker.

```bash
make deploy              # wraps setup-k3d.sh: creates the cluster and installs the Helm chart
```

- App: <http://localhost:8080>

The Helm chart in [`chart/`](./chart) manages configuration, secrets, and the deployment of all components.

---

## Usage

Create a gateway API key in the console, then point any OpenAI-compatible client at the gateway.

**Python (OpenAI SDK)**

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/api/v1",   # the gateway, not api.openai.com
    api_key="YOUR_GATEWAY_API_KEY",
)

response = client.chat.completions.create(
    model="gpt-4o",                            # or a Gemini / Ollama model name
    messages=[{"role": "user", "content": "Explain Kubernetes in one sentence."}],
)
print(response.choices[0].message.content)
```

**cURL**

```bash
curl http://localhost:8000/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_GATEWAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Hello!"}],
        "stream": false
      }'
```

---

## API overview

Full interactive documentation is served at `/docs` when the backend is running.

| Area | Prefix |
|---|---|
| Authentication | `/api/v1/auth` |
| Chat (LLM proxy) | `/api/v1/chat` |
| Analytics | `/api/v1/analytics` |
| Admin | `/api/v1/admin` |

---

## Project structure

```
.
├── backend/                 # FastAPI app: routing, auth, rate limiting, logging
├── frontend/                # React console (Vite + TypeScript)
├── chart/                   # Helm chart for Kubernetes deployment
├── docker-compose.yml       # Local development stack
├── docker-compose.prod.yml  # Production-style compose stack
├── setup-k3d.sh             # One-command k3d cluster + deploy script
├── Makefile                 # make dev / make deploy
├── .env.example             # Environment variable template
├── SPEC.md                  # Design specification
└── improve.md               # Planned improvements
```

---

## Security notes

- Provider keys live only in server-side configuration (`.env` locally, Kubernetes Secrets in the cluster). **Never commit `.env`.**
- Gateway API keys are stored as hashes; the plaintext key is shown only once at creation.
- Authentication uses JWT bearer tokens with role checks on admin routes.

---

## Roadmap

- [ ] **Budget limits**: automatically block a key when its monthly spend cap is reached
- [ ] **Provider health monitor** and **circuit breaker** with automatic fallback to another provider
- [ ] CI/CD pipeline for build, test, and deploy
- [ ] Interactive API docs with the user's key pre-filled in code samples
- [ ] Prompt library with `{{variable}}` templates
- [ ] Webhook alerts (Slack / Discord) for errors and budget thresholds

---

## Author

**Tran Anh Tu**: IT student at the University of Economics Ho Chi Minh City (UEH), focused on DevOps and AI operations.

- Portfolio: <https://myportfolio-billy.vercel.app>
- LinkedIn: <https://www.linkedin.com/in/billytran201/>
- GitHub: [@tranannhtu21012006](https://github.com/tranannhtu21012006)
