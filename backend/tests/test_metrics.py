import pytest
from fastapi.testclient import TestClient
from prometheus_client import REGISTRY

from app.main import app
from app.metrics import (
    gateway_llm_cost_dollars_total,
    gateway_llm_latency_seconds,
    gateway_llm_requests_total,
    gateway_llm_tokens_total,
    record_llm_cost,
    record_llm_latency,
    record_llm_request,
    record_llm_tokens,
)


def test_metrics_helpers_and_registration():
    # Record test metrics
    record_llm_request(provider="test_provider", model="test_model", status="success")
    record_llm_latency(provider="test_provider", model="test_model", latency_ms=500)
    record_llm_tokens(
        provider="test_provider",
        model="test_model",
        prompt_tokens=42,
        completion_tokens=18,
    )
    record_llm_cost(provider="test_provider", model="test_model", cost=0.0012)

    # Verify requests counter
    request_val = gateway_llm_requests_total.labels(
        provider="test_provider", model="test_model", status="success"
    )._value.get()
    assert request_val >= 1.0

    # Verify tokens counter
    prompt_tokens = gateway_llm_tokens_total.labels(
        provider="test_provider", model="test_model", type="prompt"
    )._value.get()
    assert prompt_tokens >= 42.0

    completion_tokens = gateway_llm_tokens_total.labels(
        provider="test_provider", model="test_model", type="completion"
    )._value.get()
    assert completion_tokens >= 18.0

    # Verify cost counter
    cost_val = gateway_llm_cost_dollars_total.labels(
        provider="test_provider", model="test_model"
    )._value.get()
    assert cost_val >= 0.0012

    # Verify latency histogram sum
    latency_sum = gateway_llm_latency_seconds.labels(
        provider="test_provider", model="test_model"
    )._sum.get()
    assert latency_sum >= 0.5


def test_metrics_endpoint():
    client = TestClient(app)
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "gateway_llm_requests_total" in response.text
    assert "gateway_llm_latency_seconds_bucket" in response.text
    assert "gateway_llm_tokens_total" in response.text
    assert "gateway_llm_cost_dollars_total" in response.text
