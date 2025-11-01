import { useState, useEffect, useMemo } from 'react';
import { Wallet, Users, TrendingUp, Search, Calendar, Filter, X } from 'lucide-react';

import PaymentCard from '@/react-app/components/PaymentCard';
import type { Payment } from '@/shared/types';
import { supabase } from '@/shared/supabase';

export default function Home() {
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    startDate: '',
    endDate: '',
    showFilters: false
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Buscar pagamentos do Supabase
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
      } else {
        setPayments(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  const clearFilters = () => {
    setFilters({
      name: '',
      startDate: '',
      endDate: '',
      showFilters: false
    });
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Filter by name
      const matchesName = !filters.name || 
        payment.member_name.toLowerCase().includes(filters.name.toLowerCase());

      // Filter by date range
      const paymentDate = payment.payment_date.split('T')[0]; // Get date part only
      const matchesStartDate = !filters.startDate || paymentDate >= filters.startDate;
      const matchesEndDate = !filters.endDate || paymentDate <= filters.endDate;

      return matchesName && matchesStartDate && matchesEndDate;
    });
  }, [payments, filters]);

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const uniqueMembers = new Set(filteredPayments.map(p => p.member_name)).size;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthPayments = filteredPayments.filter(p => p.payment_date.startsWith(thisMonth));

  const hasActiveFilters = filters.name || filters.startDate || filters.endDate;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin">
          <Wallet className="w-10 h-10 text-blue-600" />
        </div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AssociaçãoPay</h1>
                <p className="text-gray-600">Carteira Pública de Mensalidades</p>
              </div>
            </div>
            
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {hasActiveFilters ? 'Total Filtrado' : 'Total Arrecadado'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {hasActiveFilters ? 'Membros Filtrados' : 'Membros Contribuintes'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{uniqueMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {hasActiveFilters ? 'Resultados Encontrados' : 'Pagamentos Este Mês'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {hasActiveFilters ? filteredPayments.length : thisMonthPayments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Histórico de Pagamentos
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
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
                {filteredPayments.length} de {payments.length} pagamento{payments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Filters */}
          {filters.showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-2" />
                    Buscar por nome
                  </label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
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
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
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

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasActiveFilters ? 'Nenhum pagamento encontrado' : 'Nenhum pagamento registrado'}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Tente ajustar os filtros para encontrar o que você procura.'
                  : 'Comece adicionando o primeiro pagamento da associação.'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <X className="w-5 h-5" />
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </div>
      </main>

      
    </div>
  );
}
