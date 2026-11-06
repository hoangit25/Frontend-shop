interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Thuật toán tính danh sách số trang hiển thị với dấu chấm lửng
  const getPageNumbers = (): (number | string)[] => {
    const delta = 1; // Số trang lân cận xung quanh currentPage

    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-2">
      {/* Thông tin số lượng sản phẩm */}
      <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
        Hiển thị trang <span className="font-semibold text-gray-700">{currentPage}</span> /{' '}
        <span className="font-semibold text-gray-700">{totalPages}</span>
        {totalItems !== undefined && (
          <span className="ml-1 text-gray-400">({totalItems} sản phẩm)</span>
        )}
      </div>

      {/* Nút phân trang */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Nút về trang trước */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="
            min-w-9 h-9 px-2 rounded-lg border
            flex items-center justify-center text-xs font-medium
            transition-all duration-200
            border-gray-200 text-gray-600 bg-white
            hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200
          "
          title="Trang trước"
          aria-label="Trang trước"
        >
          <i className="fas fa-chevron-left text-[11px]" />
        </button>

        {/* Các số trang */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`dots-${idx}`}
                className="w-8 h-9 flex items-center justify-center text-gray-400 text-xs font-medium select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading || isActive}
              className={`
                min-w-9 h-9 px-3 rounded-lg text-xs font-semibold
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 border border-orange-500'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                }
                disabled:cursor-default
              `}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Nút sang trang sau */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="
            min-w-9 h-9 px-2 rounded-lg border
            flex items-center justify-center text-xs font-medium
            transition-all duration-200
            border-gray-200 text-gray-600 bg-white
            hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200
          "
          title="Trang sau"
          aria-label="Trang sau"
        >
          <i className="fas fa-chevron-right text-[11px]" />
        </button>
      </div>
    </div>
  );
}
