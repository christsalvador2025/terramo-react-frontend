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
      <h3 className="text-lg font-semibold text-gray-900">Contact Person</h3>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="First Name"
          required
          placeholder="Enter first name"
          {...register("contact_person_first_name")}
          error={errors.contact_person_first_name?.message}
        />
        
        <Input
          label="Last Name"
          required
          placeholder="Enter last name"
          {...register("contact_person_last_name")}
          error={errors.contact_person_last_name?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Gender"
          required
          options={genderOptions}
          placeholder="Please select"
          {...register("gender")}
          error={errors.gender?.message}
        />
        
        <Input
          label="Birth Year"
          type="number"
          required
          placeholder="YYYY"
          {...register("year_of_birth", { valueAsNumber: true })}
          error={errors.year_of_birth?.message}
        />
      </div>
    </div>
  );
};