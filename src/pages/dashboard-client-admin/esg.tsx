import {
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { useMemo, useState, useEffect } from "react";
import Spinner from "../../utils/spinner";
import { 
  useGetAllEsgQuestionsQuery,
  useGetUserEsgResponsesQuery,
  useCreateOrUpdateEsgResponseMutation 
} from "../../lib/redux/features/clients/clientupdatedApiSlice";

interface ESGQuestion {
  id: number;
  category_name: string;
  measure: string;
  index_code: string;
  description?: string;
  order: number;
  is_active: boolean;
}

interface ESGResponse {
  id?: number;
  question: number;
  priority: number | null;
  status_quo: number | null;
  comment: string;
  status: 'draft' | 'submitted' | 'reviewed';
}

const EsgCheck = () => {
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useGetAllEsgQuestionsQuery();
  const { data: responses, isLoading: responsesLoading, refetch: refetchResponses } = useGetUserEsgResponsesQuery();
  const [createOrUpdateResponse, { isLoading: saving }] = useCreateOrUpdateEsgResponseMutation();

  const [activeCategory, setActiveCategory] = useState("");
  const [formData, setFormData] = useState<Record<number, ESGResponse>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Priority choices mapping
  const priorityChoices = [
    { value: 0, label: '0 - nicht gestartet' },
    { value: 1, label: '1 - wenig Priorität' },
    { value: 2, label: '2 - mittlere Priorität' },
    { value: 3, label: '3 - hohe Priorität' },
    { value: 4, label: '4 - sehr hohe Priorität' },
  ];

  // Status quo choices mapping
  const statusQuoChoices = [
    { value: 0, label: '0 - nicht gestartet' },
    { value: 1, label: '1 - schlecht' },
    { value: 2, label: '2 - befriedigend' },
    { value: 3, label: '3 - gut' },
    { value: 4, label: '4 - ausgezeichnet' },
  ];

  const categories = useMemo(() => {
    if (!questions) return [];
    const uniqueCategories = new Set(questions.map((q: ESGQuestion) => q.category_name));
    const desiredCategoryOrder = ["Environment", "Social", "Corporate Governance"];
    return desiredCategoryOrder.filter((category) =>
      uniqueCategories.has(category)
    );
  }, [questions]);

  const categoryMap = {
    Environment: "Umwelt",
    Social: "Gesellschaft",
    "Corporate Governance": "Unternehmensführung",
  };

  // Set activeCategory to the first category if it's not set yet
  useEffect(() => {
    if (categories.length > 0 && activeCategory === "") {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Initialize form data with existing responses
  useEffect(() => {
    if (questions && responses) {
      const initialFormData: Record<number, ESGResponse> = {};
      
      questions.forEach((question: ESGQuestion) => {
        const existingResponse = responses.find((r: ESGResponse) => r.question === question.id);
        initialFormData[question.id] = existingResponse || {
          question: question.id,
          priority: null,
          status_quo: null,
          comment: '',
          status: 'draft'
        };
      });
      
      setFormData(initialFormData);
    }
  }, [questions, responses]);

  const currentQuestions = useMemo(() => {
    if (!questions) return [];
    return questions
      .filter((question: ESGQuestion) => question.category_name === activeCategory)
      .sort((a: ESGQuestion, b: ESGQuestion) => a.order - b.order || a.index_code.localeCompare(b.index_code));
  }, [questions, activeCategory]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveCategory((event.target as HTMLInputElement).value);
  };

  const handleFieldChange = (questionId: number, field: keyof ESGResponse, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
        status: 'draft' // Reset to draft when making changes
      }
    }));
  };

  const handleSaveResponse = async (questionId: number) => {
    try {
      setSaveStatus('saving');
      const responseData = formData[questionId];
      
      await createOrUpdateResponse({
        question: questionId,
        priority: responseData.priority,
        status_quo: responseData.status_quo,
        comment: responseData.comment,
        status: 'draft'
      }).unwrap();
      
      setSaveStatus('saved');
      refetchResponses();
      
      // Reset save status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving response:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSubmitAll = async () => {
    try {
      setSaveStatus('saving');
      const currentCategoryQuestions = currentQuestions.map(q => q.id);
      
      // Submit all responses for the current category
      const submitPromises = currentCategoryQuestions.map(questionId => {
        const responseData = formData[questionId];
        return createOrUpdateResponse({
          question: questionId,
          priority: responseData.priority,
          status_quo: responseData.status_quo,
          comment: responseData.comment,
          status: 'submitted'
        }).unwrap();
      });
      
      await Promise.all(submitPromises);
      setSaveStatus('saved');
      refetchResponses();
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error submitting responses:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (questionsLoading || responsesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (questionsError) {
    console.error("Error fetching ESG questions:", questionsError);
    let error_msg = "An error occurred while fetching ESG questions";
    if (questionsError?.status === 403) {
      error_msg = questionsError?.data?.detail || "Unauthorized Access, Only for Terramo Admin.";
    }
    return <Typography color="error">{error_msg}</Typography>;
  }

  if (!questions || !Array.isArray(questions)) {
    return (
      <Typography color="error">
        Data format error: No questions found or unexpected data structure.
      </Typography>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        ESG-Check – 2025
      </Typography>
      
      <Typography variant="body1" gutterBottom sx={{ mt: 2, mb: 3 }}>
        Um Nachhaltigkeit zu erzielen, werden verschiedene Massnahmen eingesetzt. 
        Abhängig vom Unternehmen sind manche wichtiger, manche weniger. Wie schätzen Sie 
        die Prioritäten der jeweiligen Massnahmen aus Sicht Ihres Unternehmens ein? 
        Schätzen Sie auch ein, wie weit diese Massnahmen fortgeschritten sind.
      </Typography>

      {saveStatus !== 'idle' && (
        <Alert 
          severity={
            saveStatus === 'saving' ? 'info' : 
            saveStatus === 'saved' ? 'success' : 'error'
          }
          sx={{ mb: 2 }}
        >
          {saveStatus === 'saving' && 'Speichere Antworten...'}
          {saveStatus === 'saved' && 'Antworten erfolgreich gespeichert!'}
          {saveStatus === 'error' && 'Fehler beim Speichern der Antworten.'}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Beachten Sie: Der ESG-Check kann pro Jahr nur einmal ausgefüllt werden.
      </Alert>

      {/* Category Navigation */}
      <Box sx={{ 
        display: 'flex', 
        borderBottom: 1, 
        borderColor: 'divider',
        mb: 3
      }}>
        {categories.map((category, index) => (
          <Box
            key={category}
            onClick={() => setActiveCategory(category)}
            sx={{
              px: 3,
              py: 2,
              cursor: 'pointer',
              borderBottom: activeCategory === category ? 2 : 0,
              borderColor: '#026770',
              fontWeight: activeCategory === category ? 'bold' : 'normal',
              color: activeCategory === category ? '#026770' : 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                backgroundColor: 'grey.50'
              }
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: activeCategory === category ? '#026770' : 'grey.300',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            >
              {index + 1}
            </Box>
            {categoryMap[category as keyof typeof categoryMap]}
          </Box>
        ))}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.disabled'
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'grey.300',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 'bold'
            }}
          >
            4
          </Box>
          Zusammenfassung
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        Mögliche Massnahmen im Bereich {categoryMap[activeCategory as keyof typeof categoryMap]}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Alle Felder sind Pflichtfelder
      </Typography>

      {/* Questions Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'grey.200' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>Index</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: '300px' }}>Maßnahme</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Priorität</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Status-Quo</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '250px' }}>Kommentar (optional)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentQuestions.map((question: ESGQuestion) => {
              const response = formData[question.id] || {
                priority: null,
                status_quo: null,
                comment: ''
              };

              return (
                <TableRow key={question.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {question.index_code}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {question.measure}
                      </Typography>
                      {question.description && (
                        <Tooltip title={question.description} arrow>
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={response.priority || ''}
                        onChange={(e: SelectChangeEvent) => 
                          handleFieldChange(question.id, 'priority', Number(e.target.value))
                        }
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Bitte auswählen
                        </MenuItem>
                        {priorityChoices.map((choice) => (
                          <MenuItem key={choice.value} value={choice.value}>
                            {choice.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={response.status_quo || ''}
                        onChange={(e: SelectChangeEvent) => 
                          handleFieldChange(question.id, 'status_quo', Number(e.target.value))
                        }
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Bitte auswählen
                        </MenuItem>
                        {statusQuoChoices.map((choice) => (
                          <MenuItem key={choice.value} value={choice.value}>
                            {choice.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      rows={1}
                      placeholder="Kommentar anzeigen"
                      value={response.comment || ''}
                      onChange={(e) => 
                        handleFieldChange(question.id, 'comment', e.target.value)
                      }
                      InputProps={{
                        style: { fontSize: '0.875rem' }
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mt: 3,
        pt: 2,
        borderTop: 1,
        borderColor: 'grey.200'
      }}>
        <Button
          variant="outlined"
          color="inherit"
          disabled={saving}
        >
          Zurück
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            disabled={saving}
            onClick={handleSubmitAll}
          >
            Zwischenspeichern
          </Button>
          
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: '#026770',
              '&:hover': {
                backgroundColor: '#025a63'
              }
            }}
            disabled={saving}
            onClick={handleSubmitAll}
          >
            {saving ? 'Speichere...' : 'Weiter'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default EsgCheck;