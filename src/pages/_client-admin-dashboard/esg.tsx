import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setClientAdminCurrentClient } from "../../lib/redux/features/clients/clientAdminSlice";
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
  Stack,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
} from "@mui/material";
import { Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { ColDef } from "ag-grid-community";
import Plot from "react-plotly.js";
import Table from "../../components/table/table";
import Spinner from "../../utils/spinner";
import {
  useGetClientAdminDashboardQuery,
  useBulkUpdateEsgResponsesMutation,
  useGetStakeholdersByGroupQuery,
  useCreateStakeholderMutation,
  useRemoveStakeholderMutation,
  useGetCurrentUserStakeholderGroupsQuery,
} from "../../lib/redux/features/clients/clientupdatedApiSlice";
import toast from "react-hot-toast";
import { useYearContext } from "../_client-admin-dashboard"; // Import the context hook
import ESGCheckCard from '../../components/client-admin/no-invited-persons';

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

interface StakeholderData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  group: {
    id: string;
    name: string;
  };
  is_registered: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  last_login: string | null;
}

interface NewStakeholderData {
  first_name: string;
  last_name: string;
  email: string;
  send_invitation: boolean;
  send_login_link: boolean;
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
const ClientEsgCheckDashboard = () => {
  // Get selected year from context
  const { selectedYear } = useYearContext();
  const clientadminState = useSelector((state) => state.clientadmin_data);
  const [activeTab, setActiveTab] = useState(0);
  const [summaryTab, setSummaryTab] = useState(0);
  const [commentDialog, setCommentDialog] = useState<CommentDialogData | null>(null);
  const [stakeholderListOpen, setStakeholderListOpen] = useState(false);
  const [addStakeholderOpen, setAddStakeholderOpen] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGroupInvitation, setSelectedGroupInvitation] = useState<string>('');
  const [newStakeholder, setNewStakeholder] = useState<NewStakeholderData>({
    first_name: '',
    last_name: '',
    email: '',
    send_invitation: true,
    send_login_link: true,
  });

  // API hooks - Pass the selected year as a parameter
  // const { data: dashboardData, isLoading, error, refetch } = useGetClientAdminDashboardQuery({
  //   year: selectedYear
  // });
   const { data: dashboardData, isLoading, error, refetch } = useGetClientAdminDashboardQuery({
      year: selectedYear
    });
  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdateEsgResponsesMutation();
  
  // Stakeholder API hooks
  const { data: stakeholderGroups } = useGetCurrentUserStakeholderGroupsQuery();
  const { 
    data: stakeholdersData, 
    isLoading: stakeholdersLoading,
    refetch: refetchStakeholders 
  } = useGetStakeholdersByGroupQuery(selectedGroupId, {
    skip: !selectedGroupId,
  });
  
  const [createStakeholder, { isLoading: isCreating }] = useCreateStakeholderMutation();
  const [removeStakeholder, { isLoading: isRemoving }] = useRemoveStakeholderMutation();
  const dispatch = useDispatch();
  // Refetch data when year changes
  useEffect(() => {
    if (selectedYear) {
      refetch();
    }
  }, [selectedYear, refetch]);

  // console.log("selectedYear==>",selectedYear)
  // console.log('stakeholderGroups.results--',stakeholderGroups)
  // console.log('dashboard data=>', dashboardData)
  const defaultStakeholder = stakeholderGroups?.results.find(item => item.name === "Management");
  console.log(defaultStakeholder)
  // Set default group ID when stakeholder groups are loaded
  useEffect(() => {
    if (stakeholderGroups?.results && stakeholderGroups.results.length > 0 && !selectedGroupId) {
      
      
      // const defaultStakeholder = stakeholderGroups.results.find(item => item.name === "Management");
      setSelectedGroupId(stakeholderGroups.results.find(item => item.name === "Management").id);
    }
  }, [stakeholderGroups, selectedGroupId]);


  useEffect(() => {
    if (dashboardData) {
      dispatch(setClientAdminCurrentClient(dashboardData.client));

    
    }
  }, [dashboardData, dispatch]);
  // set the invitation token
  useEffect(() => {
    if (stakeholderGroups?.results && stakeholderGroups.results.length > 0 && !selectedGroupInvitation) {
      
      setSelectedGroupInvitation(stakeholderGroups?.results.find(item => item.name === "Management").invitation_token);
    }
  }, [stakeholderGroups, selectedGroupInvitation]);

