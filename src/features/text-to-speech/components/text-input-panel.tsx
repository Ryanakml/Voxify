"use client";

import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { ttsFormOptions } from "../data/tts-form-config";
import { useStore } from "@tanstack/react-form";
import { Textarea } from "@/components/ui/textarea";
import { COST_PER_UNIT, MAX_TEXT_LENGTH } from "../data/constant";
import { GenerateButton } from "./generate-button";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";

export function TextInputPanel() {
  const form = useTypedAppFormContext(ttsFormOptions);

  const text = useStore(form.store, (s) => s.values.text);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const isValid = useStore(form.store, (s) => s.isValid);

  return (
    <div className="flex h-full min-h-0 flex-col flex-1">
      <div className="relative min-h-0 flex-1">
        <form.Field name="text">
          {(field) => (
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Start typing or paste your text here..."
              className="absolute inset-0 resize-none border-0 bg-transparent p-4 pb-6 lg:p-6 lg:pb-8 text-base! leading-relaxed tracking-tight shadow-none wrap-break-word focus-visible:ring-0"
              maxLength={MAX_TEXT_LENGTH}
              disabled={isSubmitting}
            />
          )}
        </form.Field>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="shrink-0 p-4 lg:p-6">
        <div className="flex flex-col gap-3 lg:hidden">
          <GenerateButton
            className="w-full"
            disabled={!isValid || isSubmitting}
            isSubmitting={isSubmitting}
            onSubmit={() => form.handleSubmit()}
          />
        </div>

        {text.length > 0 ? (
          <div className="hidden items-center justify-between lg:flex">
            <Badge variant="outline" className="gap-1.5 border-dashed">
              <Coins className="size-3 text-chart-5" />
              <span className="text-xs">
                <span className="tabular-nums">
                  ${(text.length * COST_PER_UNIT).toFixed(4)}
                </span>
              </span>
            </Badge>

            <div className="flex items-center gap-3">
              <p className="text-xs tracking-tight">
                {text.length.toLocaleString()}
                <span className="text-muted-foreground">
                  {" "}
                  / {MAX_TEXT_LENGTH.toLocaleString()} characters
                </span>
              </p>

              <GenerateButton
                size="sm"
                disabled={!isValid || isSubmitting}
                isSubmitting={isSubmitting}
                onSubmit={() => form.handleSubmit()}
              />
            </div>
          </div>
        ) : (
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">
              Get started by typing or pasting text above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
