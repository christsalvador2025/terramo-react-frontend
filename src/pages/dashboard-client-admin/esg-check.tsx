// import {
//   Container,
//   FormControl,
//   FormControlLabel,
//   FormLabel,
//   Radio,
//   RadioGroup,
//   Typography,
// } from "@mui/material";
// import { ColDef } from "ag-grid-community";
// import { PlotData } from "plotly.js";
// import { useEffect, useState } from "react";
// import Plot from "react-plotly.js";
// import Table from "../../components/table/table";
// import { useCustomer } from "../../context/customer-context";
// import useFetchMeasures from "../../hooks/use-fetch-measures";
// import { Customer } from "../../types/customer";
// import { Measure } from "../../types/measure";
// import { categorizeMeasureGrading } from "../../utils/measure-utils";

// const EsgCheck = () => {
//   const [chartData, setChartData] = useState<Record<string, any[]>>({});
//   const [activeCategory, setActiveCategory] = useState("Umwelt");
//   const { measures } = useFetchMeasures();
//   const customerData = useCustomer();
//   const [meanRow, setMeanRow] = useState({
//     key: "Durchschnitt",
//     name: "",
//     grading: 0,
//     statusQuo: 0,
//   });

//   const assembleMeasureGrading = (measureGrading: any, measures: Measure[]) => {
//     const categoryName = categorizeMeasureGrading(measureGrading);
//     const measure = measures.find((m: Measure) => m.key === measureGrading.key);
//     return {
//       category: categoryName,
//       key: measureGrading.key,
//       name: measure ? measure.name : "Unknown",
//       grading: measureGrading.prio,
//       statusQuo: measureGrading.statusQuo,
//     };
//   };

//   const groupMeasureGradings = (measureGradings: any[]) => {
//     return measureGradings.reduce(
//       (acc, grading) => {
//         const category = grading.category;
//         if (!acc[category]) {
//           acc[category] = [];
//         }
//         acc[category].push(grading);
//         return acc;
//       },
//       {} as Record<string, any[]>
//     );
//   };

//   const processMeasureGradings = (
//     customerData: Customer,
//     measures: Measure[]
//   ) => {
//     const measureGradings = customerData.measureGradings.map((measureGrading) =>
//       assembleMeasureGrading(measureGrading, measures)
//     );
//     return groupMeasureGradings(measureGradings);
//   };

//   const calculateMean = (data: any[], field: string) => {
//     if (data.length === 0) return 0;
//     const total = data.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
//     return Math.round((total / data.length) * 100) / 100;
//   };

//   const updateMeanRow = (
//     chartData: Record<string, any[]>,
//     activeCategory: string
//   ) => {
//     const activeData = chartData[activeCategory] || [];
//     setMeanRow({
//       key: "Durchschnitt",
//       name: "",
//       grading: calculateMean(activeData, "grading"),
//       statusQuo: calculateMean(activeData, "statusQuo"),
//     });
//   };

//   useEffect(() => {
//     if (customerData?.measureGradings && measures.length > 0) {
//       const groupedGradings = processMeasureGradings(customerData, measures);
//       setChartData(groupedGradings);
//     }
//   }, [customerData, measures]);

//   useEffect(() => {
//     updateMeanRow(chartData, activeCategory);
//   }, [chartData, activeCategory]);

//   const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setActiveCategory((event.target as HTMLInputElement).value);
//   };

//   const createPlotData = () => {
//     const activeData = chartData[activeCategory] || [];
//     return [
//       {
//         type: "bar",
//         x: activeData.map((d: any) => -d.grading).reverse(),
//         base: 0,
//         y: activeData.map((d: any) => d.key).reverse(),
//         orientation: "h",
//         name: "Priorität",
//         marker: {
//           color: "026770",
//         },
//       },
//       {
//         type: "bar",
//         x: activeData.map((d: any) => d.statusQuo).reverse(),
//         base: 0,
//         y: activeData.map((d: any) => d.key).reverse(),
//         orientation: "h",
//         name: "Status Quo",
//         marker: {
//           color: "7DB6B7",
//         },
//       },
//     ] as unknown as Partial<PlotData>[];
//   };

