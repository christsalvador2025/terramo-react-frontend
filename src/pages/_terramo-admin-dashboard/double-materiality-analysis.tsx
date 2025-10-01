import React, { useState, useMemo } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import Plot from 'react-plotly.js';

// ============= INTERFACES =============
interface StakeholderGroup {
  id: number;
  name: string;
  selected: boolean;
  weight: string;
  rating: string;
}

interface Topic {
  id: string;
  index: string;
  description: string;
  punkteKT: number;
  punkteSH: number;
  relevanz: string;
  hasRating?: boolean;
  stakeholders?: string[];
}

interface Category {
  id: string;
  name: string;
  topics: Topic[];
}

// ============= MOCK DATA =============
const MOCK_STAKEHOLDER_GROUPS: StakeholderGroup[] = [
  { id: 1, name: 'Vorstand', selected: true, weight: '5', rating: 'Höchste Priorität für strategische Entscheidungen.' },
  { id: 2, name: 'Verwaltungsrat', selected: true, weight: '4', rating: 'Wichtige Stakeholder-Gruppe für Governance.' },
  { id: 3, name: 'Mitarbeitende', selected: true, weight: '4', rating: 'Zentrale Gruppe für soziale Nachhaltigkeit.' },
  { id: 4, name: 'Kunden', selected: true, weight: '3', rating: 'Wichtig für Marktposition.' },
  { id: 5, name: 'Lieferanten', selected: false, weight: '3', rating: '' },
  { id: 6, name: 'Investoren', selected: true, weight: '5', rating: 'Kritisch für Finanzierung.' },
  { id: 7, name: 'Lokale Gemeinschaft', selected: false, weight: '2', rating: '' },
  { id: 8, name: 'Regulierungsbehörden', selected: true, weight: '4', rating: 'Wichtig für Compliance.' },
  { id: 9, name: 'NGOs und Umweltverbände', selected: false, weight: '', rating: '' },
  { id: 10, name: 'Medien', selected: false, weight: '2', rating: '' }
];

const MOCK_CATEGORIES: Category[] = [
  {
    id: 'umwelt',
    name: 'Umwelt',
    topics: [
      { id: 'E-1', index: 'E-1', description: 'Beitrag zum Klimaschutz leisten', punkteKT: 1, punkteSH: 1, relevanz: 'Ja', hasRating: true, stakeholders: [] },
      { id: 'E-2', index: 'E-2', description: 'Anpassung an den Klimawandel: Szenario Analysen und klimafestes entwickeln', punkteKT: 2, punkteSH: 1, relevanz: 'Ja', hasRating: true, stakeholders: [] },
      { id: 'E-3', index: 'E-3', description: 'Energie sparen bzw. effizient nutzen', punkteKT: 1, punkteSH: 1, relevanz: 'Ja', hasRating: true, stakeholders: ['M', 'B'] },
      { id: 'E-4', index: 'E-4', description: 'Emissionen aus fossilen Brenn- und Treibstoffen reduzieren', punkteKT: 1, punkteSH: 2, relevanz: 'Nein', hasRating: false, stakeholders: [] },
      { id: 'E-5', index: 'E-5', description: 'Verschmutzung von Boden, Luft, Wasser reduzieren', punkteKT: 1, punkteSH: 2, relevanz: 'Nein', hasRating: false, stakeholders: [] },
    ]
  },
  {
    id: 'gesellschaft',
    name: 'Gesellschaft',
    topics: [
      { id: 'S-1', index: 'S-1', description: 'Faire Arbeitsbedingungen gewährleisten', punkteKT: 2, punkteSH: 3, relevanz: 'Ja', hasRating: true, stakeholders: ['M'] },
      { id: 'S-2', index: 'S-2', description: 'Gleichstellung und Vielfalt fördern', punkteKT: 1, punkteSH: 2, relevanz: 'Nein', hasRating: false, stakeholders: [] },
    ]
  },
  {
    id: 'unternehmensfuehrung',
    name: 'Unternehmensführung',
    topics: [
      { id: 'G-1', index: 'G-1', description: 'Unternehmenskultur und Ethik stärken', punkteKT: 2, punkteSH: 3, relevanz: 'Ja', hasRating: true, stakeholders: [] },
    ]
  }
];

const STAKEHOLDER_COLORS: Record<string, string> = {
  'M': '#FFB020',
  'B': '#E53935',
  'V': '#1E88E5',
  'K': '#43A047',
};

