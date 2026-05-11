import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(date: string | Date, pattern = 'dd MMMM yyyy'): string {
  return format(new Date(date), pattern, { locale: fr });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
}
