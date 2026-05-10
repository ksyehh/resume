/**
 * 字体配置 - 仅保留思源黑体
 */

export const ENGLISH_FONT_FAMILIES = [] as const;
type EnglishFontFamily = (typeof ENGLISH_FONT_FAMILIES)[number];

export const NON_ENGLISH_FONT_FAMILIES = ["NotoSansSC"] as const;
type NonEnglishFontFamily = (typeof NON_ENGLISH_FONT_FAMILIES)[number];

export const NON_ENGLISH_FONT_FAMILY_TO_LANGUAGE: Record<
  NonEnglishFontFamily,
  string[]
> = {
  NotoSansSC: ["zh", "zh-CN", "zh-TW"],
};

export type FontFamily = NonEnglishFontFamily;
export const FONT_FAMILY_TO_STANDARD_SIZE_IN_PT: Record<FontFamily, number> = {
  NotoSansSC: 11,
};

export const FONT_FAMILY_TO_DISPLAY_NAME: Record<FontFamily, string> = {
  NotoSansSC: "思源黑体(简体)",
};