// ============= MAIN COMPONENT =============
const DoppelteWesentlichkeitCombined: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [stakeholderGroups, setStakeholderGroups] = useState<StakeholderGroup[]>(MOCK_STAKEHOLDER_GROUPS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [expandedPanel, setExpandedPanel] = useState<string>('umwelt');
  
  // Step 1 modals
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StakeholderGroup | null>(null);
  const [tempRating, setTempRating] = useState('');

  // Step 2 modals
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [tempReason, setTempReason] = useState('');

  const steps = ['Auswahl Stakeholder', 'Auswahl für IRO-Bewertung', 'IRO-Bewertung'];

  // ============= STEP 1 HANDLERS =============
  const handleToggle = (id: number) => {
    setStakeholderGroups(groups =>
      groups.map(group =>
        group.id === id ? { ...group, selected: !group.selected } : group
      )
    );
  };

  const handleWeightChange = (id: number, value: string) => {
    setStakeholderGroups(groups =>
      groups.map(group =>
        group.id === id ? { ...group, weight: value } : group
      )
    );
  };

  const openAssessmentModal = (group: StakeholderGroup) => {
    setSelectedGroup(group);
    setTempRating(group.rating || '');
    setAssessmentModalOpen(true);
  };

  const closeAssessmentModal = () => {
    setAssessmentModalOpen(false);
    setSelectedGroup(null);
    setTempRating('');
  };

  const saveAssessment = () => {
    if (selectedGroup) {
      setStakeholderGroups(groups =>
        groups.map(group =>
          group.id === selectedGroup.id ? { ...group, rating: tempRating } : group
        )
      );
    }
    closeAssessmentModal();
  };

  // ============= STEP 2 HANDLERS =============
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : '');
  };

  const handleRelevanzChange = (categoryId: string, topicId: string, value: string) => {
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              topics: category.topics.map(topic =>
                topic.id === topicId ? { ...topic, relevanz: value } : topic
              )
            }
          : category
      )
    );
  };

  // ============= SCATTER PLOT =============
  const scatterPlotData = useMemo(() => {
    const plotData: any[] = [];
    const allTopics: any[] = [];

    categories.forEach(category => {
      category.topics.forEach(topic => {
        if (topic.punkteKT && topic.punkteSH) {
          allTopics.push({
            x: topic.punkteKT,
            y: topic.punkteSH,
            text: topic.index,
            category: category.name
          });
        }
      });
    });

    const categoryColors: Record<string, string> = {
      'Umwelt': '#7ba042',
      'Gesellschaft': '#b27300',
      'Unternehmensführung': '#005959'
    };

    Object.entries(categoryColors).forEach(([categoryName, color]) => {
      const categoryPoints = allTopics.filter(t => t.category === categoryName);
      
      plotData.push({
        x: categoryPoints.map(p => p.x),
        y: categoryPoints.map(p => p.y),
        text: categoryPoints.map(p => p.text),
        mode: 'markers+text',
        type: 'scatter',
        name: categoryName,
        marker: {
          size: 12,
          color: color,
          line: { width: 2, color: 'white' }
        },
        textposition: 'top center',
        textfont: { size: 10, color: color }
      });
    });

    return {
      data: plotData,
      layout: {
        title: 'Wesentlichkeitsmatrix Stakeholder',
        xaxis: { title: 'Stakeholder Gewichtung', range: [0, 3.5], showgrid: true, gridcolor: '#e0e0e0' },
        yaxis: { title: 'Geschäftsleitung', range: [0, 3.5], showgrid: true, gridcolor: '#e0e0e0' },
        legend: { x: 1.02, y: 0.5 },
        margin: { l: 80, r: 150, t: 60, b: 80 },
        plot_bgcolor: '#f5f5f5',
        paper_bgcolor: 'white'
      },
      config: { displayModeBar: true, displaylogo: false }
    };
  }, [categories]);

  // ============= NAVIGATION =============
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // ============= RENDER =============
  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4, bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Doppelte Wesentlichkeit
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
          {activeStep === 0 
            ? 'In diesem Schritt bestimmen Sie, welche Stakeholdergruppen in die Wesentlichkeitsanalyse einbezogen werden.'
            : 'Bestimmen Sie, welche Themen für eine vertiefte Risikoanalyse (IRO) berücksichtigt werden sollen.'}
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ mb: 4, bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: index === activeStep ? 600 : 400,
                    color: index === activeStep ? '#333' : '#999'
                  }}
                >
                  {index + 1} {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* STEP 1: Stakeholder Selection */}
      {activeStep === 0 && (
        <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Stakeholder</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Auswahl</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Gewichtung (1-5) | Pflichtfeld</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>IRO-Bewertung</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stakeholderGroups.map((group) => (
                <TableRow key={group.id} hover>
                  <TableCell><Typography variant="body2">{group.name}</Typography></TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={group.selected}
                      onChange={() => handleToggle(group.id)}
                      sx={{
                        width: 41,
                        height: 22,
                        padding: 0,
                        '& .MuiSwitch-switchBase': {
                          padding: 0,
                          margin: '2px',
                          '&.Mui-checked': {
                            transform: 'translateX(20px)',
                            color: '#fff',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#026770',
                              opacity: 1,
                              border: 0,
                            },
                          },
                        },
                        '& .MuiSwitch-thumb': {
                          width: 18,
                          height: 18,
                          backgroundColor: '#fff',
                        },
                        '& .MuiSwitch-track': {
                          borderRadius: 13,
                          backgroundColor: '#D9D9D9',
                          border: '1px solid #BEBEBE',
                          opacity: 1,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={group.weight}
                        onChange={(e) => handleWeightChange(group.id, e.target.value)}
                        disabled={!group.selected}
                      >
                        <MenuItem value="">Bitte wählen</MenuItem>
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                        <MenuItem value="3">3</MenuItem>
                        <MenuItem value="4">4</MenuItem>
                        <MenuItem value="5">5</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {group.selected && group.weight ? (
                      <Button variant="text" size="small" onClick={() => openAssessmentModal(group)} sx={{ color: '#026770', textTransform: 'none' }}>
                        {group.rating ? 'Bewertung ändern' : 'Bewertung erstellen'}
                      </Button>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#999' }}>Gewichtung festlegen</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* STEP 2: Topic Selection with Accordion */}
      {activeStep === 1 && (
        <>
          {categories.map((category) => (
            <Accordion
              key={category.id}
              expanded={expandedPanel === category.id}
              onChange={handleAccordionChange(category.id)}
              sx={{ mb: 2, boxShadow: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8f9fa' }}>
                <Typography sx={{ fontWeight: 600 }}>{category.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#fafafa' }}>
                        <TableCell sx={{ fontWeight: 600, width: '80px' }}>Index</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Thema</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '100px', textAlign: 'center' }}>Punkte KT</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '100px', textAlign: 'center' }}>Punkte SH</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '150px' }}>Relevanz</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '180px' }}>IRO</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {category.topics.map((topic) => (
                        <TableRow key={topic.id} hover>
                          <TableCell>{topic.index}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{topic.description}</Typography>
                              {topic.stakeholders && topic.stakeholders.length > 0 && (
                                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                                  {topic.stakeholders.map((sh, idx) => (
                                    <Avatar key={idx} sx={{ bgcolor: STAKEHOLDER_COLORS[sh], fontWeight: 600, color: sh === 'M' ? '#333' : 'white' }}>{sh}</Avatar>
                                  ))}
                                </AvatarGroup>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{topic.punkteKT}</TableCell>
                          <TableCell align="center">{topic.punkteSH}</TableCell>
                          <TableCell>
                            <FormControl size="small" fullWidth>
                              <Select value={topic.relevanz} onChange={(e) => handleRelevanzChange(category.id, topic.id, e.target.value)}>
                                <MenuItem value="Bitte wählen">Bitte wählen</MenuItem>
                                <MenuItem value="Ja">Ja</MenuItem>
                                <MenuItem value="Nein">Nein</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            {topic.hasRating ? (
                              <Button variant="text" size="small" sx={{ color: '#026770', textTransform: 'none', fontSize: '0.813rem' }}>
                                Begründung anzeigen
                              </Button>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#999', fontSize: '0.813rem' }}>Relevanz festlegen</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Scatter Plot */}
          <Box sx={{ mt: 4, bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Geschäftsleitung</Typography>
            <Plot data={scatterPlotData.data} layout={scatterPlotData.layout} config={scatterPlotData.config} style={{ width: '100%', height: '500px' }} />
          </Box>
        </>
      )}

      {/* STEP 3: Placeholder */}
      {activeStep === 2 && (
        <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 1, textAlign: 'center' }}>
          <Typography variant="h6">IRO-Bewertung</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 2 }}>Dieser Schritt wird implementiert...</Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack} sx={{ color: '#026770', borderColor: '#026770' }}>
          Zurück
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="text" sx={{ color: '#026770' }}>Zwischenspeichern</Button>
          <Button variant="contained" onClick={handleNext} disabled={activeStep === 2} sx={{ bgcolor: '#026770', '&:hover': { bgcolor: '#024f57' } }}>
            Weiter
          </Button>
        </Box>
      </Box>

      {/* Step 1 Assessment Modal */}
      <Dialog open={assessmentModalOpen} onClose={closeAssessmentModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">IRO-Bewertung für {selectedGroup?.name}</Typography>
          <IconButton onClick={closeAssessmentModal}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
            Geben Sie die IRO-Bewertung (Impact, Risk, Opportunity) für diese Stakeholder-Gruppe ein.
          </Typography>
          <TextField fullWidth multiline rows={6} value={tempRating} onChange={(e) => setTempRating(e.target.value)} placeholder="Beschreiben Sie die IRO-Bewertung..." variant="outlined" />
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#666' }}>
              <strong>Hinweis:</strong> Die IRO-Bewertung hilft dabei, die Auswirkungen (Impact), Risiken (Risk) und Chancen (Opportunity) zu identifizieren.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeAssessmentModal}>Abbrechen</Button>
          <Button variant="contained" onClick={saveAssessment} sx={{ bgcolor: '#026770', '&:hover': { bgcolor: '#024f57' } }}>
            Bewertung speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoppelteWesentlichkeitCombined;