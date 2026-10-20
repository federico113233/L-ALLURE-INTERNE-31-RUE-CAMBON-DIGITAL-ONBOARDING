"use client";

import dynamic from "next/dynamic";

// The whole journey is client-side (WebGL, Web Audio, microphone).
const Experience = dynamic(() => import("@/components/journey/Experience"), {
  ssr: false,
  loading: () => <main className="h-dvh w-full bg-noir" />,
});

export default function Page() {
  return <Experience />;
}
