#!/usr/bin/env bash
set -euo pipefail

: "${PINGPONG_RESOURCE_GROUP:?Set PINGPONG_RESOURCE_GROUP}"
: "${PINGPONG_LOCATION:?Set PINGPONG_LOCATION}"
: "${PINGPONG_KEYVAULT_NAME:?Set PINGPONG_KEYVAULT_NAME}"
: "${SESSION_TOKEN_SIGNING_SECRET:?Set SESSION_TOKEN_SIGNING_SECRET without committing it}"

az keyvault show \
  --resource-group "${PINGPONG_RESOURCE_GROUP}" \
  --name "${PINGPONG_KEYVAULT_NAME}" >/dev/null 2>&1 || \
az keyvault create \
  --resource-group "${PINGPONG_RESOURCE_GROUP}" \
  --location "${PINGPONG_LOCATION}" \
  --name "${PINGPONG_KEYVAULT_NAME}"

az keyvault secret set \
  --vault-name "${PINGPONG_KEYVAULT_NAME}" \
  --name SESSION-TOKEN-SIGNING-SECRET \
  --value "${SESSION_TOKEN_SIGNING_SECRET}" >/dev/null

echo "Stored SESSION_TOKEN_SIGNING_SECRET in Key Vault ${PINGPONG_KEYVAULT_NAME}."
