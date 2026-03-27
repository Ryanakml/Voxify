"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { VoiceAvatar } from "@/components/voice-avatar";
import { Pause, Play, Undo, Download } from "lucide-react";
import { useState } from "react";
import { useWaveSurfer } from "../hooks/use-wavesurfer";
import { format } from "date-fns";

type VoicePreviewPanelVoice = {
  id?: string;
  name: string;
};

function formatTime(seconds: number): string {
  return format(new Date(seconds * 1000), "mm:ss");
}

function getPreviewText(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 4) return words.join(" ");
  return `${words.slice(0, 4).join(" ")}...`;
}

export function VoicePreviewPanel({
  audioUrl,
  voice,
  text,
}: {
  audioUrl: string;
  voice: VoicePreviewPanelVoice | null;
  text: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedVoiceName = voice?.name ?? null;
  const selectedVoiceSeed = voice?.id ?? null;
  const previewText = getPreviewText(text);

  const {
    containerRef,
    isPlaying,
    isReady,
    currentTime,
    duration,
    togglePlayPause,
    seekBackward,
    seekForward,
  } = useWaveSurfer({
    url: audioUrl,
    autoplay: true,
  });

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
    <div className="hidden min-w-0 flex-col overflow-hidden border-t lg:flex">
      {/* Header */}
      <div className="p-6 pb-0">
        <h3 className="font-semibold text-foreground">Voice preview</h3>
      </div>

      {/* Waveform */}
      <div className="relative flex min-w-0 items-center justify-center px-6 py-4">
        {!isReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Badge
              variant="outline"
              className="gap-2 bg-background/90 px-3 py-1.5 text-sm text-muted-foreground shadow-sm"
            >
              <Spinner className="size-4" />
              <span>Loading audio...</span>
            </Badge>
          </div>
        )}

        {/* Waveform container with max width and horizontal scroll */}
        <div className="w-full max-w-3xl overflow-hidden">
          <div
            ref={containerRef}
            className={cn(
              "min-w-full cursor-pointer transition-opacity duration-200",
              !isReady && "opacity-0",
            )}
            style={{ minWidth: 400, maxWidth: "100%" }}
          />
        </div>
      </div>

      {/* Time display */}
      <div className="flex items-center justify-center">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {formatTime(currentTime)}&nbsp;
          <span className="text-muted-foreground">
            / {formatTime(duration)}
          </span>
        </p>
      </div>

      {/* Footer: metadata + controls + download */}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 p-6">
        {/* Metadata */}
        <div className="flex min-w-0 flex-col gap-0.5 justify-self-start">
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

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-2 justify-self-center">
          <Button
            variant="ghost"
            size="icon-lg"
            className="flex-col"
            onClick={() => seekBackward(5)}
            disabled={!isReady}
          >
            <Undo className="size-4 -mb-1" />
            <span className="text-[10px] font-medium">5</span>
          </Button>

          <Button
            variant="default"
            size="icon-lg"
            className="rounded-full"
            onClick={togglePlayPause}
            disabled={!isReady}
          >
            {isPlaying ? (
              <Pause className="fill-background" />
            ) : (
              <Play className="fill-background" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon-lg"
            className="flex-col"
            onClick={() => seekForward(5)}
            disabled={!isReady}
          >
            <Undo className="size-4 -mb-1 rotate-180" />
            <span className="text-[10px] font-medium">5</span>
          </Button>
        </div>

        {/* Download */}
        <div className="flex justify-self-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="shrink-0"
          >
            <Download className="size-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
