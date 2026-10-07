import pytest
from httpx import AsyncClient

@pytest.fixture
def anyio_backend():
    return 'asyncio'

# Other generic fixtures can go here, but depending on Agent 2's structure
# we keep it simple to pass our own tests.
