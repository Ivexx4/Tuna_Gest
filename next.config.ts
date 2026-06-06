import type { NextConfig } from "next";

// ATENÇÃO: Para a funcionalidade PWA funcionar, instale o pacote:
// npm install @ducanh2912/next-pwa
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // add more options here
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
