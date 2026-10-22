import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MassWeddingSetupScreen from './MassWeddingSetupScreen';

describe('MassWeddingSetupScreen', () => {
  const defaultProps = {
    onSave: vi.fn(),
    onSwitchToIndividual: vi.fn(),
    onSwitchMode: vi.fn(),
    isRtl: false,
    lang: 'en',
    onToggleLang: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with empty initial data', () => {
    render(<MassWeddingSetupScreen {...defaultProps} />);

    // Check main title
    expect(screen.getByText('Plan a New Mass Wedding')).toBeInTheDocument();

    // Check all inputs are present and empty
    const titleInput = screen.getByPlaceholderText(/Community Charitable Mass Wedding/i);
    expect(titleInput).toHaveValue('');

    const organizerInput = screen.getByPlaceholderText(/Marriage Facilitation Committee/i);
    expect(organizerInput).toHaveValue('');

    const cityInput = screen.getByPlaceholderText(/Hadhramaut/i);
    expect(cityInput).toHaveValue('');

    const locationInput = screen.getByPlaceholderText(/Palace Grounds/i);
    expect(locationInput).toHaveValue('');

    const targetCouplesInput = screen.getByPlaceholderText(/24/i);
    expect(targetCouplesInput).toHaveValue(null);

    const budgetInput = screen.getByPlaceholderText(/15000000/i);
    expect(budgetInput).toHaveValue(null);

    const guestQuotaInput = screen.getByPlaceholderText(/35/i);
    expect(guestQuotaInput).toHaveValue(null);

    const notesInput = screen.getByPlaceholderText(/Write event motto/i);
    expect(notesInput).toHaveValue('');
  });

  it('renders correctly with provided initial data', () => {
    const initialData = {
      title: 'Initial Title',
      organizer: 'Initial Organizer',
      city: 'Initial City',
      location: 'Initial Location',
      date: '2024-12-31',
      targetCouples: 50,
      estimatedTotalBudget: 1000000,
      guestQuotaPerCouple: 20,
      notes: 'Initial notes',
    };

    render(<MassWeddingSetupScreen {...defaultProps} initialData={initialData} />);

    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Organizer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial City')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Location')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    expect(screen.getByDisplayValue(50)).toBeInTheDocument();
    expect(screen.getByDisplayValue(1000000)).toBeInTheDocument();
    expect(screen.getByDisplayValue(20)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial notes')).toBeInTheDocument();
  });

  it('renders correctly in RTL mode (Arabic)', () => {
    render(<MassWeddingSetupScreen {...defaultProps} isRtl={true} lang="ar" />);

    expect(screen.getByText('تنظيم زواج جماعي جديد')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/العرس الجماعي الخيري لشباب تريم/)).toBeInTheDocument();
  });

  it('updates state when typing into inputs', async () => {
    const user = userEvent.setup();
    render(<MassWeddingSetupScreen {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText(/Community Charitable Mass Wedding/i);
    await user.type(titleInput, 'New Event Title');
    expect(titleInput).toHaveValue('New Event Title');

    const couplesInput = screen.getByPlaceholderText(/24/i);
    await user.type(couplesInput, '100');
    expect(couplesInput).toHaveValue(100);

    const budgetInput = screen.getByPlaceholderText(/15000000/i);
    await user.type(budgetInput, '20000000');
    expect(budgetInput).toHaveValue(20000000);
  });

  it('calls onSave with form data when form is submitted', async () => {
    const user = userEvent.setup();
    render(<MassWeddingSetupScreen {...defaultProps} />);

    // Fill the required inputs
    await user.type(screen.getByPlaceholderText(/Community Charitable Mass Wedding/i), 'Test Event');
    await user.type(screen.getByPlaceholderText(/Marriage Facilitation Committee/i), 'Test Organizer');
    await user.type(screen.getByPlaceholderText(/Hadhramaut/i), 'Test City');
    await user.type(screen.getByPlaceholderText(/Palace Grounds/i), 'Test Location');

    const dateInput = document.querySelector('input[type="date"]');
    await user.type(dateInput, '2024-12-31');

    await user.type(screen.getByPlaceholderText(/24/i), '50');
    await user.type(screen.getByPlaceholderText(/15000000/i), '1000000');

    // Submit the form
    const form = document.querySelector('form');
    // Using fireEvent since the standard submit action with user.click sometimes fails to trigger
    // the onSubmit handler in testing library for complex forms
    fireEvent.submit(form);

    expect(defaultProps.onSave).toHaveBeenCalledWith({
      title: 'Test Event',
      organizer: 'Test Organizer',
      city: 'Test City',
      location: 'Test Location',
      date: '2024-12-31',
      targetCouples: 50,
      estimatedTotalBudget: 1000000,
      guestQuotaPerCouple: '',
      notes: ''
    });
  });

  it('calls onToggleLang when language button is clicked', async () => {
    const user = userEvent.setup();
    render(<MassWeddingSetupScreen {...defaultProps} />);

    const toggleLangBtn = screen.getByTitle('التبديل للعربية');
    await user.click(toggleLangBtn);

    expect(defaultProps.onToggleLang).toHaveBeenCalledTimes(1);
  });

  it('calls onSwitchToIndividual when switch to individual link is clicked', async () => {
    const user = userEvent.setup();
    render(<MassWeddingSetupScreen {...defaultProps} />);

    const switchToIndividualBtn = screen.getByRole('button', { name: /Switch to Individual Wedding/i });
    await user.click(switchToIndividualBtn);

    expect(defaultProps.onSwitchToIndividual).toHaveBeenCalledTimes(1);
  });

  it('calls onSwitchMode when change mode link is clicked', async () => {
    const user = userEvent.setup();
    render(<MassWeddingSetupScreen {...defaultProps} />);

    const switchModeBtn = screen.getByRole('button', { name: /Change Mode/i });
    await user.click(switchModeBtn);

    expect(defaultProps.onSwitchMode).toHaveBeenCalledTimes(1);
  });
});