import React from 'react';
import { Box, Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { useCategoryChartData } from '../../../../hooks/client-admin/useEsg';

interface EsgChartProps {
  categoryName: string;
  categoryDisplayName: string;
  hasData: boolean;
}

const EsgChart: React.FC<EsgChartProps> = ({
  categoryName,
  categoryDisplayName,
  hasData,
}) => {
  const { createCategoryChartData } = useCategoryChartData();

  const questionsNotFound = () => {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h4" sx={{ color: 'gray', fontWeight: 'normal' }}>
          No Data found.
        </Typography>
      </Box>
    );
  };

  if (!hasData) {
    return (
      <Box sx={{ mt: 1, mb: 5 }}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich {categoryDisplayName}
        </Typography>
        {questionsNotFound()}
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1, mb: 5 }}>
      <Typography variant="h6" gutterBottom>
        Mögliche Massnahmen im Bereich {categoryDisplayName}
      </Typography>

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
            tickvals: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
            ticktext: ['4', '3', '2', '1', '0', '1', '2', '3', '4'],
          },
          yaxis: { autorange: "reversed" },
          showlegend: true,
        }}
        config={{ displayModeBar: false }}
      />
    </Box>
  );
};

export default EsgChart;