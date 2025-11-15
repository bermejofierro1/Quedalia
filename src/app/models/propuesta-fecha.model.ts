export interface PropuestaFecha {
  id?: string;
  tipo: 'dia' | 'rango';
  fecha?: string; // solo si es tipo 'dia'
  fechaInicio?: string; // si es tipo 'rango'
  fechaFin?: string;     // si es tipo 'rango'
  creadorId: string;
  votos: string[];
}