  const categories = useMemo(() => {
    if (!dashboardData?.question_response) return [];
    const categoryNames = Object.keys(dashboardData.question_response);
    const desiredOrder = ["Environment", "Social", "Corporate Governance"];
    return desiredOrder.filter((c) => categoryNames.includes(c));
  }, [dashboardData]);
  

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
      setHasChanges(false);
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
    setHasChanges(true);
  };

  const handleCommentSave = (comment: string) => {
    if (commentDialog) {
      handleResponseChange(commentDialog.question_id, "comment", comment);
      setCommentDialog(null);
    }
  };

  /* -------------------------- Stakeholder handlers -------------------------- */
  const handleAddStakeholder = async () => {
    if (!selectedGroupId) {
      toast.error('Keine Gruppe ausgewählt');
      return;
    }

    if (!newStakeholder.email) {
      toast.error('E-Mail ist erforderlich');
      return;
    }

    try {
      const result = await createStakeholder({
        groupId: selectedGroupId,
        data: {
          email: newStakeholder.email,
          first_name: newStakeholder.first_name,
          last_name: newStakeholder.last_name,
          send_invitation: newStakeholder.send_invitation,
          send_login_link: newStakeholder.send_login_link,
        }
      }).unwrap();

      toast.success(result.message || 'Stakeholder erfolgreich hinzugefügt');
      setNewStakeholder({ 
        first_name: '', 
        last_name: '', 
        email: '',
        send_invitation: true,
        send_login_link: true,
      });
      setAddStakeholderOpen(false);
      refetchStakeholders();
    } catch (error: any) {
      console.error('Error creating stakeholder:', error);
      const errorMessage = error?.data?.detail || 
                          error?.data?.email?.[0] || 
                          error?.data?.non_field_errors?.[0] ||
                          'Fehler beim Hinzufügen des Stakeholders';
      toast.error(errorMessage);
    }
  };

  const handleRemoveStakeholder = async (stakeholderId: string) => {
    if (!selectedGroupId) {
      toast.error('Keine Gruppe ausgewählt');
      return;
    }

    try {
      await removeStakeholder({
        stakeholderId,
        groupId: selectedGroupId,
      }).unwrap();
      
      toast.success('Stakeholder entfernt');
      refetchStakeholders();
    } catch (error: any) {
      console.error('Error removing stakeholder:', error);
      const errorMessage = error?.data?.detail || 'Fehler beim Entfernen des Stakeholders';
      toast.error(errorMessage);
    }
  };

  const handleCopyInviteLink = () => {
    if (!selectedGroupInvitation) {
      toast.error('Keine Gruppe ausgewählt');
      return;
    }

    const inviteLink = `${window.location.origin}/stakeholder/accept-invitation/${selectedGroupInvitation}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Einladungslink kopiert');
  };

  /* -------------------------- Bulk update -------------------------- */
  const buildPayload = (status: "draft" | "submitted") => {
    const payloadResponses = Object.entries(responses).map(([question_id, r]: any) => ({
      question_id,
      priority: r?.priority ?? null,
      status_quo: r?.status_quo ?? null,
      comment: r?.comment ?? "",
    }));
    return { status, responses: payloadResponses, year: selectedYear }; // Include year in payload
  };

  const handleSaveDraft = async () => {
    try {
      const payload = buildPayload("draft");
      if (payload.responses.length === 0) {
        toast("Keine Änderungen zum Speichern.", { icon: "ℹ️" });
        return;
      }
      const res = await bulkUpdate(payload).unwrap();
      toast.success(res?.message ?? "Entwurf gespeichert");
      setHasChanges(false);
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.detail ?? "Fehler beim Speichern des Entwurfs");
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = buildPayload("submitted");
      if (payload.responses.length === 0) {
        toast("Keine Änderungen zum Einreichen.", { icon: "ℹ️" });
        return;
      }
      const res = await bulkUpdate(payload).unwrap();
      toast.success(res?.message ?? "Antworten eingereicht");
      setHasChanges(false);
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.detail ?? "Fehler beim Einreichen");
      console.error(e);
    }
  };

  /* -------------------------- Render guards -------------------------- */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  if (error) return <Typography color="error">Error loading ESG data</Typography>;
  if (!dashboardData) return <Typography color="error">No data available</Typography>;

  /* -------------------------- Data for tables -------------------------- */
  const tableEmpty = () => {
    console.log("empty array")
    return <div>No Data</div>
  }
  const getCurrentCategoryData = (): TableRowData[] => {
    if (activeTab === 3) return [];
    const categoryName = categories[activeTab] as keyof typeof categoryMap;
    const categoryData = (dashboardData as any).question_response[categoryName];
    if (!categoryData) return [];

    // console.log("data----",categoryData.questions?.length)
    
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

  /* ------------------------ Editable col definitions ------------------------ */
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
 

  /* ----------------------- Per-category chart data ----------------------- */
  const createCategoryChartData = (categoryName: string) => {
  if (!dashboardData.categories) return [];
  const cat = (dashboardData as any).categories[categoryName];
  if (!cat) return [];

  const ordered = [...cat.questions].sort((a: any, b: any) => sortIndexCode(a.index_code, b.index_code));
  const yLabels = ordered.map((d: any) => d.index_code);

  return [
    {
      type: "bar",
      x: ordered.map((d: any) => -Number(d.avg_priority || 0)), // Keep negative for left positioning
      y: yLabels,
      orientation: "h",
      name: "Priorität",
      marker: { color: "#026770" },
      // Show absolute value in hover (positive)
      hovertemplate: "<b>%{y}</b><br>Priorität: %{customdata:.1f}<extra></extra>",
      customdata: ordered.map((d: any) => Number(d.avg_priority || 0)), // Positive values for display
    },
    {
      type: "bar",
      x: ordered.map((d: any) => Number(d.avg_status_quo || 0)), // right
      y: yLabels,
      orientation: "h",
      name: "Status Quo",
      marker: { color: "#7DB6B7" },
      hovertemplate: "<b>%{y}</b><br>Status Quo: %{x:.1f}<extra></extra>",
    },
  ];
};

const questionsNotFound = ()=>{
  return <Stack direction="row" spacing={2} justifyContent="center" alignItems="start" py={2}>
            <Typography variant="h4" gutterBottom>
              <div style={{"color": "gray", "fontWeight": "semibold"}}>No Data found.</div>
            </Typography>
          </Stack>
}
  return (
    <Container>
      {/* Header - Show selected year */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          ESG-Check – {selectedYear}
        </Typography>
        <Button
          onClick={() => setStakeholderListOpen(true)}
          sx={{ 
            color: '#026770',
            '&:hover': {
              backgroundColor: 'rgba(2, 103, 112, 0.04)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PersonAddIcon sx={{ fontSize: '1.25rem', transform: 'scaleX(-1)' }} />
            <span>Kernteam</span>
          </Box>
        </Button>
      </Stack>
      
      <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
        Um Nachhaltigkeit zu erzielen, werden verschiedene Maßnahmen eingesetzt. Abhängig vom
        Unternehmen sind manche wichtiger, manche weniger. Wie schätzen Sie die Prioritäten der
        jeweiligen Maßnahmen aus Sicht Ihres Unternehmens ein? Schätzen Sie auch ein, wie weit diese
        Maßnahmen fortgeschritten sind.
      </Typography>
      
      {/* Notice */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Beachten Sie: Der ESG-Check kann pro Jahr nur einmal ausgefüllt werden.
      </Alert>

        {/* <ESGCheckCard/> */}
      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="1 Umwelt" />
          <Tab label="2 Gesellschaft" />
          <Tab label="3 Unternehmensführung" />
          <Tab label="4 Zusammenfassung" />
        </Tabs>
      </Box>

      {/* Environment Tab */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich Umwelt
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Alle Felder sind Pflichtfelder
        </Typography>

        {
          
          dashboardData.question_response["Environment"].questions?.length <= 0 
          ? 
          questionsNotFound()
          : <Table rowData={getCurrentCategoryData()} colDefs={colDefs} />
        }
        
      </TabPanel>

      {/* Social Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich Gesellschaft
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Alle Felder sind Pflichtfelder
        </Typography>
        {/* <Table rowData={getCurrentCategoryData()} colDefs={colDefs} /> */}
        {
          dashboardData.question_response["Social"].questions?.length <= 0 
          ? 
          questionsNotFound()
          : <Table rowData={getCurrentCategoryData()} colDefs={colDefs} />
        }
      </TabPanel>

      {/* Corporate Governance Tab */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich Unternehmensführung
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Alle Felder sind Pflichtfelder
        </Typography>
        {/* <Table rowData={getCurrentCategoryData()} colDefs={colDefs} /> */}
        {
          dashboardData.question_response["Corporate Governance"].questions?.length <= 0 
          ? 
          questionsNotFound()
          : <Table rowData={getCurrentCategoryData()} colDefs={colDefs} />
        }
      </TabPanel>

      {/* Summary Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={summaryTab} onChange={(_, v) => setSummaryTab(v)}>
            <Tab label="Tabelle" />
            <Tab label="Chart" />
          </Tabs>
        </Box>

        {/* Summary tables per category */}
        {summaryTab === 0 && (
          <>
            {categories.map((categoryName) => (
              <Box key={categoryName} sx={{ mb: 4 }}>
               
                <Typography variant="h6" gutterBottom>
                  Mögliche Massnahmen im Bereich {categoryMap[categoryName as keyof typeof categoryMap]}
                </Typography>
                {
                  dashboardData.question_response[categoryName].questions?.length <= 0 
                  ? questionsNotFound()
                  :
                <Table
                  rowData={
                    (dashboardData as any).question_response[categoryName]?.questions
                      .slice()
                      .sort((a: any, b: any) => sortIndexCode(a.index_code, b.index_code))
                      .map((q: any) => {
                        const p = responses[q.question_id]?.priority ?? q.priority;
                        const s = responses[q.question_id]?.status_quo ?? q.status_quo;
                        return {
                          question_id: q.question_id,
                          index_code: q.index_code,
                          measure: q.measure,
                          priority: p,
                          status_quo: s,
                          comment: responses[q.question_id]?.comment ?? q.comment,
                          priority_display: displayOrSelect(PRIORITY_MAP, p),
                          status_quo_display: displayOrSelect(STATUS_MAP, s),
                          is_answered: q.is_answered,
                          response_id: q.response_id,
                        } as TableRowData;
                      }) || []
                  }
                  colDefs={[
                    { field: "index_code", headerName: "Index", flex: 1 },
                    { field: "measure", headerName: "Maßnahme", flex: 4 },
                    { field: "priority_display", headerName: "Priorität", flex: 2 },
                    { field: "status_quo_display", headerName: "Status Quo", flex: 2 },
                    {
                      field: "comment",
                      headerName: "Kommentar",
                      flex: 2,
                      cellRenderer: (params: any) => params.value || "kein Kommentar",
                    },
                  ]}
                />
                 }
              </Box>
            ))}
          </>
        )}

        {/* Summary charts per category */}
        {summaryTab === 1 && (
          <>
            {categories.map((categoryName) => (
              <Box key={categoryName} sx={{ mt: 1, mb: 5 }}>
                <Typography variant="h6" gutterBottom>
                  Mögliche Massnahmen im Bereich {categoryMap[categoryName as keyof typeof categoryMap]}
                </Typography>

                {
                   dashboardData.question_response[categoryName].questions?.length <= 0 
                  ? questionsNotFound()
                  :
              
                <Plot
                  data={createCategoryChartData(categoryName) as any}
                  layout={{
                    barmode: "relative",
                    height: 420,
                    bargap: 0.2,
                    margin: { l: 120, r: 50, t: 10, b: 40 },
                    xaxis: {
                      range: [-4, 4],
                      zeroline: true,
                      zerolinewidth: 2,
                      zerolinecolor: "#cccccc",
                      tickvals: [-4,-3, -2, -1, 0, 1, 2, 3, 4],
                      ticktext: ['4','3', '2', '1', '0', '1', '2', '3', '4'],
                      
                    },
                    yaxis: { autorange: "reversed" },
                    showlegend: true,
                  }}
                  config={{ displayModeBar: false }}
                />
                  }
              </Box>
            ))}
          </>
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
            onChange={(e) => setCommentDialog((prev) => (prev ? { ...prev, comment: e.target.value } : null))}
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

      {/* Stakeholder List Modal */}
      <Dialog 
        open={stakeholderListOpen} 
        onClose={() => setStakeholderListOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Kernteam</Typography>
          <IconButton onClick={() => setStakeholderListOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Leo senectus etiam mattis facilisi purus viverra pellentesque nam. Viverra sapien quisque dolor 
            augue proin amet consectetur nibh urna. Condimentum donec diam faucibus vulputate dui enim 
            eu. Orci pharetra feugiat gravida facilisi eu integer eu.
          </Typography>

          {/* Group Selection */}
          {stakeholderGroups?.results && stakeholderGroups.results.length > 1 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Stakeholder Gruppe auswählen:
              </Typography>
              <Typography variant="" sx={{ mb: 1 }}>
                {stakeholderGroups.results.map((group) => (
                  group.name === 'Management' && <Typography variant="h6" key={group.id} value={group.id} sx={{ 
                color: '#026770',
               
              }}>{group.name}</Typography>
                 
                ))}
              </Typography>
              {/* <Select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                fullWidth
                size="small"
              >
                {stakeholderGroups.results.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select> */}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button 
              variant="text" 
              onClick={() => setAddStakeholderOpen(true)}
              sx={{ color: '#026770' }}
              disabled={!selectedGroupId}
            >
              User manuell anlegen
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCopyInviteLink}
              disabled={!selectedGroupInvitation}
              sx={{ 
                backgroundColor: '#026770',
                '&:hover': { backgroundColor: '#024f57' }
              }}
            >
              Einladungslink kopieren
            </Button>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Einladung bereits angenommen:
          </Typography>

          {stakeholdersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <MuiTable>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Vorname</TableCell>
                    <TableCell>Nachname</TableCell>
                    <TableCell>E-Mail Adresse</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Angemeldet am</TableCell>
                    <TableCell align="center">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stakeholdersData?.results && stakeholdersData.results.length > 0 ? (
                    stakeholdersData.results.map((stakeholder) => (
                      <TableRow key={stakeholder.id}>
                        <TableCell>{stakeholder.first_name || '-'}</TableCell>
                        <TableCell>{stakeholder.last_name || '-'}</TableCell>
                        <TableCell>{stakeholder.email}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 'medium',
                              textAlign: 'center',
                              backgroundColor: 
                                stakeholder.status === 'approved' ? '#e8f5e8' :
                                stakeholder.status === 'pending' ? '#fff3cd' : '#f8d7da',
                              color:
                                stakeholder.status === 'approved' ? '#2e7d32' :
                                stakeholder.status === 'pending' ? '#856404' : '#721c24'
                            }}
                          >
                            {stakeholder.status === 'approved' ? 'Genehmigt' :
                             stakeholder.status === 'pending' ? 'Ausstehend' : 'Abgelehnt'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {stakeholder.last_login 
                            ? new Date(stakeholder.last_login).toLocaleDateString('de-DE')
                            : '-'
                          }
                        </TableCell>
                        <TableCell align="center">
                          <Button 
                            size="small" 
                            onClick={() => handleRemoveStakeholder(stakeholder.id)}
                            disabled={isRemoving}
                            sx={{ color: '#026770', minWidth: 'auto' }}
                          >
                            ✕ Entfernen
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {selectedGroupId ? 'Keine Stakeholder gefunden' : 'Bitte wählen Sie eine Gruppe aus'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </MuiTable>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Stakeholder Modal */}
      <Dialog 
        open={addStakeholderOpen} 
        onClose={() => setAddStakeholderOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User manuell anlegen</Typography>
          <IconButton onClick={() => setAddStakeholderOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fügen Sie einen neuen Stakeholder zur ausgewählten Gruppe hinzu. Eine E-Mail-Adresse ist erforderlich.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Vorname
              </Typography>
              <TextField
                fullWidth
                placeholder="Vorname eingeben"
                value={newStakeholder.first_name}
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, first_name: e.target.value }))}
                variant="outlined"
                size="medium"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Nachname
              </Typography>
              <TextField
                fullWidth
                placeholder="Nachname eingeben"
                value={newStakeholder.last_name}
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, last_name: e.target.value }))}
                variant="outlined"
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                E-Mail Adresse *
              </Typography>
              <TextField
                fullWidth
                placeholder="E-Mail Adresse eingeben"
                value={newStakeholder.email}
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, email: e.target.value }))}
                variant="outlined"
                size="medium"
                type="email"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="send_invitation"
                    checked={newStakeholder.send_invitation}
                    onChange={(e) => setNewStakeholder(prev => ({ ...prev, send_invitation: e.target.checked }))}
                  />
                  <label htmlFor="send_invitation" style={{ marginLeft: 8, fontSize: '0.875rem' }}>
                    Einladung senden
                  </label>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="send_login_link"
                    checked={newStakeholder.send_login_link}
                    onChange={(e) => setNewStakeholder(prev => ({ ...prev, send_login_link: e.target.checked }))}
                  />
                  <label htmlFor="send_login_link" style={{ marginLeft: 8, fontSize: '0.875rem' }}>
                    Login-Link senden
                  </label>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAddStakeholderOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddStakeholder}
            disabled={!newStakeholder.email || isCreating}
            sx={{ 
              backgroundColor: '#026770',
              '&:hover': { backgroundColor: '#024f57' }
            }}
          >
            {isCreating ? <CircularProgress size={20} color="inherit" /> : 'User anlegen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottom action bar */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: (t) => t.zIndex.appBar,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 6,
          py: 2,
          px: { xs: 0, sm: 0 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side: Back */}
        <Button
          variant="outlined"
          disabled={activeTab === 0}
          onClick={() => setActiveTab((t) => Math.max(0, t - 1))}
        >
          Zurück
        </Button>

        {/* Right side: Save draft + Next/Submit */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="text"
            onClick={handleSaveDraft}
            disabled={isSaving}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Zwischenspeichern
          </Button>

          {activeTab < 3 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              Weiter
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              Abschließen
            </Button>
          )}
        </Box>
      </Box>

    </Container>
  );
};

export default ClientEsgCheckDashboard;