import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../types';
import { Button } from './ui/Button';
import { CheckCircle, XCircle, Trash2, RefreshCw, Lock, CreditCard, Save } from 'lucide-react';

interface AdminDashboardProps {
  tickets: Ticket[];
  pixKey: string;
  onUpdatePix: (key: string) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onReset: (id: number) => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  tickets, 
  pixKey,
  onUpdatePix,
  onApprove, 
  onReject, 
  onReset,
  onClose 
}) => {
  const [editingPix, setEditingPix] = useState(pixKey);
  const [savedMsg, setSavedMsg] = useState(false);

  // Calculate stats
  const soldCount = tickets.filter(t => t.status === TicketStatus.SOLD).length;
  const pendingUserCount = tickets.filter(t => t.status === TicketStatus.PENDING_USER).length;
  const systemLockedCount = tickets.filter(t => t.status === TicketStatus.SYSTEM_LOCKED_PENDING || t.status === TicketStatus.SYSTEM_LOCKED_SOLD).length;
  const availableCount = tickets.filter(t => t.status === TicketStatus.AVAILABLE).length;

  // Sort: User Pending first, then Real Sold, then System Locked, then Available
  const sortedTickets = [...tickets].sort((a, b) => {
    const priority = {
      [TicketStatus.PENDING_USER]: 0,
      [TicketStatus.SOLD]: 1,
      [TicketStatus.SYSTEM_LOCKED_PENDING]: 2,
      [TicketStatus.SYSTEM_LOCKED_SOLD]: 2,
      [TicketStatus.AVAILABLE]: 3,
    };
    return priority[a.status] - priority[b.status];
  });

  const handleSavePix = () => {
    onUpdatePix(editingPix);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 shadow-lg flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold">Painel Administrativo</h2>
          <p className="text-xs text-slate-400">Gerenciamento da Rifa</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Sair do Admin
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Pix Config Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Configuração de Pagamento</h3>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-1">Chave PIX (Copia e Cola/Email/Telefone)</label>
              <input 
                type="text" 
                value={editingPix}
                onChange={(e) => setEditingPix(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Digite a chave PIX aqui..."
              />
            </div>
            <Button onClick={handleSavePix} disabled={savedMsg}>
              {savedMsg ? <CheckCircle size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
              {savedMsg ? 'Salvo!' : 'Salvar PIX'}
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Disponíveis</p>
            <p className="text-3xl font-bold text-green-800 mt-1">{availableCount}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Pendente (Real)</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">{pendingUserCount}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm">
            <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Travados (Sistema)</p>
            <p className="text-3xl font-bold text-orange-800 mt-1">{systemLockedCount}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Vendas Reais</p>
            <p className="text-3xl font-bold text-red-800 mt-1">{soldCount}</p>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50">
             <h3 className="font-bold text-slate-700">Gerenciamento de Bilhetes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Nome da Rifa</th>
                  <th className="px-4 py-3">Status Real</th>
                  <th className="px-4 py-3">Comprador</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">#{ticket.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{ticket.name}</td>
                    <td className="px-4 py-3">
                      {ticket.status === TicketStatus.SOLD && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Vendido (Real)
                        </span>
                      )}
                      {ticket.status === TicketStatus.PENDING_USER && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">
                          Aguardando Aprovação
                        </span>
                      )}
                      {ticket.status === TicketStatus.SYSTEM_LOCKED_PENDING && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Lock className="w-3 h-3 mr-1" /> Travado (Visual Pendente)
                        </span>
                      )}
                      {ticket.status === TicketStatus.SYSTEM_LOCKED_SOLD && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          <Lock className="w-3 h-3 mr-1" /> Travado (Visual Vendido)
                        </span>
                      )}
                      {ticket.status === TicketStatus.AVAILABLE && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Disponível
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ticket.buyerName ? (
                        <div>
                          <p className="font-medium text-slate-900">{ticket.buyerName}</p>
                          <p className="text-slate-500 text-xs">{ticket.buyerPhone}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {ticket.status === TicketStatus.PENDING_USER && (
                          <>
                            <button 
                              onClick={() => onApprove(ticket.id)}
                              className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
                              title="Aprovar Venda (Libera um travado)"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => onReject(ticket.id)}
                              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                              title="Rejeitar / Cancelar"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        
                        {(ticket.status === TicketStatus.SOLD || 
                          ticket.status === TicketStatus.SYSTEM_LOCKED_PENDING || 
                          ticket.status === TicketStatus.SYSTEM_LOCKED_SOLD) && (
                           <button 
                             onClick={() => onReset(ticket.id)}
                             className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                             title="Liberar para Disponível"
                           >
                             <RefreshCw size={18} />
                           </button>
                        )}
                        
                        {ticket.status === TicketStatus.AVAILABLE && (
                          <button 
                            onClick={() => onReset(ticket.id)} 
                            className="p-1.5 text-slate-300 hover:text-slate-500"
                            disabled
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};