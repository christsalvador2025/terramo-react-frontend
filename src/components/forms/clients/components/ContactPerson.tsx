"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { TRegisterClientAdminSchema } from "../validations/_clientSchema";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";

interface ContactPersonProps {
  form: UseFormReturn<TRegisterClientAdminSchema>;
}

export const ContactPerson: React.FC<ContactPersonProps> = ({ form }) => {
  const {
    register,
    formState: { errors },
  } = form;

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "diverse", label: "Diverse" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Ansprechperson</h3>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Vorname"
          required
          placeholder="Vorname eingeben"
          {...register("contact_person_first_name")}
          error={errors.contact_person_first_name?.message}
        />
        
        <Input
          label="Nachname"
          // required
          placeholder="Nachname eingeben"
          {...register("contact_person_last_name")}
          error={errors.contact_person_last_name?.message}
        />
      </div>

      <div className="flex gap-4">
        <Select
          className="flex-1 w-[120px]"
          label="Geschlecht"
          required
          options={genderOptions}
          placeholder="Please select"
          {...register("gender")}
          error={errors.gender?.message}
          
        />
        
        <Input
          label="Geburtsjahr"
          type="number"
          required
          placeholder="JJJJ"
          {...register("year_of_birth", { valueAsNumber: true })}
          error={errors.year_of_birth?.message}
          className="flex-1 w-[553px]"
        />
      </div>
    </div>
  );
};