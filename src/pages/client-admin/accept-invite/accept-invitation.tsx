import AcceptInvitationPage from "../../../components/invitations/ClientAdminAcceptInvite";
import { useParams } from "react-router-dom";

export default function AcceptClientInvitePage() {
  const { token } = useParams();
  console.log('----token-------', token);
  return <AcceptInvitationPage token={token} />;
}
