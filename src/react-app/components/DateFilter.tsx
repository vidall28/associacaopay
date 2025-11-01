import { Search, Calendar, Filter, X } from 'lucide-react';

interface FilterState {
  name: string;
  startDate: string;
  endDate: string;
  showFilters: boolean;
}

interface DateFilterProps {
  filters: FilterState;
  onFiltersChange: (updater: FilterState | ((prev: FilterState) => FilterState)) => void;
  totalResults: number;
  totalItems: number;
}

export default function DateFilter({ filters, onFiltersChange, totalResults, totalItems }: DateFilterProps) {
  const clearFilters = () => {
    onFiltersChange({
      name: '',
      startDate: '',
      endDate: '',
      showFilters: false
    });
  };

  const hasActiveFilters = filters.name || filters.startDate || filters.endDate;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onFiltersChange((prev: FilterState) => ({ ...prev, showFilters: !prev.showFilters }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              filters.showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {(filters.name ? 1 : 0) + (filters.startDate ? 1 : 0) + (filters.endDate ? 1 : 0)}
              </span>
            )}
          </button>
          <span className="text-sm text-gray-500">
            {totalResults} de {totalItems} pagamento{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      {filters.showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Buscar por nome
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => onFiltersChange((prev: FilterState) => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do membro..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data inicial
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onFiltersChange((prev: FilterState) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data final
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onFiltersChange((prev: FilterState) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
