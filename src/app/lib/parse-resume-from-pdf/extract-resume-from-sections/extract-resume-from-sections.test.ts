/** @jest-environment node */
import {
  matchOnlyLetterSpaceOrPeriod,
  matchEmail,
  matchPhone,
  matchPhoneChina,
  matchUrl,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-profile";
import { stripChineseSectionNumberPrefix } from "lib/parse-resume-from-pdf/zh-resume-keywords";
import { normalizePdfText } from "lib/parse-resume-from-pdf/normalize-text";
import {
  getBulletPointsFromLines,
  BULLET_POINTS,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";
import { DATE_FEATURE_SETS } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import type { TextItem, Lines } from "lib/parse-resume-from-pdf/types";

const makeTextItem = (text: string) =>
  ({
    text,
  } as TextItem);

describe("extract-profile tests - ", () => {
  it("Name", () => {
    expect(
      matchOnlyLetterSpaceOrPeriod(makeTextItem("Leonardo W. DiCaprio"))![0]
    ).toBe("Leonardo W. DiCaprio");
  });

  it("Name with CJK", () => {
    expect(matchOnlyLetterSpaceOrPeriod(makeTextItem("张三"))![0]).toBe("张三");
    expect(matchOnlyLetterSpaceOrPeriod(makeTextItem("王小明"))![0]).toBe(
      "王小明"
    );
  });

  it("Email", () => {
    expect(matchEmail(makeTextItem("  hello@open-resume.org  "))![0]).toBe(
      "hello@open-resume.org"
    );
  });

  it("Phone", () => {
    expect(matchPhone(makeTextItem("  (123)456-7890  "))![0]).toBe(
      "(123)456-7890"
    );
  });

  it("Phone China mainland", () => {
    expect(matchPhoneChina(makeTextItem("13812345678"))![0]).toBe("13812345678");
    expect(matchPhoneChina(makeTextItem("+86 138-1234-5678"))![0]).toBe(
      "+86 138-1234-5678"
    );
    expect(matchPhoneChina(makeTextItem("１３８１２３４５６７８"))).toBeFalsy();
  });

  it("Url", () => {
    expect(matchUrl(makeTextItem("  linkedin.com/in/open-resume  "))![0]).toBe(
      "linkedin.com/in/open-resume"
    );
    expect(matchUrl(makeTextItem("hello@open-resume.org"))).toBeFalsy();
  });
});

function sumDateFeatureScores(text: string): number {
  const item = { text } as TextItem;
  let sum = 0;
  for (const row of DATE_FEATURE_SETS) {
    const fn = row[0] as (i: TextItem) => boolean | RegExpMatchArray | null;
    const score = row[1] as number;
    const out = fn(item);
    const hit = typeof out === "boolean" ? out : !!out;
    if (hit) sum += score;
  }
  return sum;
}

describe("Chinese resume helpers", () => {
  it("stripChineseSectionNumberPrefix", () => {
    expect(stripChineseSectionNumberPrefix("一、工作经历")).toBe("工作经历");
    expect(stripChineseSectionNumberPrefix("（二） 教育背景")).toBe("教育背景");
    expect(stripChineseSectionNumberPrefix("3. 项目经历")).toBe("项目经历");
  });

  it("normalizePdfText NFKC", () => {
    expect(normalizePdfText("ａ＠ｂ．ｃ")).toBe("a@b.c");
  });

  it("DATE_FEATURE_SETS picks up Chinese-style ranges", () => {
    expect(sumDateFeatureScores("2020年1月 - 至今")).toBeGreaterThan(0);
    expect(sumDateFeatureScores("2019.06～2021.12")).toBeGreaterThan(0);
  });

  it("BULLET_POINTS includes common CN markers", () => {
    expect(BULLET_POINTS).toEqual(expect.arrayContaining(["·", "※", "◇"]));
  });

  it("getBulletPointsFromLines splits on ※", () => {
    const bulletLines: Lines = [
      [makeTextItem("职责描述")],
      [makeTextItem("※"), makeTextItem("完成需求分析")],
      [makeTextItem("※"), makeTextItem("参与上线")],
    ];
    expect(getBulletPointsFromLines(bulletLines)).toEqual([
      "完成需求分析",
      "参与上线",
    ]);
  });
});
