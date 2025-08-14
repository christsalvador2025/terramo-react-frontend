import React, { useState, useReducer, useEffect } from 'react';
import Logo from "../assets/logo.svg";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Typography,
  Paper,
  FormHelperText,
  Snackbar,
  Alert,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'react-i18next';



// Define the form data structure
interface FormData {
  company: string;
  role: 'employee' | 'customer' | 'supplier' | 'industry' | 'society' | 'investors' | 'laws' | '';
  function: string;
  salutation: string;
  gender: 'male' | 'female' | 'nonbinary' | '';
  firstName: string;
  lastName: string;
  birthYear: number | null;
  street: string;
  zipCode: string;
  city: string;
  country: 'switzerland' | 'liechtenstein' | 'germany' | 'austria' | 'france' | 'italy' | '';
  phone: string;
  mobile: string;
  email: string;
  customerName: string;
  internalProcessingNotes: string;
  date: Date | null;
}

// Define the form action types
type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormData; value: any }
  | { type: 'SET_FORM_DATA'; data: FormData };

// Reducer function for managing form state
const formReducer = (state: FormData, action: FormAction): FormData => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_FORM_DATA':
      return action.data;
    default:
      return state;
  }
};

const initialFormData: FormData = {
  company: '',
  role: '',
  function: '',
  salutation: '',
  gender: '',
  firstName: '',
  lastName: '',
  birthYear: null,
  street: '',
  zipCode: '',
  city: '',
  country: '',
  phone: '',
  mobile: '',
  email: '',
  customerName: '',
  internalProcessingNotes: '',
  date: new Date(), // Default to today's date
};

interface FormErrors {
  [key: string]: string;
}

// Dummy API call function
const submitFormData = async (data: FormData): Promise<any> => {
  console.log("Submitting data (simulated):", data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate API success or failure
      if (Math.random() > 0.1) { // 90% success rate
        resolve({ success: true, message: 'Data successfully saved!' });
      } else {
        reject(new Error('Network error or server unavailable.'));
      }
    }, 1500); // Simulate network delay
  });
};

const SustainabilityAnalyzerForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [formData, dispatch] = useReducer(formReducer, initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Optionally fetch initial data from an API if editing an existing entry
    // Example: fetchExistingData().then(data => dispatch({ type: 'SET_FORM_DATA', data }));
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields based on the image and your list
    const requiredFields: (keyof FormData)[] = [
      'role',
      'gender', // Added gender as required based on your list
      'birthYear',
      'company',
      'firstName',
      'lastName',
      'email',
      'street',
      'zipCode',
      'city',
      'country',
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = t('validation.required', { field: t(field as any) });
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    // Birth Year validation
    if (formData.birthYear && (formData.birthYear < 1900 || formData.birthYear > new Date().getFullYear())) {
      newErrors.birthYear = t('validation.invalidYear');
    }

    // Basic Phone validation (optional: you might want a more robust regex for specific countries)
    if (formData.phone && !/^\+?[0-9\s-()]{7,20}$/.test(formData.phone)) {
      newErrors.phone = t('validation.invalidPhone');
    }
    if (formData.mobile && !/^\+?[0-9\s-()]{7,20}$/.test(formData.mobile)) {
      newErrors.mobile = t('validation.invalidPhone');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    let value = event.target.value;

    // Special handling for number fields like birthYear if it were a TextField (it's a Select here, but good to keep in mind)
    if (field === 'birthYear' && typeof value === 'string') {
      const parsedValue = parseInt(value);
      value = isNaN(parsedValue) ? null : parsedValue;
    }

    dispatch({ type: 'UPDATE_FIELD', field, value });
    // Clear error for the field once user starts typing/changing
    if (errors[field]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date: Date | null) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'date', value: date });
    if (errors.date) { // Clear date error if any
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.date;
        return newErrors;
      });
    }
  };

  const handleSelectChange = (field: keyof FormData) => (event: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value: event.target.value });
    if (errors[field]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      setSnackbarMessage(t('submissionError', { message: t('Please correct the errors in the form.') }));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real application, you'd send formData to your backend API
      const response = await submitFormData(formData); // Using our dummy API call
      console.log('Form data submitted:', response);
      setSnackbarMessage(t('submissionSuccess'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Optionally reset form after successful submission if it's a "create new" form
      // dispatch({ type: 'SET_FORM_DATA', data: initialFormData });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setSnackbarMessage(t('submissionError', { message: error.message || 'Unknown error' }));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i); // Last 100 years for birth year, adjust as needed

  const roleOptions = [
    { value: 'employee', labelKey: 'employee' },
    { value: 'customer', labelKey: 'customer' },
    { value: 'supplier', labelKey: 'supplier' },
    { value: 'industry', labelKey: 'industry' },
    { value: 'society', labelKey: 'society' },
    { value: 'investors', labelKey: 'investors' },
    { value: 'laws', labelKey: 'laws' },
  ];

  const functionOptions = [
    { value: 'personalmanager', labelKey: 'functionOptions.personalmanager' },
    { value: 'teamleader', labelKey: 'functionOptions.teamleader' },
    { value: 'ceo', labelKey: 'functionOptions.ceo' },
    { value: 'cfo', labelKey: 'functionOptions.cfo' },
    { value: 'technicaldirector', labelKey: 'functionOptions.technicaldirector' },
    { value: 'operationsmanager', labelKey: 'functionOptions.operationsmanager' },
    { value: 'salesmanager', labelKey: 'functionOptions.salesmanager' },
    { value: 'marketingmanager', labelKey: 'functionOptions.marketingmanager' },
    { value: 'projectleader', labelKey: 'functionOptions.projectleader' },
    { value: 'itmanager', labelKey: 'functionOptions.itmanager' },
    { value: 'commercialemployee', labelKey: 'functionOptions.commercialemployee' },
    { value: 'administrativeprofessional', labelKey: 'functionOptions.administrativeprofessional' },
  ];

  const genderOptions = [
    { value: 'male', labelKey: 'male' },
    { value: 'female', labelKey: 'female' },
    { value: 'nonbinary', labelKey: 'nonbinary' },
  ];

  const countryOptions = [
    { value: 'switzerland', labelKey: 'countryOptions.switzerland' },
    { value: 'liechtenstein', labelKey: 'countryOptions.liechtenstein' },
    { value: 'germany', labelKey: 'countryOptions.germany' },
    { value: 'austria', labelKey: 'countryOptions.austria' },
    { value: 'france', labelKey: 'countryOptions.france' },
    { value: 'italy', labelKey: 'countryOptions.italy' },
  ];


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" component="h1" sx={{ color: '#004d40', fontWeight: 'bold' }}>
              Terramo "Sustainability Analyzer 2.0"
            </Typography>
            {/* You can replace this with your actual logo */}
            {/* <img src="https://via.placeholder.com/150x50?text=Terramo+Logo" alt="Terramo Logo" style={{ maxHeight: 50 }} /> */}
            <img src={Logo} alt="Logo" style={{ width: "210px", marginRight: "2rem" }} />
          </Box>

          <Grid container spacing={3}>
            {/* Column 1 (Left - xs=12/md=4 for 3 columns on medium/large screens) */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal" error={!!errors.company}>
                <TextField
                  label={`${t('company')} *`}
                  value={formData.company}
                  onChange={handleChange('company')}
                  required
                  error={!!errors.company}
                  helperText={errors.company}
                />
              </FormControl>
              <FormControl fullWidth margin="normal" error={!!errors.function}>
                <InputLabel id="function-label">{t('function')}</InputLabel>
                <Select
                  labelId="function-label"
                  value={formData.function}
                  onChange={handleSelectChange('function')}
                  label={t('function')}
                >
                  {functionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.function && <FormHelperText>{errors.function}</FormHelperText>}
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label={t('salutation')}
                  value={formData.salutation}
                  onChange={handleChange('salutation')}
                />
              </FormControl>
              <FormControl fullWidth margin="normal" error={!!errors.firstName}>
                <TextField
                  label={`${t('firstName')} *`}
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  required
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </FormControl>
              <FormControl fullWidth margin="normal" error={!!errors.birthYear}>
                <InputLabel id="birth-year-label" required>{t('birthYear')}</InputLabel>
                <Select
                  labelId="birth-year-label"
                  value={formData.birthYear || ''} // Use empty string for no selection
                  onChange={handleSelectChange('birthYear')}
                  label={`${t('birthYear')} *`}
                  error={!!errors.birthYear}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
                {errors.birthYear && <FormHelperText>{errors.birthYear}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Column 2 (Middle - xs=12/md=4) */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal" error={!!errors.role}>
                <InputLabel id="role-label" required>{t('role')}</InputLabel>
                <Select
                  labelId="role-label"
                  value={formData.role}
                  onChange={handleSelectChange('role')}
                  label={`${t('role')} *`}
                  error={!!errors.role}
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
              <FormControl fullWidth margin="normal" error={!!errors.gender}>
                <InputLabel id="gender-label" required>{t('gender')}</InputLabel>
                <Select
                  labelId="gender-label"
                  value={formData.gender}
                  onChange={handleSelectChange('gender')}
                  label={`${t('gender')} *`}
                  error={!!errors.gender}
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
              </FormControl>
              <FormControl fullWidth margin="normal" error={!!errors.lastName}>
                <TextField
                  label={`${t('lastName')} *`}
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  required
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </FormControl>
              {/* Added a spacer to push the next section lower, mimicking the image */}
              <Box sx={{ height: '50px' }}></Box> {/* Adjust height as needed */}
            </Grid>

            {/* Column 3 (Right - xs=12/md=4) */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">{t('date')}:</Typography>
                <DatePicker
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} />}
                  inputFormat="dd.MM.yyyy"
                />
              </Box>
              <FormControl fullWidth margin="normal">
                <TextField
                  label={t('customerName')}
                  value={formData.customerName}
                  onChange={handleChange('customerName')}
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label={t('internalProcessingNotes')}
                  value={formData.internalProcessingNotes}
                  onChange={handleChange('internalProcessingNotes')}
                  multiline
                  rows={5}
                />
              </FormControl>
            </Grid>

            {/* Address and Contact Information (Bottom Section - spans across two columns) */}
            {/* This Grid item takes up 8 of 12 columns (4+4) on medium/large screens */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}> {/* Nested Grid for Street, PLZ/City, etc. */}
                <Grid item xs={12}> {/* Street is full width within this 8-column section */}
                  <FormControl fullWidth margin="normal" error={!!errors.street}>
                    <TextField
                      label={`${t('street')} *`}
                      value={formData.street}
                      onChange={handleChange('street')}
                      required
                      error={!!errors.street}
                      helperText={errors.street}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}> {/* PLZ takes half width on small/medium/large screens */}
                  <FormControl fullWidth margin="normal" error={!!errors.zipCode}>
                    <TextField
                      label={`${t('zipCode')} *`}
                      value={formData.zipCode}
                      onChange={handleChange('zipCode')}
                      required
                      error={!!errors.zipCode}
                      helperText={errors.zipCode}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}> {/* City takes half width on small/medium/large screens */}
                  <FormControl fullWidth margin="normal" error={!!errors.city}>
                    <TextField
                      label={`${t('city')} *`}
                      value={formData.city}
                      onChange={handleChange('city')}
                      required
                      error={!!errors.city}
                      helperText={errors.city}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}> {/* Country is full width within this 8-column section */}
                  <FormControl fullWidth margin="normal" error={!!errors.country}>
                    <InputLabel id="country-label" required>{t('country')}</InputLabel>
                    <Select
                      labelId="country-label"
                      value={formData.country}
                      onChange={handleSelectChange('country')}
                      label={`${t('country')} *`}
                      error={!!errors.country}
                    >
                      {countryOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12}> {/* Phone is full width within this 8-column section */}
                  <FormControl fullWidth margin="normal" error={!!errors.phone}>
                    <TextField
                      label={t('phone')}
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      type="tel"
                      error={!!errors.phone}
                      helperText={errors.phone}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}> {/* Mobile is full width within this 8-column section */}
                  <FormControl fullWidth margin="normal" error={!!errors.mobile}>
                    <TextField
                      label={t('mobile')}
                      value={formData.mobile}
                      onChange={handleChange('mobile')}
                      type="tel"
                      error={!!errors.mobile}
                      helperText={errors.mobile}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}> {/* Email is full width within this 8-column section */}
                  <FormControl fullWidth margin="normal" error={!!errors.email}>
                    <TextField
                      label={`${t('email')} *`}
                      value={formData.email}
                      onChange={handleChange('email')}
                      required
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            {/* The space beside the address/contact info remains empty, creating the visual break */}
            <Grid item xs={12} md={4}></Grid> {/* Empty Grid item for the remaining 4 columns */}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              <span style={{ color: 'red' }}>*</span> {t('requiredField')}
            </Typography>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#004d40', '&:hover': { backgroundColor: '#00332c' } }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : t('submit')}
            </Button>
          </Box>
        </Paper>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="outlined" onClick={() => i18n.changeLanguage('de')}>
            Deutsch
          </Button>
          <Button variant="outlined" onClick={() => i18n.changeLanguage('en')}>
            English
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default SustainabilityAnalyzerForm;