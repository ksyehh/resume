"use client";

import { Form } from "components/ResumeForm/Form";
import { BulletListIconButton } from "components/ResumeForm/Form/IconButton";
import { BulletListTextarea } from "components/ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import {
  changePersonalSummary,
  selectPersonalSummary,
} from "lib/redux/resumeSlice";
import {
  selectShowBulletPoints,
  changeShowBulletPoints,
} from "lib/redux/settingsSlice";
import { useTranslations } from "lib/i18n/LocaleProvider";

export const PersonalSummaryForm = () => {
  const tp = useTranslations("resumeForm.personalSummary");
  const ts = useTranslations("resumeForm.skills");
  const personalSummary = useAppSelector(selectPersonalSummary);
  const dispatch = useAppDispatch();
  const { descriptions } = personalSummary;
  const form = "personalSummary";
  const showBulletPoints = useAppSelector(selectShowBulletPoints(form));

  const handleChange = (field: "descriptions", value: string[]) => {
    dispatch(changePersonalSummary({ field, value }));
  };

  const handleShowBulletPoints = (value: boolean) => {
    dispatch(changeShowBulletPoints({ field: form, value }));
  };

  return (
    <Form form={form}>
      <div className="col-span-full grid grid-cols-6 gap-3">
        <div className="relative col-span-full">
          <BulletListTextarea
            label={tp("summaryList")}
            labelClassName="col-span-full"
            name="descriptions"
            placeholder={ts("placeholderBullets")}
            value={descriptions}
            onChange={handleChange}
            showBulletPoints={showBulletPoints}
          />
          <div className="absolute left-[7.7rem] top-[0.07rem]">
            <BulletListIconButton
              showBulletPoints={showBulletPoints}
              onClick={handleShowBulletPoints}
            />
          </div>
        </div>
      </div>
    </Form>
  );
};
