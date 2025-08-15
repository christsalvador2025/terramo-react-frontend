import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController
} from 'chart.js';

// ✅ Register Chart.js v4 components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController
);

// Mock API response
const mockApiResponse = {
  client: { id: "4fcd9040-da5e-4377-b24a-dc06ac3329ad", name: "dd Company" },
  year: 2025,
  averages: {
    by_category: {
      Environment: {
        category_info: {
          id: "2f5b2e3c-4e39-498b-941a-4ef3a49c7d8b",
          name: "Environment",
          display_name: "Environment"
        },
        questions: [
          { question_id: "81e8c3ed", index_code: "E-1", measure: "Beitrag zum Klimaschutz leisten", avg_priority: 1.5, avg_status_quo: 0.8, response_count: 1, total_possible_responses: 1, response_rate: 100.0 },
          { question_id: "72acb2e1", index_code: "E-2", measure: "Anpassung an den Klimawandel", avg_priority: 1.2, avg_status_quo: 0.5, response_count: 1, total_possible_responses: 1, response_rate: 100.0 }
        ]
      },
      Social: {
        category_info: { id: "18c9a88c", name: "Social", display_name: "Social" },
        questions: [
          { question_id: "278c733b", index_code: "S-1", measure: "Gesundes Arbeitsumfeld", avg_priority: 2.1, avg_status_quo: 1.4, response_count: 1, total_possible_responses: 1, response_rate: 100.0 }
        ]
      }
    }
  }
};

interface Question {
  question_id: string;
  index_code: string;
  measure: string;
  avg_priority: number;
  avg_status_quo: number;
  response_count: number;
  total_possible_responses: number;
  response_rate: number;
}

interface Category {
  category_info: { id: string; name: string; display_name: string; };
  questions: Question[];
}

interface EsgData {
  client: { id: string; name: string; };
  year: number;
  averages: { by_category: Record<string, Category>; };
}

// Error boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ESG Check Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800">Ein Fehler ist aufgetreten. Bitte laden Sie die Seite neu.</p>
      </div>;
    }
    return this.props.children;
  }
}

// ✅ Fixed Chart.js v4 component
const ESGChart: React.FC<{ data: Question[] }> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map(item => item.index_code);
    const priorityData = data.map(item => -item.avg_priority);
    const statusData = data.map(item => item.avg_status_quo);

    chartInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Priorität', data: priorityData, backgroundColor: '#026770', borderWidth: 0 },
          { label: 'Status Quo', data: statusData, backgroundColor: '#7DB6B7', borderWidth: 0 }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            min: -3,
            max: 3,
            ticks: {
              callback: (value) => Math.abs(Number(value))
            },
            grid: { color: '#e5e7eb' }
          },
          y: { grid: { display: false } }
        },
        plugins: {
          legend: { position: 'top', align: 'end' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = Math.abs(context.parsed.x);
                return `${label}: ${value.toFixed(1)}`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data]);

  return <div className="w-full" style={{ height: '400px' }}>
    <canvas ref={chartRef}></canvas>
  </div>;
};

const EsgCheck: React.FC = () => {
  const [data, setData] = useState<EsgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const categoryMap: Record<string, string> = {
    Environment: 'Umwelt',
    Social: 'Gesellschaft',
    'Corporate Governance': 'Unternehmensführung'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise(res => setTimeout(res, 500));
        setData(mockApiResponse as EsgData);
        const categories = Object.keys(mockApiResponse.averages.by_category);
        if (categories.length > 0) setActiveCategory(categories[0]);
      } catch {
        setError('Fehler beim Laden der ESG-Daten');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = useMemo(() => data ? Object.keys(data.averages.by_category) : [], [data]);
  const currentCategoryData = useMemo(() => data?.averages.by_category[activeCategory] || null, [data, activeCategory]);

  if (loading) return <ErrorBoundary><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div></ErrorBoundary>;
  if (error) return <ErrorBoundary><div className="p-4 bg-red-50 border border-red-200 rounded"><p className="text-red-800">{error}</p></div></ErrorBoundary>;
  if (!data || !currentCategoryData) return <ErrorBoundary><div className="p-4 bg-gray-50 border border-gray-200 rounded"><p className="text-gray-600">Keine Daten verfügbar</p></div></ErrorBoundary>;

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ESG-Check – {data.year}</h1>
          <p className="text-gray-600 text-sm mb-6">Um Nachhaltigkeit zu erzielen, werden verschiedene Massnahmen eingesetzt...</p>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {categories.map(category => (
                <button key={category} onClick={() => setActiveCategory(category)}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm ${activeCategory === category ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {categoryMap[category] || category}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mb-8 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Index</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Maßnahme</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Priorität</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status-Quo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Kommentar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCategoryData.questions.map((q, i) => (
                <tr key={q.question_id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm text-teal-600 font-medium">{q.index_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{q.measure}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">1 - wenig Priorität</td>
                  <td className="px-4 py-3 text-sm text-gray-500">0 - nicht gestartet</td>
                  <td className="px-4 py-3 text-sm text-teal-600">Kommentare anzeigen</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">ESG Chart</h2>
          </div>
          <div className="p-6">
            <ESGChart data={currentCategoryData.questions} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EsgCheck;
