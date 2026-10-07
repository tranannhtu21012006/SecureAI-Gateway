#!/bin/bash
set -e

CLUSTER_NAME="secureai-gateway"
NAMESPACE="secureai-gateway"
RELEASE_NAME="secureai-release"

echo "Checking k3d cluster..."
if k3d cluster list | grep -q "^${CLUSTER_NAME}"; then
    echo "Cluster already exists. Skipping creation."
else
    echo "Creating k3d cluster..."
    k3d cluster create ${CLUSTER_NAME} -p "8080:80@loadbalancer"
fi

echo "Building backend image..."
docker build -t secureai-gateway-backend:latest -f backend/Dockerfile --target production .

echo "Building frontend image..."
docker build -t secureai-gateway-frontend:latest -f frontend/Dockerfile --target production .

echo "Importing images to k3d..."
k3d image import secureai-gateway-backend:latest -c ${CLUSTER_NAME}
k3d image import secureai-gateway-frontend:latest -c ${CLUSTER_NAME}

echo "Deploying via Helm..."
helm upgrade --install ${RELEASE_NAME} ./chart \
    --namespace ${NAMESPACE} \
    --create-namespace

echo "Waiting for deployments..."
kubectl rollout status deployment/backend -n ${NAMESPACE}
kubectl rollout status deployment/frontend -n ${NAMESPACE}

echo "Done! The application should be available at http://localhost:8080"
