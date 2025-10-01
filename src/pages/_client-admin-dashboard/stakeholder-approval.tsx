import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, User, Users, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { 
  useGetStakeholdersListQuery,
  useApproveStakeholderMutation,
  useRejectStakeholderMutation,
  useResendStakeholderInvitationMutation
} from '../../lib/redux/features/clients/clientupdatedApiSlice';

const StakeholderManagement = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  
  // Action dialog states
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject' | 'resend'
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  // Fetch all stakeholders data
  const { 
    data: stakeholdersData, 
    isLoading, 
    error,
    refetch 
  } = useGetStakeholdersListQuery({});

  // Action mutations
  const [approveStakeholder, { isLoading: isApproving }] = useApproveStakeholderMutation();
  const [rejectStakeholder, { isLoading: isRejecting }] = useRejectStakeholderMutation();
  const [resendInvitation, { isLoading: isResending }] = useResendStakeholderInvitationMutation();

  // Extract data from response
  const stakeholders = stakeholdersData?.stakeholders || [];
  const client = stakeholdersData?.client;

  // Get unique groups for filter dropdown
  const groups = useMemo(() => {
    const uniqueGroups = new Set();
    stakeholders.forEach(stakeholder => {
      if (stakeholder.group?.name) {
        uniqueGroups.add(stakeholder.group.name);
      }
    });
    return Array.from(uniqueGroups);
  }, [stakeholders]);

  // Filter stakeholders based on current filters
  const filteredStakeholders = useMemo(() => {
    let filtered = [...stakeholders];

    if (selectedGroup) {
      filtered = filtered.filter(stakeholder => 
        stakeholder.group?.name === selectedGroup
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(stakeholder =>
        stakeholder.full_name.toLowerCase().includes(searchLower) ||
        stakeholder.email.toLowerCase().includes(searchLower) ||
        stakeholder.group?.name.toLowerCase().includes(searchLower)
      );
    }

    if (activeTab !== 'ALL') {
      filtered = filtered.filter(stakeholder => 
        stakeholder.status.toLowerCase() === activeTab.toLowerCase()
      );
    }

    return filtered;
  }, [stakeholders, activeTab, searchTerm, selectedGroup]);

  // Stats for all stakeholders (top cards)
  const stats = useMemo(() => {
    const total = stakeholders.length;
    const pending = stakeholders.filter(s => s.status === 'pending').length;
    const approved = stakeholders.filter(s => s.status === 'approved').length;
    const rejected = stakeholders.filter(s => s.status === 'rejected').length;
     
    return { total, pending, approved, rejected };
  }, [stakeholders]);

  // Stats for filtered stakeholders (tab counts)
  const statusGroupCount = useMemo(() => {
    const total = filteredStakeholders.length;
    const pending = filteredStakeholders.filter(s => s.status === 'pending').length;
    const approved = filteredStakeholders.filter(s => s.status === 'approved').length;
    const rejected = filteredStakeholders.filter(s => s.status === 'rejected').length;

    return { total, pending, approved, rejected };
  }, [filteredStakeholders]);

  // Action handlers
  const openActionDialog = (stakeholder, action) => {
    setSelectedStakeholder(stakeholder);
    setActionType(action);
    setIsDialogOpen(true);
    setReason('');
    setSendNotification(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
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
      // You might want to add a toast notification here for error handling
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full border";
    
    switch (status) {
      case 'pending':
        return `${baseClasses} text-orange-700 bg-orange-50 border-orange-200`;
      case 'approved':
        return `${baseClasses} text-green-700 bg-green-50 border-green-200`;
      case 'rejected':
        return `${baseClasses} text-red-700 bg-red-50 border-red-200`;
      default:
        return `${baseClasses} text-gray-700 bg-gray-50 border-gray-200`;
    }
  };

  const getRegistrationBadge = (isRegistered) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full border";
    
    return isRegistered
      ? `${baseClasses} text-green-700 bg-green-50 border-green-200`
      : `${baseClasses} text-gray-700 bg-gray-50 border-gray-200`;
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
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading stakeholders: {error.data?.error || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Stakeholder Management
        </h1>
        <p className="text-gray-600">
          Manage and approve stakeholder requests for {client?.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Stakeholders</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, email, or group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <span className="text-gray-700">
                {selectedGroup || 'Filter by Group'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            
            {isGroupDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setSelectedGroup('');
                    setIsGroupDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  All Groups
                </button>
                {groups.map((group) => (
                  <button
                    key={group}
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsGroupDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                  >
                    {group}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'ALL', label: 'ALL', count: statusGroupCount.total, color: 'text-blue-600' },
              { key: 'PENDING', label: 'PENDING', count: statusGroupCount.pending, color: 'text-orange-600' },
              { key: 'APPROVED', label: 'APPROVED', count: statusGroupCount.approved, color: 'text-green-600' },
              { key: 'REJECTED', label: 'REJECTED', count: statusGroupCount.rejected, color: 'text-red-600' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? `border-blue-500 ${tab.color}`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 text-xs font-bold rounded-full ${
                  activeTab === tab.key ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stakeholder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStakeholders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No stakeholders found
                  </td>
                </tr>
              ) : (
                filteredStakeholders.map((stakeholder) => (
                  <tr key={stakeholder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {stakeholder.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stakeholder.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {stakeholder.group?.name || 'No Group'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(stakeholder.status)}>
                        {stakeholder.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stakeholder.days_since_created === 0 
                          ? 'Today' 
                          : `${stakeholder.days_since_created} days ago`
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(stakeholder.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="mb-1">
                        <span className={getRegistrationBadge(stakeholder.is_registered)}>
                          {stakeholder.is_registered ? 'Registered' : 'Not Registered'}
                        </span>
                      </div>
                      {stakeholder.last_login && (
                        <div className="text-xs text-gray-500">
                          Last: {new Date(stakeholder.last_login).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        {stakeholder.status === 'pending' && stakeholder.is_registered && (
                          <>
                            <button 
                              onClick={() => openActionDialog(stakeholder, 'approve')}
                              disabled={isApproving}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {isApproving ? 'Approving...' : 'Approve'}
                            </button>
                            <button 
                              onClick={() => openActionDialog(stakeholder, 'reject')}
                              disabled={isRejecting}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              {isRejecting ? 'Rejecting...' : 'Reject'}
                            </button>
                          </>
                        )}
                        {stakeholder.status === 'pending' && !stakeholder.is_registered && (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-3 py-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              Waiting for registration
                            </span>
                            <button 
                              onClick={() => openActionDialog(stakeholder, 'resend')}
                              disabled={isResending}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              {isResending ? 'Sending...' : 'Resend'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {getActionTitle()}
              </h3>
              
              {selectedStakeholder && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {selectedStakeholder.full_name}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    {selectedStakeholder.email}
                  </div>
                  <div className="text-sm text-gray-500">
                    Group: {selectedStakeholder.group?.name || 'No Group'}
                  </div>
                </div>
              )}

              {actionType !== 'resend' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {actionType === 'approve' ? 'Approval Message (Optional)' : 'Rejection Reason (Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      actionType === 'approve' 
                        ? 'Enter a message for the stakeholder...'
                        : 'Provide a reason for rejection...'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {actionType !== 'resend' && (
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sendNotification}
                      onChange={(e) => setSendNotification(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Send email notification to stakeholder
                    </span>
                  </label>
                </div>
              )}

              {actionType === 'resend' && (
                <p className="text-sm text-gray-600 mb-4">
                  This will send a new invitation email to the stakeholder.
                </p>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={isApproving || isRejecting || isResending}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : actionType === 'reject'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {(isApproving || isRejecting || isResending) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  )}
                  {actionType === 'approve' ? 'Approve' :
                   actionType === 'reject' ? 'Reject' :
                   'Resend'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeholderManagement;