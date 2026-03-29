import { LoopsPricingSlider } from "@/components/ui/pricing-slider-loops";

export default function PricingSection() {
    return (
        <section id="pricing" className="mt-32 px-4">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-center text-center">
                <p className="font-domine text-3xl">OUR PRICING</p>
                <p className="mt-4 max-w-md text-sm/6 text-gray-500">
                    Start free until 300 credits, then scale smoothly: 500 credits is
                    $7, with larger credit packs for growing usage.
                </p>
            </div>
            <LoopsPricingSlider />
        </section>
    );
}
