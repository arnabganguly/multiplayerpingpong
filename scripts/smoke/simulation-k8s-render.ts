import { execFileSync } from "node:child_process";

const overlay = process.env.K8S_OVERLAY ?? "infra/k8s/overlays/dev";
const output = execFileSync("kubectl", ["kustomize", overlay], { encoding: "utf8" });

for (const expected of ["Deployment", "load-generator", "Service", "load-generator-api"]) {
  if (!output.includes(expected)) {
    throw new Error(`Rendered manifests did not include ${expected}.`);
  }
}

console.log(`Simulator Kubernetes render passed for ${overlay}.`);
