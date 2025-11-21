import React, { useState, useEffect } from 'react';
import { Ticket } from '../types';
import { Button } from './ui/Button';
import { X, Copy, CheckCircle, QrCode } from 'lucide-react';

interface ReservationModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  pixKey: string;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ 
  ticket, 
  isOpen, 
  pixKey,
  onClose, 
  onConfirm 
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [copied, setCopied] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setName('');
      setPhone('');
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      onConfirm(name, phone);
      setStep('success');
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onClose();
  };

  // Use a public API to generate the QR Code image from the pixKey string
  // Note: For best results, the pixKey should be a full "Copia e Cola" code (starts with 000201...), 
  // but it also works visually for simple keys (email, CPF).
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent(pixKey)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center ${step === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>
          <h3 className="text-white font-bold text-lg">
            {step === 'success' ? 'Reserva Realizada!' : `Reservar: ${ticket.name}`}
          </h3>
          <button onClick={handleClose} className="text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
              <p>Você está reservando o número <strong>#{ticket.id} - {ticket.name}</strong>.</p>
              <p className="mt-1">Preencha seus dados para receber as informações de pagamento.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Seu Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: João da Silva"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">WhatsApp / Telefone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: (11) 99999-9999"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" fullWidth onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Confirmar e Ver PIX
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-6 flex flex-col items-center text-center space-y-6">
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-slate-900">Pagamento Pendente</h4>
              <p className="text-sm text-slate-600">
                Escaneie o QR Code ou copie a chave abaixo para pagar.
              </p>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-slate-100 rounded-xl shadow-sm">
               {pixKey ? (
                 <img 
                   src={qrCodeUrl} 
                   alt="QR Code Pix" 
                   className="w-40 h-40 object-contain mix-blend-multiply"
                   loading="lazy"
                 />
               ) : (
                 <div className="w-40 h-40 flex items-center justify-center bg-slate-100 rounded text-slate-400">
                   <QrCode size={48} />
                 </div>
               )}
               <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">QR Code Pagamento</p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold mb-2">Chave PIX (Copia e Cola)</p>
              <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg">
                <code className="flex-1 text-sm font-mono truncate text-slate-800 select-all">{pixKey}</code>
                <button 
                  onClick={handleCopyPix}
                  className={`p-2 rounded-md transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  title="Copiar"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
              {copied && <p className="text-xs text-green-600 mt-1 font-medium">Chave copiada!</p>}
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-xs text-amber-800 w-full">
              ⚠️ Envie o comprovante para o administrador pelo WhatsApp para validar sua compra.
            </div>

            <Button variant="primary" fullWidth onClick={handleClose}>
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};