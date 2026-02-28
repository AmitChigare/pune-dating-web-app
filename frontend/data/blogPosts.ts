export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    content: string; // HTML or Markdown for simplicity we will do HTML strings
    publishedAt: string;
    author: string;
}

export const blogPosts: BlogPost[] = [
    {
        slug: "top-5-date-spots-koregaon-park",
        title: "Top 5 First Date Spots in Koregaon Park, Pune",
        description: "Looking to impress your match? Discover the most romantic and cozy cafes in Koregaon Park for your first date.",
        publishedAt: "2026-02-15",
        author: "Pune Dating Editor",
        content: `
            <h2>The Vibe of Koregaon Park</h2>
            <p>Koregaon Park (KP) has always been the trendiest neighborhood in Pune. With its lush canopy of banyan trees and narrow lanes filled with eclectic eateries, it's the perfect backdrop for a first date. If you've just matched with a fellow Pune professional on <a href="/register" class="text-accent underline">Pune Dating App</a>, here are the top 5 spots to meet up.</p>
            
            <h3>1. The French Window Patisserie</h3>
            <p>A quiet, pet-friendly outdoor seating area with incredible baked goods. Perfect for a casual afternoon coffee date where you can actually hear each other talk.</p>
            
            <h3>2. Daily All Day</h3>
            <p>If you're looking for great cocktails and a modern, upbeat atmosphere, Daily All Day is a fantastic choice for evening dates. It gets busy, so make sure your match is comfortable with a lively crowd.</p>
            
            <h3>3. Sunderban Resort & Spa (Hidden Gardens)</h3>
            <p>Quiet, green, and incredibly peaceful. Taking a walk here after grabbing a quick espresso is a great way to bond without the pressure of a sit-down meal.</p>
            
            <p class="mt-8 font-semibold">Ready to find your KP date? <a href="/register" class="text-accent underline">Join Pune Singles today!</a></p>
        `
    },
    {
        slug: "dating-as-an-it-professional-hinjewadi",
        title: "Navigating Dating as an IT Professional in Hinjewadi",
        description: "Balancing late-night calls and long commutes? Here is how IT professionals in Hinjewadi are using geo-location to find love.",
        publishedAt: "2026-02-20",
        author: "Pune Dating Editor",
        content: `
            <h2>The Hinjewadi Hustle</h2>
            <p>Working in Phase 1, 2, or 3 of Hinjewadi IT Park means you're accustomed to long hours, intense traffic, and sudden project deadlines. For many engineers and analysts, dating feels impossible.</p>
            
            <h3>Location Matters More Than Ever</h3>
            <p>One of the biggest hurdles for IT professionals is commuting. Matching with someone who lives in Magarpatta when you work in Hinjewadi and live in Wakad is a recipe for a long-distance relationship within the same city! </p>
            <p>This is why <a href="/register" class="text-accent underline">Pune Dating App</a> uses strict geo-location to sort your matches by proximity. When you log in, we ensure the profiles you see are practically your neighbors or coworkers.</p>
            
            <h3>Best Post-Work Meetups</h3>
            <p>Keep your first dates close to the office. Places like Viman Nagar might be tempting on weekends, but for a Tuesday evening, stick to Baner or Balewadi High Street.</p>
            <p class="mt-8 font-semibold">Tired of the commute? <a href="/register" class="text-accent underline">Match with local IT professionals now.</a></p>
        `
    },
    {
        slug: "weekend-getaways-from-pune-for-couples",
        title: "Best Weekend Getaways from Pune for Couples",
        description: "You've been dating for a few months and want to take a trip. Here are the best romantic weekend getaways near Pune.",
        publishedAt: "2026-02-28",
        author: "Pune Dating Editor",
        content: `
            <h2>Time to Hit the Mumbai-Pune Expressway</h2>
            <p>Once you've swiped, matched, and gone on a few successful dates around Pune city limits, you might be looking for a change of scenery. Luckily, Pune is surrounded by the beautiful Sahyadri mountains.</p>
            
            <h3>1. Lonavala & Khandala</h3>
            <p>It's a classic for a reason. Less than 90 minutes away, the foggy mountains and Tiger Point lookouts offer a highly romantic escape. Book a resort with a private pool for maximum privacy.</p>
            
            <h3>2. Mahabaleshwar</h3>
            <p>Famous for its strawberries and stunning valley views. It's a slightly longer drive (about 3 hours), making it an ideal long-weekend trip. The climate is incredibly cool year-round.</p>
            
            <h3>3. Pawna Lake Camping</h3>
            <p>If you and your partner prefer the outdoors, camping by Pawna Lake offers stargazing, bonfires, and a completely unplugged experience to deepen your connection.</p>
            
            <p class="mt-8 font-semibold">Looking for someone to travel with? <a href="/register" class="text-accent underline">Sign up and meet Pune locals.</a></p>
        `
    }
];
