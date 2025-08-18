import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
  AppBar,
  Toolbar,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Groups as GroupsIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import Plot from 'react-plotly.js';
import Logo from "../../assets/logo.svg"
const DRAWER_WIDTH = 280;

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

const StakeholderAnalysisUI = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [stakeholderData, setStakeholderData] = useState(mockStakeholderData);
  const [activeSection, setActiveSection] = useState('stakeholder-analyse');

  const navigationItems = [
    { id: 'esg-check', title: 'ESG-Check', icon: <AssessmentIcon /> },
    { id: 'stakeholder-analyse', title: 'Stakeholder-Analyse', icon: <GroupsIcon /> },
    { id: 'doppelte-wesentlichkeit', title: 'Doppelte Wesentlichkeit', icon: <EditIcon /> }
  ];

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
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Top Navigation Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          color: 'black',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={Logo} alt="Logo" style={{ width: "210px", marginRight: "2rem" }} />
            {/* <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Terramo
            </Typography> */}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton>
              <SettingsIcon />
            </IconButton>
            <Typography variant="body2">Einstellungen</Typography>
            <IconButton>
              <LogoutIcon />
            </IconButton>
            <Typography variant="body2">Logout</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'white',
            borderRight: '1px solid #e0e0e0',
            mt: 8
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Year Selector */}
          <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
            Aus welchem Jahr möchten Sie Ihre Daten sehen?
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
            </Select>
          </FormControl>

          {/* Navigation Menu */}
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: '#e3f2fd',
                      '& .MuiListItemIcon-root': {
                        color: '#1976d2'
                      },
                      '& .MuiListItemText-primary': {
                        color: '#1976d2',
                        fontWeight: 600
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Company Logo */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976d2' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'white' }}>
              IHR LOGO
            </Typography>
          </Avatar>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
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
    </Box>
  );
};

export default StakeholderAnalysisUI;