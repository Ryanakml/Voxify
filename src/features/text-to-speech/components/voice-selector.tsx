import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { useTTSVoices } from "../context/tts-voices-context";
import { ttsFormOptions } from "../data/tts-form-config";
import { useStore } from "@tanstack/react-form";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoiceAvatar } from "@/components/voice-avatar";
import { VOICE_CATEGORY_LABELS } from "@/features/voices/data/voice-categories";

export function VoiceSelector() {
  const { customVoices, systemVoices, allVoices: voices } = useTTSVoices();

  const form = useTypedAppFormContext(ttsFormOptions);
  const voiceId = useStore(form.store, (s) => s.values.voiceId);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  const selectedVoice = voices.find((v) => v.id === voiceId);
  const hasMissingSelectedVoice = Boolean(voiceId) && !selectedVoice;

  const currentVoice = selectedVoice
    ? selectedVoice
    : hasMissingSelectedVoice
      ? {
          id: voiceId,
          name: "Unavailable voice",
          category: null as null,
        }
      : voices[0];

  const activeVoiceId = currentVoice?.id ?? null;
  const visibleCustomVoices = activeVoiceId
    ? customVoices.filter((v) => v.id !== activeVoiceId)
    : customVoices;
  const visibleSystemVoices = activeVoiceId
    ? systemVoices.filter((v) => v.id !== activeVoiceId)
    : systemVoices;

  return (
    <Field>
      <FieldLabel>Voice style</FieldLabel>

      <Select
        value={voiceId}
        onValueChange={(v) => form.setFieldValue("voiceId", v)}
        disabled={isSubmitting}
      >
        <SelectTrigger className="w-full h-auto gap-1 rounded-lg bg-white px-2 py-1">
          <SelectValue>
            {currentVoice && (
              <>
                <VoiceAvatar seed={currentVoice.id} name={currentVoice.name} />
                <span className="truncate text-sm font-medium tracking-tight">
                  {currentVoice.name}
                  {currentVoice.category &&
                    ` – ${VOICE_CATEGORY_LABELS[currentVoice.category]}`}
                </span>
              </>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {currentVoice && (
            <SelectGroup>
              <SelectLabel>Selected Voice</SelectLabel>
              <SelectItem value={currentVoice.id}>
                <VoiceAvatar seed={currentVoice.id} name={currentVoice.name} />
                <span className="truncate text-sm font-medium">
                  {currentVoice.name}
                  {currentVoice.category &&
                    ` – ${VOICE_CATEGORY_LABELS[currentVoice.category]}`}
                </span>
              </SelectItem>
            </SelectGroup>
          )}

          {(visibleCustomVoices.length > 0 || visibleSystemVoices.length > 0) && (
            <SelectSeparator />
          )}

          {visibleCustomVoices.length > 0 && (
            <SelectGroup>
              <SelectLabel>Team Voices</SelectLabel>
              {visibleCustomVoices.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <VoiceAvatar seed={v.id} name={v.name} />
                  <span className="truncate text-sm font-medium">
                    {v.name} – {VOICE_CATEGORY_LABELS[v.category]}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {visibleSystemVoices.length > 0 && (
            <SelectGroup>
              <SelectLabel>Built-in Voices</SelectLabel>
              {visibleSystemVoices.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <VoiceAvatar seed={v.id} name={v.name} />
                  <span className="truncate text-sm font-medium">
                    {v.name} – {VOICE_CATEGORY_LABELS[v.category]}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </Field>
  );
}
