import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupsIcon from "@mui/icons-material/Groups";
import { DashboardLayout, Navigation, PageContainer } from "@toolpad/core";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { theme } from "../../theme";
import { useGetClientAdminDashboardQuery } from "../../lib/redux/features/clients/clientupdatedApiSlice";

// Year context + sidebar
import { YearProvider } from "../../components/year/YearContext";
import SidebarYearSelect from "../../components/year/SidebarYearSelect";

// Pages
import EsgCheck from "./esg-check";            
import Stakeholder from "./stakeholder";                        // simple placeholder below

export default function UpdatedClientAdminDashboardPage() {
  const { data: dashboardData } = useGetClientAdminDashboardQuery();

  const NAVIGATION: Navigation = useMemo(
    () => [
      { kind: "header", title: "Dashboard" },
      { segment: "/client-admin/dashboard/esg-check", title: "ESG-Check", icon: <AssessmentIcon /> },
      { segment: "/client-admin/dashboard/stakeholder", title: "Stakeholder-Analyse", icon: <GroupsIcon /> },
    ],
    []
  );

  return (
    <YearProvider>
      <AppProvider
        navigation={NAVIGATION}
        branding={{ title: dashboardData?.client?.name ?? "Client Admin" }}
        theme={theme}
      >
        <DashboardLayout
          sx={{ width: "100%", height: "calc(100vh - 64px)", display: "flex" }}
          // If your Toolpad version doesn't have sidebarHeader, try sidebarFooter
          slots={{ sidebarHeader: <SidebarYearSelect /> }}
        >
          <PageContainer sx={{ flex: 1, overflowY: "auto" }} breadcrumbs={[{ path: "", title: "" }]}>
            <Routes>
              <Route index element={<Navigate to="esg-check" replace />} />
              <Route path="esg-check" element={<EsgCheck />} />
              <Route path="stakeholder" element={<Stakeholder />} />
              {/* add more client-admin pages here if needed */}
              <Route path="*" element={<Navigate to="esg-check" replace />} />
            </Routes>
          </PageContainer>
        </DashboardLayout>
      </AppProvider>
    </YearProvider>
  );
}
