import { useState } from 'react';
import { Users, Edit2, Trash2, Mail, Phone, Search } from 'lucide-react';
import MemberModal from './MemberModal';
import type { Member } from '@/shared/types';
import { supabase } from '@/shared/supabase';

interface MembersListProps {
  members: Member[];
  onRefresh: () => void;
}

export default function MembersList({ members, onRefresh }: MembersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditMember = async (memberData: { name: string; email?: string; phone?: string }) => {
    if (!editingMember) return;

    try {
      const { error } = await supabase
        .from('members')
        .update({
          name: memberData.name,
          email: memberData.email || null,
          phone: memberData.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMember.id);

      if (error) {
        console.error('Erro ao atualizar membro:', error);
        throw new Error(error.message || 'Erro ao atualizar membro');
      }

      onRefresh();
      setEditingMember(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      throw error;
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm('Tem certeza que deseja desativar este membro?')) return;

    try {
      const { error } = await supabase
        .from('members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) {
        console.error('Erro ao desativar membro:', error);
        throw new Error(error.message || 'Erro ao desativar membro');
      }

      onRefresh();
    } catch (error) {
      console.error('Erro ao desativar membro:', error);
    }
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingMember(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Lista de Membros</h2>
          <span className="text-sm text-gray-500">{filteredMembers.length} membros</span>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar membro..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <div className="mt-1 space-y-1">
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar membro"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Desativar membro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MemberModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleEditMember}
        member={editingMember}
      />
    </>
  );
}
