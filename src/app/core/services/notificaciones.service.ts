import { Injectable } from '@angular/core';
import { auth, db } from '../firebase.config';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
 
  tieneNotisNoLeidas$ = new BehaviorSubject<boolean>(false);
  notificaciones$ = new BehaviorSubject<any[]>([]);

  private userId: string | null = null;
  private unsubscribeNoLeidas: (() => void) | null = null;
  private unsubscribeTodas: (() => void) | null = null;

  constructor() {
    
      console.log('[NotificacionesService] Constructor llamado');
    onAuthStateChanged(auth, (user) => {
       console.log('[NotificacionesService] onAuthStateChanged ejecutado', user?.uid);
      if (user) {
        this.userId = user.uid;
        this.iniciarListenerNoLeidas();
        this.iniciarListenerTodas();
      } else {
        this.userId = null;
        this.tieneNotisNoLeidas$.next(false);
        this.notificaciones$.next([]);
        this.unsubscribeNoLeidas?.();
        this.unsubscribeNoLeidas = null;
        this.unsubscribeTodas?.();
        this.unsubscribeTodas = null;
      }
    });
  }

  private iniciarListenerNoLeidas() {
    if (!this.userId) return;

    const q = query(
      collection(db, 'notificaciones'),
      where('uidDestino', '==', this.userId),
      where('leido', '==', false)
    );

    this.unsubscribeNoLeidas?.();
    this.unsubscribeNoLeidas = onSnapshot(q, (snapshot) => {
      this.tieneNotisNoLeidas$.next(!snapshot.empty);
    });
  }

  private iniciarListenerTodas() {
    if (!this.userId) return;

    const q = query(
      collection(db, 'notificaciones'),
      where('uidDestino', '==', this.userId),
      orderBy('fecha', 'desc')
    );

    this.unsubscribeTodas?.();
    this.unsubscribeTodas = onSnapshot(q, (snapshot) => {
      const notis = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.notificaciones$.next(notis);
    });
  }

  async crearNotificacion(uidDestino: string, mensaje: string, planId: string) {
    await addDoc(collection(db, 'notificaciones'), {
      uidDestino,
      mensaje,
      planId,
      leido: false,
      fecha: Timestamp.now()
    });
  }

  // Ya no usaremos obtenerMisNotificaciones porque tenemos el observable notificaciones$ en tiempo real

  async marcarComoLeida(id: string) {
    const docRef = doc(db, 'notificaciones', id);
    await updateDoc(docRef, { leido: true });
  }

  async eliminarNotificacion(id: string) {
    const docRef = doc(db, 'notificaciones', id);
    await deleteDoc(docRef);
  }
}
