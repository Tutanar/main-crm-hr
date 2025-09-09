import React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableHeaderProps {
  field: string;
  currentSort?: {
    field: string;
    direction: SortDirection;
  };
  onSort: (field: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  currentSort,
  onSort,
  children,
  className = ''
}) => {
  const getSortIcon = () => {
    if (currentSort?.field !== field) {
      return '↕️'; // Нет сортировки
    }
    
    switch (currentSort.direction) {
      case 'asc':
        return '↑'; // По возрастанию
      case 'desc':
        return '↓'; // По убыванию
      default:
        return '↕️';
    }
  };

  const handleClick = () => {
    onSort(field);
  };

  return (
    <th 
      className={`cursor-pointer hover:bg-gray-100 select-none ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <span className="text-sm">{getSortIcon()}</span>
      </div>
    </th>
  );
};

// Хук для управления сортировкой
export const useSorting = (initialField?: string, initialDirection: SortDirection = 'asc') => {
  const [sort, setSort] = React.useState<{
    field: string;
    direction: SortDirection;
  }>({
    field: initialField || '',
    direction: initialDirection
  });

  const handleSort = (field: string) => {
    setSort(prevSort => {
      if (prevSort.field === field) {
        // Переключаем направление: asc -> desc -> null -> asc
        switch (prevSort.direction) {
          case 'asc':
            return { field, direction: 'desc' };
          case 'desc':
            return { field, direction: null };
          default:
            return { field, direction: 'asc' };
        }
      } else {
        // Новое поле - начинаем с возрастания
        return { field, direction: 'asc' };
      }
    });
  };

  const getSortOrder = () => {
    if (!sort.direction) return null;
    
    return {
      [sort.field]: sort.direction
    };
  };

  return {
    sort,
    handleSort,
    getSortOrder
  };
};