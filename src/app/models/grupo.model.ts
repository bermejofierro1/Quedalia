export interface Grupo {
  id?: string;
  nombre: string;
    descripcion?: string;
  foto?: string;
  creadorId: string;
  miembros: string[];
  shareCode: string;
  timestamp: any; // o Timestamp
  fechaFinalElegida?: string;
  votacionEstado: 'abierta' | 'cerrada';
}



export interface TricoinPago {
  id?: string;
  descripcion: string;
  cantidad: number;
  pagadoPor: string;
  involucrados: string[];
  grupoId: string;
  timestamp: number; // o Timestamp
}
