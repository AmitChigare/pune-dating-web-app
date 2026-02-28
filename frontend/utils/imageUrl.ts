export const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/400x500';
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // In production, use NEXT_PUBLIC_API_URL but strip the /api/v1
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

    // Ensure properly formatted URL
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
};
