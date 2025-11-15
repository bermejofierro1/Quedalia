import { Injectable } from '@angular/core';
import { auth, db } from '../firebase.config';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { Usuario } from 'src/app/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private authService:AuthService) { }

  
 async enviarMensaje(grupoId: string, texto: string, autorNombre: string) {

    const user:Usuario|null = await this.authService.usuarioApp$.value;
    if (!user) throw new Error('Usuario no autenticado');

    const mensajesRef = collection(db, 'grupos', grupoId, 'mensajes');
    return addDoc(mensajesRef, {
      texto,
      autorId: user.uid,
      autorNombre,
      timestamp: serverTimestamp()
    });
  }

  escucharMensajes(grupoId: string, callback: (mensajes: any[]) => void) {
    const mensajesRef = collection(db, 'grupos', grupoId, 'mensajes');
    const q = query(mensajesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const mensajes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(mensajes);
    });
  }


   agruparMensajes(mensajes: any[]): any[] {
    const agrupados: any[] = [];
    let grupoActual: any = null;

    mensajes.forEach(msg => {
      const fecha = msg.timestamp?.toDate?.() || new Date();
      const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (!grupoActual || grupoActual.autorId !== msg.autorId) {
        grupoActual = {
          autorId: msg.autorId,
          autorNombre: msg.autorNombre,
          mensajes: [{ texto: msg.texto, hora }]
        };
        agrupados.push(grupoActual);
      } else {
        grupoActual.mensajes.push({ texto: msg.texto, hora });
      }
    });

    return agrupados;
  }

  formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
}
