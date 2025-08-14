 

import { ClientForm } from "../../components/forms/clients/Clientform"

export default function CreateClient() {
     
  return (
   <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <ClientForm />
      </div>
    </div>
  )
}

// import React from 'react';
// import { ClientForm } from './ClientForm';

// // In your main app component:
// function App() {
//   // Your Redux hooks
//   const useCreateClientMutation = ...; // Your Redux mutation hook
//   const useGetProductsQuery = ...; // Your Redux query hook
  
//   const handleNavigate = (path) => {
//     // Handle navigation without React Router
//     // You can use window.location or your preferred navigation method
//     window.location.href = path;
//   };

//   return (
//     <ClientForm 
//       useCreateClientMutation={useCreateClientMutation}
//       useGetProductsQuery={useGetProductsQuery}
//       onNavigate={handleNavigate}
//     />
//   );
// }