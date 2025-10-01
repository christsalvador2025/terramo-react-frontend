// Updated ClientForm.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "react-toastify";
import { toast } from "react-hot-toast";
import { registerClientAdminSchema, TRegisterClientAdminSchema } from "./validations/_clientSchema";
// import { useCreateClientMutation, useGetProductsQuery } from "@/lib/redux/features/clients/_clientApiSlice";
import { useCreateClientMutation, useGetProductsQuery } from "../../../lib/redux/features/clients/_clientApiSlice";
import { Button } from "../ui/Buttton";
import { ProductSelection } from "./components/ProductSelection";
import { CompanyDetails } from "./components/CompanyDetails";
import { ContactPerson } from "./components/ContactPerson";
import { AddressDetails } from "./components/AddressDetails";
// import { useRouter } from "next/navigation";
import { useNavigate } from "react-router-dom";


// ----------------------------- MODAL ------------------------------------
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewClient: () => void;
  onCreateAnother: () => void;
  invitationToken?: string; // Add token to modal props
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  onViewClient, 
  onCreateAnother,
  invitationToken 
}) => {
  if (!isOpen) return null;

  const handleCopyInvitationLink = () => {
    if (invitationToken) {
      const baseUrl = window.location.origin;
      const invitationLink = `${baseUrl}/client-admin/accept-invitation/${invitationToken}`;
      navigator.clipboard.writeText(invitationLink);
      toast.success("Einladungslink kopiert!");
    } else {
      toast.error("Kein Einladungstoken verfügbar");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-[32px] shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success Icon */}
        {/* <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div> */}

        {/* Content */}
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Kunde erfolgreich angelegt
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Ultrices tellus tortor vel eu diam amet in in dignissim. 
            Interdum consectetur integer varius nulla nisl. Egestas.
          </p>

          {/* Action Buttons */}
          <div className="flex justify-between gap-x-[24px] px-[32px]">
            <button
              onClick={onCreateAnother}
              className="w-full rounded-md border border-teal-600 px-4 py-4 text-sm font-medium text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-nowrap background-[#026770]"
            >
              Zur Kundenübersicht
            </button>
            <button
              onClick={onViewClient}
              className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-nowrap"
            >
              Zum Kunden
            </button>
            
          </div>

          {/* Copy Link - Only show if invitation token exists */}
          {invitationToken && (
            <button
              onClick={handleCopyInvitationLink}
              className="mt-4 flex w-full items-center justify-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Einladungslink kopieren</span>
            </button>
          )}

          {/* Show token for debugging */}
          {invitationToken && process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-gray-500">
              Token: <code className="bg-gray-100 px-1 py-0.5 rounded">{invitationToken}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --------------------------- MAIN COMPONENT -----------------------------------

export const ClientForm: React.FC = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedInvitationToken, setSubmittedInvitationToken] = useState<string>("");

  const form = useForm<TRegisterClientAdminSchema>({
    resolver: zodResolver(registerClientAdminSchema),
    mode: "onChange",
    defaultValues: {
      send_invitation: true,
      invitation_expires_days: 30,
      raw_token: undefined,
      is_active: true,
      product_ids: [],
      gender: undefined,
      company_photo: undefined,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = form;

  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery();
  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
//   const router = useRouter();
  const navigate = useNavigate();
// navigate("/about");


  // Callback to handle token generation from AddressDetails setShowSuccessModal(true);
  const handleTokenGenerated = useCallback((token: string) => {
    console.log("Token generated in ClientForm:", token);
    setValue("raw_token", token);
  }, [setValue]);

  const onSubmit: SubmitHandler<TRegisterClientAdminSchema> = async (data) => {
    try {
      console.log("Submitting client data:", {
        ...data,
        company_photo: data.company_photo ? `File: ${data.company_photo.name}` : 'No file',
        raw_token: data.raw_token || 'No token generated'
      });
      
      await createClient(data).unwrap();
      
      // Store the token for the success modal
      if (data.raw_token) {
        setSubmittedInvitationToken(data.raw_token);
      }
      
      setShowSuccessModal(true);
      reset();
      
      // Clear any file previews
      const fileInput = document.getElementById("company-photo-input") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: any) {
      console.error("Error creating client:", error);
      
      if (error?.data && typeof error.data === "object") {
        const fieldErrors = error.data as Record<string, string[]>;
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (Array.isArray(messages)) {
            form.setError(field as keyof TRegisterClientAdminSchema, {
              type: "server",
              message: messages.join(" "),
            });
          }
        }
      } else {
        toast.error(error?.data?.message || "Failed to create client. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    reset();
    
    // Clear file input and preview
    const fileInput = document.getElementById("company-photo-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    
    toast.info("Form has been reset");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSubmittedInvitationToken("");
  };

  const handleViewClient = () => {
    setShowSuccessModal(false);
    setSubmittedInvitationToken("");
    // router.push(`/clients`);
    navigate("/clients");
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setSubmittedInvitationToken("");
    // router.refresh();
    window.location.reload();

  };

  const isLoading = isSubmitting || isCreating;

  return (
    <>
      <div className="mx-auto max-w-4xl bg-white p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Kunde anlegen</h1>
        
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" encType="multipart/form-data">
          <ProductSelection
            form={form}
            products={products}
            isLoading={isProductsLoading}
          />

          <CompanyDetails form={form} />

          <ContactPerson form={form} />

          <AddressDetails 
            form={form} 
            onTokenGenerated={handleTokenGenerated}
          />

          <div className="space-y-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
            <h3 className="text-[18px] font-bold text-[#000000]">Sonstiges</h3>
            <div className="space-y-1">
              <label className="text-[14px] font-medium text-[#666666]">
                Interner Bearbeitungsvermerk
              </label>
              <textarea
                {...form.register("miscellaneous")}
                rows={6}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
               
              />
            </div>
            </div>
            <div></div>
          </div>

          <div className="flex justify-between space-x-4 border-t border-gray-200 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="text-[#026770]"
            >
              {/* Cancel */}
              Abbrechen
            </Button>
            <Button
              type="submit"
              style={{ background: '#026770'}}
              loading={isLoading}
              disabled={isLoading}
            >
              {/* Save Client */}
              Kunde speichern
            </Button>
          </div>
        </form>

        {/* Debug: Show form data including token in development */}
        {/* {process.env.NODE_ENV === 'development' && (
          // start
          <div className="mt-4 space-y-2"> 
            {Object.keys(errors).length > 0 && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <h4 className="font-medium text-red-800">Form Errors:</h4>
                <pre className="mt-2 text-xs text-red-600">
                  {JSON.stringify(
                    Object.entries(errors).reduce((acc, [key, error]) => {
                      acc[key] = error?.message || error;
                      return acc;
                    }, {} as Record<string, any>), 
                    null, 
                    2
                  )}
                </pre>
              </div>
            )}
            
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <h4 className="font-medium text-blue-800">Current Form Values:</h4>
              <pre className="mt-2 text-xs text-blue-600">
                {JSON.stringify({
                  raw_token: watch("raw_token"),
                  send_invitation: watch("send_invitation"),
                  email: watch("email"),
                }, null, 2)}
              </pre>
            </div>
          </div> // end
        )} */}
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onViewClient={handleViewClient}
        onCreateAnother={handleCreateAnother}
        invitationToken={submittedInvitationToken}
      />
    </>
  );
};