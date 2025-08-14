import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetStakeholderByIdQuery,
  useUpdateStakeholderMutation,
  useDeleteStakeholderMutation,
} from '../../api/stakeholderApi';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogTitle,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

export default function SingleStakeholder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stakeholderId = Number(id);

  // API hooks
  const { data: stakeholder, isLoading, isError, error } = useGetStakeholderByIdQuery(stakeholderId);
  const [updateStakeholder] = useUpdateStakeholderMutation();
  const [deleteStakeholder] = useDeleteStakeholderMutation();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Stakeholder>>({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Handle edit toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form when canceling
      setFormData({});
    } else if (stakeholder) {
      // Initialize form with current data when starting edit
      setFormData({
        STAKEHOLDER_NACE: stakeholder.STAKEHOLDER_NACE,
        // Add other editable fields here
      });
    }
    setIsEditing(!isEditing);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle save
  const handleSave = async () => {
    try {
      await updateStakeholder({
        id: stakeholderId,
        updates: formData
      }).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update stakeholder:', err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteStakeholder(stakeholderId).unwrap();
      navigate('/stakeholders');
    } catch (err) {
      console.error('Failed to delete stakeholder:', err);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Error: {error.toString()}</Alert>;
  if (!stakeholder) return <Alert severity="warning">Stakeholder not found</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Stakeholder ID: {stakeholder.STAKEHOLDER_ID}
        </Typography>
        <Box>
          {isEditing ? (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleEditToggle}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditToggle}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenDeleteDialog(true)}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2, width: '100%' } }}>
        <TextField
          label="Stakeholder ID"
          value={stakeholder.STAKEHOLDER_ID}
          InputProps={{ readOnly: true }}
          fullWidth
        />

        <TextField
          label="NACE Code"
          name="STAKEHOLDER_NACE"
          value={isEditing ? formData.STAKEHOLDER_NACE || '' : stakeholder.STAKEHOLDER_NACE || ''}
          onChange={handleInputChange}
          InputProps={{ readOnly: !isEditing }}
          fullWidth
        />

        <TextField
          label="Created At"
          value={new Date(stakeholder.STAKEHOLDER_CREATED).toLocaleString()}
          InputProps={{ readOnly: true }}
          fullWidth
        />

        <TextField
          label="Created By"
          value={stakeholder.STAKEHOLDER_CREATED_BY}
          InputProps={{ readOnly: true }}
          fullWidth
        />

        {stakeholder.STAKEHOLDER_UPDATED && (
          <TextField
            label="Last Updated"
            value={new Date(stakeholder.STAKEHOLDER_UPDATED).toLocaleString()}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>
          Confirm delete stakeholder #{stakeholder.STAKEHOLDER_ID}?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}