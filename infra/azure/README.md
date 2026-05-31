# Azure Provisioning

This folder contains small, explicit scripts for the cost-conscious AKS baseline.

Required permissions:

- Create or manage an Azure resource group.
- Create Azure Container Registry.
- Create Azure Kubernetes Service with ACR attach.
- Enable the Key Vault Secrets Store CSI Driver addon.
- Create or update a Key Vault secret for `SESSION_TOKEN_SIGNING_SECRET`.

Default resources:

- Resource group: `PINGPONG_RESOURCE_GROUP`
- Region: `PINGPONG_LOCATION`
- ACR: `PINGPONG_ACR_NAME`
- AKS: `PINGPONG_AKS_NAME`
- Key Vault: `PINGPONG_KEYVAULT_NAME`

The first release keeps active online session ownership in memory. Do not raise
the realtime backend above one active-session owner until Redis, Azure Web
PubSub, or another shared routing layer is added.
