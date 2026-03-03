import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../components/ui/Input';

describe('Input Component', () => {
  it('should render input with label', () => {
    render(<Input label="Email" />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render error message when error prop is provided', () => {
    render(<Input label="Email" error="Email is required" />);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('should apply error styles when error exists', () => {
    render(<Input label="Email" error="Error" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-accent-danger');
  });

  it('should call onChange when user types', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input label="Email" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should accept value prop', () => {
    render(<Input label="Email" value="test@example.com" onChange={vi.fn()} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test@example.com');
  });

  it('should render with placeholder', () => {
    render(<Input label="Email" placeholder="Enter your email" />);

    const input = screen.getByPlaceholderText(/enter your email/i);
    expect(input).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input label="Email" disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should render with correct type attribute', () => {
    render(<Input label="Password" type="password" />);

    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should not render error message when no error', () => {
    render(<Input label="Email" />);

    const errorElement = screen.queryByRole('alert');
    expect(errorElement).not.toBeInTheDocument();
  });
});
