import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have disabled attribute when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply primary variant classes by default', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-accent-primary');
  });

  it('should apply outline variant classes', () => {
    render(<Button variant="outline">Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'border-primary');
  });

  it('should apply small size classes', () => {
    render(<Button size="sm">Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  it('should render as button type by default', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should render as submit type when specified', () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
