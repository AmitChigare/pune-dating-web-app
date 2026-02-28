import { blogPosts } from '@/data/blogPosts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { MarketingHeader } from '@/components/MarketingHeader';
import type { Metadata, ResolvingMetadata } from 'next';

interface Props {
    params: { slug: string };
}

// Dynamically generate metadata for SEO
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const post = blogPosts.find(p => p.slug === params.slug);

    if (!post) {
        return {
            title: 'Article Not Found',
        };
    }

    return {
        title: post.title,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [post.author],
        },
    };
}

export default function BlogPostPage({ params }: Props) {
    const post = blogPosts.find(p => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            <MarketingHeader />

            <main className="pt-24 pb-24 px-4 bg-white">
                <article className="max-w-3xl mx-auto">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-serif text-accent font-bold tracking-tight mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-500 text-sm">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                        </div>
                    </header>

                    <div className="prose prose-lg prose-red mx-auto text-gray-700 w-full" dangerouslySetInnerHTML={{ __html: post.content }} />

                    <hr className="my-16 border-gray-200" />

                    <section className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                        <h3 className="text-2xl font-bold mb-4 font-serif">Meet Your Match in Pune</h3>
                        <p className="text-gray-600 mb-6">Stop reading about great dates and start going on them. Connect with local singles today.</p>
                        <Link href="/register" className="inline-block px-6 py-3 bg-accent text-white font-medium rounded-full hover:bg-red-600 transition shadow-sm">
                            Create Your Free Profile
                        </Link>
                    </section>
                </article>
            </main>
        </div>
    );
}

// Generate static params for these known routes at build time
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}
