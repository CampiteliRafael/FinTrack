import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  // Mobile: 3 páginas, Desktop: 5 páginas
  const maxVisiblePages = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="min-w-[80px]"
      >
        <span className="hidden sm:inline">Anterior</span>
        <span className="sm:hidden">Ant</span>
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(1)}
            className="min-w-[44px]"
          >
            1
          </Button>
          {startPage > 2 && <span className="px-1 sm:px-2 text-foreground-tertiary">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onPageChange(page)}
          className="min-w-[44px]"
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-1 sm:px-2 text-foreground-tertiary">...</span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="min-w-[44px]"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="min-w-[80px]"
      >
        <span className="hidden sm:inline">Próxima</span>
        <span className="sm:hidden">Prox</span>
      </Button>
    </div>
  );
}
