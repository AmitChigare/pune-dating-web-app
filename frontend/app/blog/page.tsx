import Link from 'next/link';
import { blogPosts } from '@/data/blogPosts';
import { ArrowRight, Calendar } from 'lucide-react';
import { MarketingHeader } from '@/components/MarketingHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pune Dating Blog & Relationships Guide',
    description: 'Read the latest dating tips, success stories, and relationship advice tailored for singles in Pune, Maharashtra.',
    openGraph: {
        title: 'Pune Dating Blog & Relationships Guide',
        description: 'Read the latest dating tips, success stories, and relationship advice tailored for singles in Pune, Maharashtra.',
    }
};

export default function BlogIndex() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-16 px-4">
            <MarketingHeader />
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif text-accent font-bold tracking-tight">Pune Dating Blog</h1>
                    <p className="mt-4 text-xl text-gray-600">Expert relationship advice and date ideas for Maharashtra singles.</p>
                </div>

                <div className="grid gap-8">
                    {blogPosts.map((post) => (
                        <div key={post.slug} className="group bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-gray-300 transition-colors">
                            <Link href={`/blog/${post.slug}`}>
                                <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">{post.title}</h2>
                            </Link>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.publishedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>By {post.author}</span>
                            </div>

                            <p className="text-gray-700 mb-6 leading-relaxed">
                                {post.description}
                            </p>

                            <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-accent font-semibold hover:text-red-700 transition">
                                Read Article <ArrowRight size={16} />
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center bg-red-50 rounded-2xl p-12 border border-red-100">
                    <h3 className="text-2xl font-bold mb-4 font-serif">Ready to write your own success story?</h3>
                    <p className="text-gray-600 mb-8 max-w-lg mx-auto">Join the most active dating community explicitly designed for professionals living in Pune city limits.</p>
                    <Link href="/register" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-accent text-white text-lg font-semibold rounded-full hover:bg-red-600 transition shadow-lg shadow-red-200">
                        Join Pune Singles Now Default
                    </Link>
                </div>
            </div>
        </div>
    );
}
