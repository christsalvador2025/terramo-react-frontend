import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import Plot from 'react-plotly.js';

interface PlotData {
  data: any[];
  layout: any;
  config: any;
}

interface StakeholderChartProps {
  plotData: PlotData;
  preventOverlap?: boolean;
  jitterAmount?: number;
  showQuadrants?: boolean; // You can set this to false when using the component
  addQuadrantLabels?: boolean;
}


const StakeholderChart: React.FC<StakeholderChartProps> = ({ 
  plotData, 
  preventOverlap = true,
  jitterAmount = 0.08,
  showQuadrants = true, // Default to true, but you'll control it from the parent
  addQuadrantLabels = false
}) => {
  
  // Function to add jitter to overlapping points across ALL traces/categories
  const addJitter = (data: any[]) => {
    
    // 1. Consolidate all points from all traces/categories
    const allPoints: { 
      traceIndex: number; 
      pointIndex: number; 
      x: number; 
      y: number; 
      text: string;
      customdata: any[]; // Preserve customdata (original coords) here
    }[] = [];

    data.forEach((trace, traceIndex) => {
      if (trace.type === 'scatter' && trace.x && trace.y && trace.x.length > 0) {
        const texts = trace.text || new Array(trace.x.length).fill('');
        const customData = trace.customdata || new Array(trace.x.length).fill([]);

        trace.x.forEach((x: number, pointIndex: number) => {
          const y = trace.y[pointIndex];
          allPoints.push({ 
            traceIndex, 
            pointIndex, 
            x, 
            y, 
            text: texts[pointIndex],
            customdata: customData[pointIndex] 
          });
        });
      }
    });

    if (allPoints.length === 0) {
        return data;
    }

    // 2. Track positions and calculate jitter for duplicates
    const positions = new Map<string, number>();
    const jiggledPoints = [...allPoints]; // Copy to apply jitter

    jiggledPoints.forEach((point, i) => {
      // Round to 1 decimal place (e.g., 1.0, 1.1) for overlap check
      const key = `${Math.round(point.x * 10) / 10}-${Math.round(point.y * 10) / 10}`;
      
      if (positions.has(key)) {
        const count = positions.get(key)!;
        
        // Spiral Jitter pattern
        const angle = (count * 2.4); // Golden angle
        const radius = Math.sqrt(count) * jitterAmount;
        const jitterX = Math.cos(angle) * radius;
        const jitterY = Math.sin(angle) * radius;

        // Apply the jitter to x and y
        jiggledPoints[i].x += jitterX;
        jiggledPoints[i].y += jitterY;

        positions.set(key, count + 1);
      } else {
        positions.set(key, 1);
      }
    });

    // 3. Redistribute jiggled points back into new traces
    const newTraces = data.map(trace => ({
      ...trace,
      x: [],
      y: [],
      text: [],
      customdata: [] // Initialize customdata array for redistribution
    }));

    jiggledPoints.forEach(point => {
      const newTrace = newTraces[point.traceIndex];
      newTrace.x.push(point.x); // Jiggled X
      newTrace.y.push(point.y); // Jiggled Y
      newTrace.text.push(point.text); 
      newTrace.customdata.push(point.customdata); // Original X and Y
    });

    return newTraces;
  };

  // Enhanced layout with quadrant lines and better formatting
  const enhancedLayout = useMemo(() => {
    const baseLayout = {
      ...plotData.layout,
      // Ensure proper margins
      margin: {
        l: 60,
        r: 150,
        t: 60,
        b: 60,
        ...plotData.layout?.margin
      },
      // Better hover settings
      hovermode: 'closest',
      // Enhanced grid styling
      xaxis: {
        ...plotData.layout?.xaxis,
        showgrid: true,
        gridwidth: 1,
        gridcolor: '#D9D9D9',
        showline: true,
        linewidth: 1,
        linecolor: '#333',
        mirror: true
      },
      yaxis: {
        ...plotData.layout?.yaxis,
        showgrid: true,
        gridwidth: 1,
        gridcolor: '#D9D9D9',
        showline: true,
        linewidth: 1,
        linecolor: '#333',
        mirror: true
      }
    };

    // 🎯 MODIFIED: Only add quadrant lines if showQuadrants is true
    if (showQuadrants) {
      const xMax = plotData.layout?.xaxis?.range?.[1] || 4.5;
      const yMax = plotData.layout?.yaxis?.range?.[1] || 4.5;
      const xMid = xMax / 2;
      const yMid = yMax / 2;

      baseLayout.shapes = [
        ...(baseLayout.shapes || []),
        // Vertical line
        {
          type: 'line',
          x0: xMid,
          y0: 0,
          x1: xMid,
          y1: yMax,
          line: {
            color: '#cccccc',
            width: 2,
            dash: 'dash' // This is the property that creates the dashed line
          }
        },
        // Horizontal line
        {
          type: 'line',
          x0: 0,
          y0: yMid,
          x1: xMax,
          y1: yMid,
          line: {
            color: '#cccccc',
            width: 2,
            dash: 'dash' // This is the property that creates the dashed line
          }
        }
      ];

      // Add quadrant labels if requested (unchanged)
      if (addQuadrantLabels) {
        const quarterX = xMid / 2;
        const threeQuarterX = xMid + quarterX;
        const quarterY = yMid / 2;
        const threeQuarterY = yMid + quarterY;

        baseLayout.annotations = [
          ...(baseLayout.annotations || []),
          // Bottom left quadrant
          {
            x: quarterX,
            y: quarterY,
            text: 'Monitor<br>(Low Priority,<br>Low Status Quo)',
            showarrow: false,
            font: { size: 10, color: '#666' },
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: '#ccc',
            borderwidth: 1
          },
          // Bottom right quadrant
          {
            x: threeQuarterX,
            y: quarterY,
            text: 'Improve<br>(High Priority,<br>Low Status Quo)',
            showarrow: false,
            font: { size: 10, color: '#666' },
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: '#ccc',
            borderwidth: 1
          },
          // Top left quadrant
          {
            x: quarterX,
            y: threeQuarterY,
            text: 'Maintain<br>(Low Priority,<br>High Status Quo)',
            showarrow: false,
            font: { size: 10, color: '#666' },
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: '#ccc',
            borderwidth: 1
          },
          // Top right quadrant
          {
            x: threeQuarterX,
            y: threeQuarterY,
            text: 'Excellence<br>(High Priority,<br>High Status Quo)',
            showarrow: false,
            font: { size: 10, color: '#666' },
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: '#ccc',
            borderwidth: 1
          }
        ];
      }
    }

    return baseLayout;
  }, [plotData.layout, showQuadrants, addQuadrantLabels]);

  // Enhanced data to store original coordinates in customdata
  const enhancedData = useMemo(() => {
    return plotData.data.map(trace => {
      if (trace.type === 'scatter') {
        // Store original [x, y] coordinates in customdata
        const customData = trace.x.map((x: number, i: number) => [x, trace.y[i]]);
        
        return {
          ...trace,
          // Attach custom data to the trace
          customdata: customData, 
          
          // Enhanced markers
          marker: {
            size: 10,
            opacity: 0.9,
            line: {
              width: 2,
              color: 'white'
            },
            ...trace.marker
          },
            
          // Reference customdata for Priority and Status Quo (showing original values)
          hovertemplate: 
            '<b>%{text}</b><br>' +
            'Category: ' + trace.name + '<br>' +
            'Priority: %{customdata[0]:.4f}<br>' + // Reference customdata index 0 (Original X)
            'Status Quo: %{customdata[1]:.4f}<br>' + // Reference customdata index 1 (Original Y)
            '<extra></extra>',
            
          // Better text positioning and styling
          textposition: 'top center',
          textfont: {
            size: 10,
            color: trace.marker?.color || '#333',
            ...trace.textfont
          }
        };
      }
      return trace;
    });
  }, [plotData.data]);

  // Apply jitter if needed
  const finalData = useMemo(() => {
    // This calls addJitter on the enhancedData which now includes customdata
    if (preventOverlap) {
      return addJitter(enhancedData);
    }
    return enhancedData;
  }, [enhancedData, preventOverlap, jitterAmount]);

  const enhancedConfig = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true,
    ...plotData.config
  };

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
        data={finalData}
        layout={enhancedLayout}
        config={enhancedConfig}
        style={{ width: '100%', height: '600px' }}
      />
    </Box>
  );
};

export default StakeholderChart;