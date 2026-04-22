import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ScoreResumeResponse } from "lib/deepseek/client";
import type { Resume } from "lib/redux/types";

export interface ScoreState {
  isScoring: boolean;
  isOptimizing: boolean;
  scoreResult: ScoreResumeResponse | null;
  error: string | null;
  lastScoredResumeHash: string | null; // 记录上次成功打分的简历内容
}

const initialState: ScoreState = {
  isScoring: false,
  isOptimizing: false,
  scoreResult: null,
  error: null,
  lastScoredResumeHash: null,
};

// 生成简历内容的hash（排除隐私字段）
export const getResumeHash = (resume: Resume): string => {
  // 创建一个副本，排除隐私字段
  const resumeForHash = {
    ...resume,
    profile: {
      ...resume.profile,
      email: "",
      phone: "",
      url: "",
    },
  };
  return JSON.stringify(resumeForHash);
};

// 计算两个字符串的差异比例
export const calculateDifferenceRate = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 100; // 如果任一为空，认为差异100%
  
  let differences = 0;
  const maxLength = Math.max(str1.length, str2.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (str1[i] !== str2[i]) {
      differences++;
    }
  }
  
  return (differences / maxLength) * 100;
};

export const scoreSlice = createSlice({
  name: "score",
  initialState,
  reducers: {
    startScoring: (state) => {
      state.isScoring = true;
      state.error = null;
    },
    setScoreResult: (state, action: PayloadAction<{ result: ScoreResumeResponse; resumeHash: string }>) => {
      state.isScoring = false;
      state.scoreResult = action.payload.result;
      state.lastScoredResumeHash = action.payload.resumeHash;
      state.error = null;
    },
    setScoringError: (state, action: PayloadAction<string>) => {
      state.isScoring = false;
      state.error = action.payload;
    },
    clearScoreResult: (state) => {
      state.scoreResult = null;
      state.error = null;
      state.lastScoredResumeHash = null;
    },
    startOptimizing: (state) => {
      state.isOptimizing = true;
    },
    finishOptimizing: (state) => {
      state.isOptimizing = false;
    },
  },
});

export const {
  startScoring,
  setScoreResult,
  setScoringError,
  clearScoreResult,
  startOptimizing,
  finishOptimizing,
} = scoreSlice.actions;

export const selectIsScoring = (state: { score: ScoreState }) => state.score.isScoring;
export const selectIsOptimizing = (state: { score: ScoreState }) => state.score.isOptimizing;
export const selectScoreResult = (state: { score: ScoreState }) => state.score.scoreResult;
export const selectScoreError = (state: { score: ScoreState }) => state.score.error;
export const selectLastScoredResumeHash = (state: { score: ScoreState }) => state.score.lastScoredResumeHash;

export { initialState as initialScoreState };
export default scoreSlice.reducer;
