import { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blogPosts';

export default function sitemap(): MetadataRoute.Sitemap {
    // In production, BASE_URL should from process.env.NEXT_PUBLIC_BASE_URL
    const baseUrl = 'https://punedating.example.com';

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        ...blogPosts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.publishedAt),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        }))
        // Protected routes (discover, matches, etc.) are excluded from sitemap intentionally
    ];
}
