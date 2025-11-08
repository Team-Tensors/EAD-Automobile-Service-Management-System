#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DriveCare Kubernetes Deployment Script        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${YELLOW}kubectl not found. Please install kubectl first.${NC}"
    exit 1
fi

# Check if Kubernetes is running
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${YELLOW}Kubernetes cluster not accessible. Please start Docker Desktop Kubernetes.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} kubectl found"
echo -e "${GREEN}✓${NC} Kubernetes cluster accessible"
echo ""

# Apply manifests in order
echo -e "${BLUE}Deploying to Kubernetes...${NC}"
echo ""

echo -e "${YELLOW}[1/7]${NC} Creating namespace..."
kubectl apply -f namespace.yaml

echo -e "${YELLOW}[2/7]${NC} Applying secrets..."
kubectl apply -f secrets.yaml

echo -e "${YELLOW}[3/7]${NC} Applying configmap..."
kubectl apply -f configmap.yaml

echo -e "${YELLOW}[4/7]${NC} Creating persistent volume..."
kubectl apply -f postgres-pv.yaml

echo -e "${YELLOW}[5/7]${NC} Deploying PostgreSQL..."
kubectl apply -f postgres-deployment.yaml

echo -e "${YELLOW}[6/7]${NC} Deploying backend..."
kubectl apply -f backend-deployment.yaml

echo -e "${YELLOW}[7/7]${NC} Deploying frontend..."
kubectl apply -f frontend-deployment.yaml

echo ""
echo -e "${GREEN}✓ All resources deployed!${NC}"
echo ""

# Wait for pods to be ready
echo -e "${BLUE}Waiting for pods to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=backend -n drivecare --timeout=120s 2>/dev/null || true
kubectl wait --for=condition=ready pod -l app=frontend -n drivecare --timeout=120s 2>/dev/null || true

echo ""
echo -e "${BLUE}Current Status:${NC}"
kubectl get pods -n drivecare

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Deployment Complete!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:30173${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:30400/api${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  View pods:    ${YELLOW}kubectl get pods -n drivecare${NC}"
echo -e "  View logs:    ${YELLOW}kubectl logs -f deployment/backend -n drivecare${NC}"
echo -e "  Delete all:   ${YELLOW}kubectl delete namespace drivecare${NC}"
echo ""
