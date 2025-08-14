import { useGetStakeholdersQuery } from '../../api/stakeholderApi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Stakeholders() {
  const { data: stakeholders, isLoading, error } = useGetStakeholdersQuery();

 if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div>Error loading stakeholders</div>;

  return (
    <ul>
      {stakeholders?.map((stakeholder) => (
        <li key={stakeholder.STAKEHOLDER_ID}>
          ID: {stakeholder.STAKEHOLDER_ID} | 
          Created: {new Date(stakeholder.STAKEHOLDER_CREATED).toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
}