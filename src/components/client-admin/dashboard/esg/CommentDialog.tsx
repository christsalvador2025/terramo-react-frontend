import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

interface CommentDialogData {
  question_id: string;
  index_code: string;
  comment: string;
}

interface CommentDialogProps {
  open: boolean;
  data: CommentDialogData | null;
  onClose: () => void;
  onSave: (comment: string) => void;
}

const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  data,
  onClose,
  onSave,
}) => {
  const [comment, setComment] = useState(data?.comment || '');

  React.useEffect(() => {
    if (data) {
      setComment(data.comment || '');
    }
  }, [data]);

  const handleSave = () => {
    onSave(comment);
    onClose();
  };

  const handleClose = () => {
    setComment(data?.comment || '');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Kommentar für {data?.index_code}</DialogTitle>
      <DialogContent>
        <TextField
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Fügen Sie hier Ihren Kommentar hinzu..."
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Abbrechen</Button>
        <Button onClick={handleSave} variant="contained">
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;