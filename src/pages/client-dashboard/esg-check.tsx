// import {
//   Container,
//   FormControl,
//   FormControlLabel,
//   Radio,
//   RadioGroup,
//   Typography,
//   Box,
// } from "@mui/material";
// import { ColDef } from "ag-grid-community";
// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import Plot from "react-plotly.js";
// import Table from "../../components/table/table";
// import Spinner from "../../utils/spinner";
// import { useGetClientQuestionAveragesQuery } from "../../lib/redux/features/clients/clientupdatedApiSlice";

// interface TableRowData {
//   index_code: string;
//   measure: string;
//   avg_priority: number;
//   avg_status_quo: number;
//   response_count: number;
//   response_rate: number;
// }

// const EsgCheck = () => {
//   // Get client ID from URL params
//   const { id: clientId } = useParams<{ id: string }>();
  
//   const [activeCategory, setActiveCategory] = useState("");

//   // Fetch question averages for the selected client
//   const { 
//     data: questionAverages, 
//     isLoading, 
//     error 
//   } = useGetClientQuestionAveragesQuery(
//     { 
//       clientId: clientId || "",
//       category: activeCategory || undefined 
//     },
//     { 
//       skip: !clientId 
//     }
//   );

//   // Get available categories from the data
//   const categories = () => {
//     if (!questionAverages?.averages?.by_category) return [];
//     const categoryNames = Object.keys(questionAverages.averages.by_category);
//     const desiredCategoryOrder = ["Environment", "Social", "Corporate Governance"];
//     return desiredCategoryOrder.filter((category) =>
//       categoryNames.includes(category)
//     );
//   };

//   useEffect(() => {
//     const availableCategories = categories();
//     if (availableCategories.length > 0 && activeCategory === "") {
//       setActiveCategory(availableCategories[0]);
//     }
//   }, [questionAverages, activeCategory]);

//   const categoryMap = {
//     Environment: "Umwelt",
//     Social: "Gesellschaft",
//     "Corporate Governance": "Unternehmensführung",
//   };

//   // Conditional rendering checks come after all hooks.
//   if (!clientId) {
//     return (
//       <Typography color="error">
//         Client ID not found in URL parameters
//       </Typography>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Spinner size="xl" />
//       </div>
//     );
//   }

//   if (error) {
//     console.error("Error fetching ESG question averages:", error);
//     let error_msg = "An error occurred while fetching ESG question averages";
//     if ('status' in error && error.status === 403) {
//       error_msg = "Unauthorized Access, Only for Terramo Admin.";
//     }
//     return <Typography color="error">{error_msg}</Typography>;
//   }

//   if (!questionAverages || !questionAverages.averages?.by_category) {
//     return (
//       <Typography color="error">
//         Data format error: No question averages found or unexpected data structure.
//       </Typography>
//     );
//   }

//   // Transform the API data for the table
//   const rowData: TableRowData[] = questionAverages.averages.by_category[activeCategory]?.questions?.map((question) => ({
//     index_code: question.index_code,
//     measure: question.measure,
//     avg_priority: question.avg_priority,
//     avg_status_quo: question.avg_status_quo,
//     response_count: question.response_count,
//     response_rate: question.response_rate,
//   })) || [];

//   const colDefs: ColDef[] = [
//     { field: "index_code", headerName: "Index", flex: 1 },
//     { field: "measure", headerName: "Massnahme", flex: 4 },
//     { 
//       field: "avg_priority", 
//       headerName: "Durchschnittliche Priorität", 
//       flex: 1,
//       valueFormatter: (params) => params.value?.toFixed(2) || "0.00"
//     },
//     { 
//       field: "avg_status_quo", 
//       headerName: "Durchschnittlicher Status Quo", 
//       flex: 1,
//       valueFormatter: (params) => params.value?.toFixed(2) || "0.00"
//     },
//     { 
//       field: "response_count", 
//       headerName: "Antworten", 
//       flex: 1 
//     },
//     { 
//       field: "response_rate", 
//       headerName: "Antwortrate (%)", 
//       flex: 1,
//       valueFormatter: (params) => `${params.value?.toFixed(1) || "0.0"}%`
//     },
//   ];

//   const handleCategoryChange = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setActiveCategory((event.target as HTMLInputElement).value);
//   };

