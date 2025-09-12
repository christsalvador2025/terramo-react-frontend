import React from 'react';
import { Box } from '@mui/material';
import Plot from 'react-plotly.js';

interface PlotData {
  data: any[];
  layout: any;
  config: any;
}

interface StakeholderChartProps {
  plotData: PlotData;
}

const StakeholderChart: React.FC<StakeholderChartProps> = ({ plotData }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center',
      bgcolor: 'white',
      borderRadius: 2,
      p: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <Plot
        data={plotData.data}
        layout={plotData.layout}
        config={plotData.config}
        style={{ width: '100%', height: '600px' }}
      />
    </Box>
  );
};

export default StakeholderChart;