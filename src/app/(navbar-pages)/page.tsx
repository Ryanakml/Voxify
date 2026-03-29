import BuildProcess from "@/components/landings/sections/build-process";
import CallToAction from "@/components/landings/sections/call-to-action";
import FeaturesSection from "@/components/landings/sections/features-section";
import HeroSection from "@/components/landings/sections/hero-section";
import OurTestimonials from "@/components/landings/sections/our-testimonials";
import PricingSection from "@/components/landings/sections/pricing-section";
import TrustedBrand from "@/components/landings/sections/trusted-brand";

export default function Page() {
    return (
        <main className="px-4 py-4 md:px-16 lg:px-24 xl:px-32">
            <HeroSection />
            <TrustedBrand />
            <FeaturesSection />
            <BuildProcess />
            <PricingSection />
            <OurTestimonials />
            <CallToAction />
        </main>
    );
}
