import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="flex flex-1 items-center justify-between">
        {/* Showing X-Y of Z */}
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex}</span> to{' '}
            <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{total}</span> users
          </p>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            icon={<ChevronLeft size={16} />}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            iconRight={<ChevronRight size={16} />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
