import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { Check, Clock, User } from 'lucide-react';

interface RaffleTicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
}

export const RaffleTicketCard: React.FC<RaffleTicketCardProps> = ({ ticket, onClick }) => {
  // Public View Logic:
  // System Locked Sold looks exactly like Real Sold
  const isSold = ticket.status === TicketStatus.SOLD || ticket.status === TicketStatus.SYSTEM_LOCKED_SOLD;
  
  // System Locked Pending looks exactly like Real Pending
  const isPending = ticket.status === TicketStatus.PENDING_USER || ticket.status === TicketStatus.SYSTEM_LOCKED_PENDING;
  
  const isAvailable = ticket.status === TicketStatus.AVAILABLE;

  let bgClass = "bg-white border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer";
  let textClass = "text-slate-800";
  let icon = null;

  if (isSold) {
    bgClass = "bg-red-50 border-red-200 opacity-90 cursor-not-allowed";
    textClass = "text-red-800";
    icon = <User className="w-4 h-4" />;
  } else if (isPending) {
    bgClass = "bg-amber-50 border-amber-200 cursor-not-allowed";
    textClass = "text-amber-800";
    icon = <Clock className="w-4 h-4" />;
  } else {
    bgClass = "bg-white border-green-200 shadow-sm hover:shadow-md hover:scale-105 hover:border-green-400 transition-all cursor-pointer";
    textClass = "text-green-800 font-bold";
    icon = <Check className="w-4 h-4 text-green-500" />;
  }

  // Don't allow clicking if it's not available
  const handleClick = () => {
    if (isAvailable) {
      onClick(ticket);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 aspect-[4/3] ${bgClass}`}
    >
      <span className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isSold ? 'text-red-400' : 'text-slate-400'}`}>
        #{ticket.id.toString().padStart(2, '0')}
      </span>
      <h3 className={`text-lg font-bold text-center leading-tight truncate w-full ${textClass}`}>
        {ticket.name}
      </h3>
      <div className="absolute top-2 right-2 opacity-50">
        {icon}
      </div>
      
      {isSold && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/10 rounded-xl backdrop-blur-[1px]">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full rotate-[-12deg] shadow-sm">
            VENDIDO
          </span>
        </div>
      )}
      
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-900/5 rounded-xl">
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            PENDENTE
          </span>
        </div>
      )}
    </div>
  );
};