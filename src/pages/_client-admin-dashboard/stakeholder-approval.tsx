import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Send as ResendIcon,
  Clear as ClearIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import {
  useGetStakeholdersListQuery,
  useApproveStakeholderMutation,
  useRejectStakeholderMutation,
  useResendStakeholderInvitationMutation
} from '../../lib/redux/features/clients/clientupdatedApiSlice';

const StakeholderApprovalPage = () => {
  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject' | 'resend'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  // Tab filters
  const tabFilters = ['all', 'pending', 'approved', 'rejected'];
  const currentFilter = tabFilters[currentTab];

  // API hooks
  const { 
    data: stakeholdersData, 
    isLoading, 
    error,
    refetch 
  } = useGetStakeholdersListQuery({
    status: currentFilter,
    group: selectedGroup || undefined,
    search: searchTerm || undefined
  });

  const [approveStakeholder, { isLoading: isApproving }] = useApproveStakeholderMutation();
  const [rejectStakeholder, { isLoading: isRejecting }] = useRejectStakeholderMutation();
  const [resendInvitation, { isLoading: isResending }] = useResendStakeholderInvitationMutation();

  // Event handlers
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  const handleGroupFilterChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const openActionDialog = (stakeholder, action) => {
    setSelectedStakeholder(stakeholder);
    setActionType(action);
    setDialogOpen(true);
    setReason('');
    setSendNotification(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedStakeholder(null);
    setActionType('');
    setReason('');
    setSendNotification(true);
  };

  const handleAction = async () => {
    if (!selectedStakeholder) return;

    try {
      const actionData = {
        reason: reason.trim() || undefined,
        send_notification: sendNotification
      };

      switch (actionType) {
        case 'approve':
          await approveStakeholder({
            stakeholderId: selectedStakeholder.id,
            data: actionData
          }).unwrap();
          break;
        case 'reject':
          await rejectStakeholder({
            stakeholderId: selectedStakeholder.id,
            data: actionData
          }).unwrap();
          break;
        case 'resend':
          await resendInvitation(selectedStakeholder.id).unwrap();
          break;
      }
      
      closeDialog();
      refetch();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'approve':
        return 'Approve Stakeholder';
      case 'reject':
        return 'Reject Stakeholder';
      case 'resend':
        return 'Resend Invitation';
      default:
        return '';
    }
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
        Error loading stakeholders: {error.data?.error || 'Unknown error'}
      </Alert>
    );
  }

  const { stakeholders = [], stats, groups = [], client } = stakeholdersData || {};

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        Stakeholder Management
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Manage and approve stakeholder requests for {client?.name}
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Stakeholders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats?.pending || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats?.approved || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {stats?.rejected || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <OutlinedInput
                fullWidth
                placeholder="Search by name, email, or group..."
                value={searchTerm}
                onChange={handleSearchChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
                endAdornment={
                  searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearchClear} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Filter by Group</InputLabel>
                <Select
                  value={selectedGroup}
                  onChange={handleGroupFilterChange}
                  label="Filter by Group"
                >
                  <MenuItem value="">All Groups</MenuItem>
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Card>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="All" 
            icon={<Badge badgeContent={stats?.total} color="primary" />}
          />
          <Tab 
            label="Pending" 
            icon={<Badge badgeContent={stats?.pending} color="warning" />}
          />
          <Tab 
            label="Approved" 
            icon={<Badge badgeContent={stats?.approved} color="success" />}
          />
          <Tab 
            label="Rejected" 
            icon={<Badge badgeContent={stats?.rejected} color="error" />}
          />
        </Tabs>

        {/* Stakeholders Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Stakeholder</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stakeholders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No stakeholders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                stakeholders.map((stakeholder) => (
                  <TableRow key={stakeholder.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {stakeholder.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stakeholder.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          {stakeholder.group.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={stakeholder.status_display}
                        color={getStatusColor(stakeholder.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {stakeholder.days_since_created === 0 
                          ? 'Today' 
                          : `${stakeholder.days_since_created} days ago`
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(stakeholder.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={stakeholder.is_registered ? 'Registered' : 'Not Registered'}
                        color={stakeholder.is_registered ? 'success' : 'default'}
                        variant="outlined"
                      />
                      {stakeholder.last_login && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Last: {new Date(stakeholder.last_login).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {stakeholder.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <Button
                                size="small"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={() => openActionDialog(stakeholder, 'approve')}
                                disabled={isApproving}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <Button
                                size="small"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => openActionDialog(stakeholder, 'reject')}
                                disabled={isRejecting}
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </>
                        )}
                        
                        <Tooltip title="Resend Invitation">
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<ResendIcon />}
                            onClick={() => openActionDialog(stakeholder, 'resend')}
                            disabled={isResending}
                          >
                            Resend
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {getActionTitle()}
        </DialogTitle>
        <DialogContent>
          {selectedStakeholder && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Stakeholder:</strong> {selectedStakeholder.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <EmailIcon sx={{ fontSize: 16, mr: 1 }} />
                {selectedStakeholder.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <GroupIcon sx={{ fontSize: 16, mr: 1 }} />
                {selectedStakeholder.group.name}
              </Typography>
            </Box>
          )}

          {actionType !== 'resend' && (
            <>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={actionType === 'approve' ? 'Approval Message (Optional)' : 'Rejection Reason (Optional)'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Enter a message for the stakeholder...'
                    : 'Provide a reason for rejection...'
                }
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                  />
                }
                label="Send email notification to stakeholder"
              />
            </>
          )}

          {actionType === 'resend' && (
            <Typography variant="body2" color="text.secondary">
              This will send a new invitation email to the stakeholder.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            disabled={isApproving || isRejecting || isResending}
            color={
              actionType === 'approve' ? 'success' : 
              actionType === 'reject' ? 'error' : 
              'primary'
            }
            startIcon={
              (isApproving || isRejecting || isResending) ? 
              <CircularProgress size={16} /> : 
              actionType === 'approve' ? <ApproveIcon /> :
              actionType === 'reject' ? <RejectIcon /> :
              <ResendIcon />
            }
          >
            {actionType === 'approve' ? 'Approve' :
             actionType === 'reject' ? 'Reject' :
             'Resend'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StakeholderApprovalPage;