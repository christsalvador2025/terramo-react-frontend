// import React, { useState, useEffect, useMemo } from 'react';
// import Plot from 'react-plotly.js'; 
// import { useGetStakeholderAnalysisDashboardQuery } from '../../lib/redux/features/clients/clientupdatedApiSlice';

// interface StakeholderGroupUI {
//   id: string;
//   name: string;
//   display_name: string;
//   stakeholder_count: number;
//   is_default: boolean;
//   has_responses: boolean;
//   category_averages: Record<string, any>;
//   selected: boolean;
//   canToggle: boolean;
// }

// const StakeholderAnalysisGroupDashboard: React.FC = () => {
//   const [stakeholderGroups, setStakeholderGroups] = useState<StakeholderGroupUI[]>([]);

//   const { data: dashboardData, isLoading, error, refetch } = useGetStakeholderAnalysisDashboardQuery();

//   // Initialize stakeholder groups when data is loaded
//   useEffect(() => {
//     if (dashboardData?.stakeholder_groups) {
//       const initializedGroups: StakeholderGroupUI[] = dashboardData.stakeholder_groups.map(group => ({
//         ...group,
//         selected: group.is_default, // Default group always selected
//         canToggle: group.is_default || group.has_responses, // Can toggle if not default or has responses
//       }));
//       setStakeholderGroups(initializedGroups);
//     }
//   }, [dashboardData]);

//   const handleStakeholderToggle = (groupId: string) => {
//     setStakeholderGroups(prev =>
//       prev.map(group => {
//         if (group.id === groupId) {
//           // Don't allow toggling off the default group
//           if (group.is_default) return group;
//           // Only allow toggling if the group has responses
//           if (group.has_responses) {
//             return { ...group, selected: !group.selected };
//           }
//         }
//         return group;
//       })
//     );
//   };

//   const createScatterPlot = useMemo(() => {
//     if (!dashboardData || !stakeholderGroups.length) return null;

//     const selectedGroups = stakeholderGroups.filter(group => group.selected);
//     const traces: any[] = [];

//     selectedGroups.forEach(group => {
//       const categories = Object.keys(group.category_averages);

//       categories.forEach(categoryName => {
//         const categoryData = group.category_averages[categoryName];
//         if (!categoryData) return;

//         const x = categoryData.priority_average;
//         const y = categoryData.status_quo_average;

//         if (x > 0 || y > 0) {
//           traces.push({
//             x: [x],
//             y: [y],
//             text: [`${categoryName}`],
//             name: `${group.display_name} - ${categoryName}`,
//             mode: 'markers+text',
//             type: 'scatter',
//             marker: {
//               size: 12,
//               color: '#005959',
//               opacity: group.is_default ? 1 : 0.7,
//             },
//             textposition: 'top center',
//             textfont: {
//               size: 9,
//               color: '#005959',
//             },
//             hovertemplate: `<b>${categoryName}</b><br>` +
//                           `Group: ${group.display_name}<br>` +
//                           `Priority: ${x.toFixed(2)}<br>` +
//                           `Status Quo: ${y.toFixed(2)}<br>` +
//                           '<extra></extra>',
//             showlegend: true,
//           });
//         }
//       });
//     });

//     return {
//       data: traces,
//       layout: {
//         title: {
//           text: 'Stakeholder Matrix',
//           font: { size: 20, color: '#333' },
//         },
//         xaxis: { title: 'Priority', range: [0, 4] },
//         yaxis: { title: 'Status Quo', range: [0, 4] },
//         hovermode: 'closest',
//       },
//     };
//   }, [dashboardData, stakeholderGroups]);

//   // Loading state
//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   // Error state
//   if (error) {
//     return <div>Error loading data: {error.message}</div>;
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       {/* Page Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-semibold text-gray-900 mb-2">
//           Stakeholder-Analyse
//         </h1>
//         <p className="text-gray-600 leading-relaxed">
//           Um Nachhaltigkeit zu erzielen, werden verschiedene Massnahmen eingesetzt. Abhängig vom Unternehmen sind manche wichtiger, manche weniger.
//         </p>
//       </div>

//       {/* Stakeholder Groups Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stakeholder-Gruppe</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anzahl Stakeholder</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Chart anzeigen</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {stakeholderGroups.map(group => (
//               <tr key={group.id}>
//                 <td className="px-6 py-4 whitespace-nowrap">{group.display_name}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{group.stakeholder_count}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <input
//                     type="checkbox"
//                     checked={group.selected}
//                     onChange={() => handleStakeholderToggle(group.id)}
//                     disabled={!group.canToggle}
//                     className="cursor-pointer"
//                   />
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   {!group.is_default && (
//                     <button onClick={() => console.log('Copy Invitation Link')} className="text-blue-500 hover:text-blue-700">
//                       Copy Invitation Link
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Edit Button */}
//       <div className="flex justify-end mb-6">
//         <button
//           onClick={() => console.log('Edit Stakeholder Groups')}
//           className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
//         >
//           ✏️ Stakeholder-Gruppen bearbeiten
//         </button>
//       </div>

