import { Filter, X } from 'lucide-react';

interface MonthlyFilterProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function MonthlyFilter({ selectedMonth, onMonthChange }: MonthlyFilterProps) {
  // Generate last 12 months
  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = date.toISOString().slice(0, 7);
    const label = date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'short' 
    });
    months.push({ value, label });
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filtrar por mês</span>
        </div>
        {selectedMonth && (
          <button
            onClick={() => onMonthChange('')}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {months.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onMonthChange(value === selectedMonth ? '' : value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedMonth === value
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
