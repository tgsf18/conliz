/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8080';

// Exportação estática: o Next gera HTML/CSS/JS puros em ./out, que passam a ser
// servidos pelo próprio Spring Boot (backend/src/main/resources/static).
// Sem processo Node, sem porta 3000 e sem proxy — o painel chama /api no mesmo host.
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
