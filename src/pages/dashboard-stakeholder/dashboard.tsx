import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Tab,
  Tabs,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ColDef } from "ag-grid-community";
import Table from "../../components/table/table";
import { useGetStakeholderDashboardQuery, useBulkUpdateStakeholderResponsesMutation } from "../../lib/redux/features/stakeholders/stakeholderApiSlice";
import toast from "react-hot-toast";

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
interface TableRowData {
  question_id: string;
  index_code: string;
  measure: string;
  priority: number | null;
  status_quo: number | null;
  comment: string | null;
  priority_display: string | null;
  status_quo_display: string | null;
  is_answered: boolean;
  response_id: string | null;
}

interface CommentDialogData {
  question_id: string;
  index_code: string;
  comment: string;
}

/* --------------------------- Helpers/Maps --------------------------- */
const PRIORITY_MAP = new Map<number, string>([
  [0, "nicht gestartet"],
  [1, "wenig Priorität"],
  [2, "mittlere Priorität"],
  [3, "hohe Priorität"],
  [4, "sehr hohe Priorität"],
]);
const STATUS_MAP = new Map<number, string>([
  [0, "nicht gestartet"],
  [1, "schlecht"],
  [2, "ausreichend"],
  [3, "gut"],
  [4, "ausgezeichnet"],
]);
const displayOrSelect = (map: Map<number, string>, v?: number | null) =>
  v === 0 || v ? `${v} - ${map.get(v as number)}` : "Bitte auswählen";

// E-1, E-2, … S-1 … G-1 …
const sortIndexCode = (a: string, b: string) => {
  const pa = a.split("-");
  const pb = b.split("-");
  if (pa[0] !== pb[0]) {
    return ["E", "S", "G"].indexOf(pa[0]) - ["E", "S", "G"].indexOf(pb[0]);
  }
  return Number(pa[1]) - Number(pb[1]);
};

const categoryMap = {
  Environment: "Umwelt",
  Social: "Gesellschaft",
  "Corporate Governance": "Unternehmensführung",
} as const;

