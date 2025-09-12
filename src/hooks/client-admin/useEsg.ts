import { useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  setEsgData,
  updateResponse,
  setActiveTab,
  setSummaryTab,
  setLoading,
  setSaving,
  setError,
  clearError,
  resetChanges,
  resetEsg,
} from '../../lib/redux/features/clients/esgSlice';
import {
  useGetClientAdminDashboardQuery,
  useBulkUpdateEsgResponsesMutation,
} from '../../lib/redux/features/clients/clientupdatedApiSlice';
// import { setClientAdminCurrentClient } from "../../lib/redux/features/clients/clientAdminSlice";

// Type for RootState - adjust according to your store structure
type RootState = {
  esg: any; // Replace with actual ESG state type
};

// Constants
export const PRIORITY_MAP = new Map<number, string>([
  [0, "nicht gestartet"],
  [1, "wenig Priorität"],
  [2, "mittlere Priorität"],
  [3, "hohe Priorität"],
  [4, "sehr hohe Priorität"],
]);

export const STATUS_MAP = new Map<number, string>([
  [0, "nicht gestartet"],
  [1, "schlecht"],
  [2, "ausreichend"],
  [3, "gut"],
  [4, "ausgezeichnet"],
]);

export const categoryMap = {
  Environment: "Umwelt",
  Social: "Gesellschaft",
  "Corporate Governance": "Unternehmensführung",
} as const;

// Utility functions
export const displayOrSelect = (map: Map<number, string>, v?: number | null) =>
  v === 0 || v ? `${v} - ${map.get(v as number)}` : "Bitte auswählen";

export const sortIndexCode = (a: string, b: string) => {
  const pa = a.split("-");
  const pb = b.split("-");
  if (pa[0] !== pb[0]) {
    return ["E", "S", "G"].indexOf(pa[0]) - ["E", "S", "G"].indexOf(pb[0]);
  }
  return Number(pa[1]) - Number(pb[1]);
};

// Main ESG Hook
export const useEsg = (selectedYear: number) => {
  const dispatch = useDispatch();
  const esgState = useSelector((state: RootState) => state.esg);
  
  // API hooks
  const { data: dashboardData, isLoading, error, refetch } = useGetClientAdminDashboardQuery({
    year: selectedYear
  });
  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdateEsgResponsesMutation();



 
  // Initialize data when dashboard data is loaded
  useEffect(() => {
    if (dashboardData) {
      dispatch(setEsgData({ data: dashboardData }));
      
    }
  }, [dashboardData, dispatch]);

  // Refetch data when year changes
  useEffect(() => {
    if (selectedYear) {
      refetch();
    }
  }, [selectedYear, refetch]);

  // Handle response changes
  const handleResponseChange = useCallback((questionId: string, field: string, value: any) => {
    dispatch(updateResponse({ questionId, field, value }));
  }, [dispatch]);

  // Handle tab changes
  const handleTabChange = useCallback((tab: number) => {
    dispatch(setActiveTab({ tab }));
  }, [dispatch]);

  const handleSummaryTabChange = useCallback((tab: number) => {
    dispatch(setSummaryTab({ tab }));
  }, [dispatch]);

  // Build payload for API calls
  const buildPayload = useCallback((status: "draft" | "submitted") => {
    const payloadResponses = Object.entries(esgState.responses).map(([question_id, r]: any) => ({
      question_id,
      priority: r?.priority ?? null,
      status_quo: r?.status_quo ?? null,
      comment: r?.comment ?? "",
    }));
    return { status, responses: payloadResponses, year: selectedYear };
  }, [esgState.responses, selectedYear]);

  // Save draft
  const handleSaveDraft = useCallback(async () => {
    try {
      dispatch(setSaving({ isSaving: true }));
      const payload = buildPayload("draft");
      if (payload.responses.length === 0) {
        toast("Keine Änderungen zum Speichern.", { icon: "ℹ️" });
        return;
      }
      const res = await bulkUpdate(payload).unwrap();
      toast.success(res?.message ?? "Entwurf gespeichert");
      dispatch(resetChanges());
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.detail ?? "Fehler beim Speichern des Entwurfs");
      console.error(e);
      dispatch(setError({ error: e?.data?.detail ?? "Fehler beim Speichern des Entwurfs" }));
    } finally {
      dispatch(setSaving({ isSaving: false }));
    }
  }, [dispatch, buildPayload, bulkUpdate, refetch]);

  // Submit responses
  const handleSubmit = useCallback(async () => {
    try {
      dispatch(setSaving({ isSaving: true }));
      const payload = buildPayload("submitted");
      if (payload.responses.length === 0) {
        toast("Keine Änderungen zum Einreichen.", { icon: "ℹ️" });
        return;
      }
      const res = await bulkUpdate(payload).unwrap();
      toast.success(res?.message ?? "Antworten eingereicht");
      dispatch(resetChanges());
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.detail ?? "Fehler beim Einreichen");
      console.error(e);
      dispatch(setError({ error: e?.data?.detail ?? "Fehler beim Einreichen" }));
    } finally {
      dispatch(setSaving({ isSaving: false }));
    }
  }, [dispatch, buildPayload, bulkUpdate, refetch]);

  return {
    // State
    ...esgState,
    dashboardData,
    isLoading: isLoading || esgState.isLoading,
    isSaving: isSaving || esgState.isSaving,
    error: error || esgState.error,

    // Actions
    handleResponseChange,
    handleTabChange,
    handleSummaryTabChange,
    handleSaveDraft,
    handleSubmit,
    refetch,
    clearError: () => dispatch(clearError()),
    reset: () => dispatch(resetEsg()),
  };
};

