import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  Snackbar
} from '@mui/material';
import { Info } from '@mui/icons-material';

// Define props interface
interface ESGCheckCardProps {
  invitationLink: string;
  onCopySuccess?: () => void;
  onCopyError?: (error: string) => void;
}

const ESGCheckCard: React.FC<ESGCheckCardProps> = ({ 
  invitationLink, 
  onCopySuccess, 
  onCopyError 
}) => {
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleCopyLink = async () => {
    if (!invitationLink) {
      const errorMsg = 'Kein Einladungslink verfügbar';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      onCopyError?.(errorMsg);
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationLink);
      const successMsg = 'Einladungslink wurde in die Zwischenablage kopiert!';
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      onCopySuccess?.();
    } catch (error) {
      const errorMsg = 'Kopieren fehlgeschlagen';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      onCopyError?.(errorMsg);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Card sx={{ margin: 'auto' }}>
        <CardContent>
          {/* Header */}
          <Typography variant="h5" component="h1" gutterBottom color="primary">
            ESG-Check (interne Sicht) – 2025
          </Typography>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
            Porro voluptate aut in facellibus. Porttitor nunc condimentum nunc ut nibh. Elit mauris rutrum quis nibh. Nec tortor armet at felis turpis. 
            Pulvinar interdum in eros est tellus. Nunc sollicitudin cursus pellentesque mauris cras quis nec. Libero cursus etiam vel ipsum lectus. 
            Gravida elementum purus eleifend quam porta. Fermentum sed bibendum odio sed lectus cursus consequat eleifend lorem at rhoncus risus elit tellus. 
            Mauris pellentesque massa. Elementum porttitor cursus elit auctor mauris et quam non proin tellus id ut lectus nec quis ante est cursus est turpis.
          </Typography>

          {/* Status Alert */}
          <Alert 
            severity={invitationLink ? "success" : "info"}
            icon={<Info />}
            sx={{ mb: 3 }}
          >
            <Typography variant="body2" fontWeight="medium">
              {invitationLink 
                ? "Einladungslink ist bereit zum Teilen"
                : "Aktuell haben Sie noch keine Personen aus dem Kernteam eingeladen"
              }
            </Typography>
          </Alert>

          {/* Instructions */}
          <List dense sx={{ mb: 3 }}>
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  1.
                </Typography>
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2">
                  Kopieren Sie folgenden Einladungslink
                </Typography>
              </ListItemText>
            </ListItem>
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  2.
                </Typography>
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2">
                  Senden sie diesen Link per E-Mail an die Mitglieder aus dem Kernteam
                </Typography>
              </ListItemText>
            </ListItem>
          </List>

          {/* Link Preview (Optional) */}
          {invitationLink && (
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: 'grey.100', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300'
            }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Einladungslink:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem'
                }}
              >
                {invitationLink}
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleCopyLink}
              disabled={!invitationLink}
              sx={{ textTransform: 'none', fontWeight: 'medium' }}
            >
              Einladungslink kopieren
            </Button>
            <Typography variant="body2" color="text.secondary">
              Weiter zur ESG-Check interne Sicht Auswertung
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default ESGCheckCard;