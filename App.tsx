import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from './types';
import { RAFFLE_NAMES } from './constants';
import { RaffleTicketCard } from './components/RaffleTicketCard';
import { ReservationModal } from './components/ReservationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { Button } from './components/ui/Button';
import { Ticket as TicketIcon, LogIn, UserCog } from 'lucide-react';

const INITIAL_LOCKED_COUNT = 25;

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [pixKey, setPixKey] = useState<string>('12345678900'); // Default PIX key
  
  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const [initialized, setInitialized] = useState(false);

  // Initialize the Raffle
  useEffect(() => {
    if (initialized) return;

    const initialTickets: Ticket[] = RAFFLE_NAMES.map((name, index) => ({
      id: index + 1,
      name: name,
      status: TicketStatus.AVAILABLE,
    }));

    // Logic: "25 names will be locked"
    const shuffledIndices = [...Array(50).keys()].sort(() => 0.5 - Math.random());
    const indicesToLock = shuffledIndices.slice(0, INITIAL_LOCKED_COUNT);

    indicesToLock.forEach(index => {
      const isFakeSold = Math.random() > 0.5;
      initialTickets[index].status = isFakeSold 
        ? TicketStatus.SYSTEM_LOCKED_SOLD 
        : TicketStatus.SYSTEM_LOCKED_PENDING;
    });

    setTickets(initialTickets);
    setInitialized(true);
  }, [initialized]);

  // --- Authentication ---

  const handleLogin = (email: string, pass: string) => {
    // Hardcoded credentials as requested
    if (email === 'wagnao8@gmail.com' && pass === 'pinda92monhangaba') {
      setIsAdminLoggedIn(true);
      setIsLoginOpen(false);
      setIsAdminOpen(true); // Open admin immediately upon login
    } else {
      alert("Credenciais inválidas");
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminOpen(false);
  };

  // --- Actions ---

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleReservationConfirm = (name: string, phone: string) => {
    if (!selectedTicket) return;

    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: TicketStatus.PENDING_USER,
          buyerName: name,
          buyerPhone: phone,
          updatedAt: new Date()
        };
      }
      return t;
    }));
    
    // Note: Modal stays open in 'success' state (handled by ReservationModal)
  };

  // --- Admin Logic ---

  const releaseOneSystemLockedTicket = (currentTickets: Ticket[]): Ticket[] => {
    const systemLockedTickets = currentTickets.filter(t => 
      t.status === TicketStatus.SYSTEM_LOCKED_PENDING || 
      t.status === TicketStatus.SYSTEM_LOCKED_SOLD
    );
    
    if (systemLockedTickets.length === 0) return currentTickets;

    const randomIndex = Math.floor(Math.random() * systemLockedTickets.length);
    const ticketToRelease = systemLockedTickets[randomIndex];

    return currentTickets.map(t => {
      if (t.id === ticketToRelease.id) {
        return { ...t, status: TicketStatus.AVAILABLE };
      }
      return t;
    });
  };

  const handleAdminApprove = (id: number) => {
    setTickets(prev => {
      let updatedTickets = prev.map(t => 
        t.id === id ? { ...t, status: TicketStatus.SOLD } : t
      );
      updatedTickets = releaseOneSystemLockedTicket(updatedTickets);
      return updatedTickets;
    });
  };

  const handleAdminReject = (id: number) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: TicketStatus.AVAILABLE,
          buyerName: undefined,
          buyerPhone: undefined
        };
      }
      return t;
    }));
  };

  const handleAdminReset = (id: number) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: TicketStatus.AVAILABLE,
          buyerName: undefined,
          buyerPhone: undefined
        };
      }
      return t;
    }));
  };

  const soldCount = tickets.filter(t => t.status === TicketStatus.SOLD || t.status === TicketStatus.SYSTEM_LOCKED_SOLD).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <TicketIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Rifa da Sorte</h1>
              <span className="text-xs text-slate-500 font-medium">Edição Nomes Especiais</span>
            </div>
          </div>
          
          {/* Logic for Admin Button */}
          {isAdminLoggedIn ? (
            <Button variant="outline" size="sm" onClick={() => setIsAdminOpen(true)}>
              <UserCog size={16} className="mr-2" />
              Painel
            </Button>
          ) : (
             <Button variant="outline" size="sm" onClick={() => setIsLoginOpen(true)}>
              <LogIn size={16} className="mr-2" />
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white border-2 border-green-400 shadow-sm"></span>
            Disponível
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span>
            Pendente / Reservado
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 shadow-sm"></span>
            Vendido
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tickets.map(ticket => (
            <RaffleTicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onClick={handleTicketClick} 
            />
          ))}
        </div>

        {/* Stats Summary Footer */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
          <h3 className="text-slate-500 uppercase text-xs font-bold tracking-wider mb-2">Progresso da Ação</h3>
          <div className="w-full bg-slate-100 rounded-full h-4 mb-4 overflow-hidden">
             <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${(soldCount / 50) * 100}%` }}
             ></div>
          </div>
          <p className="text-slate-900 font-medium">
            {soldCount} de 50 nomes vendidos
          </p>
        </div>

      </main>

      {/* Modals */}
      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticket={selectedTicket}
        pixKey={pixKey}
        onConfirm={handleReservationConfirm}
      />

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      {isAdminOpen && (
        <AdminDashboard 
          tickets={tickets}
          pixKey={pixKey}
          onUpdatePix={setPixKey}
          onClose={() => setIsAdminOpen(false)} // Just close modal, don't logout
          onApprove={handleAdminApprove}
          onReject={handleAdminReject}
          onReset={handleAdminReset}
        />
      )}
    </div>
  );
};

export default App;