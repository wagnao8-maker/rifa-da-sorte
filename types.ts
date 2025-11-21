export enum TicketStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING_USER = 'PENDING_USER', // Reserved by a real user waiting for confirmation
  SOLD = 'SOLD', // Real verified sale
  
  // System locked statuses (The "25 items" rule)
  SYSTEM_LOCKED_PENDING = 'SYSTEM_LOCKED_PENDING', // Locked, looks like Pending to public
  SYSTEM_LOCKED_SOLD = 'SYSTEM_LOCKED_SOLD' // Locked, looks like Sold to public
}

export interface Ticket {
  id: number;
  name: string;
  status: TicketStatus;
  buyerName?: string;
  buyerPhone?: string;
  updatedAt?: Date;
}

export interface UserReservationData {
  name: string;
  phone: string;
}