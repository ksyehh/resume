"use client";
import { useState, useEffect } from "react";
import { useLocale } from "lib/i18n/LocaleProvider";
import { Loading } from "components/Loading";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { selectResume, setResume } from "lib/redux/resumeSlice";
import { showToast } from "components/Toast";
import {
  selectIsScoring,
  selectIsOptimizing,
  selectScoreResult,
  selectLastScoredResumeHash,
  startScoring,
  setScoreResult,
  setScoringError,
  startOptimizing,
  finishOptimizing,
  getResumeHash,
  calculateDifferenceRate,
} from "lib/redux/scoreSlice";

const ScoreProgressBar = ({ label, score, maxScore }: { label: string; score: number; maxScore: number }) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const getColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{score}/{maxScore}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-1000 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const IssueItem = ({ type, description, suggestion }: { type: string; description: string; suggestion: string }) => {
  const getTypeColor = () => {
    const t = type.toLowerCase();
    if (t.includes("fatal") || t.includes("严重")) return "bg-red-100 text-red-800";
    if (t.includes("warning") || t.includes("警告")) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
      {type && (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getTypeColor()}`}>
          {type}
        </span>
      )}
      <p className="text-gray-700 mb-2">{description}</p>
      {suggestion && (
        <p className="text-gray-600 text-sm">
          <span className="font-medium">💡 {suggestion}</span>
        </p>
      )}
    </div>
  );
};

// 模拟默认打分结果
const mockScoreResult = {
  score: {
    total: 65,
    level: "一般",
    breakdown: {
      completeness: 15,
      clarity: 18,
      impact: 15,
      structure: 10,
      professionalism: 7,
    },
  },
  score_explanation: {
    summary: "简历内容基本完整，但缺少量化成果，表达可以更加简洁有力。",
    key_reasons: ["缺少量化成果数据", "工作经历描述较为笼统", "技能展示不够突出"],
    risk: "竞争力一般，建议优化成果展示。",
  },
  fatal_issue: "",
  issues: [
    {
      type: "建议",
      description: "工作经历缺少量化成果",
      suggestion: "添加具体数据，如：增长百分比、效率提升、项目规模等",
    },
    {
      type: "建议",
      description: "技能展示不够突出",
      suggestion: "精选最相关的技能，使用简洁的描述",
    },
  ],
  optimized_resume: null,
};

export const ResumeScoreSection = () => {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const resume = useAppSelector(selectResume);
  const isScoring = useAppSelector(selectIsScoring);
  const isOptimizing = useAppSelector(selectIsOptimizing);
  const scoreResult = useAppSelector(selectScoreResult);
  const lastScoredResumeHash = useAppSelector(selectLastScoredResumeHash);
  const [showOverlay, setShowOverlay] = useState(!scoreResult);

  useEffect(() => {
    if (scoreResult) {
      setShowOverlay(false);
    } else {
      setShowOverlay(true); // 当 scoreResult 被清除时，显示蒙版
    }
  }, [scoreResult]);

  const getLevelColor = () => {
    const currentScore = scoreResult || mockScoreResult;
    const level = currentScore.score.level.toLowerCase();
    if (level.includes("优秀") || level.includes("excellent")) {
      return "text-green-600 bg-green-50 border-green-200";
    }
    if (level.includes("良好") || level.includes("good")) {
      return "text-blue-600 bg-blue-50 border-blue-200";
    }
    if (level.includes("一般") || level.includes("average")) {
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
    return "text-red-600 bg-red-50 border-red-200";
  };

  const handleAiScore = async () => {
    const currentResumeHash = getResumeHash(resume);
    
    // 检查是否有上次记录的简历
    if (lastScoredResumeHash) {
      const differenceRate = calculateDifferenceRate(lastScoredResumeHash, currentResumeHash);
      
      if (differenceRate <= 10) {
        showToast({ message: "当前简历改动较小，没有必要频繁打分。", type: "warning" });
        return;
      }
    }
    
    dispatch(startScoring());
    setShowOverlay(true);

    try {
      const response = await fetch("/api/score-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resume }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch(setScoreResult({ result: data.data, resumeHash: currentResumeHash }));
      } else {
        dispatch(setScoringError(data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error scoring resume:", error);
      dispatch(setScoringError("Network error"));
    }
  };

  const handleOptimize = () => {
    if (!scoreResult?.optimized_resume) return;

    dispatch(startOptimizing());

    const optimized = scoreResult.optimized_resume;
    const newResume = {
      ...resume,
      profile: {
        ...resume.profile,
        name: optimized.profile.name || resume.profile.name,
        summary: optimized.profile.summary || resume.profile.summary,
      },
      personalSummary: {
        descriptions: optimized.personalSummary?.descriptions || resume.personalSummary.descriptions,
      },
      workExperiences: optimized.workExperiences?.map(exp => ({
        ...exp,
        descriptions: exp.descriptions || [],
      })) || resume.workExperiences,
      educations: optimized.educations?.map(edu => ({
        ...edu,
        descriptions: edu.descriptions || [],
      })) || resume.educations,
      projects: optimized.projects?.map(proj => ({
        ...proj,
        descriptions: proj.descriptions || [],
      })) || resume.projects,
      skills: {
        featuredSkills: optimized.skills?.featuredSkills || resume.skills.featuredSkills,
        descriptions: optimized.skills?.descriptions || resume.skills.descriptions,
      },
      custom: {
        descriptions: optimized.custom?.descriptions || resume.custom.descriptions,
      },
    };

    dispatch(setResume(newResume));
    dispatch(finishOptimizing());
  };

  const currentDisplayResult = scoreResult || mockScoreResult;

  return (
    <div className="relative">
      {/* 模糊蒙版 */}
      {showOverlay && (
        <div className="absolute inset-0 z-20 flex items-start justify-center bg-white/80 backdrop-blur-sm pt-6">
          {isScoring ? (
            <div className="text-center pt-24">
              <Loading message={t("scorePanel.loading")} size="lg" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 pt-24">
              <button
                onClick={handleAiScore}
                className="flex items-center gap-2 rounded border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 hover:border-blue-600"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>AI 打分</span>
              </button>
              <div className="text-center">
                <p className="text-base text-gray-700">点击开始AI分析您的简历</p>
                <p className="text-sm text-gray-600 mt-2">个人隐私信息已过滤，不会发给AI</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 打分内容 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* 头部 - 总分和按钮 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${currentDisplayResult.score.total}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{currentDisplayResult.score.total}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t("scorePanel.totalScore")}
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 border ${getLevelColor()}`}
                >
                  {currentDisplayResult.score.level}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* AI打分按钮 */}
              <button
                onClick={handleAiScore}
                disabled={isScoring}
                className="flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>{isScoring ? t("scorePanel.loading") : "AI 打分"}</span>
              </button>
              {/* 一键优化按钮 */}
              {scoreResult?.optimized_resume && (
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="flex items-center gap-2 rounded border border-green-500 bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 hover:border-green-600 disabled:opacity-50"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>{isOptimizing ? t("scorePanel.optimizing") : t("scorePanel.optimizeBtn")}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* 评分细分 */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {t("scorePanel.scoreExplanation")}
            </h4>
            <ScoreProgressBar
              label={t("scorePanel.breakdown.completeness")}
              score={currentDisplayResult.score.breakdown.completeness}
              maxScore={20}
            />
            <ScoreProgressBar
              label={t("scorePanel.breakdown.clarity")}
              score={currentDisplayResult.score.breakdown.clarity}
              maxScore={25}
            />
            <ScoreProgressBar
              label={t("scorePanel.breakdown.impact")}
              score={currentDisplayResult.score.breakdown.impact}
              maxScore={25}
            />
            <ScoreProgressBar
              label={t("scorePanel.breakdown.structure")}
              score={currentDisplayResult.score.breakdown.structure}
              maxScore={15}
            />
            <ScoreProgressBar
              label={t("scorePanel.breakdown.professionalism")}
              score={currentDisplayResult.score.breakdown.professionalism}
              maxScore={15}
            />
          </div>

          {/* 评分说明 */}
          {(currentDisplayResult.score_explanation.summary || 
            currentDisplayResult.score_explanation.key_reasons?.length > 0 || 
            currentDisplayResult.score_explanation.risk) && (
            <div className="mb-8 bg-gray-50 rounded-lg p-4">
              {currentDisplayResult.score_explanation.summary && (
                <p className="text-gray-700 mb-3">{currentDisplayResult.score_explanation.summary}</p>
              )}
              {currentDisplayResult.score_explanation.key_reasons?.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">{t("scorePanel.keyReasons")}:</h5>
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                    {currentDisplayResult.score_explanation.key_reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {currentDisplayResult.score_explanation.risk && (
                <div className="text-yellow-700 bg-yellow-50 rounded p-3 text-sm">
                  <span className="font-medium">{t("scorePanel.risk")}:</span> {currentDisplayResult.score_explanation.risk}
                </div>
              )}
            </div>
          )}

          {/* 致命问题 */}
          {currentDisplayResult.fatal_issue && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-red-700 mb-4">
                ⚠️ {t("scorePanel.fatalIssue")}
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{currentDisplayResult.fatal_issue}</p>
              </div>
            </div>
          )}

          {/* 问题列表 */}
          {currentDisplayResult.issues?.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {t("scorePanel.issues")}
              </h4>
              {currentDisplayResult.issues.map((issue, i) => (
                <IssueItem
                  key={i}
                  type={issue.type}
                  description={issue.description}
                  suggestion={issue.suggestion}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
