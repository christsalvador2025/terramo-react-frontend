

"use client";
import React, { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { TRegisterClientAdminSchema } from "../validations/_clientSchema";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { COUNTRIES } from "../../../../lib/constants/countries";

interface AddressDetailsProps {
  form: UseFormReturn<TRegisterClientAdminSchema>;
  onTokenGenerated?: (token: string) => void; // Add callback prop
}

// UUID v4 generator function
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const AddressDetails: React.FC<AddressDetailsProps> = ({ 
  form, 
  onTokenGenerated 
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const [invitationToken, setInvitationToken] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showInvitationLink, setShowInvitationLink] = useState<boolean>(false);

  const generateToken = useCallback(() => {
    // Only generate if no token exists
    if (!invitationToken) {
      const newToken = generateUUID();
      setInvitationToken(newToken);
      
      // Call the callback to update the parent form
      if (onTokenGenerated) {
        onTokenGenerated(newToken);
      }
      
      return newToken;
    }
    return invitationToken;
  }, [invitationToken, onTokenGenerated]);

  // Function to copy the invitation link
  const copyInvitationLink = useCallback(async () => {
    let tokenToCopy = invitationToken;
    
    // Generate token if it doesn't exist
    if (!tokenToCopy) {
      tokenToCopy = generateToken();
    }
    
    // Create the invitation link
    const baseUrl = window.location.origin;
    const invitationLink = `${baseUrl}/client-admin/accept-invitation/${tokenToCopy}`;
    
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invitation link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = invitationLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [invitationToken, generateToken]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowInvitationLink(isChecked);
    
    if (isChecked) {
      // Generate token only if it doesn't exist
      generateToken();
    }
    // Don't clear token when unchecked - keep it persistent
  };



  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Address Details</h3>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          label="Location"
          required
          placeholder="Enter locations"
          {...register("location")}
          error={errors.location?.message}
        />
        <Input
          label="Street"
          required
          placeholder="Enter street address"
          {...register("street")}
          error={errors.street?.message}
        />
        <Input
          label="ZIP Code"
          required
          placeholder="Enter ZIP code"
          {...register("zip_code")}
          error={errors.zip_code?.message}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Country"
          required
          options={COUNTRIES}
          placeholder="Please select"
          {...register("land")}
          error={errors.land?.message}
        />
        <Input
          label="City"
          required
          placeholder="Enter city"
          {...register("city")}
          error={errors.city?.message}
        />
      </div>

      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        
      </div> */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Landline Number"
          required
          placeholder="e.g. +49 123 456789"
          {...register("landline_number")}
          error={errors.landline_number?.message}
        />
        <Input
          label="Mobile Phone Number"
          required
          placeholder="+49 123 123456"
          {...register("mobile_phone_number")}
          error={errors.mobile_phone_number?.message}
        />
        {/* <Input
          label="Email Address"
          type="email"
          required
          placeholder="Enter email address"
          {...register("email")}
          error={errors.email?.message}
        /> */}
      </div>

      {/* Copy Invitation Link Section */}
    
      {/* -- */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="copy-invitation-link"
            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
            onChange={handleCheckboxChange}
            checked={showInvitationLink}
          />
          <label htmlFor="copy-invitation-link" className="text-sm font-medium text-blue-600 cursor-pointer flex justify-center items-center gap-1">
             <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M4.54813 12.5834C4.17299 12.5834 3.8559 12.4539 3.59687 12.1949C3.33785 11.9358 3.20833 11.6188 3.20833 11.2436V1.75654C3.20833 1.3814 3.33785 1.06432 3.59687 0.80529C3.8559 0.546262 4.17299 0.416748 4.54813 0.416748H12.0352C12.4103 0.416748 12.7274 0.546262 12.9865 0.80529C13.2455 1.06432 13.375 1.3814 13.375 1.75654V11.2436C13.375 11.6188 13.2455 11.9358 12.9865 12.1949C12.7274 12.4539 12.4103 12.5834 12.0352 12.5834H4.54813ZM4.54813 11.5001H12.0352C12.0994 11.5001 12.1581 11.4733 12.2115 11.4199C12.2649 11.3665 12.2917 11.3078 12.2917 11.2436V1.75654C12.2917 1.69237 12.2649 1.63362 12.2115 1.58029C12.1581 1.52682 12.0994 1.50008 12.0352 1.50008H4.54813C4.48396 1.50008 4.42521 1.52682 4.37188 1.58029C4.3184 1.63362 4.29167 1.69237 4.29167 1.75654V11.2436C4.29167 11.3078 4.3184 11.3665 4.37188 11.4199C4.42521 11.4733 4.48396 11.5001 4.54813 11.5001ZM1.96479 15.1667C1.58965 15.1667 1.27257 15.0372 1.01354 14.7782C0.754514 14.5192 0.625 14.2021 0.625 13.827V3.25654H1.70833V13.827C1.70833 13.8911 1.73507 13.9499 1.78854 14.0032C1.84188 14.0567 1.90062 14.0834 1.96479 14.0834H10.5352V15.1667H1.96479Z" fill="#026770"/>
             </svg> <span className="text-[#026770]">Einladungslink kopieren</span>
           </label>
        </div>

        {/* Show note if checkbox is unchecked but token exists */}
        {!showInvitationLink && invitationToken && (
          <div className="text-xs text-gray-500 ml-7 bg-blue-50 p-2 rounded border">
            💡 Ein Token wurde bereits generiert. Aktivieren Sie die Checkbox um den Link anzuzeigen.
          </div>
        )}

        {/* Invitation Link Input and Copy Button */}
        {showInvitationLink && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  label="Invitation Link"
                  value={invitationToken ? `${window.location.origin}/client-admin/accept-invitation/${invitationToken}` : ""}
                  readOnly
                  placeholder="Invitation link will be generated..."
                  className="bg-white"
                />
              </div>
              {/* background: '#026770' */}
              <button
                type="button"
                onClick={copyInvitationLink}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  copied
                    ? 'bg-[#026770] text-white border border-green-300'
                    : 'bg-[#026770] text-white active:bg-[#026770]'
                }`}
                style={{ height: '42px', marginTop: '24px' }} // Align with input field
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            
            {invitationToken && (
              <div className="mt-2 text-xs text-gray-500">
                Token: <code className="bg-gray-100 px-1 py-0.5 rounded">{invitationToken}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};