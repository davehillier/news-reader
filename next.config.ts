import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // BBC
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk',
        pathname: '/**',
      },
      // Guardian
      {
        protocol: 'https',
        hostname: 'i.guim.co.uk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.guim.co.uk',
        pathname: '/**',
      },
      // TechCrunch
      {
        protocol: 'https',
        hostname: 'techcrunch.com',
        pathname: '/**',
      },
      // The Verge
      {
        protocol: 'https',
        hostname: 'cdn.vox-cdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform.theverge.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'duet-cdn.vox-cdn.com',
        pathname: '/**',
      },
      // Ars Technica
      {
        protocol: 'https',
        hostname: 'cdn.arstechnica.net',
        pathname: '/**',
      },
      // Reuters
      {
        protocol: 'https',
        hostname: 'www.reuters.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudfront-us-east-2.images.arcpublishing.com',
        pathname: '/**',
      },
      // Sky (multiple CDN variants)
      {
        protocol: 'https',
        hostname: 'e0.365dm.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'e1.365dm.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'e2.365dm.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'e3.365dm.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'news.sky.com',
        pathname: '/**',
      },
      // Al Jazeera
      {
        protocol: 'https',
        hostname: 'www.aljazeera.com',
        pathname: '/**',
      },
      // NME
      {
        protocol: 'https',
        hostname: 'www.nme.com',
        pathname: '/**',
      },
      // Pitchfork
      {
        protocol: 'https',
        hostname: 'pitchfork.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.pitchfork.com',
        pathname: '/**',
      },
      // NASA
      {
        protocol: 'https',
        hostname: 'www.nasa.gov',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.nasa.gov',
        pathname: '/**',
      },
      // New Scientist
      {
        protocol: 'https',
        hostname: 'images.newscientist.com',
        pathname: '/**',
      },
      // Euronews
      {
        protocol: 'https',
        hostname: 'static.euronews.com',
        pathname: '/**',
      },
      // France 24
      {
        protocol: 'https',
        hostname: 'www.france24.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's.france24.com',
        pathname: '/**',
      },
      // South China Morning Post
      {
        protocol: 'https',
        hostname: 'cdn.i-scmp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.i-scmp.com',
        pathname: '/**',
      },
      // Fallback placeholder
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
