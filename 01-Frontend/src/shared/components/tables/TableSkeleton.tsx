import { Skeleton } from "../ui";

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
}

export const TableSkeleton = ({
  rowCount = 5,
  columnCount = 5,
}: TableSkeletonProps) => {
  return (
    <div className="table-container">
      <div className="table-inner-container">
        {/* Top bar skeleton */}
        <div className="table-top-bar">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-36" /> {/* Column visibility selector */}
            <Skeleton className="h-9 w-48" /> {/* Search input */}
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24" /> {/* New button */}
          </div>
        </div>

        {/* Table skeleton */}
        <div className="table-wrapper">
          <table className="custom-table w-full">
            <thead className="table-thead">
              <tr className="table-row">
                {Array.from({ length: columnCount }).map((_, index) => (
                  <th key={`header-${index}`} className="table-cell">
                    <Skeleton className="h-8 w-full" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="table-row">
                  {Array.from({ length: columnCount }).map((_, colIndex) => (
                    <td key={`cell-${rowIndex}-${colIndex}`} className="table-cell">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" /> {/* Page size selector */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" /> {/* First page button */}
            <Skeleton className="h-8 w-8" /> {/* Previous page button */}
            <Skeleton className="h-8 w-24" /> {/* Page indicator */}
            <Skeleton className="h-8 w-8" /> {/* Next page button */}
            <Skeleton className="h-8 w-8" /> {/* Last page button */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;