//   const colDefs: ColDef[] = [
//     { field: "key", headerName: "Index", flex: 1 },
//     { field: "name", headerName: "Massnahme", flex: 4 },
//     { field: "grading", headerName: "Priorität", flex: 1 },
//     { field: "statusQuo", headerName: "Status Quo", flex: 1 },
//   ];

//   const activeData = chartData[activeCategory] || [];

//   return (
//     <Container>
//       <FormControl component="fieldset">
//         <FormLabel component="legend">Kategorie</FormLabel>
//         <RadioGroup
//           aria-label="category"
//           name="category"
//           value={activeCategory}
//           onChange={handleCategoryChange}
//           row
//         >
//           <FormControlLabel value="Umwelt" control={<Radio />} label="Umwelt" />
//           <FormControlLabel
//             value="Gesellschaft"
//             control={<Radio />}
//             label="Gesellschaft"
//           />
//           <FormControlLabel
//             value="Wirtschaft"
//             control={<Radio />}
//             label="Wirtschaft"
//           />
//         </RadioGroup>
//       </FormControl>
//       <Typography variant="h6" gutterBottom>
//         {`Relevanz für das Unternehmen & Status Quo, Bereich ${activeCategory}`}
//       </Typography>
//       <Table rowData={[...activeData, meanRow]} colDefs={colDefs} />
//       <Plot
//         data={createPlotData()}
//         layout={{
//           barmode: "relative",
//         }}
//       />
//     </Container>
//   );
// };

// export default EsgCheck;


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
  SelectChangeEvent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import { ColDef } from "ag-grid-community";
import { useState, useEffect, useMemo } from "react";
import Plot from "react-plotly.js";
import Table from "../../components/table/table";
import Spinner from "../../utils/spinner";
import { useGetClientAdminDashboardQuery } from "../../lib/redux/features/clients/clientupdatedApiSlice";
import CommentIcon from "@mui/icons-material/Comment";
import EditIcon from "@mui/icons-material/Edit";

// Types for dropdown options
const PRIORITY_OPTIONS = [
  { value: 0, label: "0 - nicht festgelegt", display: "nicht festgelegt" },
  { value: 1, label: "1 - wenig Priorität", display: "wenig Priorität" },
  { value: 2, label: "2 - mittlere Priorität", display: "mittlere Priorität" },
  { value: 3, label: "3 - hohe Priorität", display: "hohe Priorität" },
  { value: 4, label: "4 - sehr hohe Priorität", display: "sehr hohe Priorität" },
];

const STATUS_QUO_OPTIONS = [
  { value: 0, label: "0 - nicht gestartet", display: "nicht gestartet" },
  { value: 1, label: "1 - schlecht", display: "schlecht" },
  { value: 2, label: "2 - angemessen", display: "angemessen" },
  { value: 3, label: "3 - gut", display: "gut" },
  { value: 4, label: "4 - ausgezeichnet", display: "ausgezeichnet" },
];

interface TableRowData {
  question_id: string;
  index_code: string;
  measure: string;
  avg_priority: number;
  avg_status_quo: number;
  response_count: number;
  user_priority?: number;
  user_status_quo?: number;
  user_comment?: string;
}

interface CommentModalData {
  open: boolean;
  questionId: string;
  currentComment: string;
  questionText: string;
}

