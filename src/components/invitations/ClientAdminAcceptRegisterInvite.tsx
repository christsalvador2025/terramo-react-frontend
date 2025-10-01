import React, { useState } from 'react';

// Types
interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Logo Component
const TerramoLogo = () => (
  <div className="flex items-center justify-center mb-8">
    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center mr-3">
      <div className="absolute w-6 h-6 rounded-full border-3 border-white border-t-transparent border-r-transparent transform rotate-45" />
    </div>
    <h1 className="text-4xl font-serif text-teal-700" style={{ letterSpacing: '0.5px' }}>
      Terramo
    </h1>
  </div>
);

// Icon Components
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Registration Component
const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'E-Mail Adresse ist erforderlich';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Vorname ist erforderlich';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Nachname ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      console.log('Registration data:', formData);
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <TerramoLogo />
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Registrierung erfolgreich!</h2>
            <p className="text-gray-600 mb-6">
              Ihre Registrierung wurde erfolgreich abgeschlossen. Sie werden in Kürze weitergeleitet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-10 shadow-sm">
        <TerramoLogo />

        <h2 className="text-2xl font-medium text-gray-900 text-center mb-1">
          Registrierung als Mitarbeiterin oder
        </h2>
        <h2 className="text-2xl font-medium text-gray-900 text-center mb-8">
          Mitarbeiter von "Company 1"
        </h2>

        <div onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail Adresse
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <MailIcon />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="max.mustermann@mail.at"
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* First Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vorname
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <UserIcon />
              </div>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Vorname eingeben"
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name Field */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nachname
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <UserIcon />
              </div>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Nachname eingeben"
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-4 rounded-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Wird registriert...
              </span>
            ) : (
              'Jetzt registrieren'
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-teal-50 rounded-md flex items-start">
          <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
            M
          </div>
          <p className="text-sm text-teal-900 leading-relaxed">
            <strong>Sollen Sie keine Mitarbeiterin oder Mitarbeiter von Company 1 sein, schreiben Sie uns bitte eine E-Mail.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

// Login Component
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('E-Mail Adresse ist erforderlich');
      return;
    }

    if (!validateEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      console.log('Login link sent to:', email);
    }, 1500);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <TerramoLogo />
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">E-Mail gesendet!</h2>
            <p className="text-gray-600 mb-4">
              Wir haben Ihnen einen Login-Link an <strong>{email}</strong> gesendet.
            </p>
            <p className="text-sm text-gray-500">
              Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Link, um sich anzumelden.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-10 shadow-sm">
        <TerramoLogo />

        <h2 className="text-2xl font-medium text-gray-900 text-center mb-8">
          Anmeldung
        </h2>

        <div>
          {/* Email Field */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail Adresse
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <MailIcon />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="E-Mail Adresse der Einladung eingeben"
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-4 rounded-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Wird gesendet...
              </span>
            ) : (
              'Jetzt Link zur Anmeldung erhalten'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Demo Component
export default function TerramoAuthUI() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <div className="fixed top-5 right-5 z-50">
        <button
          onClick={() => setShowLogin(!showLogin)}
          className="px-4 py-2 border-2 border-teal-700 text-teal-700 rounded-md font-medium hover:bg-teal-50 transition duration-200"
        >
          {showLogin ? 'Zur Registrierung' : 'Zur Anmeldung'}
        </button>
      </div>

      {/* Render Current View */}
      {showLogin ? <LoginPage /> : <RegistrationPage />}
    </div>
  );
}