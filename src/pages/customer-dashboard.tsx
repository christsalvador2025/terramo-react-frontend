import AssessmentIcon from "@mui/icons-material/Assessment";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  // AppProvider,
  DashboardLayout,
  Navigation,
  PageContainer,
} from "@toolpad/core";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { useEffect, useState } from "react";
import { Outlet, Route, Routes, useParams } from "react-router-dom";
import { CustomerProvider } from "../context/customer-context";
import useFetchCustomerById from "../hooks/use-fetch-customer-by-id";
import { theme } from "../theme";
import DualEssentiality from "./customer-dashboard/dual-essentiality/dual-essentiality";
import EsgCheck from "./customer-dashboard/esg-check";
import Stakeholder from "./customer-dashboard/stakeholder";

const CustomerDashboard = () => {
  const { id } = useParams();
  const customer = useFetchCustomerById(id);
  const [logoNode, setLogoNode] = useState<React.ReactNode>(null);

  const NAVIGATION: Navigation = [
    {
      kind: "header",
      title: "Dashboard",
    },
    {
      segment: `customers/${id}/dashboard/esg-check`,
      title: "ESG-Check",
      icon: <AssessmentIcon />,
    },
    {
      segment: `customers/${id}/dashboard/stakeholder`,
      title: "Stakeholder-Analyse",
      icon: <GroupsIcon />,
    },
    {
      segment: `customers/${id}/dashboard/dual-essentiality`,
      title: "Doppelte Wesentlichkeit",
      icon: <EditIcon />,
    },
  ];

  useEffect(() => {
    if (customer.base64Image) {
      setLogoNode(<img src={customer.base64Image} alt="Logo" />);
    }
  }, [customer]);

  return (
    <CustomerProvider key={customer.id} customer={customer}>
      <AppProvider
        navigation={NAVIGATION}
        branding={{ logo: logoNode, title: customer.name }}
        theme={theme}
      >
        <DashboardLayout
          sx={{ width: "100%", height: "calc(100vh - 64px)", display: "flex" }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <PageContainer
              sx={{ flex: 1, overflowY: "auto" }}
              breadcrumbs={[{ path: "", title: "" }]}
            >
              <Outlet />
              <Routes>
                <Route path="esg-check" element={<EsgCheck />} />
                <Route path="stakeholder" element={<Stakeholder />} />
                <Route
                  path="dual-essentiality"
                  element={<DualEssentiality />}
                />
              </Routes>
              {/* {props.children} */}
            </PageContainer>
          </div>
        </DashboardLayout>
      </AppProvider>
    </CustomerProvider>
  );
};

export default CustomerDashboard;
