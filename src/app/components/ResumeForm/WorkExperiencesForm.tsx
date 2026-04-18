"use client";

import { Form, FormSection } from "components/ResumeForm/Form";
import {
  Input,
  BulletListTextarea,
} from "components/ResumeForm/Form/InputGroup";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import {
  changeWorkExperiences,
  selectWorkExperiences,
} from "lib/redux/resumeSlice";
import type { ResumeWorkExperience } from "lib/redux/types";
import { useTranslations } from "lib/i18n/LocaleProvider";

export const WorkExperiencesForm = () => {
  const tw = useTranslations("resumeForm.work");
  const workExperiences = useAppSelector(selectWorkExperiences);
  const dispatch = useAppDispatch();

  const showDelete = workExperiences.length > 1;

  return (
    <Form form="workExperiences" addButtonText={tw("addJob")}>
      {workExperiences.map(({ company, jobTitle, date, descriptions }, idx) => {
        const handleWorkExperienceChange = (
          ...[
            field,
            value,
          ]: CreateHandleChangeArgsWithDescriptions<ResumeWorkExperience>
        ) => {
          dispatch(changeWorkExperiences({ idx, field, value } as any));
        };
        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== workExperiences.length - 1;

        return (
          <FormSection
            key={idx}
            form="workExperiences"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText={tw("deleteJob")}
          >
            <Input
              label={tw("company")}
              labelClassName="col-span-full"
              name="company"
              placeholder={tw("placeholderCompany")}
              value={company}
              onChange={handleWorkExperienceChange}
            />
            <Input
              label={tw("jobTitle")}
              labelClassName="col-span-4"
              name="jobTitle"
              placeholder={tw("placeholderJobTitle")}
              value={jobTitle}
              onChange={handleWorkExperienceChange}
            />
            <Input
              label={tw("date")}
              labelClassName="col-span-2"
              name="date"
              placeholder={tw("placeholderDate")}
              value={date}
              onChange={handleWorkExperienceChange}
            />
            <BulletListTextarea
              label={tw("description")}
              labelClassName="col-span-full"
              name="descriptions"
              placeholder={tw("placeholderBullets")}
              value={descriptions}
              onChange={handleWorkExperienceChange}
            />
          </FormSection>
        );
      })}
    </Form>
  );
};
