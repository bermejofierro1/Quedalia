export interface Usuario {
  uid: string;            
  email: string;
  nombre: string;
  fotoURL?: string;         
  lastLogin?: number;      
  grupos?: string[];      
  planesRealizados?: string[]; 
}
