import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import z from "zod";
import locales from "locale-codes";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import {
  AlignLeft,
  AudioLines,
  ChevronsUpDown,
  FileAudio,
  FolderOpen,
  Globe,
  Layers,
  Mic,
  Pause,
  Play,
  Search,
  Tag,
  Upload,
  X,
} from "lucide-react";

import {
  VOICE_CATEGORIES,
  VOICE_CATEGORY_LABELS,
} from "@/features/voices/data/voice-categories";
import { VoiceRecorder } from "./voice-recorder";

const LANGUAGE_OPTIONS = (
  locales.all as Array<{ tag: string; name: string; location?: string }>
)
  .filter((l) => l.tag && l.tag.includes("-") && l.name)
  .map((l) => ({
    value: l.tag,
    label: l.location ? `${l.name} (${l.location})` : l.name,
  }));

/* ========================= */
/* HELPERS                   */
/* ========================= */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ========================= */
/* HOOK: useAudioPlayback    */
/* ========================= */

function useAudioPlayback(file: File | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!file) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(file));
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [file, isPlaying]);

  return { isPlaying, togglePlay };
}

/* ========================= */
/* SCHEMA                    */
/* ========================= */

const voiceCreateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "A category is required"),
  language: z.string().min(1, "A language is required"),
  description: z.string(),
  file: z
    .instanceof(File, { message: "An audio file is required" })
    .nullable()
    .refine((f) => f !== null, "An audio file is required"),
});

type VoiceCreateFormValues = {
  name: string;
  category: string;
  language: string;
  description: string;
  file: File | null;
};

/* ========================= */
/* MAIN FORM COMPONENT       */
/* ========================= */

interface VoiceCreateFormProps {
  scrollable?: boolean;
  footer?: (submit: React.ReactNode) => React.ReactNode;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function VoiceCreateForm({
  scrollable,
  footer,
  onSuccess,
  onError,
}: VoiceCreateFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      file,
      category,
      language,
      description,
    }: {
      name: string;
      file: File;
      category: string;
      language: string;
      description?: string;
    }) => {
      const params = new URLSearchParams({ name, category, language });
      if (description) params.set("description", description);

      const response = await fetch(`/api/voices/create?${params.toString()}`, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to create voice");
      }

      return response.json();
    },
  });

  const form = useForm<VoiceCreateFormValues>({
    defaultValues: {
      name: "",
      file: null,
      category: "GENERAL",
      language: "en-US",
      description: "",
    },
    resolver: zodResolver(voiceCreateFormSchema),
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    control,
    reset,
  } = form;

  const onSubmit = async (values: VoiceCreateFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        file: values.file!,
        category: values.category,
        language: values.language,
        description: values.description || undefined,
      });

      toast.success("Voice created successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.voices.getAll.queryKey(),
      });
      onSuccess?.();

      reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create voice";

      toast.error(message);
      onError?.(message);
    }
  };

  const submitButton = (
    <Button type="submit" disabled={isSubmitting} className="w-full">
      {isSubmitting ? "Creating..." : "Create Voice"}
    </Button>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "flex w-full min-w-0 flex-col overflow-x-hidden [&_[data-slot=field]]:min-w-0 [&_[data-slot=input]]:min-w-0 [&_[data-slot=textarea]]:min-w-0",
        scrollable ? "min-h-0 flex-1" : "gap-4",
      )}
    >
      <div
        className={cn(
          scrollable
            ? "no-scrollbar flex min-w-0 flex-col gap-4 overflow-y-auto overflow-x-hidden px-4"
            : "flex flex-col gap-4",
        )}
      >
        {/* ── 1. FILE (tabs + dropzone) ── */}
        <Controller
          name="file"
          control={control}
          render={({ field, fieldState }) => {
            const isInvalid = fieldState.isTouched && fieldState.invalid;
            return (
              <Field data-invalid={isInvalid}>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="h-11 w-full">
                    <TabsTrigger value="upload" className="flex-1">
                      <Upload className="size-3.5" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="record" className="flex-1">
                      <Mic className="size-3.5" />
                      Record
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-2">
                    <FileDropzone
                      file={field.value}
                      onFileChange={(f) => {
                        field.onChange(f);
                        field.onBlur();
                      }}
                      isInvalid={isInvalid}
                    />
                  </TabsContent>
                  <TabsContent value="record" className="mt-2">
                    <VoiceRecorder
                      file={field.value}
                      onFileChange={(f) => {
                        field.onChange(f);
                        field.onBlur();
                      }}
                      isInvalid={isInvalid}
                    />
                  </TabsContent>
                </Tabs>

                {isInvalid && (
                  <FieldError
                    errors={
                      fieldState.error
                        ? [{ message: fieldState.error.message }]
                        : []
                    }
                  />
                )}
              </Field>
            );
          }}
        />

        {/* ── 2. NAME ── */}
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => {
            const isInvalid = fieldState.isTouched && fieldState.invalid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <Tag className="size-4 text-muted-foreground" />
                  </div>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Voice Label"
                    aria-invalid={isInvalid}
                    className="pl-10"
                  />
                </div>
                {isInvalid && (
                  <FieldError
                    errors={
                      fieldState.error
                        ? [{ message: fieldState.error.message }]
                        : []
                    }
                  />
                )}
              </Field>
            );
          }}
        />

        {/* ── 3. CATEGORY ── */}
        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => {
            const isInvalid = fieldState.isTouched && fieldState.invalid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <Layers className="size-4 text-muted-foreground" />
                  </div>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {VOICE_CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isInvalid && (
                  <FieldError
                    errors={
                      fieldState.error
                        ? [{ message: fieldState.error.message }]
                        : []
                    }
                  />
                )}
              </Field>
            );
          }}
        />

        {/* ── 4. LANGUAGE (searchable combobox) ── */}
        <Controller
          name="language"
          control={control}
          render={({ field, fieldState }) => {
            const isInvalid = fieldState.isTouched && fieldState.invalid;
            return (
              <Field data-invalid={isInvalid}>
                <LanguageCombobox
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    field.onBlur();
                  }}
                  isInvalid={isInvalid}
                  options={LANGUAGE_OPTIONS}
                />
                {isInvalid && (
                  <FieldError
                    errors={
                      fieldState.error
                        ? [{ message: fieldState.error.message }]
                        : []
                    }
                  />
                )}
              </Field>
            );
          }}
        />

        {/* ── 5. DESCRIPTION ── */}
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => {
            const isInvalid = fieldState.isTouched && fieldState.invalid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-start">
                  <div className="pointer-events-none absolute left-0 flex w-11 items-start justify-center pt-3">
                    <AlignLeft className="size-4 text-muted-foreground" />
                  </div>
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Describe this voice..."
                    aria-invalid={isInvalid}
                    className="field-sizing-fixed min-h-24 w-full min-w-0 overflow-x-hidden pl-10 break-all whitespace-pre-wrap [overflow-wrap:anywhere]"
                    rows={3}
                  />
                </div>
                {isInvalid && (
                  <FieldError
                    errors={
                      fieldState.error
                        ? [{ message: fieldState.error.message }]
                        : []
                    }
                  />
                )}
              </Field>
            );
          }}
        />
      </div>

      {/* ── SUBMIT ── */}
      <div className={cn(scrollable && "px-4 pt-2")}>
        {footer ? footer(submitButton) : submitButton}
      </div>
    </form>
  );
}

