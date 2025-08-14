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
import { useMemo, useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Table from "../../components/table/table";
import Spinner from "../../utils/spinner";
import { useGetAllEsgQuestionsQuery } from "../../lib/redux/features/clients/clientupdatedApiSlice";

interface TableRowData {
  index_code: string;
  measure: string;
  prioritaet: string;
  statusQuo: string;
  kommentar: string;
}

const EsgCheck = () => {
  // All hooks must be called at the top level of the component,
  // before any conditional return statements.
  const { data: questions, isLoading, error } = useGetAllEsgQuestionsQuery();

  const [activeCategory, setActiveCategory] = useState("");

  const categories = useMemo(() => {
    if (!questions) return [];
    const uniqueCategories = new Set(questions.map((q) => q.category_name));
    const desiredCategoryOrder = ["Environment", "Social", "Corprorate Governance"];
    return desiredCategoryOrder.filter((category) =>
      uniqueCategories.has(category)
    );
  }, [questions]);

  useEffect(() => {
    if (categories.length > 0 && activeCategory === "") {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const categoryMap = {
    Environment: "Umwelt",
    Social: "Gesellschaft",
    "Corprorate Governance": "Unternehmensführung",
  };

  // Conditional rendering checks come after all hooks.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    console.error("Error fetching ESG questions:", error);
    let error_msg = "An error occurred while fetching ESG questions";
    if (error?.status === 403) {
      error_msg =
        error?.data?.detail ||
        "Unauthorized Access, Only for Terramo Admin.";
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

  // Memoize rowData to avoid re-calculating on every render.
  const rowData: TableRowData[] = useMemo(() => {
    return questions
      .filter((question) => question.category_name === activeCategory)
      .map((question) => ({
        index_code: question.index_code,
        measure: question.measure,
        prioritaet: "1 - wenig Priorität",
        statusQuo: "0 - nicht gestartet",
        kommentar: "kein Kommentar",
      }));
  }, [questions, activeCategory]);

  const colDefs: ColDef[] = [
    { field: "index_code", headerName: "Index", flex: 1 },
    { field: "measure", headerName: "Massnahme", flex: 4 },
    { field: "prioritaet", headerName: "Priorität", flex: 1 },
    { field: "statusQuo", headerName: "Status Quo", flex: 1 },
    { field: "kommentar", headerName: "Kommentar (optional)", flex: 1 },
  ];

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setActiveCategory((event.target as HTMLInputElement).value);
  };

  const chartData = useMemo(() => {
    const dummyPrioritaet = rowData.map((_, i) => i % 3 + 1);
    const dummyStatusQuo = rowData.map((_, i) => (i % 2 === 0 ? 1 : 2));

    return [
      {
        type: "bar",
        x: dummyPrioritaet.map((d) => -d),
        y: rowData.map((d) => d.index_code),
        orientation: "h",
        name: "Priorität",
        marker: { color: "#026770" },
      },
      {
        type: "bar",
        x: dummyStatusQuo,
        y: rowData.map((d) => d.index_code),
        orientation: "h",
        name: "Status Quo",
        marker: { color: "#7DB6B7" },
      },
    ];
  }, [rowData]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        ESG-Check – 2025
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
        Um Nachhaltigkeit zu erzielen, werden verschiedene Massnahmen
        eingesetzt. Abhängig von Unternehmen sind manche wichtiger, manche
        weniger. Wie schätzen Sie die Prioritäten der jeweiligen Massnahmen aus
        Sicht Ihres Unternehmens ein? Schätzen Sie auch ein, wie weit diese
        Massnahmen fortgeschritten sind.
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
          ESG Chart
        </Typography>
        <Plot
          data={chartData as any}
          layout={{
            barmode: "relative",
          }}
        />
      </Box>
    </Container>
  );
};

export default EsgCheck;