import { execFileSync } from "node:child_process";

const namespace = process.env.K8S_NAMESPACE ?? "pingpong";

const kubectl = (...args: string[]) =>
  execFileSync("kubectl", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

console.log("# Load generator HPA");
console.log(kubectl("-n", namespace, "get", "hpa", "load-generator", "-o", "wide"));

console.log("# Load generator pods");
console.log(
  kubectl(
    "-n",
    namespace,
    "get",
    "pods",
    "-l",
    "app.kubernetes.io/name=load-generator",
    "-o",
    "wide"
  )
);

console.log("# Recent scaling events");
console.log(
  kubectl(
    "-n",
    namespace,
    "get",
    "events",
    "--sort-by=.lastTimestamp",
    "--field-selector",
    "involvedObject.name=load-generator"
  )
);
