"use client";

import { SessionProvider } from "@/lib/client/session";
import { VoiceProvider } from "@/lib/client/voice";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <VoiceProvider>{children}</VoiceProvider>
    </SessionProvider>
  );
}