/* ----------------------------- Component ---------------------------- */
const StakeholderDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [commentDialog, setCommentDialog] = useState<CommentDialogData | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: dashboardData, isLoading, error, refetch } = useGetStakeholderDashboardQuery();
  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdateStakeholderResponsesMutation();

  const categories = useMemo(() => {
    if (!dashboardData?.question_response) return [];
    const categoryNames = Object.keys(dashboardData.question_response);
    const desiredOrder = ["Environment", "Social", "Corporate Governance"];
    return desiredOrder.filter((c) => categoryNames.includes(c));
  }, [dashboardData]);

  console.log('stakeholder dashboardData--',dashboardData)

  /* -------------------- Initialize responses on load ------------------- */
  useEffect(() => {
    if (dashboardData?.question_response) {
      const initial: Record<string, any> = {};
      Object.values(dashboardData.question_response).forEach((category: any) => {
        category.questions.forEach((q: any) => {
          initial[q.question_id] = {
            priority: q.priority ?? null,
            status_quo: q.status_quo ?? null,
            comment: q.comment ?? "",
            response_id: q.response_id,
          };
        });
      });
      setResponses(initial);
    }
  }, [dashboardData]);

  const handleResponseChange = (questionId: string, field: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
  };

  const handleCommentSave = (comment: string) => {
    if (commentDialog) {
      handleResponseChange(commentDialog.question_id, "comment", comment);
      setCommentDialog(null); // Close dialog after saving
    }
  };

  /* -------------------------- Save/Submit -------------------------- */
  const buildPayload = (status: "draft" | "submitted") => {
    const payloadResponses = Object.entries(responses).map(([question_id, r]: any) => ({
      question_id,
      priority: r?.priority ?? null,
      status_quo: r?.status_quo ?? null,
      comment: r?.comment ?? "",
    }));
    return { status, responses: payloadResponses };
  };

  const handleSaveDraft = async () => {
    try {
      const payload = buildPayload("draft");  // Set status to 'draft' for saving draft
      if (payload.responses.length === 0) {
        toast("Keine Änderungen zum Speichern.", { icon: "ℹ️" });
        return;
      }
      const res = await bulkUpdate(payload).unwrap();  // Trigger bulk update mutation
      toast.success(res?.message ?? "Entwurf gespeichert");
      setHasChanges(false);
      refetch();  // Re-fetch data if necessary
    } catch (e: any) {
      toast.error(e?.data?.detail ?? "Fehler beim Speichern des Entwurfs");
      console.error(e);
    }
  };

  // Handle Submit
  const handleSubmit = async () => {
    try {
      const payload = buildPayload("submitted");  // Set status to 'submitted' for submitting
      if (payload.responses.length === 0) {
        toast("Keine Änderungen zum Einreichen.", { icon: "ℹ️" });
        return;
      }
      const res = await bulkUpdate(payload).unwrap();  // Trigger bulk update mutation
      toast.success("Antworten eingereicht");
      setHasChanges(false);
      refetch();  // Re-fetch data if necessary
    } catch (e: any) {
      toast.error(e?.data?.detail ?? "Fehler beim Einreichen");
      console.error(e);
    }
  };

  /* -------------------------- Render guards -------------------------- */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress size="xl" />
      </div>
    );
  }
  if (error) return <Typography color="error">Error loading ESG data</Typography>;
  if (!dashboardData) return <Typography color="error">No data available</Typography>;

  const getCurrentCategoryData = (): TableRowData[] => {
    if (activeTab === 3) return [];
    const categoryName = categories[activeTab] as keyof typeof categoryMap;
    const categoryData = dashboardData.question_response[categoryName];
    if (!categoryData) return [];
    return categoryData.questions
      .slice()
      .sort((a: any, b: any) => sortIndexCode(a.index_code, b.index_code))
      .map((q: any) => ({
        question_id: q.question_id,
        index_code: q.index_code,
        measure: q.measure,
        priority: responses[q.question_id]?.priority ?? q.priority,
        status_quo: responses[q.question_id]?.status_quo ?? q.status_quo,
        comment: responses[q.question_id]?.comment ?? q.comment,
        priority_display: q.priority_display,
        status_quo_display: q.status_quo_display,
        is_answered: q.is_answered,
        response_id: q.response_id,
      }));
  };

  const colDefs: ColDef[] = [
    { field: "index_code", headerName: "Index", flex: 1 },
    { field: "measure", headerName: "Maßnahme", flex: 4 },
    {
      field: "priority",
      headerName: "Priorität",
      flex: 2,
      cellRenderer: (params: any) => (
        <Select
          value={params.value === 0 || params.value ? params.value : ""}
          size="small"
          fullWidth
          displayEmpty
          renderValue={(v) => (v === "" ? "Bitte auswählen" : displayOrSelect(PRIORITY_MAP, Number(v)))}
          onChange={(e) =>
            handleResponseChange(
              params.data.question_id,
              "priority",
              e.target.value === "" ? null : e.target.value
            )
          }
        >
          <MenuItem value="">
            <em>Bitte auswählen</em>
          </MenuItem>
          {[0, 1, 2, 3, 4].map((v) => (
            <MenuItem key={v} value={v}>
              {v} - {PRIORITY_MAP.get(v)}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: "status_quo",
      headerName: "Status Quo",
      flex: 2,
      cellRenderer: (params: any) => (
        <Select
          value={params.value === 0 || params.value ? params.value : ""}
          size="small"
          fullWidth
          displayEmpty
          renderValue={(v) => (v === "" ? "Bitte auswählen" : displayOrSelect(STATUS_MAP, Number(v)))}
          onChange={(e) =>
            handleResponseChange(
              params.data.question_id,
              "status_quo",
              e.target.value === "" ? null : e.target.value
            )
          }
        >
          <MenuItem value="">
            <em>Bitte auswählen</em>
          </MenuItem>
          {[0, 1, 2, 3, 4].map((v) => (
            <MenuItem key={v} value={v}>
              {v} - {STATUS_MAP.get(v)}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: "comment",
      headerName: "Kommentar (optional)",
      flex: 2,
      cellRenderer: (params: any) => (
        <Button
          size="small"
          onClick={() =>
            setCommentDialog({
              question_id: params.data.question_id,
              index_code: params.data.index_code,
              comment: params.value || "",
            })
          }
          sx={{ textTransform: "none" }}
        >
          {params.value ? "Kommentare anzeigen" : "Hinzufügen"}
        </Button>
      ),
    },
  ];

  return (
    <Container>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        ESG Dashboard – {dashboardData.year}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
        Um Nachhaltigkeit zu erzielen, werden verschiedene Maßnahmen eingesetzt.
      </Typography>

      {/* Notice */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Beachten Sie: Der ESG-Check kann pro Jahr nur einmal ausgefüllt werden.
      </Alert>

      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="1 Umwelt" />
          <Tab label="2 Gesellschaft" />
          <Tab label="3 Unternehmensführung" />
          <Tab label="4 Zusammenfassung" />
        </Tabs>
      </Box>

      {/* Category Tabs */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich Umwelt
        </Typography>
        <Table rowData={getCurrentCategoryData()} colDefs={colDefs} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich Gesellschaft
        </Typography>
        <Table rowData={getCurrentCategoryData()} colDefs={colDefs} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich Unternehmensführung
        </Typography>
        <Table rowData={getCurrentCategoryData()} colDefs={colDefs} />
      </TabPanel>

      {/* Summary Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}></Box>
        {categories && categories.length > 0 ? (
          categories.map((categoryName) => (
            <Box key={categoryName} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Mögliche Massnahmen im Bereich {categoryMap[categoryName as keyof typeof categoryMap]}
              </Typography>
              <Table
                rowData={
                  (dashboardData as any).question_response[categoryName]?.questions
                    ? (dashboardData as any).question_response[categoryName]?.questions
                        .slice()
                        .sort((a: any, b: any) => sortIndexCode(a.index_code, b.index_code))
                        .map((q: any) => ({
                          question_id: q.question_id,
                          index_code: q.index_code,
                          measure: q.measure,
                          priority: responses[q.question_id]?.priority ?? q.priority,
                          status_quo: responses[q.question_id]?.status_quo ?? q.status_quo,
                          comment: responses[q.question_id]?.comment ?? q.comment,
                          priority_display: displayOrSelect(PRIORITY_MAP, q.priority),
                          status_quo_display: displayOrSelect(STATUS_MAP, q.status_quo),
                          is_answered: q.is_answered,
                          response_id: q.response_id,
                        }))
                    : []
                }
                colDefs={colDefs}
              />
            </Box>
          ))
        ) : (
          <Typography color="error">Keine Daten für die Zusammenfassung verfügbar</Typography>
        )}
      </TabPanel>

      {/* Comment Dialog */}
      <Dialog open={!!commentDialog} onClose={() => setCommentDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Kommentar für {commentDialog?.index_code}</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={commentDialog?.comment || ""}
            onChange={(e) =>
              setCommentDialog((prev) => (prev ? { ...prev, comment: e.target.value } : null))
            }
            placeholder="Fügen Sie hier Ihren Kommentar hinzu..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog(null)}>Abbrechen</Button>
          <Button onClick={() => handleCommentSave(commentDialog?.comment || "")} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Draft/Submit */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" onClick={handleSaveDraft} disabled={isSaving}>
          Entwurf speichern
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
          Antworten einreichen
        </Button>
      </Box>
    </Container>
  );
};

export default StakeholderDashboard;
