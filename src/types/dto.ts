// Plain, JSON-serializable shapes for passing Prisma results (Decimal/Date)
// across the server -> client component boundary.

export type ServiceDTO = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
};

export type EmployeeDTO = {
  id: string;
  name: string;
  phone: string | null;
  isActive: boolean;
  serviceIds: string[];
  workSchedules: { dayOfWeek: number; startTime: string; endTime: string; isOff: boolean }[];
};

export type CustomerDTO = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  notes: string | null;
  totalVisits: number;
  totalSpent: number;
  lastVisitAt: string | null;
  preferredEmployeeId: string | null;
  preferredServiceId: string | null;
};

export type AppointmentDTO = {
  id: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
};
