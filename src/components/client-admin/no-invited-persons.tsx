 
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Info } from '@mui/icons-material';

const ESGCheckCard = () => {
  const handleCopyLink = () => {
    const invitationLink = "https://your-domain.com/invitation/abc123";
    navigator.clipboard.writeText(invitationLink)
      .then(() => {
        alert('Einladungslink wurde in die Zwischenablage kopiert!');
      })
      .catch(() => {
        alert('Kopieren fehlgeschlagen');
      });
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', mt: 2 }}>
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
          severity="info" 
          icon={<Info />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2" fontWeight="medium">
            Aktuell haben Sie noch keine Personen aus dem Kernteam eingeladen
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

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCopyLink}
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
  );
};

export default ESGCheckCard;