//   // Create chart data based on the averages
//   const chartData = [
//     {
//       type: "bar",
//       x: rowData.map((d) => -d.avg_priority), // Negative for left side
//       y: rowData.map((d) => d.index_code),
//       orientation: "h",
//       name: "Durchschnittliche Priorität",
//       marker: { color: "#026770" },
//       text: rowData.map((d) => `Priorität: ${d.avg_priority.toFixed(2)}`),
//       textposition: "auto",
//     },
//     {
//       type: "bar",
//       x: rowData.map((d) => d.avg_status_quo), // Positive for right side
//       y: rowData.map((d) => d.index_code),
//       orientation: "h",
//       name: "Durchschnittlicher Status Quo",
//       marker: { color: "#7DB6B7" },
//       text: rowData.map((d) => `Status: ${d.avg_status_quo.toFixed(2)}`),
//       textposition: "auto",
//     },
//   ];

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom>
//         ESG-Check – {questionAverages.year}
//       </Typography>
//       <Typography variant="h6" gutterBottom>
//         Client: {questionAverages.client.name}
//       </Typography>
//       <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
//         Durchschnittswerte der ESG-Maßnahmen basierend auf {questionAverages.averages.total_users} Benutzerantworten.
//         Diese Werte zeigen die kollektive Einschätzung der Prioritäten und des aktuellen Status der verschiedenen Nachhaltigkeitsmaßnahmen.
//       </Typography>

//       <FormControl component="fieldset" sx={{ mb: 2, borderBottom: "1px solid #eee" }}>
//         <RadioGroup
//           row
//           name="category"
//           value={activeCategory}
//           onChange={handleCategoryChange}
//           sx={{
//             "& .MuiFormControlLabel-root": {
//               mr: 2,
//               "& .MuiRadio-root": {
//                 display: "none",
//               },
//               "& .MuiFormControlLabel-label": {
//                 padding: "4px 8px",
//                 borderBottom: "2px solid transparent",
//                 cursor: "pointer",
//                 color: "text.primary",
//                 transition: "border-color 0.2s, color 0.2s",
//               },
//               "& .Mui-checked + .MuiFormControlLabel-label": {
//                 borderBottom: "2px solid #026770",
//                 fontWeight: "bold",
//                 color: "#026770",
//               },
//             },
//           }}
//         >
//           {categories().map((category) => (
//             <FormControlLabel
//               key={category}
//               value={category}
//               control={<Radio />}
//               label={categoryMap[category as keyof typeof categoryMap]}
//             />
//           ))}
//         </RadioGroup>
//       </FormControl>

//       <Table rowData={rowData} colDefs={colDefs} />

//       <Box sx={{ mt: 4 }}>
//         <Typography variant="h6" gutterBottom>
//           ESG Durchschnittswerte - {categoryMap[activeCategory as keyof typeof categoryMap]}
//         </Typography>
//         <Plot
//           data={chartData as any}
//           layout={{
//             barmode: "relative",
//             title: `Durchschnittliche Bewertungen für ${categoryMap[activeCategory as keyof typeof categoryMap]}`,
//             xaxis: {
//               title: "Bewertung",
//               range: [-4, 4], // Adjust based on your scale
//             },
//             yaxis: {
//               title: "Maßnahmen",
//             },
//             height: 600,
//             margin: {
//               l: 100,
//               r: 50,
//               t: 50,
//               b: 50,
//             },
//           }}
//         />
//       </Box>

//       <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
//         <Typography variant="body2" color="text.secondary">
//           <strong>Hinweis:</strong> Die Durchschnittswerte basieren auf den Antworten von {questionAverages.averages.total_users} Benutzern. 
//           Die Prioritätswerte zeigen, wie wichtig die jeweilige Maßnahme eingeschätzt wird, während die Status Quo-Werte den 
//           aktuellen Umsetzungsgrad widerspiegeln.
//         </Typography>
//       </Box>
//     </Container>
//   );
// };

// export default EsgCheck;



/**
 * 
 * UPDATED CODE
 */

