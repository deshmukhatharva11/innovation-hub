import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Badge from '../Badge';
import { FiCheck } from 'react-icons/fi';

describe('Badge Component', () => {
  test('renders badge with text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-100', 'text-green-800');

    rerender(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-100', 'text-red-800');

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('px-2', 'py-1', 'text-xs');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1.5', 'text-base');
  });

  test('renders with icon', () => {
    render(<Badge icon={FiCheck}>With Icon</Badge>);
    expect(screen.getByText('With Icon')).toBeInTheDocument();
    // Icon should be present (though we can't easily test the actual icon rendering)
  });

  test('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });

  test('renders status-specific variants correctly', () => {
    const { rerender } = render(<Badge variant="pending">Pending</Badge>);
    expect(screen.getByText('Pending')).toHaveClass('bg-yellow-100', 'text-yellow-800');

    rerender(<Badge variant="endorsed">Endorsed</Badge>);
    expect(screen.getByText('Endorsed')).toHaveClass('bg-green-100', 'text-green-800');

    rerender(<Badge variant="rejected">Rejected</Badge>);
    expect(screen.getByText('Rejected')).toHaveClass('bg-red-100', 'text-red-800');

    rerender(<Badge variant="accepted">Accepted</Badge>);
    expect(screen.getByText('Accepted')).toHaveClass('bg-blue-100', 'text-blue-800');
  });
});
