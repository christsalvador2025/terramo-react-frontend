import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Tab,
  Tabs,
  Alert,
  Stack,
} from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Spinner from "../../../../utils/spinner";
import { useYearContext } from "../../../../pages/_client-admin-dashboard";
import { useEsg, useEsgCategories, useCurrentCategoryData, categoryMap, PRIORITY_MAP, STATUS_MAP } from '../../../../hooks/client-admin/useEsg';
import { useStakeholder } from '../../../../hooks/client-admin/useEsgStakeholder';
// Components
import EsgTable from './EsgTable';
import EsgChart from './EsgChart';
import CommentDialog from './CommentDialog';
import StakeholderManagement from './StakeholderManagement';

/* ----------------------------- Tab Panel ----------------------------- */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/* ------------------------------ Types ------------------------------- */
interface CommentDialogData {
  question_id: string;
  index_code: string;
  comment: string;
}

/* ----------------------------- Component ---------------------------- */
const ClientEsgCheckDashboardMain = () => {
  // Get selected year from context
  const { selectedYear } = useYearContext();
  
  // Local state
  const [commentDialog, setCommentDialog] = useState<CommentDialogData | null>(null);
  const [summaryTab, setSummaryTab] = useState(0);

  // Custom hooks
  const {
    data: dashboardData,
    responses,
    activeTab,
    hasChanges,
    isLoading,
    isSaving,
    error,
    handleResponseChange,
    handleTabChange,
    handleSaveDraft,
    handleSubmit,
  } = useEsg(selectedYear);

  const {
    handleStakeholderListOpen,
  } = useStakeholder();

  const categories = useEsgCategories();
  const currentCategoryData = useCurrentCategoryData();

  // Comment handlers
  const handleCommentClick = (questionId: string, indexCode: string, comment: string) => {
    setCommentDialog({
      question_id: questionId,
      index_code: indexCode,
      comment: comment,
    });
  };

  const handleCommentSave = (comment: string) => {
    if (commentDialog) {
      handleResponseChange(commentDialog.question_id, "comment", comment);
      setCommentDialog(null);
    }
  };

  // Helper functions
  const questionsNotFound = () => {
    return (
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="start" py={2}>
        <Typography variant="h4" gutterBottom>
          <div style={{ color: "gray", fontWeight: "normal" }}>No Data found.</div>
        </Typography>
      </Stack>
    );
  };

  const getCategorySummaryData = (categoryName: string) => {
    if (!dashboardData?.question_response?.[categoryName]) return [];
    
    return dashboardData.question_response[categoryName].questions
      .slice()
      .sort((a: any, b: any) => {
        const pa = a.index_code.split("-");
        const pb = b.index_code.split("-");
        if (pa[0] !== pb[0]) {
          return ["E", "S", "G"].indexOf(pa[0]) - ["E", "S", "G"].indexOf(pb[0]);
        }
        return Number(pa[1]) - Number(pb[1]);
      })
      .map((q: any) => {
        const response = responses[q.question_id];
        return {
          ...q,
          priority: response?.priority || null,
          status_quo: response?.status_quo || null,
          comment: response?.comment || null,
          priority_display: response?.priority !== null && response?.priority !== undefined 
            ? `${response.priority} - ${PRIORITY_MAP.get(response.priority)}` 
            : null,
          status_quo_display: response?.status_quo !== null && response?.status_quo !== undefined 
            ? `${response.status_quo} - ${STATUS_MAP.get(response.status_quo)}` 
            : null,
          is_answered: response?.priority !== null && response?.status_quo !== null,
          response_id: response?.id || null,
        };
      });
  };

  const getCurrentCategoryName = () => {
    return categories[activeTab] || '';
  };

  const getCurrentCategoryDisplayName = () => {
    const categoryName = getCurrentCategoryName();
    return categoryMap.get(categoryName) || categoryName;
  };

  const hasCurrentCategoryData = () => {
    const categoryName = getCurrentCategoryName();
    return dashboardData?.question_response?.[categoryName]?.questions?.length > 0;
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Spinner />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ESG-Check {selectedYear}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          onClick={() => handleStakeholderListOpen(true)}
          sx={{ 
            borderColor: '#026770',
            color: '#026770',
            '&:hover': {
              borderColor: '#024f57',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Kernteam verwalten
        </Button>
      </Box>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Sie haben ungespeicherte Änderungen. Vergessen Sie nicht, Ihre Arbeit zu speichern.
        </Alert>
      )}

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="ESG categories"
        >
          {categories.map((category, index) => (
            <Tab
              key={category}
              label={categoryMap.get(category) || category}
              id={`category-tab-${index}`}
              aria-controls={`category-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      {/* Category Content */}
      {categories.map((category, index) => (
        <TabPanel key={category} value={activeTab} index={index}>
          {/* Summary Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={summaryTab}
              onChange={(_, newValue) => setSummaryTab(newValue)}
              aria-label="summary tabs"
            >
              <Tab label="Übersicht" />
              <Tab label="Grafische Darstellung" />
            </Tabs>
          </Box>

          {/* Summary Content */}
          {summaryTab === 0 && (
            <Box>
              {hasCurrentCategoryData() ? (
                <EsgTable
                  data={getCategorySummaryData(category)}
                  onResponseChange={handleResponseChange}
                  onCommentClick={handleCommentClick}
                  editable={true}
                />
              ) : (
                questionsNotFound()
              )}
            </Box>
          )}

          {summaryTab === 1 && (
            <EsgChart
              categoryName={category}
              categoryDisplayName={getCurrentCategoryDisplayName()}
              hasData={hasCurrentCategoryData()}
            />
          )}
        </TabPanel>
      ))}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleSaveDraft}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? 'Speichere...' : 'Entwurf speichern'}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!hasChanges || isSaving}
          sx={{
            backgroundColor: '#026770',
            '&:hover': { backgroundColor: '#024f57' }
          }}
        >
          {isSaving ? 'Speichere...' : 'Abschicken'}
        </Button>
      </Box>

      {/* Comment Dialog */}
      <CommentDialog
        open={!!commentDialog}
        data={commentDialog}
        onClose={() => setCommentDialog(null)}
        onSave={handleCommentSave}
      />

      {/* Stakeholder Management Modal */}
      <StakeholderManagement />
    </Container>
  );
};

export default ClientEsgCheckDashboardMain;