import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://punedating.example.com';

    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/login', '/register'],
            disallow: ['/discover', '/chat/', '/matches', '/admin', '/profile', '/settings', '/onboarding'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