//       {/* Plot Section */}
//       {createScatterPlot && (
//         <Plot data={createScatterPlot.data} layout={createScatterPlot.layout} />
//       )}
//     </div>
//   );
// };

// export default StakeholderAnalysisGroupDashboard;


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
  Box,
  Switch,
  CircularProgress,
  Alert
} from '@mui/material';
import Plot from 'react-plotly.js';
import { useGetStakeholderAnalysisDashboardQuery, useCopyStakeholderInvitationLinkMutation } from '../../lib/redux/features/clients/clientupdatedApiSlice';

const StakeholderAnalysisDashboardPage = () => {
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [copyInvitationLink] = useCopyStakeholderInvitationLinkMutation();
  
  const { 
    data: stakeholderData, 
    isLoading, 
    error 
  } = useGetStakeholderAnalysisDashboardQuery();

  const handleGroupToggle = (groupId: string, isDefault: boolean) => {
    if (isDefault) return; // Default group can't be toggled
    
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleCopyInvitationLink = async (groupId: string) => {
    try {
      const result = await copyInvitationLink(groupId).unwrap();
      // Copy to clipboard
      await navigator.clipboard.writeText(result.invitation_link);
      // You can add a toast notification here
      alert('Invitation link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy invitation link:', error);
      alert('Failed to copy invitation link');
    }
  };

  const createScatterPlot = () => {
    if (!stakeholderData) return { data: [], layout: {} };

    const categoryColors = {
      'Corporate Governance': '#005959',
      'Environment': '#7ba042',
      'Social': '#b27300'
    };

    // Get data for selected groups + client admin data
    const allDataPoints: Array<{
      x: number;
      y: number;
      text: string;
      category: string;
      source: string;
    }> = [];

    // Add client admin data (always shown)
    Object.entries(stakeholderData.question_response).forEach(([categoryName, categoryData]) => {
      categoryData.questions.forEach((question) => {
        if (question.priority !== null && question.status_quo !== null && 
            question.priority > 0 && question.status_quo > 0) {
          allDataPoints.push({
            x: question.priority,
            y: question.status_quo,
            text: question.index_code,
            category: categoryName,
            source: 'Client Admin'
          });
        }
      });
    });

    // Add selected stakeholder groups data
    stakeholderData.stakeholder_groups.forEach((group) => {
      const shouldInclude = group.is_default || selectedGroups.has(group.id);
      
      if (shouldInclude && group.has_responses && group.question_response) {
        Object.entries(group.question_response).forEach(([categoryName, categoryData]) => {
          categoryData.questions.forEach((question) => {
            if (question.priority !== null && question.status_quo !== null && 
                question.priority > 0 && question.status_quo > 0) {
              allDataPoints.push({
                x: question.priority,
                y: question.status_quo,
                text: question.index_code,
                category: categoryName,
                source: group.name
              });
            }
          });
        });
      }
    });

    // Create traces for each category
    const traces = Object.keys(categoryColors).map(category => {
      const categoryPoints = allDataPoints.filter(point => point.category === category);
      
      return {
        x: categoryPoints.map(point => point.x),
        y: categoryPoints.map(point => point.y),
        text: categoryPoints.map(point => point.text),
        mode: 'markers+text',
        type: 'scatter',
        name: category,
        marker: {
          size: 8,
          color: categoryColors[category as keyof typeof categoryColors],
          line: { width: 1, color: 'white' }
        },
        textposition: 'top center',
        textfont: { size: 10, color: categoryColors[category as keyof typeof categoryColors] }
      };
    });

    return {
      data: traces,
      layout: {
        title: 'Wesentlichkeitsmatrix Stakeholder',
        xaxis: { 
          title: 'Priority',
          range: [0, 4.5],
          showgrid: true,
          gridcolor: '#f0f0f0',
          dtick: 1
        },
        yaxis: { 
          title: 'Status Quo',
          range: [0, 4.5],
          showgrid: true,
          gridcolor: '#f0f0f0',
          dtick: 1
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading stakeholder analysis data
      </Alert>
    );
  }

  if (!stakeholderData) {
    return (
      <Alert severity="warning">
        No stakeholder analysis data available
      </Alert>
    );
  }

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
              <TableCell sx={{ fontWeight: 600 }}>In Chart anzeigen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stakeholderData.stakeholder_groups.map((group) => (
              <TableRow key={group.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {group.name}
                    {!group.has_responses && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleCopyInvitationLink(group.id)}
                        sx={{ 
                          minWidth: 'auto', 
                          px: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        📋 Einladungslink kopieren
                      </Button>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{group.stakeholder_count}</TableCell>
                <TableCell>
                  <Switch
                    checked={group.is_default || selectedGroups.has(group.id)}
                    onChange={() => handleGroupToggle(group.id, group.is_default)}
                    disabled={group.is_default || !group.has_responses}
                    color="primary"
                  />
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
          Stakeholder-Gruppen bearbeiten
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

export default StakeholderAnalysisDashboardPage;