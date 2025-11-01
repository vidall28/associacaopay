import { Calendar, DollarSign, CheckCircle } from 'lucide-react';
import type { Payment } from '@/shared/types';

interface PaymentCardProps {
  payment: Payment;
}

export default function PaymentCard({ payment }: PaymentCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {payment.member_name}
            </h3>
            <p className="text-green-600 font-medium">Mensalidade Paga</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold text-gray-900">
            {formatCurrency(payment.amount)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(payment.payment_date)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Registrado em {formatDate(payment.created_at)}
        </p>
      </div>
    </div>
  );
}
