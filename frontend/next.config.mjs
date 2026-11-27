/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/portal/literature',
        destination: '/portal/department?dept=Literature',
        permanent: false,
      },
      {
        source: '/portal/content-creation',
        destination: '/portal/department?dept=Content%20Creation',
        permanent: false,
      },
      {
        source: '/portal/welfare',
        destination: '/portal/department?dept=Welfare',
        permanent: false,
      },
      {
        source: '/portal/outreach-and-marketing',
        destination: '/portal/department?dept=Outreach%20and%20Marketing',
        permanent: false,
      },
      {
        source: '/portal/oam',
        destination: '/portal/department?dept=Outreach%20and%20Marketing',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || 'https://tmr-backend-6smd.onrender.com';
    return [
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/auth/:path*`,
      },
      {
        source: '/api/super-admin/:path*',
        destination: `${backendUrl}/api/super-admin/:path*`,
      },
      {
        source: '/api/hr/:path*',
        destination: `${backendUrl}/api/hr/:path*`,
      },
      {
        source: '/api/finance/:path*',
        destination: `${backendUrl}/api/finance/:path*`,
      },
      {
        source: '/api/developer/:path*',
        destination: `${backendUrl}/api/developer/:path*`,
      },
      {
        source: '/api/emergency/:path*',
        destination: `${backendUrl}/api/emergency/:path*`,
      },
      {
        source: '/api/department/:path*',
        destination: `${backendUrl}/api/department/:path*`,
      },
      {
        source: '/api/departments',
        destination: `${backendUrl}/api/departments`,
      },
      {
        source: '/api/departments/:path*',
        destination: `${backendUrl}/api/departments/:path*`,
      },
      {
        source: '/api/member/:path*',
        destination: `${backendUrl}/api/member/:path*`,
      },
      {
        source: '/api/members',
        destination: `${backendUrl}/api/members`,
      },
      {
        source: '/api/members/:path*',
        destination: `${backendUrl}/api/members/:path*`,
      },
      {
        source: '/api/tasks',
        destination: `${backendUrl}/api/tasks`,
      },
      {
        source: '/api/tasks/:path*',
        destination: `${backendUrl}/api/tasks/:path*`,
      },
      {
        source: '/api/assessments',
        destination: `${backendUrl}/api/assessments`,
      },
      {
        source: '/api/assessments/:path*',
        destination: `${backendUrl}/api/assessments/:path*`,
      },
      {
        source: '/api/notifications',
        destination: `${backendUrl}/api/notifications`,
      },
      {
        source: '/api/notifications/:path*',
        destination: `${backendUrl}/api/notifications/:path*`,
      },
      {
        source: '/api/announcements/:path*',
        destination: `${backendUrl}/api/announcements/:path*`,
      },
      {
        source: '/api/recruitment/:path*',
        destination: `${backendUrl}/api/recruitment/:path*`,
      },
      {
        source: '/api/events/:path*',
        destination: `${backendUrl}/api/events/:path*`,
      },
      {
        source: '/api/media/:path*',
        destination: `${backendUrl}/api/media/:path*`,
      },
      {
        source: '/api/gallery/:path*',
        destination: `${backendUrl}/api/gallery/:path*`,
      },
      {
        source: '/api/health',
        destination: `${backendUrl}/api/health`,
      },
    ];
  },
};

export default nextConfig;
