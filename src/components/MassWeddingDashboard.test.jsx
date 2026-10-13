import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MassWeddingDashboard from './MassWeddingDashboard';
import { DEFAULT_MASS_WEDDING_DATA } from '../data/massWeddingTemplates';

// Mock Recharts to avoid SVG rendering issues in JSDOM
vi.mock('recharts', () => {
  const OriginalRecharts = vi.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: () => <div data-testid="bar-chart" />,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    PieChart: () => <div data-testid="pie-chart" />,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  return {
    __esModule: true,
    default: new Proxy({}, {
      get: function(target, prop) {
        return () => <span data-testid={`icon-${prop}`}>{prop}</span>;
      }
    }),
    Printer: () => <span data-testid="icon-Printer">Printer</span>,
    ArrowRight: () => <span data-testid="icon-ArrowRight">ArrowRight</span>,
    FileSpreadsheet: () => <span data-testid="icon-FileSpreadsheet">FileSpreadsheet</span>,
    UserPlus: () => <span data-testid="icon-UserPlus">UserPlus</span>,
    UploadCloud: () => <span data-testid="icon-UploadCloud">UploadCloud</span>,
    Download: () => <span data-testid="icon-Download">Download</span>,
    Users2: () => <span data-testid="icon-Users2">Users2</span>,
    HeartHandshake: () => <span data-testid="icon-HeartHandshake">HeartHandshake</span>,
    Utensils: () => <span data-testid="icon-Utensils">Utensils</span>,
    Calendar: () => <span data-testid="icon-Calendar">Calendar</span>,
    Clock: () => <span data-testid="icon-Clock">Clock</span>,
    MapPin: () => <span data-testid="icon-MapPin">MapPin</span>,
    Sparkles: () => <span data-testid="icon-Sparkles">Sparkles</span>,
    CheckCircle2: () => <span data-testid="icon-CheckCircle2">CheckCircle2</span>,
    AlertCircle: () => <span data-testid="icon-AlertCircle">AlertCircle</span>,
    Plus: () => <span data-testid="icon-Plus">Plus</span>,
    Trash2: () => <span data-testid="icon-Trash2">Trash2</span>,
    Search: () => <span data-testid="icon-Search">Search</span>,
    Phone: () => <span data-testid="icon-Phone">Phone</span>,
    Share2: () => <span data-testid="icon-Share2">Share2</span>,
    Copy: () => <span data-testid="icon-Copy">Copy</span>,
    Check: () => <span data-testid="icon-Check">Check</span>,
    Filter: () => <span data-testid="icon-Filter">Filter</span>,
    ArrowUpRight: () => <span data-testid="icon-ArrowUpRight">ArrowUpRight</span>,
    ShieldCheck: () => <span data-testid="icon-ShieldCheck">ShieldCheck</span>,
    Building2: () => <span data-testid="icon-Building2">Building2</span>,
    Coins: () => <span data-testid="icon-Coins">Coins</span>,
    Droplets: () => <span data-testid="icon-Droplets">Droplets</span>,
    Coffee: () => <span data-testid="icon-Coffee">Coffee</span>,
    Flame: () => <span data-testid="icon-Flame">Flame</span>,
    Tent: () => <span data-testid="icon-Tent">Tent</span>,
    Award: () => <span data-testid="icon-Award">Award</span>,
    FileText: () => <span data-testid="icon-FileText">FileText</span>,
    MessageSquare: () => <span data-testid="icon-MessageSquare">MessageSquare</span>,
    ChevronRight: () => <span data-testid="icon-ChevronRight">ChevronRight</span>,
    Edit3: () => <span data-testid="icon-Edit3">Edit3</span>,
    Send: () => <span data-testid="icon-Send">Send</span>,
    Loader2: () => <span data-testid="icon-Loader2">Loader2</span>,
    Sliders: () => <span data-testid="icon-Sliders">Sliders</span>,
    RotateCcw: () => <span data-testid="icon-RotateCcw">RotateCcw</span>,
    X: () => <span data-testid="icon-X">X</span>,
    Edit2: () => <span data-testid="icon-Edit2">Edit2</span>,
    Radio: () => <span data-testid="icon-Radio">Radio</span>,
    QrCode: () => <span data-testid="icon-QrCode">QrCode</span>,
    Eye: () => <span data-testid="icon-Eye">Eye</span>,
  };
});

// Mock child components to speed up and simplify tests
vi.mock('./CommandBroadcastHub', () => ({
  default: () => <div data-testid="command-broadcast-hub" />
}));
vi.mock('./CommitteeQrModal', () => ({
  default: () => <div data-testid="committee-qr-modal" />
}));
vi.mock('./CommitteePortalView', () => ({
  default: () => <div data-testid="committee-portal-view" />
}));


describe('MassWeddingDashboard', () => {
  const mockOnUpdateData = vi.fn();
  const mockOnOpenSettings = vi.fn();
  const mockOnSwitchMode = vi.fn();
  const mockOnTabChange = vi.fn();

  const defaultProps = {
    data: DEFAULT_MASS_WEDDING_DATA,
    onUpdateData: mockOnUpdateData,
    onOpenSettings: mockOnOpenSettings,
    onSwitchMode: mockOnSwitchMode,
    isRtl: true,
    lang: 'ar',
    generateWithGemini: vi.fn(),
    activeTab: 'overview',
    onTabChange: mockOnTabChange
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and displays the default overview tab', () => {
    render(<MassWeddingDashboard {...defaultProps} />);

    // Check if a prominent element from overview is rendered
    expect(screen.getByText('العرسان المسجلون')).toBeInTheDocument();
    expect(screen.getByText('الضيوف المتوقعين')).toBeInTheDocument();
  });

  it('renders LTR correctly based on isRtl prop', () => {
    render(<MassWeddingDashboard {...defaultProps} isRtl={false} lang="en" />);

    // Check if LTR strings are displayed
    expect(screen.getByText('Registered Couples')).toBeInTheDocument();
    expect(screen.getByText('Expected Guests')).toBeInTheDocument();
  });

  it('calls onTabChange when navigating between tabs via buttons', async () => {
    const user = userEvent.setup();
    render(<MassWeddingDashboard {...defaultProps} />);

    // Find a button that triggers a tab change, for instance the "Open Catering Calculator" button
    const logisticsButton = screen.getByText('فتح حاسبة التموين وإضافة المواد 📋');

    await user.click(logisticsButton);

    expect(mockOnTabChange).toHaveBeenCalledWith('logistics');
  });

  it('calls onOpenSettings when the edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<MassWeddingDashboard {...defaultProps} />);

    const editButton = screen.getByTitle('تعديل بيانات العرس الجماعي');
    await user.click(editButton);

    expect(mockOnOpenSettings).toHaveBeenCalled();
  });
});