const ClientAdminOwnerDashboard = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [commentModal, setCommentModal] = useState<CommentModalData>({
    open: false,
    questionId: "",
    currentComment: "",
    questionText: "",
  });
  
  // Store user responses locally for immediate UI updates
  const [userResponses, setUserResponses] = useState<Record<string, {
    priority: number;
    status_quo: number;
    comment: string;
  }>>({});

  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch
  } = useGetClientAdminDashboardQuery();


  // Get available categories from the data
  const categories = useMemo(() => {
    if (!dashboardData?.categories) return [];
    const categoryNames = Object.keys(dashboardData.categories);
    const desiredCategoryOrder = ["Environment", "Social", "Corporate Governance"];
    return desiredCategoryOrder.filter((category) =>
      categoryNames.includes(category)
    );
  }, [dashboardData]);

  useEffect(() => {
    if (categories.length > 0 && activeCategory === "") {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const categoryMap = {
    Environment: "Umwelt",
    Social: "Gesellschaft",
    "Corporate Governance": "Unternehmensführung",
  };

  // Handle dropdown changes
  const handlePriorityChange = async (questionId: string, value: number) => {
    // Update local state immediately
    setUserResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        priority: value
      }
    }));
    
    // TODO: Call API to update response
    // await updateESGResponse({ questionId, priority: value });
  };

  const handleStatusQuoChange = async (questionId: string, value: number) => {
    // Update local state immediately
    setUserResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        status_quo: value
      }
    }));
    
    // TODO: Call API to update response
    // await updateESGResponse({ questionId, status_quo: value });
  };

  // Handle comment modal
  const openCommentModal = (questionId: string, currentComment: string, questionText: string) => {
    setCommentModal({
      open: true,
      questionId,
      currentComment,
      questionText,
    });
  };

  const closeCommentModal = () => {
    setCommentModal({
      open: false,
      questionId: "",
      currentComment: "",
      questionText: "",
    });
  };

  const saveComment = async (comment: string) => {
    // Update local state
    setUserResponses(prev => ({
      ...prev,
      [commentModal.questionId]: {
        ...prev[commentModal.questionId],
        comment
      }
    }));
    
    // TODO: Call API to update comment
    // await updateESGResponse({ questionId: commentModal.questionId, comment });
    
    closeCommentModal();
  };

  // Conditional rendering
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    console.error("Error fetching dashboard data:", error);
    let errorMsg = "An error occurred while fetching dashboard data";
    if ('status' in error && error.status === 403) {
      errorMsg = "Unauthorized Access.";
    }
    return <Typography color="error">{errorMsg}</Typography>;
  }

  if (!dashboardData || !dashboardData.categories || !activeCategory) {
    return (
      <Typography color="error">
        No data available for display.
      </Typography>
    );
  }

  // Transform the API data for the table
  const rowData: TableRowData[] = dashboardData.categories[activeCategory]?.questions?.map((question) => ({
    question_id: question.question_id,
    index_code: question.index_code,
    measure: question.measure,
    avg_priority: question.avg_priority,
    avg_status_quo: question.avg_status_quo,
    response_count: question.response_count,
    user_priority: userResponses[question.question_id]?.priority ?? 0,
    user_status_quo: userResponses[question.question_id]?.status_quo ?? 0,
    user_comment: userResponses[question.question_id]?.comment ?? "",
  })) || [];

  // Column definitions with dropdown renderers
  const colDefs: ColDef[] = [
    { field: "index_code", headerName: "Index", flex: 1 },
    { field: "measure", headerName: "Maßnahme", flex: 4 },
    { 
      field: "user_priority", 
      headerName: "Priorität", 
      flex: 2,
      cellRenderer: (params) => {
        const currentValue = params.value ?? 0;
        const option = PRIORITY_OPTIONS.find(opt => opt.value === currentValue);
        
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={currentValue}
              onChange={(e: SelectChangeEvent<number>) => 
                handlePriorityChange(params.data.question_id, e.target.value as number)
              }
              displayEmpty
            >
              {PRIORITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }
    },
    { 
      field: "user_status_quo", 
      headerName: "Status Quo", 
      flex: 2,
      cellRenderer: (params) => {
        const currentValue = params.value ?? 0;
        
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={currentValue}
              onChange={(e: SelectChangeEvent<number>) => 
                handleStatusQuoChange(params.data.question_id, e.target.value as number)
              }
              displayEmpty
            >
              {STATUS_QUO_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }
    },
    { 
      field: "user_comment", 
      headerName: "Kommentar (optional)", 
      flex: 2,
      cellRenderer: (params) => {
        const hasComment = params.value && params.value.trim().length > 0;
        
        return (
          <Box display="flex" alignItems="center" gap={1}>
            {hasComment ? (
              <Chip 
                icon={<CommentIcon />}
                label="Kommentar vorhanden"
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => openCommentModal(
                  params.data.question_id, 
                  params.value || "", 
                  params.data.measure
                )}
              />
            ) : (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                size="small"
                onClick={() => openCommentModal(
                  params.data.question_id, 
                  "", 
                  params.data.measure
                )}
              >
                Kommentar hinzufügen
              </Button>
            )}
          </Box>
        );
      }
    },
    { 
      field: "avg_priority", 
      headerName: "Ø Priorität", 
      flex: 1,
      valueFormatter: (params) => params.value?.toFixed(2) || "0.00",
      cellStyle: { backgroundColor: '#f5f5f5' }
    },
    { 
      field: "avg_status_quo", 
      headerName: "Ø Status Quo", 
      flex: 1,
      valueFormatter: (params) => params.value?.toFixed(2) || "0.00",
      cellStyle: { backgroundColor: '#f5f5f5' }
    },
  ];

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveCategory(event.target.value);
  };

  // Create chart data based on user responses vs averages
  const chartData = [
    {
      type: "bar",
      x: rowData.map((d) => -(d.user_priority || 0)), // User priority (negative for left side)
      y: rowData.map((d) => d.index_code),
      orientation: "h",
      name: "Meine Priorität",
      marker: { color: "#026770" },
      text: rowData.map((d) => `Priorität: ${d.user_priority || 0}`),
      textposition: "auto",
    },
    {
      type: "bar",
      x: rowData.map((d) => d.user_status_quo || 0), // User status quo (positive for right side)
      y: rowData.map((d) => d.index_code),
      orientation: "h",
      name: "Mein Status Quo",
      marker: { color: "#7DB6B7" },
      text: rowData.map((d) => `Status: ${d.user_status_quo || 0}`),
      textposition: "auto",
    },
    {
      type: "scatter",
      x: rowData.map((d) => -d.avg_priority), // Average priority markers
      y: rowData.map((d) => d.index_code),
      mode: "markers",
      name: "Ø Priorität (alle)",
      marker: { color: "#FF6B35", size: 8, symbol: "diamond" },
    },
    {
      type: "scatter",
      x: rowData.map((d) => d.avg_status_quo), // Average status quo markers
      y: rowData.map((d) => d.index_code),
      mode: "markers",
      name: "Ø Status Quo (alle)",
      marker: { color: "#FFA500", size: 8, symbol: "diamond" },
    },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        ESG-Check – {dashboardData.year}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Client: {dashboardData.client.name}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
        Um Nachhaltigkeit zu erzielen, werden verschiedene Maßnahmen
        eingesetzt. Abhängig von Unternehmen sind manche wichtiger, manche
        weniger. Wie schätzen Sie die Prioritäten der jeweiligen Maßnahmen aus
        Sicht Ihres Unternehmens ein? Schätzen Sie auch ein, wie weit diese
        Maßnahmen fortgeschritten sind.
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

      <Table 
        rowData={rowData} 
        colDefs={colDefs}
        defaultColDef={{
          resizable: true,
          sortable: true,
          filter: false,
        }}
        suppressRowClickSelection={true}
      />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          ESG Bewertungen - {categoryMap[activeCategory as keyof typeof categoryMap]}
        </Typography>
        <Plot
          data={chartData as any}
          layout={{
            barmode: "relative",
            title: `Meine Bewertungen vs. Durchschnitt für ${categoryMap[activeCategory as keyof typeof categoryMap]}`,
            xaxis: {
              title: "Bewertung",
              range: [-5, 5],
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
            showlegend: true,
          }}
        />
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Hinweis:</strong> Ihre individuellen Bewertungen werden mit den Durchschnittswerten 
          aller Teilnehmer verglichen. Die Diamant-Symbole zeigen die Durchschnittswerte an.
          Änderungen werden automatisch gespeichert.
        </Typography>
      </Box>

      {/* Comment Modal */}
      <Dialog 
        open={commentModal.open} 
        onClose={closeCommentModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Kommentar hinzufügen
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {commentModal.questionText}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ihr Kommentar"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            defaultValue={commentModal.currentComment}
            placeholder="Fügen Sie hier Ihren Kommentar zu dieser Maßnahme hinzu..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCommentModal}>
            Abbrechen
          </Button>
          <Button 
            onClick={() => {
              const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
              saveComment(textarea?.value || '');
            }}
            variant="contained"
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientAdminOwnerDashboard;