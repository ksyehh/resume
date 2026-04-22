"use client";
import { useLocale } from "lib/i18n/LocaleProvider";
import { Loading } from "components/Loading";
import { SparklesIcon } from "@heroicons/react/24/outline";
import type { ScoreResumeResponse } from "lib/deepseek/client";

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
          className={`h-2.5 rounded-full transition-all duration-500 ${getColor()}`}
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

const ResumeScorePanel = ({
  isScoring,
  scoreResult,
  onOptimize,
  isOptimizing,
}: {
  isScoring: boolean;
  scoreResult: ScoreResumeResponse | null;
  onOptimize: () => void;
  isOptimizing: boolean;
}) => {
  const { t } = useLocale();

  // 加载状态
  if (isScoring) {
    return (
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <Loading message={t("scorePanel.loading")} size="lg" />
          <p className="text-center text-sm text-green-600 mt-4">
            {t("scorePanel.privacyNote")}
          </p>
        </div>
      </div>
    );
  }

  // 没有评分结果，不显示
  if (!scoreResult) {
    return null;
  }

  const { score, score_explanation, fatal_issue, issues } = scoreResult;

  const getLevelColor = () => {
    const level = score.level.toLowerCase();
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

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* 头部 - 总分 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${score.total}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{score.total}</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("scorePanel.totalScore")}
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 border ${getLevelColor()}`}
                >
                  {score.level}
                </span>
              </div>
            </div>
            <button
              onClick={onOptimize}
              disabled={isOptimizing}
              className="flex items-center gap-2 rounded border border-green-500 bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 hover:border-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="h-5 w-5" />
              <span>{isOptimizing ? t("scorePanel.optimizing") : t("scorePanel.optimizeBtn")}</span>
            </button>
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
              score={score.breakdown.completeness}
              maxScore={20}
            />
            <ScoreProgressBar
              label={t("scorePanel.breakdown.clarity")}
              score={score.breakdown.clarity}
              maxScore={25}
            />
            <ScoreProgressBar
              label={t("scorePanel.breakdown.impact")}
              score={score.breakdown.impact}
              maxScore={25}
            />
            <ScoreProgressBar
              label={t("scorePanel.breakdown.structure")}
              score={score.breakdown.structure}
              maxScore={15}
            />
            <ScoreProgressBar
              label={t("scorePanel.breakdown.professionalism")}
              score={score.breakdown.professionalism}
              maxScore={15}
            />
          </div>

          {/* 评分说明 */}
          {(score_explanation.summary || score_explanation.key_reasons?.length > 0 || score_explanation.risk) && (
            <div className="mb-8 bg-gray-50 rounded-lg p-4">
              {score_explanation.summary && (
                <p className="text-gray-700 mb-3">{score_explanation.summary}</p>
              )}
              {score_explanation.key_reasons?.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">{t("scorePanel.keyReasons")}:</h5>
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                    {score_explanation.key_reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {score_explanation.risk && (
                <div className="text-yellow-700 bg-yellow-50 rounded p-3 text-sm">
                  <span className="font-medium">{t("scorePanel.risk")}:</span> {score_explanation.risk}
                </div>
              )}
            </div>
          )}

          {/* 致命问题 */}
          {fatal_issue && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-red-700 mb-4">
                ⚠️ {t("scorePanel.fatalIssue")}
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{fatal_issue}</p>
              </div>
            </div>
          )}

          {/* 问题列表 */}
          {issues?.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {t("scorePanel.issues")}
              </h4>
              {issues.map((issue, i) => (
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

export default ResumeScorePanel;
