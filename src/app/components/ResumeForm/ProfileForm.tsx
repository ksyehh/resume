"use client";

import { BaseForm } from "components/ResumeForm/Form";
import { Input, Textarea } from "components/ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { changeProfile, selectProfile } from "lib/redux/resumeSlice";
import { ResumeProfile } from "lib/redux/types";
import { useTranslations } from "lib/i18n/LocaleProvider";

export const ProfileForm = () => {
  const tp = useTranslations("resumeForm.profile");
  const profile = useAppSelector(selectProfile);
  const dispatch = useAppDispatch();
  const { name, email, phone, url, summary, location } = profile;

  const handleProfileChange = (field: keyof ResumeProfile, value: string) => {
    dispatch(changeProfile({ field, value }));
  };

  return (
    <BaseForm>
      <div className="grid grid-cols-6 gap-3">
        <Input
          label={tp("name")}
          labelClassName="col-span-full"
          name="name"
          placeholder={tp("placeholderName")}
          value={name}
          onChange={handleProfileChange}
        />
        <Textarea
          label={tp("objective")}
          labelClassName="col-span-full"
          name="summary"
          placeholder={tp("placeholderObjective")}
          value={summary}
          onChange={handleProfileChange}
        />
        <Input
          label={tp("email")}
          labelClassName="col-span-4"
          name="email"
          placeholder={tp("placeholderEmail")}
          value={email}
          onChange={handleProfileChange}
        />
        <Input
          label={tp("phone")}
          labelClassName="col-span-2"
          name="phone"
          placeholder={tp("placeholderPhone")}
          value={phone}
          onChange={handleProfileChange}
        />
        <Input
          label={tp("website")}
          labelClassName="col-span-4"
          name="url"
          placeholder={tp("placeholderWebsite")}
          value={url}
          onChange={handleProfileChange}
        />
        <Input
          label={tp("location")}
          labelClassName="col-span-2"
          name="location"
          placeholder={tp("placeholderLocation")}
          value={location}
          onChange={handleProfileChange}
        />
      </div>
    </BaseForm>
  );
};
