"use client";

import { useEffect } from "react";
import { Hero } from "home/Hero";
import { preloadResumeState } from "lib/resume-preloader";

export default function Home() {
  useEffect(() => {
    preloadResumeState();
  }, []);

  return (
    <main className="mx-auto max-w-screen-2xl bg-dot px-8 pb-16 text-gray-900 lg:px-12">
      <Hero />
    </main>
  );
}