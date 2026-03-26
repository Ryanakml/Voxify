"use client";

import React, { createElement } from "react";
import { useAppForm } from "@/hooks/use-app-form";
import {
  ttsFormSchema,
  ttsFormOptions,
  defaultTTSValues,
  type TTSFormValues,
} from "./tts-form-config";

export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: { onSubmit: ttsFormSchema },
    onSubmit: async () => {},
  });

  return createElement(form.AppForm, null, children);
}
