import {
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { ColDef } from "ag-grid-community";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Plot from "react-plotly.js";
import Table from "../../components/table/table";
import Spinner from "../../utils/spinner";
import { useGetClientAdminDashboardTerramoAdminViewQuery } from "../../lib/redux/features/clients/clientupdatedApiSlice";
import { useYearContext } from "../_terramo-admin-dashboard"; 

interface TableRowData {
  question_id: string;
  index_code: string;
  measure: string;
  avg_priority: number;
  avg_status_quo: number;
  response_count: number;
  comments: any[];
}

interface Comment {
  user_id: string;
  user_email: string;
  questionnaire_type: string;
  comment: string;
  responded_at: string;
  updated_at: string;
  is_client_admin: boolean;
}

const EsgCheckClientAdminView = () => {
  // Get client ID from URL params (optional)
  const { id: clientId } = useParams<{ id: string }>();
  
  // Get selected year from context
  const { selectedYear } = useYearContext();
  
  const [activeCategory, setActiveCategory] = useState("");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedComments, setSelectedComments] = useState<Comment[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useState("");
  const [selectedIndexCode, setSelectedIndexCode] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  // Modified hook call - only make request if clientId exists or if you want to fetch all clients data
  const { 
    data: dashboardData, 
    isLoading, 
    error 
  } = useGetClientAdminDashboardTerramoAdminViewQuery(
    {
      client_id: clientId || "", // Pass empty string if no clientId
      year: selectedYear
    },
    { 
      skip: false // Set to false if you want to fetch data even without clientId
      // If your API requires clientId, change this to: skip: !clientId
    }
  );

  // Extract categories from the new API structure
  const categories = useMemo(() => {
    if (!dashboardData?.categories) return [];
    const categoryNames = Object.keys(dashboardData.categories);
    const desiredCategoryOrder = ["Environment", "Social", "Corporate Governance"];
    return desiredCategoryOrder.filter((category) =>
      categoryNames.includes(category)
    );
  }, [dashboardData]);

  useEffect(() => {
    // Set the initial active category only if it hasn't been set yet
    if (categories.length > 0 && activeCategory === "") {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const categoryMap = {
    Environment: "Umwelt",
    Social: "Gesellschaft",
    "Corporate Governance": "Unternehmensführung",
  };

  // Define logic for handling the comment link click
  const handleShowComment = (data: TableRowData) => {
    setSelectedComments(data.comments);
    setSelectedMeasure(data.measure);
    setSelectedIndexCode(data.index_code);
    setCommentModalOpen(true);
    setExpandedComments(new Set()); // Reset expanded state
  };

  const handleCloseCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedComments([]);
    setSelectedMeasure("");
    setSelectedIndexCode("");
    setExpandedComments(new Set());
  };

  const toggleCommentExpansion = (index: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedComments(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('dashboardData->', dashboardData);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  // Error handling
  if (error) {
    console.error("Error fetching ESG dashboard data:", error);
    let error_msg = "An error occurred while fetching ESG dashboard data.";
    if ('status' in error && error.status === 403) {
      error_msg = "Unauthorized Access, Only for Terramo Admin.";
    }
    return <Typography color="error">{error_msg}</Typography>;
  }

  // Data validation
  if (!dashboardData) {
    return (
      <Typography color="error">
        No data available for display or unexpected data structure.
      </Typography>
    );
  }

  console.log("dashboardData=>", dashboardData);

  // Transform the API data for the table based on the active category
  const rowData: TableRowData[] = dashboardData.categories[activeCategory]?.questions?.map((question: any) => ({
    question_id: question.question_id,
    index_code: question.index_code,
    measure: question.measure,
    avg_priority: question.avg_priority || 0,
    avg_status_quo: question.avg_status_quo || 0,
    response_count: question.response_count || 0,
    comments: question.comments || [],
  })) || [];

  // Updated colDefs to match the structure
  const colDefs: ColDef[] = [
    { field: "index_code", headerName: "Index", flex: 1 },
    { field: "measure", headerName: "Maßnahme", flex: 4 },
    { 
      field: "avg_priority", 
      headerName: "Priorität", 
      flex: 1,
      valueFormatter: (params) => {
        const value = params.value;
        if (value === 0) return "0";
        let priorityText = "nicht festgelegt";
        if (value === 1) priorityText = "wenig Priorität";
        if (value === 2) priorityText = "mittlere Priorität";
        if (value === 3) priorityText = "hohe Priorität";
        if (value === 4) priorityText = "sehr hohe Priorität";
        return `${value.toFixed(1)}`;
      }
    },
    { 
      field: "avg_status_quo", 
      headerName: "Status Quo", 
      flex: 1,
      valueFormatter: (params) => {
        const value = params.value;
        if (value === 0) return "0";
        let statusText = "nicht gestartet";
        if (value === 1) statusText = "in Planung";
        if (value === 2) statusText = "in Bearbeitung";
        if (value === 3) statusText = "weitgehend umgesetzt";
        if (value === 4) statusText = "vollständig umgesetzt";
        return `${value.toFixed(1)}`;
      }
    },
    { 
      field: "comments", 
      headerName: "Kommentar (optional)", 
      flex: 2,
      cellRenderer: (params) => {
        const comments = params.value || [];
        if (comments.length > 0) {
          return (
            <span 
              style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => handleShowComment(params.data)}
            >
              {comments.length === 1 ? 'Kommentar anzeigen' : `${comments.length} Kommentare anzeigen`}
            </span>
          );
        }
        return "keine Kommentare";
      }
    },
  ];

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setActiveCategory((event.target as HTMLInputElement).value);
  };

  // Create chart data based on the averages of the active category
  const chartData = [
    {
      type: "bar",
      x: rowData.map((d) => -d.avg_priority), // Negative for left side
      y: rowData.map((d) => d.index_code),
      orientation: "h",
      name: "Priorität",
      marker: { color: "#026770" },
      text: rowData.map((d) => `Priorität: ${d.avg_priority.toFixed(1)}`),
      textposition: "auto",
    },
    {
      type: "bar",
      x: rowData.map((d) => d.avg_status_quo), // Positive for right side
      y: rowData.map((d) => d.index_code),
      orientation: "h",
      name: "Status Quo",
      marker: { color: "#7DB6B7" },
      text: rowData.map((d) => `Status: ${d.avg_status_quo.toFixed(1)}`),
      textposition: "auto",
    },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        ESG-Check – {dashboardData.year}
      </Typography>
      
      {/* Conditionally show client name if available */}
      {dashboardData.client?.name && (
        <Typography variant="h6" gutterBottom>
          Client: {dashboardData.client.name}
        </Typography>
      )}
      
      {/* Show info about client ID status */}
      {!clientId && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "#026770", borderRadius: 1, color: "#ffff" }}>
          <Typography variant="body2">
            Showing Averages
          </Typography>
        </Box>
      )}
      
      <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
        Durchschnittswerte der ESG-Maßnahmen basierend auf den verfügbaren Daten.
        Diese Werte zeigen die kollektive Einschätzung der Prioritäten und des aktuellen Status der verschiedenen Nachhaltigkeitsmaßnahmen.
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 2, borderBottom: "1px solid #eee" }}>
        <RadioGroup
          row
          name="category"
          value={activeCategory}
          onChange={handleCategoryChange}
          sx={{
            "& .MuiFormControlLabel-root": {
              mr: 2,
              "& .MuiRadio-root": {
                display: "none",
              },
              "& .MuiFormControlLabel-label": {
                padding: "4px 8px",
                borderBottom: "2px solid transparent",
                cursor: "pointer",
                color: "text.primary",
                transition: "border-color 0.2s, color 0.2s",
              },
              "& .Mui-checked + .MuiFormControlLabel-label": {
                borderBottom: "2px solid #026770",
                fontWeight: "bold",
                color: "#026770",
              },
            },
          }}
        >
          {categories.map((category) => (
            <FormControlLabel
              key={category}
              value={category}
              control={<Radio />}
              label={categoryMap[category as keyof typeof categoryMap]}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Table rowData={rowData} colDefs={colDefs} />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          ESG Durchschnittswerte - {categoryMap[activeCategory as keyof typeof categoryMap]}
        </Typography>
        <Plot
          data={chartData as any}
          layout={{
            barmode: "relative",
            title: `Durchschnittliche Bewertungen für ${categoryMap[activeCategory as keyof typeof categoryMap]}`,
            xaxis: {
              title: "Bewertung",
              range: [-4, 4],
              // Custom tick labels to show positive values
              tickvals: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
              ticktext: ['4', '3', '2', '1', '0', '1', '2', '3', '4'],
            },
            yaxis: {
              title: "Maßnahmen",
            },
            height: 600,
            margin: {
              l: 100,
              r: 50,
              t: 50,
              b: 50,
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Hinweis:</strong> Die Durchschnittswerte basieren auf den verfügbaren Antworten. 
          Die Prioritätswerte zeigen, wie wichtig die jeweilige Maßnahme eingeschätzt wird, während die Status Quo-Werte den 
          aktuellen Umsetzungsgrad widerspiegeln.
          {!clientId && " Diese Ansicht zeigt aggregierte Daten aller Kunden."}
        </Typography>
      </Box>

      {/* Comments Modal */}
      <Dialog
        open={commentModalOpen}
        onClose={handleCloseCommentModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          pr: 1 
        }}>
          <Box>
            <Typography variant="h6" component="div" fontWeight="bold">
              Kommentare
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedIndexCode} – {selectedMeasure}
            </Typography>
          </Box>
          <Button
            onClick={handleCloseCommentModal}
            sx={{ 
              minWidth: 'auto', 
              p: 0.5,
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'grey.100' }
            }}
          >
            ✕
          </Button>
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          {selectedComments.length === 0 ? (
            <Typography color="text.secondary">Keine Kommentare verfügbar.</Typography>
          ) : (
            <Box>
              {selectedComments.map((comment, index) => {
                const isExpanded = expandedComments.has(index);
                const shouldTruncate = comment.comment.length > 150;
                const displayText = isExpanded || !shouldTruncate 
                  ? comment.comment 
                  : truncateText(comment.comment);
                
                return (
                  <Box 
                    key={`${comment.user_id}-${index}`} 
                    sx={{ 
                      mb: 3,
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <Box sx={{ mb: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight="bold"
                        component="span"
                      >
                        {comment.user_email}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        component="span"
                        sx={{ ml: 1 }}
                      >
                        – {formatDate(comment.responded_at)}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: shouldTruncate ? 1 : 0,
                        lineHeight: 1.5,
                        color: 'text.primary'
                      }}
                    >
                      {displayText}
                    </Typography>
                    
                    {shouldTruncate && (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => toggleCommentExpansion(index)}
                        sx={{ 
                          p: 0,
                          minHeight: 'auto',
                          color: 'primary.main',
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                        }}
                      >
                        {isExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseCommentModal}
            variant="contained"
            sx={{ 
              backgroundColor: '#008080',
              '&:hover': { backgroundColor: '#006666' },
              textTransform: 'none',
              px: 3
            }}
          >
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EsgCheckClientAdminView;