/*
import {
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
} from "@mui/material";
import { ColDef } from "ag-grid-community";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Plot from "react-plotly.js";
import Table from "../../components/table/table";
import Spinner from "../../utils/spinner";
import { useGetClientQuestionAveragesQuery } from "../../lib/redux/features/clients/clientupdatedApiSlice";

interface TableRowData {
  index_code: string;
  measure: string;
  prioritaet: string;
  statusQuo: string;
  kommentar: string;
}

const EsgCheck = () => {
  // Get client ID from URL params
  const { id: clientId } = useParams<{ id: string }>();
  
  const [activeCategory, setActiveCategory] = useState("");

  // Fetch question averages for the selected client
  const { 
    data: questionAverages, 
    isLoading, 
    error 
  } = useGetClientQuestionAveragesQuery(
    { 
      clientId: clientId || "",
      category: activeCategory || undefined 
    },
    { 
      skip: !clientId 
    }
  );

  // Get available categories from the data
  const categories = () => {
    if (!questionAverages?.averages?.by_category) return [];
    const categoryNames = Object.keys(questionAverages.averages.by_category);
    const desiredCategoryOrder = ["Environment", "Social", "Corporate Governance"];
    return desiredCategoryOrder.filter((category) =>
      categoryNames.includes(category)
    );
  };

  useEffect(() => {
    const availableCategories = categories();
    if (availableCategories.length > 0 && activeCategory === "") {
      setActiveCategory(availableCategories[0]);
    }
  }, [questionAverages, activeCategory]);

  const categoryMap = {
    Environment: "Umwelt",
    Social: "Gesellschaft",
    "Corporate Governance": "Unternehmensführung",
  };

  // Conditional rendering checks come after all hooks.
  if (!clientId) {
    return (
      <Typography color="error">
        Client ID not found in URL parameters
      </Typography>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    console.error("Error fetching ESG question averages:", error);
    let error_msg = "An error occurred while fetching ESG question averages";
    if ('status' in error && error.status === 403) {
      error_msg = "Unauthorized Access, Only for Terramo Admin.";
    }
    return <Typography color="error">{error_msg}</Typography>;
  }

  if (!questionAverages || !questionAverages.averages?.by_category) {
    return (
      <Typography color="error">
        Data format error: No question averages found or unexpected data structure.
      </Typography>
    );
  }

  // Transform the API data for the table
  const rowData: TableRowData[] = questionAverages.averages.by_category[activeCategory]?.questions?.map((question) => ({
    index_code: question.index_code,
    measure: question.measure,
    prioritaet: "1 - wenig Priorität",
    statusQuo: "0 - nicht gestartet",
    kommentar: "kein Kommentar",
  })) || [];

  const colDefs: ColDef[] = [
    { field: "index_code", headerName: "Index", flex: 1 },
    { field: "measure", headerName: "Maßnahme", flex: 4 },
    { field: "prioritaet", headerName: "Priorität", flex: 1 },
    { field: "statusQuo", headerName: "Status-Quo", flex: 1 },
    { field: "kommentar", headerName: "Kommentar (optional)", flex: 1 },
  ];

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setActiveCategory((event.target as HTMLInputElement).value);
  };

  // Create chart data - display from E-1 at top to bottom
  const sortedRowData = [...rowData].sort((a, b) => {
    // Extract numeric part from index codes like "E-1", "E-2", etc.
    const getNumericIndex = (indexCode: string) => {
      const match = indexCode.match(/(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    };
    return getNumericIndex(a.index_code) - getNumericIndex(b.index_code);
  });

  const chartData = [
    {
      type: "bar",
      x: sortedRowData.map((_, i) => -((i % 3) + 1)), // Static negative values for priority
      y: sortedRowData.map((d) => d.index_code).reverse(), // Reverse to show E-1 at top
      orientation: "h",
      name: "Priorität",
      marker: { color: "#026770" },
      text: sortedRowData.map(() => "1 - wenig Priorität").reverse(),
      textposition: "auto",
    },
    {
      type: "bar",
      x: sortedRowData.map((_, i) => (i % 2 === 0 ? 1 : 2)), // Static positive values for status quo
      y: sortedRowData.map((d) => d.index_code).reverse(), // Reverse to show E-1 at top
      orientation: "h",
      name: "Status Quo",
      marker: { color: "#7DB6B7" },
      text: sortedRowData.map(() => "0 - nicht gestartet").reverse(),
      textposition: "auto",
    },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        ESG-Check – {questionAverages.year}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Client: {questionAverages.client.name}
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
          {categories().map((category) => (
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
          ESG Chart
        </Typography>
        <Plot
          data={chartData as any}
          layout={{
            barmode: "relative",
            height: 600,
            margin: {
              l: 100,
              r: 50,
              t: 50,
              b: 50,
            },
            xaxis: {
              range: [-4, 4],
            },
            yaxis: {
              autorange: "reversed", // This ensures E-1 appears at top
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Hinweis:</strong> Die Werte zeigen die Prioritätseinschätzung und den aktuellen Umsetzungsgrad 
          der verschiedenen ESG-Maßnahmen. Verwenden Sie die Tabelle zur detaillierten Bewertung und fügen Sie 
          bei Bedarf Kommentare hinzu.
        </Typography>
      </Box>
    </Container>
  );
};

export default EsgCheck;
------------------------------ */
import {
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
} from "@mui/material";
import { ColDef } from "ag-grid-community";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Plot from "react-plotly.js";
import Table from "../../components/table/table";
import Spinner from "../../utils/spinner";
import { useGetClientQuestionAveragesQuery } from "../../lib/redux/features/clients/clientupdatedApiSlice";

interface TableRowData {
  index_code: string;
  measure: string;
  avg_priority: number;
  avg_status_quo: number;
  response_count: number;
  response_rate: number;
  comment: string; // Added comment field to the interface
}

