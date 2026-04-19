import { useEffect } from "react";
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
  useEffect(() => {
    const state = loadStateFromLocalStorage();
    if (!state) return;
    if (state.resume) {
      // We merge the initial state with the stored state to ensure
      // backward compatibility, since new fields might be added to
      // the initial state over time.
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
      // 创建一个不包含 formToHeading 的设置对象
      const { formToHeading: _, ...settingsWithoutHeading } = state.settings;
      const mergedSettingsState = deepMerge(
        initialSettings,
        settingsWithoutHeading
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
  }, []);
};
