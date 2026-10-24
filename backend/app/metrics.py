"""Prometheus metrics definitions and helper functions for SecureAI Gateway."""

import logging
from prometheus_client import Counter, Histogram

logger = logging.getLogger(__name__)

# LLM Gateway Metrics Definitions
gateway_llm_requests_total = Counter(
    "gateway_llm_requests_total",
    "Total count of LLM requests processed by the gateway",
    labelnames=["provider", "model", "status"],
)

gateway_llm_latency_seconds = Histogram(
    "gateway_llm_latency_seconds",
    "Latency of LLM requests in seconds",
    labelnames=["provider", "model"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0],
)

gateway_llm_tokens_total = Counter(
    "gateway_llm_tokens_total",
    "Total number of LLM tokens processed",
    labelnames=["provider", "model", "type"],
)

gateway_llm_cost_dollars_total = Counter(
    "gateway_llm_cost_dollars_total",
    "Total estimated cost of LLM requests in dollars",
    labelnames=["provider", "model"],
)


def record_llm_request(provider: str, model: str, status: str) -> None:
    """Record an LLM request metric with provider, model, and status."""
    try:
        p = provider or "unknown"
        m = model or "unknown"
        s = status or "unknown"
        gateway_llm_requests_total.labels(provider=p, model=m, status=s).inc()
    except Exception as exc:
        logger.warning("Failed to record gateway_llm_requests_total metric: %s", exc)


def record_llm_latency(provider: str, model: str, latency_ms: int) -> None:
    """Record LLM latency converted from milliseconds to seconds."""
    try:
        p = provider or "unknown"
        m = model or "unknown"
        latency_seconds = max(0.0, float(latency_ms) / 1000.0)
        gateway_llm_latency_seconds.labels(provider=p, model=m).observe(latency_seconds)
    except Exception as exc:
        logger.warning("Failed to record gateway_llm_latency_seconds metric: %s", exc)


def record_llm_tokens(
    provider: str, model: str, prompt_tokens: int, completion_tokens: int
) -> None:
    """Record token counts for prompt and completion."""
    try:
        p = provider or "unknown"
        m = model or "unknown"
        if prompt_tokens and prompt_tokens > 0:
            gateway_llm_tokens_total.labels(provider=p, model=m, type="prompt").inc(prompt_tokens)
        if completion_tokens and completion_tokens > 0:
            gateway_llm_tokens_total.labels(provider=p, model=m, type="completion").inc(completion_tokens)
    except Exception as exc:
        logger.warning("Failed to record gateway_llm_tokens_total metric: %s", exc)


def record_llm_cost(provider: str, model: str, cost: float) -> None:
    """Record estimated cost in dollars."""
    try:
        p = provider or "unknown"
        m = model or "unknown"
        if cost and cost > 0:
            gateway_llm_cost_dollars_total.labels(provider=p, model=m).inc(cost)
    except Exception as exc:
        logger.warning("Failed to record gateway_llm_cost_dollars_total metric: %s", exc)
