import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output solo para builds Docker (self-hosted)
  // En Vercel esta variable no se setea, por lo que se omite
  ...(process.env.DOCKER_BUILD === "1" && { output: "standalone" }),
};

export default nextConfig;
