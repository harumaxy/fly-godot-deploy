import { ApiMachineConfig } from "@/fly/machine-api";

export function machineConfig(portOffset: number): ApiMachineConfig {
  const portStart = Number(process.env.PORT);
  const port = portStart + portOffset;
  return {
    env: {
      PORT: String(port),
    },
    guest: {
      cpu_kind: "shared",
      cpus: 1,
      memory_mb: 256,
    },
    services: [
      {
        protocol: "udp",
        internal_port: port,
        ports: [
          {
            port: port,
          },
        ],
      },
    ],
    image: `registry.fly.io/${process.env.FLY_APP_NAME}:latest`,
  };
}
