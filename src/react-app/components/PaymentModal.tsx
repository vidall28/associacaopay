import { useState, useRef, useEffect } from 'react';
import { X, DollarSign, Calendar, User, ChevronDown } from 'lucide-react';
import type { Member } from '@/shared/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { member_name: string; amount: number; payment_date: string }) => Promise<void>;
  members?: Member[];
}

export default function PaymentModal({ isOpen, onClose, onSubmit, members = [] }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    member_name: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formData.member_name.length > 0) {
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(formData.member_name.toLowerCase())
      );
      setFilteredMembers(filtered);
      
      // Não mostrar sugestões se o nome corresponder exatamente a um membro
      const exactMatch = members.some(member => 
        member.name.toLowerCase() === formData.member_name.toLowerCase()
      );
      setShowSuggestions(filtered.length > 0 && !exactMatch);
    } else {
      setShowSuggestions(false);
    }
  }, [formData.member_name, members]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        member_name: formData.member_name,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date
      });
      
      setFormData({
        member_name: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectMember = (memberName: string) => {
    setFormData(prev => ({ ...prev, member_name: memberName }));
    setShowSuggestions(false);
    nameInputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Adicionar Pagamento
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome do Membro
            </label>
            <div className="relative">
              <input
                ref={nameInputRef}
                type="text"
                required
                value={formData.member_name}
                onChange={(e) => setFormData(prev => ({ ...prev, member_name: e.target.value }))}
                onFocus={() => {
                  if (formData.member_name.length > 0 && filteredMembers.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Digite o nome do membro"
                autoComplete="off"
              />
              {members.length > 0 && (
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              )}
            </div>

            {showSuggestions && filteredMembers.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => selectMember(member.name)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{member.name}</div>
                    {member.email && (
                      <div className="text-sm text-gray-500">{member.email}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data do Pagamento
            </label>
            <input
              type="date"
              required
              value={formData.payment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
