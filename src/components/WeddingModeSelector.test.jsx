import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WeddingModeSelector from './WeddingModeSelector';

describe('WeddingModeSelector', () => {
  it('calls onSelectMode with "individual" when individual wedding mode is clicked', () => {
    const onSelectModeMock = vi.fn();
    render(<WeddingModeSelector onSelectMode={onSelectModeMock} isRtl={false} />);

    const individualButton = screen.getByText('👰 Individual Wedding').closest('div').parentElement;
    fireEvent.click(individualButton);

    expect(onSelectModeMock).toHaveBeenCalledWith('individual');
    expect(onSelectModeMock).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectMode with "mass" when mass wedding mode is clicked', () => {
    const onSelectModeMock = vi.fn();
    render(<WeddingModeSelector onSelectMode={onSelectModeMock} isRtl={false} />);

    const massButton = screen.getByText('👥 Community Mass Wedding').closest('div').parentElement;
    fireEvent.click(massButton);

    expect(onSelectModeMock).toHaveBeenCalledWith('mass');
    expect(onSelectModeMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close button is clicked (if provided)', () => {
    const onCloseMock = vi.fn();
    render(<WeddingModeSelector onClose={onCloseMock} isRtl={false} />);

    const closeButton = screen.getByText('Close & Keep Current');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose is not provided', () => {
    render(<WeddingModeSelector isRtl={false} />);

    const closeButton = screen.queryByText('Close & Keep Current');
    expect(closeButton).toBeNull();
  });

  it('renders correct text based on isRtl=true', () => {
    render(<WeddingModeSelector isRtl={true} />);

    expect(screen.getByText('كيف ترغب في استخدام تطبيق مراسيم؟')).toBeInTheDocument();
    expect(screen.getByText('👰 زواج فردي (شخصي)')).toBeInTheDocument();
    expect(screen.getByText('👥 عرس جماعي (خيري / مجتمعي)')).toBeInTheDocument();
  });

  it('renders correct text based on isRtl=false', () => {
    render(<WeddingModeSelector isRtl={false} />);

    expect(screen.getByText('How Would You Like to Use Maraseem?')).toBeInTheDocument();
    expect(screen.getByText('👰 Individual Wedding')).toBeInTheDocument();
    expect(screen.getByText('👥 Community Mass Wedding')).toBeInTheDocument();
  });

  it('applies correct styling for currentMode="individual"', () => {
    render(<WeddingModeSelector currentMode="individual" isRtl={false} />);

    const individualButton = screen.getByText('👰 Individual Wedding').closest('div').parentElement;
    expect(individualButton).toHaveClass('border-rose-500');
  });

  it('applies correct styling for currentMode="mass"', () => {
    render(<WeddingModeSelector currentMode="mass" isRtl={false} />);

    const massButton = screen.getByText('👥 Community Mass Wedding').closest('div').parentElement;
    expect(massButton).toHaveClass('border-amber-500');
  });
});
