// components/StakeholderAnalysis.js
import React, { useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box
} from '@mui/material';
import Plot from 'react-plotly.js';

// Mock data for demonstration
const mockStakeholderData = [
  { id: 1, name: 'Kernteam', count: 4, hasData: true, selected: false },
  { id: 2, name: 'Kunden', count: 0, hasData: false, selected: false },
  { id: 3, name: 'Mitarbeitende', count: 0, hasData: false, selected: false }
];

const mockScatterData = {
  x: [1.2, 2.1, 2.8, 1.7, 2.5, 3.0, 1.5, 2.3],
  y: [2.1, 2.8, 1.9, 3.1, 2.2, 2.6, 1.8, 2.9],
  text: ['Measure A', 'Measure B', 'Measure C', 'Measure D', 'Measure E', 'Measure F', 'Measure G', 'Measure H'],
  categories: ['Gesellschaft', 'Wirtschaft', 'Umwelt', 'Gesellschaft', 'Wirtschaft', 'Umwelt', 'Gesellschaft', 'Wirtschaft']
};

const ClientStakeholderAnalysisDashboardPage = () => {
  const [stakeholderData, setStakeholderData] = useState(mockStakeholderData);

  const handleStakeholderToggle = (id) => {
    setStakeholderData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const createScatterPlot = () => {
    const categoryColors = {
      'Gesellschaft': '#005959',
      'Wirtschaft': '#b27300', 
      'Umwelt': '#7ba042'
    };

    const traces = ['Gesellschaft', 'Wirtschaft', 'Umwelt'].map(category => {
      const indices = mockScatterData.categories
        .map((cat, index) => cat === category ? index : -1)
        .filter(index => index !== -1);
      
      return {
        x: indices.map(i => mockScatterData.x[i]),
        y: indices.map(i => mockScatterData.y[i]),
        text: indices.map(i => mockScatterData.text[i]),
        mode: 'markers+text',
        type: 'scatter',
        name: category,
        marker: {
          size: 8,
          color: categoryColors[category],
          line: { width: 1, color: 'white' }
        },
        textposition: 'top center',
        textfont: { size: 10, color: categoryColors[category] }
      };
    });

    return {
      data: traces,
      layout: {
        title: 'Wesentlichkeitsmatrix Stakeholder',
        xaxis: { 
          title: 'X-Axis',
          range: [0, 3.5],
          showgrid: true,
          gridcolor: '#f0f0f0'
        },
        yaxis: { 
          title: 'Y-Axis',
          range: [0, 3.5],
          showgrid: true,
          gridcolor: '#f0f0f0'
        },
        legend: { 
          x: 1.02, 
          y: 0.5,
          bgcolor: 'rgba(255,255,255,0)',
          bordercolor: 'rgba(255,255,255,0)'
        },
        margin: { l: 60, r: 150, t: 60, b: 60 },
        plot_bgcolor: 'white',
        paper_bgcolor: 'white'
      },
      config: { displayModeBar: false }
    };
  };

  return (
    <Box>
      {/* Page Header */}
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        Stakeholder-Analyse
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
        Um Nachhaltigkeit zu erzielen, werden verschiedene Massnahmen eingesetzt. Abhängig vom Unternehmen sind manche wichtiger, manche weniger. Wie schätzen Sie die Prioritäten der jeweiligen Massnahmen aus Sicht Ihres Unternehmens ein? Schätzen Sie auch ein, wie weit diese Massnahmen fortgeschritten sind.
      </Typography>

      {/* Stakeholder Table */}
      <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600 }}>Stakeholder-Gruppe</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Anzahl Stakeholder</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stakeholderData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.count}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small"
                    disabled={!row.hasData}
                    onClick={() => handleStakeholderToggle(row.id)}
                    sx={{ mr: 1 }}
                  >
                    📋 Einladungslink kopieren
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Process Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button 
          variant="contained" 
          sx={{ 
            bgcolor: '#00695c', 
            '&:hover': { bgcolor: '#004d40' },
            px: 4,
            py: 1.5
          }}
        >
          Bearbeiten
        </Button>
      </Box>

      {/* Scatter Chart */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        bgcolor: 'white',
        borderRadius: 2,
        p: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Plot
          data={createScatterPlot().data}
          layout={createScatterPlot().layout}
          config={createScatterPlot().config}
          style={{ width: '100%', height: '600px' }}
        />
      </Box>
    </Box>
  );
};

export default ClientStakeholderAnalysisDashboardPage;