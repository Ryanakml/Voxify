import { StarIcon } from "lucide-react";
import Marquee from "react-fast-marquee";

interface Testimonial {
    review: string;
    name: string;
    date: string;
    rating: number;
    image: string;
}

export default function OurTestimonials() {
    const data: Testimonial[] = [
        {
            review:
                "We replaced manual voice recording for product demos. Voxify gave us clean, natural audio in minutes instead of days.",
            name: "Richard Nelson",
            date: "12 Jan 2025",
            rating: 5,
            image:
                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
        },
        {
            review:
                "The voices sound human and consistent across every campaign. Our ad turnaround is dramatically faster now.",
            name: "Sophia Martinez",
            date: "15 Mar 2025",
            rating: 5,
            image:
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
        },
        {
            review:
                "From podcast intros to onboarding guides, we generate polished voiceovers without booking studio sessions.",
            name: "Ethan Roberts",
            date: "20 Feb 2025",
            rating: 5,
            image:
                "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
        },
        {
            review:
                "The workflow is straightforward: paste script, pick voice, export. Exactly what our content team needed.",
            name: "Isabella Kim",
            date: "20 Sep 2025",
            rating: 5,
            image:
                "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60",
        },
        {
            review:
                "Our support team now uses Voxify for IVR prompts and updates. Quality is excellent and revisions are quick.",
            name: "Liam Johnson",
            date: "04 Oct 2025",
            rating: 5,
            image:
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop",
        },
        {
            review:
                "We launched multilingual training narration faster than planned. Voxify made production scalable for our team.",
            name: "Ava Patel",
            date: "01 Nov 2025",
            rating: 5,
            image:
                "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage1.png",
        },
    ];

    return (
        <section className="flex flex-col items-center justify-between max-w-6xl mx-auto mt-32 px-4">
            <h3 className="font-domine text-3xl">OUR TESTIMONIALS</h3>
            <p className="mt-4 text-sm/6 text-gray-500 max-w-md text-center">
                Teams use Voxify to produce voice content faster, keep quality consistent, and reduce production overhead.
            </p>

            <Marquee pauseOnHover className="mt-16" gradient speed={30}>
                {data.map((item, index) => (
                    <TestimonialCard key={index} item={item} />
                ))}
            </Marquee>
            <Marquee pauseOnHover className="mt-6" direction="right" gradient speed={30}>
                {data.map((item, index) => (
                    <TestimonialCard key={index} item={item} />
                ))}
            </Marquee>
        </section>
    );
}

function TestimonialCard({ item }: { item: Testimonial }) {
    return (
        <div className="w-full max-w-88 mx-2 space-y-4 rounded-md border border-gray-200 bg-white p-3 text-gray-500">
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    {[...Array(item.rating)].map((_, index) => (
                        <StarIcon
                            key={index}
                            className="size-4 fill-gray-800 text-gray-800"
                        />
                    ))}
                </div>
                <p>{item.date}</p>
            </div>

            <p>“{item.review}”</p>

            <div className="flex items-center gap-2 pt-3">
                <img
                    className="size-8 rounded-full"
                    width={40}
                    height={40}
                    src={item.image}
                    alt={item.name}
                />
                <p className="font-medium text-gray-800">{item.name}</p>
            </div>
        </div>
    );
}
