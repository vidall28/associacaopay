import { useState, useEffect, useMemo } from 'react';
import { Shield, LogOut, Plus, Users, Wallet, DollarSign, TrendingUp } from 'lucide-react';
import PaymentModal from '@/react-app/components/PaymentModal';
import MemberModal from '@/react-app/components/MemberModal';
import MembersList from '@/react-app/components/MembersList';
import PaymentCard from '@/react-app/components/PaymentCard';
import DateFilter from '@/react-app/components/DateFilter';
import LoginModal from '@/react-app/components/LoginModal';
import type { Payment, Member } from '@/shared/types';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    startDate: '',
    endDate: '',
    showFilters: false
  });

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      setAuthToken(storedToken);
      checkAuth(storedToken);
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchData();
    }
  }, [isAuthenticated, authToken]);

  const checkAuth = async (token?: string) => {
    const tokenToCheck = token || authToken;
    if (!tokenToCheck) {
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': `Bearer ${tokenToCheck}`
        }
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        setAuthToken(tokenToCheck);
        localStorage.setItem('admin_token', tokenToCheck);
      } else {
        setIsAuthenticated(false);
        setAuthToken(null);
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setAuthToken(null);
      localStorage.removeItem('admin_token');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setAuthToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem('admin_token', data.token);
        return true;
      } else {
        throw new Error(data.error || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch('/api/admin/logout', { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsAuthenticated(false);
      setAuthToken(null);
      localStorage.removeItem('admin_token');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paymentsRes, membersRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/members')
      ]);
      
      const paymentsData = await paymentsRes.json();
      const membersData = await membersRes.json();
      
      setPayments(paymentsData.payments || []);
      setMembers(membersData.members || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    if (!authToken) {
      throw new Error('Token de autenticação não encontrado');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expirado ou inválido
      setIsAuthenticated(false);
      setAuthToken(null);
      localStorage.removeItem('admin_token');
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    return response;
  };

  const handleAddPayment = async (paymentData: { member_name: string; amount: number; payment_date: string }) => {
    try {
      const response = await makeAuthenticatedRequest('/api/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar pagamento');
      }
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      throw error;
    }
  };

  const handleAddMember = async (memberData: { name: string; email?: string; phone?: string }) => {
    try {
      const response = await makeAuthenticatedRequest('/api/members', {
        method: 'POST',
        body: JSON.stringify(memberData)
      });

      if (response.ok) {
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar membro');
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      throw error;
    }
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
  const hasActiveFilters = filters.name || filters.startDate || filters.endDate;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin">
          <Shield className="w-10 h-10 text-blue-600" />
        </div>
        <p className="mt-4 text-gray-600">Verificando autenticação...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin">
          <Shield className="w-10 h-10 text-blue-600" />
        </div>
        <p className="mt-4 text-gray-600">Carregando dados...</p>
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
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600">Gestão da AssociaçãoPay</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Administrador</p>
                <p className="text-xs text-gray-500">Conectado</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg font-semibold">Adicionar Pagamento</span>
          </button>
          
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Users className="w-6 h-6" />
            <span className="text-lg font-semibold">Adicionar Membro</span>
          </button>
        </div>

        {/* Date Filter */}
        <DateFilter 
          filters={filters}
          onFiltersChange={setFilters}
          totalResults={filteredPayments.length}
          totalItems={payments.length}
        />

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
                  {hasActiveFilters ? 'Membros Filtrados' : 'Total de Membros'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {hasActiveFilters ? uniqueMembers : members.length}
                </p>
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
                  {hasActiveFilters ? 'Resultados Encontrados' : 'Total de Pagamentos'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {hasActiveFilters ? 'Pagamentos Filtrados' : 'Histórico de Pagamentos'}
            </h2>
            
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {hasActiveFilters ? 'Nenhum pagamento encontrado com os filtros aplicados' : 'Nenhum pagamento registrado'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredPayments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            )}
          </div>

          {/* Members */}
          <MembersList 
            members={members} 
            onRefresh={fetchData}
            makeAuthenticatedRequest={makeAuthenticatedRequest}
          />
        </div>
      </main>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handleAddPayment}
        members={members}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
}
