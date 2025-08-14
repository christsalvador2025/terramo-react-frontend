import { useGetPersonsQuery } from '../../api/personApi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Stakeholders() {
  const { data: persons, isLoading, error } = useGetPersonsQuery();

   if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div>Error loading persons</div>;

  return (
    <ul>
      {persons?.map((person) => (
        <li key={person.PERSON_ID}>
          ID: {person.PERSON_ID} | 
          NAME : { person.PERSON_FIRSTNAME}
          {/* Created: {new Date(person.STAKEHOLDER_CREATED).toLocaleDateString()} */}
        </li>
      ))}
    </ul>
  );
}