const EsgCheck = () => {
  // Get client ID from URL params
  const { id: clientId } = useParams<{ id: string }>();
  
  const [activeCategory, setActiveCategory] = useState("");

  // Corrected hook call to pass only the clientId string
  const { 
    data: questionAverages, 
    isLoading, 
    error 
  } = useGetClientQuestionAveragesQuery(clientId || "", { 
    skip: !clientId 
  });

  // Memoize the categories to prevent unnecessary re-renders and re-calculation
  const categories = useMemo(() => {
    if (!questionAverages?.averages?.by_category) return [];
    const categoryNames = Object.keys(questionAverages.averages.by_category);
    const desiredCategoryOrder = ["Environment", "Social", "Corporate Governance"];
    return desiredCategoryOrder.filter((category) =>
      categoryNames.includes(category)
    );
  }, [questionAverages]);

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
    console.log("Show comment for:", data.index_code);
    // Implement your comment modal or a navigation logic here
  };
  
  // Conditional rendering checks come after all hooks.
  if (!clientId) {
    return (
      <Typography color="error">
        Client ID not found in URL parameters.
      </Typography>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    console.error("Error fetching ESG question averages:", error);
    let error_msg = "An error occurred while fetching ESG question averages.";
    if ('status' in error && error.status === 403) {
      error_msg = "Unauthorized Access, Only for Terramo Admin.";
    }
    return <Typography color="error">{error_msg}</Typography>;
  }

  if (!questionAverages || !questionAverages.averages?.by_category || !activeCategory ) {
    return (
      <Typography color="error">
        No data available for display or unexpected data structure.
      </Typography>
    );
  }
 console.log("questionAverages=>",questionAverages)
  // Transform the API data for the table based on the active category
  const rowData: TableRowData[] = questionAverages.averages.by_category[activeCategory]?.questions?.map((question: any) => ({
    index_code: question.index_code,
    measure: question.measure,
    avg_priority: question.avg_priority,
    avg_status_quo: question.avg_status_quo,
    response_count: question.response_count,
    response_rate: question.response_rate,
    comment: question.comment || "", // Assuming comment data is present in the API response
  })) || [];

  // Updated colDefs to match the image reference
  const colDefs: ColDef[] = [
    { field: "index_code", headerName: "Index", flex: 1 },
    { field: "measure", headerName: "Maßnahme", flex: 4 },
    { 
      field: "avg_priority", 
      headerName: "Priorität", 
      flex: 1,
      valueFormatter: (params) => {
        // Example mapping logic. You may need to adapt this based on your backend values.
        const value = params.value;
        let priorityText = "nicht festgelegt";
        if (value === 1) priorityText = "wenig Priorität";
        // Add more conditions as needed for other values
        return `${value?.toFixed(0) || "0"} - ${priorityText}`;
      }
    },
    { 
      field: "avg_status_quo", 
      headerName: "Status Quo", 
      flex: 1,
      valueFormatter: (params) => {
        // Example mapping logic. You may need to adapt this based on your backend values.
        const value = params.value;
        let statusText = "nicht gestartet";
        if (value === 1) statusText = "in Bearbeitung";
        // Add more conditions as needed for other values
        return `${value?.toFixed(0) || "0"} - ${statusText}`;
      }
    },
    { 
      field: "comment", 
      headerName: "Kommentar (optional)", 
      flex: 2,
      cellRenderer: (params) => {
        // Renders the link if a comment exists
        if (params.value) {
          return (
            <a href="#" onClick={() => handleShowComment(params.data)}>
              Kommentare anzeigen
            </a>
          );
        }
        return "kein Kommentar"; // Display this text if no comment
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
      text: rowData.map((d) => `Priorität: ${d.avg_priority.toFixed(2)}`),
      textposition: "auto",
    },
    {
      type: "bar",
      x: rowData.map((d) => d.avg_status_quo), // Positive for right side
      y: rowData.map((d) => d.index_code),
      orientation: "h",
      name: "Status Quo",
      marker: { color: "#7DB6B7" },
      text: rowData.map((d) => `Status: ${d.avg_status_quo.toFixed(2)}`),
      textposition: "auto",
    },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        ESG-Check – {questionAverages.year}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Client: {questionAverages.client.name}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
        Durchschnittswerte der ESG-Maßnahmen basierend auf {questionAverages.averages.total_users} Benutzerantworten.
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
              range: [-4, 4], // Adjust based on your scale
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
          <strong>Hinweis:</strong> Die Durchschnittswerte basieren auf den Antworten von {questionAverages.averages.total_users} Benutzern. 
          Die Prioritätswerte zeigen, wie wichtig die jeweilige Maßnahme eingeschätzt wird, während die Status Quo-Werte den 
          aktuellen Umsetzungsgrad widerspiegeln.
        </Typography>
      </Box>
    </Container>
  );
};

export default EsgCheck;