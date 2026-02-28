import Link from 'next/link';
import { Heart, Coffee, Navigation } from 'lucide-react';
import { MarketingHeader } from '@/components/MarketingHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About | Pune Dating App manifesto',
    description: 'Learn why we built the only dating app exclusively for singles living and working in Pune, Maharashtra.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <MarketingHeader />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-3xl mx-auto">

                    {/* Hero */}
                    <section className="text-center mt-12 mb-20 animate-in slide-in-from-bottom-6 duration-700">
                        <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight text-gray-900 mb-6">
                            Beyond the Swipe.<br />Within the City.
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed font-medium">
                            We believe finding someone shouldn't feel like a second job, and it definitely shouldn't involve a two-hour commute across the city.
                        </p>
                    </section>

                    {/* Manifesto Content */}
                    <article className="prose prose-lg prose-red mx-auto text-gray-700">
                        <h2>The Story Behind the App</h2>
                        <p>
                            Pune is a unique blend of historical Marathi culture, massive IT infrastructure, and a vibrant student population. It's the "Oxford of the East" meeting the silicon plateau. But paradoxically, in a city of millions of dreamers, coders, and artists, navigating the dating scene feels increasingly isolating.
                        </p>

                        <p>
                            We built this app because we were exhausted by the casual chaos of generic platforms. We were tired of matching with incredible people, only to realize they live in a different time zone... or worse, Mumbai. Long-distance relationships are tough, but long-distance relationships disguised as local ones are simply frustrating.
                        </p>

                        <h3>Real Relationships. No Casual Chaos.</h3>
                        <p>
                            This platform was explicitly designed for professionals navigating the fast-paced life of Pune. Whether your day involves endless stand-ups in Hinjewadi or studying in Viman Nagar, your evenings deserve meaningful connection.
                        </p>

                        <p>
                            We stripped away endless swiping features and gamification. Instead, our robust location-sorting algorithms connect you intimately with neighbors. We are bringing dating back to its roots: two people, sharing a conversation over a cutting chai at a local tapri or a craft coffee in Koregaon Park.
                        </p>

                        <div className="my-12 p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
                            <h3 className="text-2xl font-bold font-serif text-accent mb-2">Our Manifesto</h3>
                            <ul className="text-lg space-y-4 font-medium text-red-900 list-none pl-0">
                                <li><strong>1. Local Only:</strong> We only serve users actively in Pune. Period.</li>
                                <li><strong>2. Quality Over Quantity:</strong> No endless stacks. Curated, compatible matches.</li>
                                <li><strong>3. Real Intentions:</strong> Built for singles seeking meaningful relationships.</li>
                            </ul>
                        </div>

                        <p className="font-serif text-2xl text-center mt-12 mb-4 text-accent">Kasa kay, Pune? Let's find your match.</p>

                    </article>

                    {/* CTA */}
                    <div className="mt-20 text-center border-t border-gray-100 pt-16">
                        <h3 className="text-3xl font-bold mb-6 font-serif">Ready to experience dating differently?</h3>
                        <Link href="/register" className="inline-flex justify-center items-center px-10 py-4 bg-accent text-white text-lg font-semibold rounded-full hover:bg-red-600 transition shadow-lg shadow-red-200">
                            Create Your Free Profile
                        </Link>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
                <div className="max-w-6xl mx-auto px-4 text-center text-sm">
                    &copy; {new Date().getFullYear()} Pune Dating App. All rights reserved. Built with ❤️ for Maharashtra.
                </div>
            </footer>
        </div>
    );
}