// Hook for categories
export const useEsgCategories = () => {
  const { data: dashboardData } = useSelector((state: RootState) => state.esg);
  
  return useMemo(() => {
    if (!dashboardData?.question_response) return [];
    const categoryNames = Object.keys(dashboardData.question_response);
    const desiredOrder = ["Environment", "Social", "Corporate Governance"];
    return desiredOrder.filter((c) => categoryNames.includes(c));
  }, [dashboardData]);
};

// Hook for current category data
export const useCurrentCategoryData = () => {
  const { data: dashboardData, responses, activeTab } = useSelector((state: RootState) => state.esg);
  const categories = useEsgCategories();

  return useMemo(() => {
    if (activeTab === 3) return [];
    const categoryName = categories[activeTab];
    const categoryData = dashboardData?.question_response?.[categoryName];
    if (!categoryData) return [];

    return categoryData.questions
      .slice()
      .sort((a: any, b: any) => sortIndexCode(a.index_code, b.index_code))
      .map((q: any) => ({
        question_id: q.question_id,
        index_code: q.index_code,
        measure: q.measure,
        priority: responses[q.question_id]?.priority ?? q.priority,
        status_quo: responses[q.question_id]?.status_quo ?? q.status_quo,
        comment: responses[q.question_id]?.comment ?? q.comment,
        priority_display: q.priority_display,
        status_quo_display: q.status_quo_display,
        is_answered: q.is_answered,
        response_id: q.response_id,
      }));
  }, [activeTab, categories, dashboardData, responses]);
};

// Hook for chart data
export const useCategoryChartData = () => {
  const { data: dashboardData } = useSelector((state: RootState) => state.esg);

  const createCategoryChartData = useCallback((categoryName: string) => {
    if (!dashboardData?.categories) return [];
    const cat = dashboardData.categories[categoryName];
    if (!cat) return [];

    const ordered = [...cat.questions].sort((a: any, b: any) => sortIndexCode(a.index_code, b.index_code));
    const yLabels = ordered.map((d: any) => d.index_code);

    return [
      {
        type: "bar",
        x: ordered.map((d: any) => -Number(d.avg_priority || 0)),
        y: yLabels,
        orientation: "h",
        name: "Priorität",
        marker: { color: "#026770" },
        hovertemplate: "<b>%{y}</b><br>Priorität: %{customdata:.1f}<extra></extra>",
        customdata: ordered.map((d: any) => Number(d.avg_priority || 0)),
      },
      {
        type: "bar",
        x: ordered.map((d: any) => Number(d.avg_status_quo || 0)),
        y: yLabels,
        orientation: "h",
        name: "Status Quo",
        marker: { color: "#7DB6B7" },
        hovertemplate: "<b>%{y}</b><br>Status Quo: %{x:.1f}<extra></extra>",
      },
    ];
  }, [dashboardData]);

  return { createCategoryChartData };
};