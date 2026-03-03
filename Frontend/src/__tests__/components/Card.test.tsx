import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../../components/ui/Card';

describe('Card Component', () => {
  it('should render children content', () => {
    render(<Card>Card content</Card>);

    expect(screen.getByText(/card content/i)).toBeInTheDocument();
  });

  it('should apply base card styles', () => {
    const { container } = render(<Card>Content</Card>);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-background-secondary', 'rounded-lg', 'shadow-md');
  });

  it('should render multiple children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
      </Card>
    );

    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
  });

  it('should accept and apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('should render with padding', () => {
    const { container } = render(<Card>Content</Card>);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-4');
  });
});
