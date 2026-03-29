"use client";

import { PauseIcon, PlayIcon, TrendingUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Marquee from "react-fast-marquee";
import { useEffect, useState } from "react";

import { SpecialText } from "@/components/ui/special-text";
import { SmoothDropdown } from "@/components/ui/smooth-dropdown";
// import { DottedSurface } from "@/components/ui/dotted-surface";

interface Prompt {
    label: string;
    prompt: string;
}

export default function HeroSection() {
    const router = useRouter();
    const [textInput, setTextInput] = useState("");
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [previewReady, setPreviewReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedSound, setSelectedSound] = useState("luke(en-us)");
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [showSecondsWord, setShowSecondsWord] = useState(false);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setPreviewReady(true);
            setIsPlaying(true);
        }, 1200);
    };

    const placeholders = [
        "product demo script...",
        "podcast intro...",
        "customer support greeting...",
        "video narration...",
        "learning content...",
    ];


    const prompts: Prompt[] = [
        {
            label: "Product Demo",
            prompt: "Create a confident product demo voiceover for a new AI note-taking app with clear benefit-driven messaging",
        },
        {
            label: "Podcast Intro",
            prompt: "Write an energetic podcast intro script for a weekly startup podcast and read it in a warm voice",
        },
        {
            label: "Ad Read",
            prompt: "Generate a 30-second ad read for a coffee brand with persuasive but natural pacing",
        },
        {
            label: "Customer Support",
            prompt: "Create a calm, friendly support greeting that reduces wait-time frustration and sets clear expectations",
        },
        {
            label: "Course Narration",
            prompt: "Turn this onboarding lesson into clear instructional narration with short pauses between key points",
        },
        {
            label: "IVR Prompt",
            prompt: "Write professional IVR phone menu lines for billing, technical support, and sales",
        },
        {
            label: "Game Character",
            prompt: "Create dramatic dialogue for a mysterious game guide character introducing a quest",
        },
        {
            label: "Audiobook Scene",
            prompt: "Narrate this fantasy scene with cinematic tone and emotional pacing",
        },
        {
            label: "Social Clip",
            prompt: "Generate a short, punchy voiceover for a 20-second social media product clip",
        },
    ];

    const soundOptions = [
        { id: "luke(en-us)", label: "luke(en-us)" },
        { id: "clara(en-us)", label: "clara(en-us)" },
        { id: "henry(en-british)", label: "henry(en-british)" },
        { id: "ryan(en-us)", label: "ryan(en-us)" },
        { id: "teuku(id)", label: "teuku(id)" },
    ];


    useEffect(() => {
        if (textInput) return;

        const currentWord = placeholders[textIndex];

        if (!deleting && charIndex === currentWord.length) {
            setTimeout(() => setDeleting(true), 2000);
            return;
        }

        if (deleting && charIndex === 0) {
            setDeleting(false);
            setTextIndex((prev) => (prev + 1) % placeholders.length);
            return;
        }

        const timeout = setTimeout(() => {
            setCharIndex((prev) => prev + (deleting ? -1 : 1));
        }, 50);

        return () => clearTimeout(timeout);
    }, [charIndex, deleting, textIndex, textInput]);

    useEffect(() => {
        const timer = setTimeout(() => setShowSecondsWord(true), 900);
        return () => clearTimeout(timer);
    }, []);

    const animatedPlaceholder = placeholders[textIndex].substring(0, charIndex);

    return (
        <section id="home" className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl">
            {/* <div className="pointer-events-none absolute inset-0 -z-10">
                <DottedSurface className="absolute inset-0 -z-10" />
                <div className="absolute inset-0 bg-white/82" />
            </div> */}

            <div className="flex items-center gap-2 text-gray-500 mt-32">
                <TrendingUpIcon className="size-4.5" />
                <span>Trusted by 2,000+ creators</span>
            </div>

            <h1 className="text-center text-5xl/17 md:text-[64px]/20 font-semibold max-w-5xl m-2">
                <span className="block">Transform text to voice</span>
                <span className="mt-1 block">
                    <span className="inline-flex items-baseline justify-center whitespace-nowrap">
                        <span>in&nbsp;</span>
                        <span className="relative inline-grid place-items-center align-baseline">
                            <span className="invisible col-start-1 row-start-1">seconds</span>
                            {showSecondsWord ? (
                                <SpecialText
                                    speed={24}
                                    className="col-start-1 row-start-1 h-auto leading-none text-current !font-sans !font-semibold"
                                >
                                    seconds
                                </SpecialText>
                            ) : (
                                <span className="col-start-1 row-start-1 text-current">minutes</span>
                            )}
                        </span>
                    </span>
                </span>
            </h1>

            <p className="text-center text-base text-gray-500 max-w-md mt-2">
                Type your text, pick a sound style, and instantly preview lifelike voice output for content, products, and campaigns.
            </p>

            <form onSubmit={handleSubmit} className="relative z-20 focus-within:ring-2 focus-within:ring-gray-300 border border-gray-200 rounded-xl max-w-2xl w-full mt-8">
                <textarea
                    className="w-full resize-none p-4 outline-none text-gray-600"
                    placeholder={`Type your ${animatedPlaceholder}`}
                    rows={3}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    required
                />

                <div className="flex items-center justify-between p-4 pt-0">
                    <SmoothDropdown
                        className="w-[220px]"
                        items={soundOptions}
                        value={selectedSound}
                        onChange={setSelectedSound}
                        footerAction={{
                            label: "more",
                            onClick: () => router.push("/sign-in"),
                        }}
                    />

                    <button className={`flex items-center justify-center bg-linear-to-b from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 transition px-4 h-9 text-white rounded-lg ${loading ? "cursor-not-allowed opacity-90" : ""}`} disabled={loading}>
                        {loading ? (
                            <span className="bg-linear-to-r from-white/60 via-white to-white/60 bg-clip-text text-transparent animate-pulse">
                                Converting
                            </span>
                        ) : (
                            <span>Convert</span>
                        )}
                    </button>
                </div>
            </form>

            {previewReady && (
                <div className="mt-4 flex w-full max-w-2xl items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                    <div>
                        <p className="text-sm font-medium text-gray-800">Voice Preview</p>
                        <p className="text-xs text-gray-500">{`Ready • ${selectedSound} preset`}</p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-sm text-white"
                        onClick={() => setIsPlaying((prev) => !prev)}
                    >
                        {isPlaying ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
                        {isPlaying ? "Pause Preview" : "Play Preview"}
                    </button>
                </div>
            )}

            <Marquee gradient speed={30} pauseOnHover className="relative z-0 max-w-2xl w-full mt-3" >
                {prompts.map((item) => {
                    const isSelected = selected === item.label;

                    return (
                        <button key={item.label}
                            onClick={() => {
                                setTextInput(item.prompt);
                                setSelected(item.label);
                            }}
                            className={`px-4 py-1.5 mx-2 border rounded-full transition
                                ${isSelected
                                    ? "bg-gray-200 text-gray-800 border-gray-300 cursor-not-allowed"
                                    : "text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }
                            `}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </Marquee>
        </section>
    );
}
