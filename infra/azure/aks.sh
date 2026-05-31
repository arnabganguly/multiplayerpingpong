#!/usr/bin/env bash
set -euo pipefail

: "${PINGPONG_RESOURCE_GROUP:?Set PINGPONG_RESOURCE_GROUP}"
: "${PINGPONG_LOCATION:?Set PINGPONG_LOCATION}"
: "${PINGPONG_ACR_NAME:?Set PINGPONG_ACR_NAME}"
: "${PINGPONG_AKS_NAME:?Set PINGPONG_AKS_NAME}"

az aks show \
  --resource-group "${PINGPONG_RESOURCE_GROUP}" \
  --name "${PINGPONG_AKS_NAME}" >/dev/null 2>&1 || \
az aks create \
  --resource-group "${PINGPONG_RESOURCE_GROUP}" \
  --name "${PINGPONG_AKS_NAME}" \
  --location "${PINGPONG_LOCATION}" \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --attach-acr "${PINGPONG_ACR_NAME}" \
  --enable-addons azure-keyvault-secrets-provider,monitoring \
  --generate-ssh-keys

az aks get-credentials \
  --resource-group "${PINGPONG_RESOURCE_GROUP}" \
  --name "${PINGPONG_AKS_NAME}" \
  --overwrite-existing
