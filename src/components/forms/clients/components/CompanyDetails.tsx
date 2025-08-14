
"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { TRegisterClientAdminSchema } from "../validations/_clientSchema";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
// import Image from "next/image";
interface CompanyDetailsProps {
  form: UseFormReturn<TRegisterClientAdminSchema>;
}


export const CompanyDetails: React.FC<CompanyDetailsProps> = ({ form }) => {
    const today = new Date().toISOString().split("T")[0];
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      setSelectedFileName(file.name);
      setValue("company_photo", file, { shouldValidate: true });
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setSelectedFileName("");
      setValue("company_photo", undefined);
      setPreviewUrl("");
    }
  };

  const handleBrowseClick = () => {
    const fileInput = document.getElementById("company-photo-input") as HTMLInputElement;
    fileInput?.click();
  };

  const handleRemoveImage = () => {
    setSelectedFileName("");
    setValue("company_photo", undefined);
    setPreviewUrl("");
    
    // Reset file input
    const fileInput = document.getElementById("company-photo-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Date"
          type="date"
          defaultValue={today}
          required
          {...register("date")}
          error={errors.date?.message}
        />
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Customer Logo
          </label>
          
          {/* File Input (Hidden) */}
          <input
            id="company-photo-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Custom File Input Display */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search files"
              value={selectedFileName}
              id="company-photo-text"
              readOnly
              className={`h-10 flex-1 rounded-md border bg-white px-3 py-2 text-sm ${
                errors.company_photo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={handleBrowseClick}
              className="rounded-md bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Browse
            </button>
          </div>
          
          {/* Image Preview */}
          {previewUrl && (
            <div className="relative mt-2">
              {/* <img
                src={previewUrl}
                alt="Company logo preview"
                className="h-32 w-32 rounded-md border border-gray-300 object-cover"
              /> */}
              
              <img
                src={previewUrl}
                alt="Company logo preview"
                className="size-32 rounded-md border border-gray-300 object-cover"
                width={32}
                height={32}
                id="company-photo-preview"
              />
              <button
                id="company-remove-photo"
                type="button"
                onClick={handleRemoveImage}
                className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
          
          {/* File Upload Guidelines */}
          <p className="text-xs text-gray-500">
            Max file size: 5MB. Supported formats: JPEG, PNG, WebP
          </p>
          
          {errors.company_photo && (
            <p className="text-sm text-red-600">{errors.company_photo.message}</p>
          )}
        </div>
      </div>

      <Input
        label="Company Name"
        required
        placeholder="Enter company name"
        {...register("company_name")}
        error={errors.company_name?.message}
        name="company_name"
      />

      <Select
        label="Role"
        required
        options={[
          { value: "customer", label: "Terramo Customer" },
        ]}
        defaultValue="customer"
      />
    </div>
  );
};