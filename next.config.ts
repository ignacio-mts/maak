import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone is for the Fargate/Docker image. Vercel ignores this and prefers
  // its own builder; set MAAK_STANDALONE=1 (see Dockerfile) for container builds.
  ...(process.env.MAAK_STANDALONE === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
