import type { Resume } from "lib/redux/types";
import { resumeRehydrationDefaults } from "lib/redux/resumeSlice";
import { deepMerge } from "lib/deep-merge";
import { fillMissingFromDefaults } from "lib/redux/fill-missing-from-defaults";
import { loadStateFromLocalStorage } from "lib/redux/local-storage";

export interface PreloadState {
  resume: Resume | null;
  settings: unknown | null;
  isLoaded: boolean;
}

let preloadedState: PreloadState = {
  resume: null,
  settings: null,
  isLoaded: false,
};

let isPreloading = false;

export const getPreloadedState = (): PreloadState => {
  return preloadedState;
};

export const isPreloadFinished = (): boolean => {
  return preloadedState.isLoaded;
};

export const preloadResumeState = async (): Promise<PreloadState> => {
  if (preloadedState.isLoaded) {
    return preloadedState;
  }

  if (isPreloading) {
    return preloadedState;
  }

  isPreloading = true;

  try {
    const state = loadStateFromLocalStorage();

    if (!state) {
      preloadedState = {
        resume: null,
        settings: null,
        isLoaded: true,
      };
      return preloadedState;
    }

    let processedResume: Resume | null = null;

    if (state.resume) {
      const mergedResumeState = deepMerge(
        resumeRehydrationDefaults,
        state.resume
      ) as Resume;

      fillMissingFromDefaults(
        mergedResumeState as unknown as Record<string, unknown>,
        resumeRehydrationDefaults as unknown as Record<string, unknown>
      );

      processedResume = mergedResumeState;
    }

    preloadedState = {
      resume: processedResume,
      settings: state.settings || null,
      isLoaded: true,
    };
  } catch (error) {
    console.error("Failed to preload resume state:", error);
    preloadedState = {
      resume: null,
      settings: null,
      isLoaded: true,
    };
  } finally {
    isPreloading = false;
  }

  return preloadedState;
};

export const resetPreloadState = (): void => {
  preloadedState = {
    resume: null,
    settings: null,
    isLoaded: false,
  };
  isPreloading = false;
};