#!/usr/bin/env bash
set -euo pipefail

: "${PINGPONG_RESOURCE_GROUP:?Set PINGPONG_RESOURCE_GROUP}"
: "${PINGPONG_LOCATION:?Set PINGPONG_LOCATION}"
: "${PINGPONG_ACR_NAME:?Set PINGPONG_ACR_NAME}"

az group create \
  --name "${PINGPONG_RESOURCE_GROUP}" \
  --location "${PINGPONG_LOCATION}"

az acr show \
  --resource-group "${PINGPONG_RESOURCE_GROUP}" \
  --name "${PINGPONG_ACR_NAME}" >/dev/null 2>&1 || \
az acr create \
  --resource-group "${PINGPONG_RESOURCE_GROUP}" \
  --name "${PINGPONG_ACR_NAME}" \
  --sku Basic

az acr show \
  --resource-group "${PINGPONG_RESOURCE_GROUP}" \
  --name "${PINGPONG_ACR_NAME}" \
  --query loginServer \
  --output tsv
