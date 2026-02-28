import Link from 'next/link';
import { ArrowRight, ShieldCheck, Heart, MapPin } from 'lucide-react';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingCTA } from '@/components/MarketingCTA';

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <MarketingHeader redirectIfAuth={true} />

            {/* Hero Section */}
            <main className="pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-accent text-sm font-medium">
                            <MapPin size={16} /> Exclusive to Pune, Maharashtra
                        </div>
                        <h2 className="text-5xl md:text-6xl font-serif font-bold leading-tight text-gray-900">
                            The Best Dating App in Pune for Meaningful Connections.
                        </h2>
                        <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                            Finding connection in a fast-paced IT city shouldn't be exhausting. Experience real relationships and meaningful dates beyond the endless swiping. Curated exclusively for professionals across Pune.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <MarketingCTA />
                        </div>
                    </div>

                    {/* Skyline / App Graphic Placeholder */}
                    <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-50"></div>
                        <div className="relative text-center space-y-4">
                            <Heart className="w-16 h-16 text-accent mx-auto animate-pulse" />
                            <p className="font-serif text-xl font-medium text-gray-800">Connecting Pune</p>
                            <p className="text-sm text-gray-500 uppercase tracking-widest">Since 2026</p>
                        </div>
                    </div>
                </div>

                {/* How it Works */}
                <section className="mt-32 max-w-6xl mx-auto">
                    <h3 className="text-3xl font-bold text-center mb-16">How to meet singles in Pune</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center space-y-4 p-6">
                            <div className="w-16 h-16 bg-red-50 text-accent rounded-full flex items-center justify-center mx-auto text-2xl font-bold font-serif">1</div>
                            <h4 className="text-xl font-semibold">Create your Profile</h4>
                            <p className="text-gray-600">Tell us what you're looking for. From late-night shifts in Baner to lazy Sundays in Viman Nagar.</p>
                        </div>
                        <div className="text-center space-y-4 p-6">
                            <div className="w-16 h-16 bg-red-50 text-accent rounded-full flex items-center justify-center mx-auto text-2xl font-bold font-serif">2</div>
                            <h4 className="text-xl font-semibold">Discover Locals</h4>
                            <p className="text-gray-600">Skip the casual chaos. Our smart algorithm shows you relationship-minded singles located strictly within Pune city limits.</p>
                        </div>
                        <div className="text-center space-y-4 p-6">
                            <div className="w-16 h-16 bg-red-50 text-accent rounded-full flex items-center justify-center mx-auto text-2xl font-bold font-serif">3</div>
                            <h4 className="text-xl font-semibold">Plan a Date</h4>
                            <p className="text-gray-600">Match, chat, and meet over cutting chai at a local tapri or a craft coffee in Koregaon Park.</p>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="mt-32 bg-gray-50 rounded-3xl p-12 max-w-6xl mx-auto">
                    <h3 className="text-3xl font-bold text-center mb-12">Success Stories from Pune</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex text-accent mb-4">
                                ★★★★★
                            </div>
                            <p className="text-gray-700 italic mb-6">"I was tired of matching with people who lived hours away. This app restricted searches to Pune, and I ended up meeting my current partner who works just one street over in Kharadi!"</p>
                            <div className="font-semibold">— Rohan & Sneha</div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex text-accent mb-4">
                                ★★★★★
                            </div>
                            <p className="text-gray-700 italic mb-6">"The best dating app in Pune hands down. The community feels professional, safe, and very local. Our first date was coffee in Koregaon Park and we instantly clicked."</p>
                            <div className="font-semibold">— Priya M.</div>
                        </div>
                    </div>
                </section>

                {/* Safety section */}
                <section className="mt-32 max-w-4xl mx-auto text-center space-y-8">
                    <ShieldCheck size={48} className="text-accent mx-auto" />
                    <h3 className="text-3xl font-bold">A Safe Dating App Built for Maharashtra</h3>
                    <p className="text-lg text-gray-600">
                        Your safety is our priority. We monitor for fake profiles and enforce a strict community guideline policy to ensure the Pune relationship app ecosystem remains healthy, verified, and premium.
                    </p>
                </section>

                {/* FAQ */}
                <section className="mt-32 max-w-3xl mx-auto mb-32">
                    <h3 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="font-semibold text-lg mb-2">Is this dating app only for Pune?</h4>
                            <p className="text-gray-600">Yes! We believe that geographical focus leads to better, more realistic matches. We cater specifically to singles residing in or working around Pune, Maharashtra.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="font-semibold text-lg mb-2">How do I meet singles in Pune on this app?</h4>
                            <p className="text-gray-600">Once you complete your profile, our algorithm will begin showing you compatible locals. You can 'Like' them, and if the feeling is mutual, you'll enter a real-time chat.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                    <div className="col-span-2 space-y-4">
                        <h2 className="text-2xl font-serif text-white font-bold tracking-tight">Pune Dating</h2>
                        <p className="max-w-sm">The premier platform to meet compatible singles across Pune city.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Locations</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Hinjewadi IT Park</li>
                            <li>Koregaon Park Singles</li>
                            <li>Baner Dating</li>
                            <li>Viman Nagar Matches</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal & SEO</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-accent transition">Our Manifesto</Link></li>
                            <li><Link href="/blog" className="hover:text-accent transition">Dating Blog</Link></li>
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
                    &copy; {new Date().getFullYear()} Pune Dating App. All rights reserved. Built for singles in Pune, Maharashtra.
                </div>
            </footer>
        </div>
    );
}
