import { useState, useRef, useCallback } from "react";
import { Mic, Square, FileAudio, Play, Pause, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/lib/utils";
import { useAudioPlayback } from "@/hooks/use-audio-playback";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function getPreferredMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(() => Array(64).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mimeTypeRef = useRef<string>("");

  const stopVisualizer = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current?.disconnect();
    sourceRef.current?.disconnect();
    analyserRef.current = null;
    sourceRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopTimer();
    stopVisualizer();
    stopStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, [stopStream, stopTimer, stopVisualizer]);

  const startVisualizer = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    sourceRef.current = source;
    analyserRef.current = analyser;

    const bins = 64;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      const currentAnalyser = analyserRef.current;
      if (!currentAnalyser) return;

      currentAnalyser.getByteFrequencyData(data);
      const next = Array.from({ length: bins }, (_, i) => {
        const idx = Math.floor((i / bins) * data.length);
        return data[idx] / 255;
      });
      setLevels(next);
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      setElapsedTime(0);
      setLevels(Array(64).fill(0));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeType = getPreferredMimeType();
      mimeTypeRef.current = mimeType ?? "";
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      startVisualizer(stream);
      setIsRecording(true);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError(
          "Microphone access denied. Please allow microphone access in your browser settings.",
        );
      } else {
        setError("Failed to access microphone. Please check your device.");
      }
      cleanup();
    }
  }, [cleanup, startVisualizer]);

  const stopRecording = useCallback(
    (onBlob?: (blob: Blob) => void) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") return;

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        const type = mimeTypeRef.current || chunks[0]?.type || "audio/webm";
        const blob = new Blob(chunks, { type });

        if (blob.size === 0) {
          setError(
            "Recording failed (empty audio). Please recheck your microphone input device and try again.",
          );
        } else {
          setAudioBlob(blob);
          onBlob?.(blob);
        }

        setIsRecording(false);
        cleanup();
      };

      recorder.stop();
    },
    [cleanup],
  );

  const resetRecording = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setElapsedTime(0);
    setAudioBlob(null);
    setError(null);
    setLevels(Array(64).fill(0));
  }, [cleanup]);

  return {
    isRecording,
    elapsedTime,
    audioBlob,
    error,
    levels,
    startRecording,
    stopRecording,
    resetRecording,
  };
}

export function VoiceRecorder({
  file,
  onFileChange,
  isInvalid,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  isInvalid?: boolean;
}) {
  const { isPlaying, togglePlay } = useAudioPlayback(file);

  const {
    isRecording,
    elapsedTime,
    audioBlob,
    levels,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const handleStop = () => {
    stopRecording((blob) => {
      const type = blob.type || "audio/webm";
      const ext = type.includes("mp4")
        ? "m4a"
        : type.includes("ogg")
          ? "ogg"
          : "webm";
      const recordedFile = new File([blob], `recording.${ext}`, { type });
      onFileChange(recordedFile);
    });
  };

  const handleReRecord = () => {
    onFileChange(null);
    resetRecording();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/50 bg-destructive/5 px-6 py-10">
        <p className="text-center text-sm text-destructive">{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={resetRecording}>
          Try again
        </Button>
      </div>
    );
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <FileAudio className="size-5 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
            {audioBlob && elapsedTime > 0 && <>&nbsp;&middot;&nbsp;{formatTime(elapsedTime)}</>}
          </p>
        </div>

        <Button type="button" variant="ghost" size="icon-sm" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" onClick={handleReRecord} title="Re-record">
          <RotateCcw className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onFileChange(null)} title="Remove">
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border">
        <div className="flex h-36 w-full items-end gap-[2px] border-b px-2 py-4">
          {levels.map((level, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-foreground/70"
              style={{ height: `${Math.max(6, level * 100)}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between p-4">
          <p className="text-[28px] font-semibold leading-[1.2] tracking-tight">{formatTime(elapsedTime)}</p>
          <Button type="button" variant="destructive" onClick={handleStop}>
            <Square className="size-3" />
            Stop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-6 py-10",
        isInvalid && "border-destructive",
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <Mic className="size-5 text-muted-foreground" />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-base font-semibold tracking-tight">Record your voice</p>
        <p className="text-center text-sm text-muted-foreground">Click record to start capturing audio</p>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={startRecording}>
        <Mic className="size-3.5" />
        Record
      </Button>
    </div>
  );
}
