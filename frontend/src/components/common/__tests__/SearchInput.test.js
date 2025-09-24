import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchInput from '../SearchInput';

describe('SearchInput Component', () => {
  test('renders with placeholder', () => {
    render(<SearchInput placeholder="Search items..." />);
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  test('displays initial value', () => {
    render(<SearchInput value="initial value" />);
    expect(screen.getByDisplayValue('initial value')).toBeInTheDocument();
  });

  test('calls onChange with debounced value', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    render(<SearchInput onChange={mockOnChange} debounceMs={100} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    // Should not call immediately
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Should call after debounce delay
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('test');
    }, { timeout: 200 });
  });

  test('shows clear button when there is text', async () => {
    const user = userEvent.setup();
    render(<SearchInput showClearButton={true} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    // Clear button should appear
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('clears input when clear button is clicked', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    render(<SearchInput onChange={mockOnChange} showClearButton={true} debounceMs={0} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    const clearButton = screen.getByRole('button');
    await user.click(clearButton);
    
    expect(input.value).toBe('');
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<SearchInput size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('py-2', 'px-3', 'text-sm');

    rerender(<SearchInput size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('py-3', 'px-4', 'text-lg');
  });

  test('focuses input when autoFocus is true', () => {
    render(<SearchInput autoFocus={true} />);
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  test('hides clear button when showClearButton is false', async () => {
    const user = userEvent.setup();
    render(<SearchInput showClearButton={false} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    // Clear button should not appear
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
