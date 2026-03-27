"use client";
import { Button } from "@/components/ui/button";
import { VoiceAvatar } from "@/components/voice-avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Download, Pause, Play, Undo } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type VoicePreviewMobilePanelVoice = {
  id: string;
  name: string;
};

function getPreviewText(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 4) return words.join(" ");
  return `${words.slice(0, 4).join(" ")}...`;
}

export function VoicePreviewMobilePanel({
  audioUrl,
  voice,
  text,
}: {
  audioUrl: string;
  voice: VoicePreviewMobilePanelVoice | null;
  text: string;
}) {
  const isMobile = useIsMobile();
  const selectedVoiceName = voice?.name ?? null;
  const selectedVoiceSeed = voice?.id ?? null;
  const previewText = getPreviewText(text);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    audio.pause();
    audio.currentTime = 0;

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!isMobile) {
      audioRef.current?.pause();
    }
  }, [isMobile]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seekBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 5, 0);
  };

  const seekForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (duration <= 0) return;
    audio.currentTime = Math.min(audio.currentTime + 5, duration);
  };

  const handleDownload = () => {
    setIsDownloading(true);

    const safeName =
      text
        .slice(0, 50)
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase() || "speech";

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${safeName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 overflow-hidden border-t px-4 py-3 lg:hidden">
      <audio ref={audioRef} src={audioUrl} />

      {/* Metadata: teks + voice */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">
          {previewText}
        </p>
        {selectedVoiceName && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <VoiceAvatar
              seed={selectedVoiceSeed ?? selectedVoiceName}
              name={selectedVoiceName}
              className="shrink-0"
            />
            <span className="truncate">{selectedVoiceName}</span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="flex-col"
          onClick={seekBackward}
        >
          <Undo className="size-4 -mb-1" />
          <span className="text-[10px] font-medium">5</span>
        </Button>

        <Button
          variant="default"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause className="fill-background" />
          ) : (
            <Play className="fill-background" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex-col"
          onClick={seekForward}
        >
          <Undo className="size-4 -mb-1 rotate-180" />
          <span className="text-[10px] font-medium">5</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label="Download audio"
        >
          <Download className="size-4" />
        </Button>
      </div>
    </div>
  );
}
