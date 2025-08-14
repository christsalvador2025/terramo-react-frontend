
import { useParams } from 'react-router-dom';
import {
  useGetPersonByIdQuery,
 
} from '../../api/personApi';
import {
  Box,
  Typography,
 
  CircularProgress,
  Alert,
 
} from '@mui/material';
 

export default function SinglePerson() {
  const { id } = useParams<{ id: string }>();
 
  const personId = Number(id);

  // API hooks
  const { data: person, isLoading, isError, error } = useGetPersonByIdQuery(personId);
  

   
 

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Error: {error.toString()}</Alert>;
  if (!person) return <Alert severity="warning">Stakeholder not found</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3 , }}>
        <Typography variant="h4">
          Person ID: {person.PERSON_ID}
          
        </Typography>
        <Typography variant="h4">
            Person First Name: {person.PERSON_FIRSTNAME}
        </Typography>
        
      
      </Box>


   
    </Box>
  );
}