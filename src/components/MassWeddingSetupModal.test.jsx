
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MassWeddingSetupModal from './MassWeddingSetupModal';

describe('MassWeddingSetupModal', () => {
  const mockInitialData = {
    title: 'Test Wedding',
    titleEn: '',
    organizer: 'Test Organizer',
    organizerEn: '',
    city: 'Test City',
    cityEn: '',
    location: 'Test Location',
    locationEn: '',
    date: '2023-12-31',
    targetCouples: 100,
    estimatedTotalBudget: 1000000,
    guestQuotaPerCouple: '',
    notes: 'Test Notes'
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnDeleteWedding = vi.fn();

  it('renders correctly with initial data in LTR mode', () => {
    render(
      <MassWeddingSetupModal
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onDeleteWedding={mockOnDeleteWedding}
        isRtl={false}
      />
    );

    // Check title
    expect(screen.getByText('Mass Wedding Setup')).toBeInTheDocument();

    // Check form fields are populated
    expect(screen.getByDisplayValue('Test Wedding')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Organizer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test City')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Location')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023-12-31')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Notes')).toBeInTheDocument();
  });

  it('renders correctly without initial data in RTL mode', () => {
    render(
      <MassWeddingSetupModal
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onDeleteWedding={mockOnDeleteWedding}
        isRtl={true}
      />
    );

    // Check title in RTL
    expect(screen.getByText('إعداد ملف العرس الجماعي')).toBeInTheDocument();
  });

  it('updates form fields on user input', () => {
    const { container } = render(
      <MassWeddingSetupModal
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onDeleteWedding={mockOnDeleteWedding}
        isRtl={false}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g., 10th Community Mass Wedding');
    fireEvent.change(titleInput, { target: { value: 'New Wedding' } });
    expect(titleInput.value).toBe('New Wedding');

    // More robust way: find by name
    const couplesInput = container.querySelector('input[name="targetCouples"]');
    fireEvent.change(couplesInput, { target: { value: '50' } });
    expect(couplesInput.value).toBe('50');
  });

  it('calls onSave with form data when submitted', () => {
    const { container } = render(
      <MassWeddingSetupModal
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onDeleteWedding={mockOnDeleteWedding}
        isRtl={false}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g., 10th Community Mass Wedding');
    fireEvent.change(titleInput, { target: { value: 'Updated Wedding' } });

    // Since the form submission might be prevented if not all required fields are valid/touched,
    // let's submit via the form element directly to bypass potentially missing required validations in the test mock
    const form = container.querySelector('form');
    fireEvent.submit(form);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      ...mockInitialData,
      title: 'Updated Wedding'
    }));
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <MassWeddingSetupModal
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isRtl={false}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onDeleteWedding when delete button is clicked', () => {
    render(
      <MassWeddingSetupModal
        onSave={mockOnSave}
        onDeleteWedding={mockOnDeleteWedding}
        isRtl={false}
      />
    );

    const deleteButton = screen.getByText('Reset & Create New');
    fireEvent.click(deleteButton);

    expect(mockOnDeleteWedding).toHaveBeenCalled();
  });
});
