// @ts-nocheck
// Personel Modülü - Tipler
export interface ShiftAssignment {
  id: string;
  userId: string;
  shiftId: string;
  date: string;
  status: 'scheduled' | 'completed' | 'absent' | 'on_leave';
}

export interface TimeEntry {
  id: string;
  userId: string;
  clockIn: string;
  clockOut?: string;
  totalHours: number;
}