/* ========================= */
/* FILE DROPZONE COMPONENT   */
/* ========================= */

function FileDropzone({
  file,
  onFileChange,
  isInvalid,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  isInvalid?: boolean;
}) {
  const { isPlaying, togglePlay } = useAudioPlayback(file);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      accept: { "audio/*": [] },
      maxSize: 20 * 1024 * 1024,
      multiple: false,
      noClick: true, // we handle click ourselves via the button
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          onFileChange(acceptedFiles[0]);
        }
      },
    });

  // ── File selected ────────────────────────────────────────────────────────
  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileAudio className="size-5 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onFileChange(null)}
          aria-label="Remove file"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  // ── Empty / drag state ───────────────────────────────────────────────────
  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border px-6 py-8 transition-colors",
        isDragReject || isInvalid
          ? "border-destructive bg-destructive/5"
          : isDragActive
            ? "border-primary bg-primary/5"
            : "",
      )}
    >
      {/* Hidden native input managed by useDropzone */}
      <input {...getInputProps()} />

      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <AudioLines className="size-5 text-muted-foreground" />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-base font-semibold tracking-tight">
          {isDragActive
            ? "Drop your audio file here"
            : "Upload your audio file"}
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Supports all audio formats, max size 20MB
        </p>
      </div>

      {/* Explicit upload button — calls useDropzone's open() */}
      <Button type="button" variant="outline" size="sm" onClick={open}>
        <FolderOpen className="size-3.5" />
        Upload file
      </Button>
    </div>
  );
}

/* ========================= */
/* LANGUAGE COMBOBOX         */
/* Searchable popover — matches Image 3 */
/* ========================= */

function LanguageCombobox({
  value,
  onChange,
  isInvalid,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={isInvalid}
          className={cn(
            "flex h-10 w-full items-center gap-3 rounded-md border bg-background px-3 text-sm transition-colors",
            "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isInvalid && "border-destructive",
          )}
        >
          <Globe className="size-4 shrink-0 text-muted-foreground" />
          <span
            className={cn(
              "flex-1 text-left",
              !selected && "text-muted-foreground",
            )}
          >
            {selected ? selected.label : "Select language..."}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        {/* Search row */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search language..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Option list */}
        <div
          ref={listRef}
          className="max-h-60 overflow-y-auto py-1"
          onWheelCapture={(e) => {
            const list = listRef.current;
            if (!list) return;

            if (list.scrollHeight <= list.clientHeight) return;

            list.scrollTop += e.deltaY;
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No languages found.
            </p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setSearch("");
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                  value === opt.value && "bg-accent/60 font-medium",
                )}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
