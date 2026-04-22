"use client";

import { memo } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { spacingPx } from "components/Resume/ResumeCssMirror/spacingPx";
import {
  DEFAULT_FONT_COLOR,
  type Settings,
  type ShowForm,
} from "lib/redux/settingsSlice";
import type { Resume } from "lib/redux/types";
import { PX_PER_PT } from "lib/constants";

type Props = {
  resume: Resume;
  settings: Settings;
};

function ResumeCssSection({
  themeColor,
  heading,
  children,
  className = "",
}: {
  themeColor?: string;
  heading?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const barWidth = spacingPx(10);
  const barHeight = spacingPx(1);
  return (
    <section
      className="flex flex-col"
      style={{
        paddingTop: spacingPx(5),
        gap: spacingPx(2),
      }}
    >
      {heading && (
        <div className="flex items-center">
          {themeColor ? (
            <span
              className="shrink-0 rounded-[1px]"
              style={{
                width: barWidth,
                height: barHeight,
                backgroundColor: themeColor,
                marginRight: spacingPx(3.5),
              }}
            />
          ) : null}
          <span
            className="font-bold tracking-wide"
            style={{ letterSpacing: "0.025em" }}
          >
            {heading}
          </span>
        </div>
      )}
      <div className={className}>{children}</div>
    </section>
  );
}

function BulletList({
  items,
  showBulletPoints = true,
}: {
  items: string[];
  showBulletPoints?: boolean;
}) {
  const pl = spacingPx(2);
  if (!items || items.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col">
      {items.map((item, idx) => (
        <p
          key={idx}
          className="text-neutral-800"
          style={{
            lineHeight: 1.3,
            paddingLeft: pl,
          }}
        >
          {showBulletPoints ? `• ${item}` : item}
        </p>
      ))}
    </div>
  );
}

function FeaturedRow({
  skill,
  rating,
  themeColor,
}: {
  skill: string;
  rating: number;
  themeColor: string;
}) {
  const r = 9 * PX_PER_PT;
  const gap = 2.25 * PX_PER_PT;
  return (
    <div className="flex items-center justify-end gap-1">
      <span className="mr-0.5">{skill}</span>
      {[0, 1, 2, 3, 4].map((idx) => (
        <span
          key={idx}
          className="rounded-full"
          style={{
            width: r,
            height: r,
            marginLeft: idx === 0 ? 0 : gap,
            backgroundColor: rating >= idx ? themeColor : "#d9d9d9",
          }}
        />
      ))}
    </div>
  );
}

function CssProfile({
  profile,
  themeColor,
}: {
  profile: Resume["profile"];
  themeColor: string;
}) {
  const { name, email, phone, url, summary, location } = profile;
  const iconRows = [
    email ? { key: "email", value: email, Icon: EnvelopeIcon } : null,
    phone ? { key: "phone", value: phone, Icon: PhoneIcon } : null,
    location ? { key: "location", value: location, Icon: MapPinIcon } : null,
    url ? { key: "url", value: url, Icon: LinkIcon } : null,
  ].filter(
    (
      row
    ): row is {
      key: string;
      value: string;
      Icon: typeof EnvelopeIcon;
    } => row !== null
  );

  const nameSize = 20 * PX_PER_PT;

  return (
    <section style={{ marginTop: spacingPx(4) }}>
      <h2
        className="font-bold"
        style={{
          fontSize: nameSize,
          color: themeColor || DEFAULT_FONT_COLOR,
        }}
      >
        {name}
      </h2>
      {summary ? (
        <p className="mt-0 text-neutral-800">{summary}</p>
      ) : null}
      <div
        className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1"
        style={{ marginTop: spacingPx(0.5) }}
      >
        {iconRows.map(({ key, value, Icon }) => {
          let href = "";
          let showLink = false;
          switch (key) {
            case "email":
              href = `mailto:${value}`;
              showLink = true;
              break;
            case "phone":
              href = `tel:${value.replace(/[^\d+]/g, "")}`;
              showLink = true;
              break;
            case "url":
              href = value.startsWith("http") ? value : `https://${value}`;
              showLink = true;
              break;
            default:
              href = "";
          }
          const inner = (
            <span className="flex items-center gap-1 text-neutral-800">
              <Icon className="h-[13px] w-[13px] shrink-0 text-neutral-600" />
              <span>{value}</span>
            </span>
          );
          return (
            <span key={key} className="inline-flex items-center">
              {showLink ? (
                <a
                  href={href}
                  className="text-neutral-800 no-underline"
                  target={key === "url" ? "_blank" : undefined}
                  rel={key === "url" ? "noreferrer" : undefined}
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function formBlocks(
  resume: Resume,
  settings: Settings,
  themeColor: string
): Record<ShowForm, () => JSX.Element | null> {
  const { formToHeading, showBulletPoints } = settings;
  return {
    personalSummary: () => (
      <ResumeCssSection
        themeColor={themeColor}
        heading={formToHeading.personalSummary}
      >
        <BulletList
          items={resume.personalSummary.descriptions}
          showBulletPoints={showBulletPoints.personalSummary}
        />
      </ResumeCssSection>
    ),
    workExperiences: () => (
      <ResumeCssSection
        themeColor={themeColor}
        heading={formToHeading.workExperiences}
      >
        {resume.workExperiences.map((we, idx) => {
          const hideCompany =
            idx > 0 && we.company === resume.workExperiences[idx - 1].company;
          return (
            <div
              key={idx}
              style={{
                marginTop: idx === 0 ? 0 : spacingPx(2),
              }}
            >
              {!hideCompany && (
                <p className="font-bold text-neutral-800">{we.company}</p>
              )}
              <div
                className="flex justify-between gap-2"
                style={{
                  marginTop: hideCompany ? -spacingPx(1) : spacingPx(1.5),
                }}
              >
                <span className="text-neutral-800">{we.jobTitle}</span>
                <span className="shrink-0 text-neutral-800">{we.date}</span>
              </div>
              <div style={{ marginTop: spacingPx(1.5) }}>
                <BulletList items={we.descriptions} />
              </div>
            </div>
          );
        })}
      </ResumeCssSection>
    ),
    educations: () => (
      <ResumeCssSection themeColor={themeColor} heading={formToHeading.educations}>
        {resume.educations.map((ed, idx) => {
          const hideSchool =
            idx > 0 && ed.school === resume.educations[idx - 1].school;
          const showDesc = ed.descriptions.join("") !== "";
          const degreeLine = ed.gpa
            ? `${ed.degree} - ${Number(ed.gpa) ? `${ed.gpa} GPA` : ed.gpa}`
            : ed.degree;
          return (
            <div key={idx}>
              {!hideSchool && (
                <p className="font-bold text-neutral-800">{ed.school}</p>
              )}
              <div
                className="flex justify-between gap-2"
                style={{
                  marginTop: hideSchool ? -spacingPx(1) : spacingPx(1.5),
                }}
              >
                <span className="text-neutral-800">{degreeLine}</span>
                <span className="shrink-0 text-neutral-800">{ed.date}</span>
              </div>
              {showDesc && (
                <div style={{ marginTop: spacingPx(1.5) }}>
                  <BulletList
                    items={ed.descriptions}
                    showBulletPoints={showBulletPoints.educations}
                  />
                </div>
              )}
            </div>
          );
        })}
      </ResumeCssSection>
    ),
    projects: () => (
      <ResumeCssSection themeColor={themeColor} heading={formToHeading.projects}>
        {resume.projects.map((p, idx) => (
          <div key={idx}>
            <div
              className="flex justify-between gap-2"
              style={{ marginTop: spacingPx(0.5) }}
            >
              <span className="font-bold text-neutral-800">{p.project}</span>
              <span className="shrink-0 text-neutral-800">{p.date}</span>
            </div>
            <div style={{ marginTop: spacingPx(0.5) }}>
              <BulletList items={p.descriptions} />
            </div>
          </div>
        ))}
      </ResumeCssSection>
    ),
    skills: () => {
      const featured = resume.skills.featuredSkills.filter((x) => x.skill);
      const pairs: (typeof featured)[number][][] = [
        [featured[0], featured[3]],
        [featured[1], featured[4]],
        [featured[2], featured[5]],
      ];
      return (
        <ResumeCssSection themeColor={themeColor} heading={formToHeading.skills}>
          {featured.length > 0 && (
            <div
              className="flex justify-between gap-4"
              style={{ marginTop: spacingPx(0.5) }}
            >
              {pairs.map((pair, colIdx) => (
                <div key={colIdx} className="flex min-w-0 flex-1 flex-col gap-2">
                  {pair.map((fs, i) =>
                    fs ? (
                      <FeaturedRow
                        key={i}
                        skill={fs.skill}
                        rating={fs.rating}
                        themeColor={themeColor}
                      />
                    ) : null
                  )}
                </div>
              ))}
            </div>
          )}
          <BulletList
            items={resume.skills.descriptions}
            showBulletPoints={showBulletPoints.skills}
          />
        </ResumeCssSection>
      );
    },
    custom: () => (
      <ResumeCssSection themeColor={themeColor} heading={formToHeading.custom}>
        <BulletList
          items={resume.custom.descriptions}
          showBulletPoints={showBulletPoints.custom}
        />
      </ResumeCssSection>
    ),
  };
}

export const ResumeCssMirror = memo(function ResumeCssMirror({
  resume,
  settings,
}: Props) {
  const {
    fontFamily,
    fontSize,
    documentSize,
    formToShow,
    formsOrder,
  } = settings;
  const accent = settings.themeColor || DEFAULT_FONT_COLOR;
  const fontSizePx = Number(fontSize) * PX_PER_PT;

  const showFormsOrder = formsOrder.filter((form) => formToShow[form]);
  const blocks = formBlocks(resume, settings, accent);

  return (
    <div
      className="flex flex-col text-neutral-800"
      style={{
        fontFamily,
        fontSize: fontSizePx,
        color: DEFAULT_FONT_COLOR,
        width: "100%",
      }}
      data-document-size={documentSize}
    >
      <CssProfile profile={resume.profile} themeColor={accent} />
      {showFormsOrder.map((form) => {
        const Block = blocks[form];
        return <div key={form}>{Block()}</div>;
      })}
    </div>
  );
});
