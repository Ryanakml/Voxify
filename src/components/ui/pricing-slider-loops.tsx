"use client";

import React, { useState } from "react";

const PRICING_BREAKPOINTS = [
  { maxCredits: 300, price: 0 },
  { maxCredits: 500, price: 7 },
  { maxCredits: 1000, price: 19 },
  { maxCredits: 2000, price: 35 },
  { maxCredits: 5000, price: 79 },
  { maxCredits: 10000, price: 149 },
  { maxCredits: 20000, price: 269 },
];

const BREAKPOINT_CREDIT_VALUES = [
  50, 100, 150, 200, 250, 300, 500, 1000, 1500, 2000, 3000, 5000, 10000,
  20000,
];

const getPriceForCredits = (
  credits: number,
): { price: number; label: string } => {
  const breakpoint = PRICING_BREAKPOINTS.find((tier) => credits <= tier.maxCredits);
  if (breakpoint) return { price: breakpoint.price, label: `${credits.toLocaleString()} credits` };

  const basePrice = 269;
  const extraCredits = credits - 20000;
  const extraUnits = Math.ceil(extraCredits / 5000);
  const price = basePrice + extraUnits * 59;
  return { price, label: `${credits.toLocaleString()} credits` };
};

export const LoopsPricingSlider: React.FC = () => {
  const [sliderIndex, setSliderIndex] = useState(0);

  const credits = BREAKPOINT_CREDIT_VALUES[sliderIndex];
  const { price, label } = getPriceForCredits(credits);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderIndex(Number(e.target.value));
  };

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Card */}
        <div className="relative flex-1 rounded-xl border border-gray-200 bg-white p-8">
          <h2 className="mb-4 text-sm font-medium text-gray-800">Calculate your pricing</h2>
          <div className="mb-8 text-3xl font-semibold text-gray-900">{label}</div>
          <input
            type="range"
            min={0}
            max={BREAKPOINT_CREDIT_VALUES.length - 1}
            step={1}
            value={sliderIndex}
            onChange={handleSliderChange}
            className="w-full appearance-none h-3 rounded bg-gray-200 mb-12"
            style={{
              background: `linear-gradient(to right, #374151 0%, #374151 ${
                (sliderIndex / (BREAKPOINT_CREDIT_VALUES.length - 1)) * 100
              }%, #E5E7EB ${(sliderIndex / (BREAKPOINT_CREDIT_VALUES.length - 1)) * 100}%, #E5E7EB 100%)`,
            }}
          />

          <style>{`
            input[type='range']::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 28px;
              height: 28px;
              background: #ffffff;
              border: 2px solid #E5E7EB;
              border-radius: 50%;
              cursor: pointer;
              margin-top: -1px;
              box-shadow: 0 1px 5px rgba(192, 192, 192, 0.5);
              position: relative;
            }
            input[type='range']::-moz-range-thumb {
              width: 26px;
              height: 26px;
              background: #ffffff;
              border: 2px solid #E5E7EB;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 1px 5px rgba(192, 192, 192, 0.5);
            }
          `}</style>

          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-sm text-gray-500">
            <span>Need higher credit volume?</span>
            <a
              href="mailto:hello@voxify.app?subject=Voxify%20Enterprise%20Pricing"
              className="flex items-center font-medium text-gray-800 hover:text-gray-900"
            >
              Contact us <span className="ml-1">→</span>
            </a>
          </div>
        </div>

        {/* Right Card */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-8">
          <h2 className="mb-4 text-sm font-medium text-gray-800">Your plan</h2>
          <div className="mb-2">
            <h3 className="mb-6 text-3xl font-semibold text-gray-900">
              {price === 0 ? "Free" : `$${price} / mo`}
            </h3>
          </div>
          <p className="mt-8 text-sm/6 text-gray-500">
            {price === 0
              ? "Free tier includes up to 300 credits so you can test voices, workflows, and output quality before upgrading."
              : `Includes up to ${label}. Fast generation, high-quality output, and commercial usage ready for production workflows.`}
          </p>
          <a
            href="/dashboard/text-to-speech"
            className="mt-8 inline-flex rounded-lg bg-linear-to-b from-gray-600 to-gray-800 px-6 py-3 text-sm font-medium text-white transition hover:from-gray-700 hover:to-gray-900"
          >
            {price === 0 ? "Start Free" : "Get Started"}
          </a>
        </div>
      </div>
    </section>
  );
};
