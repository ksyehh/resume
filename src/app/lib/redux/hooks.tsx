import { useEffect, useState } from "react";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { store, type RootState, type AppDispatch } from "lib/redux/store";
import {
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from "lib/redux/local-storage";
import { resumeRehydrationDefaults, setResume } from "lib/redux/resumeSlice";
import {
  initialSettings,
  setSettings,
  type Settings,
  type ShowForm,
} from "lib/redux/settingsSlice";
import { deepMerge } from "lib/deep-merge";
import { fillMissingFromDefaults } from "lib/redux/fill-missing-from-defaults";
import { getPreloadedState } from "lib/resume-preloader";
import type { Resume } from "lib/redux/types";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook to save store to local storage on store change
 */
export const useSaveStateToLocalStorageOnChange = () => {
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      saveStateToLocalStorage(store.getState());
    });
    return unsubscribe;
  }, []);
};

export const useSetInitialStore = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const preloadState = getPreloadedState();

    if (preloadState.isLoaded && preloadState.resume) {
      dispatch(setResume(preloadState.resume));
      setIsLoading(false);
      return;
    }

    if (preloadState.isLoaded && !preloadState.resume) {
      setIsLoading(false);
      return;
    }

    const state = loadStateFromLocalStorage();
    if (!state) {
      setIsLoading(false);
      return;
    }

    if (state.resume) {
      const mergedResumeState = deepMerge(
        resumeRehydrationDefaults,
        state.resume
      ) as Resume;
      fillMissingFromDefaults(
        mergedResumeState as unknown as Record<string, unknown>,
        resumeRehydrationDefaults as unknown as Record<string, unknown>
      );
      dispatch(setResume(mergedResumeState));
    }

    if (state.settings) {
      const mergedSettingsState = deepMerge(
        initialSettings,
        state.settings
      ) as Settings;
      fillMissingFromDefaults(
        mergedSettingsState as unknown as Record<string, unknown>,
        initialSettings as unknown as Record<string, unknown>
      );
      const order = mergedSettingsState.formsOrder;
      if (!order.includes("personalSummary" as ShowForm)) {
        mergedSettingsState.formsOrder = [
          "personalSummary",
          ...order.filter((f) => f !== "personalSummary"),
        ];
      }
      dispatch(setSettings(mergedSettingsState));
    }

    setIsLoading(false);
  }, []);

  return isLoading;
};