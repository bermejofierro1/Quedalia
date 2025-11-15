export interface PlanColaborativo {
  id?: string;
  titulo: string;
  descripcion: string;
  foto?: string;
  creadoPor: string;
  idGrupo: string;
  fechaCreacion: any; // o `Timestamp` si quieres importarlo desde Firestore
  estado: 'activo' | 'cancelado' | 'finalizado';
  esPublico: boolean;

  fechasPropuestas: string[];
  lugaresPropuestos: string[];

  ubicacion?: {
    lat: number;
    lng: number;
  };

  votacionEstado: 'abierta' | 'cerrada';

  colaboradores: string[];
  solicitudes: SolicitudUnirse[];

  miembrosExternos?: string[]; // solo si aceptas usuarios ajenos al grupo
}
export interface SolicitudUnirse {
  uid: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  votos: {
    [uid: string]: 'aceptar' | 'rechazar';
  };
}
