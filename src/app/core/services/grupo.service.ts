import { Injectable } from '@angular/core';
import {  collection, query, where, getDocs, getDoc, doc, updateDoc, addDoc, orderBy, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth,db } from '../firebase.config';
import { BehaviorSubject } from 'rxjs';
import { Grupo } from 'src/app/models/grupo.model';



// Función auxiliar para generar fechas desde el rango string
function procesarFechaFinalElegida(fechaFinalElegida: string): string[] {
  // Si es rango "Del dd/mm/yyyy al dd/mm/yyyy"
  const rangoRegex = /Del (\d{1,2}\/\d{1,2}\/\d{4}) al (\d{1,2}\/\d{1,2}\/\d{4})/;

  const match = fechaFinalElegida.match(rangoRegex);
  if (match) {
    const fechaInicioStr = match[1]; // ej: "20/7/2025"
    const fechaFinStr = match[2]; // ej: "25/7/2025"

    const fechas = generarArrayFechas(fechaInicioStr, fechaFinStr);
    return fechas;
  } else {
    // No es rango, asumimos fecha única
    if (fechaFinalElegida.trim() !== '') {
      return [fechaFinalElegida.trim()];
    } else {
      return [];
    }
  }
}

// Función para generar array de strings con todas las fechas entre inicio y fin
function generarArrayFechas(fechaInicioStr: string, fechaFinStr: string): string[] {
  const parseFecha = (str: string) => {
    const [d, m, a] = str.split('/').map(x => parseInt(x, 10));
    return new Date(a, m - 1, d);
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  const inicio = parseFecha(fechaInicioStr);
  const fin = parseFecha(fechaFinStr);

  const fechas: string[] = [];
  let current = new Date(inicio);

  while (current <= fin) {
    const d = pad(current.getDate());
    const m = pad(current.getMonth() + 1);
    const a = current.getFullYear();
    fechas.push(`${d}/${m}/${a}`);
    current.setDate(current.getDate() + 1);
  }
  return fechas;
}



@Injectable({
  providedIn: 'root'
})
export class GrupoService {

   private grupoIdSubject = new BehaviorSubject<string | null>(null);
  private gruposSubject = new BehaviorSubject<any[]>([]);
grupos$ = this.gruposSubject.asObservable();


  constructor() { }

async obtenerFechasDesdeRangoGrupo(grupoId: string): Promise<string[]> {
  const grupo = await this.obtenerGrupoPorId(grupoId);
  if (!grupo || !grupo.fechaFinalElegida) return [];
  return procesarFechaFinalElegida(grupo.fechaFinalElegida);
}


 async getGruposUsuario(): Promise<Grupo[]> {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      this.gruposSubject.next([]); // vacío si no hay usuario
      return [];
    }

    const gruposRef = collection(db, 'grupos');
    const q = query(gruposRef, where('miembros', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    const grupos:Grupo[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Grupo,'id'>)
    }));

    this.gruposSubject.next(grupos); 
    return grupos;
  }

    async refreshGrupos() {
    await this.getGruposUsuario();
  }

 async joinGroupByCode(code:string):Promise<void>{
  //obtegno el usuario actual
  const currentUser=auth.currentUser;

  if(!currentUser){
    throw new Error('Usuario no autenticado');
  }

  const grupoRef=collection(db,'grupos');
  const q=query(grupoRef,where('shareCode','==',code), );
  const querySnapshot=await getDocs(q);

  if(querySnapshot.empty){
    throw new Error('No existe ningún grupo con ese código');
  }

  const grupoDoc=querySnapshot.docs[0];
  const grupoData=grupoDoc.data() as Grupo;
  const miembros:string[]=grupoData['miembros'] || [];

  if(miembros.includes(currentUser.uid)){
    throw new Error('Ya eres miembro de este grupo');
  }
  //Añado el miembro al grupo
  miembros.push(currentUser.uid);
  const grupoDocRef=doc(db,'grupos',grupoDoc.id);
  await updateDoc(grupoDocRef,{miembros});

  //Añado el usuario a todos los planes colaborativos del grupo
 // ✅ Añadir como colaborador a todos los planes del grupo
  await this.actualizarColaboradoresEnPlanes(grupoDoc.id, currentUser.uid);
 }

 
//Actualizar los colaboradores en todos los planes colaborativos al unirse a un grupo un nuevo miembro
 async actualizarColaboradoresEnPlanes(grupoId: string, nuevoUid: string): Promise<void> {
  const planesRef = collection(db, 'planesColaborativos');
  const planesSnapshot = await getDocs(query(planesRef, where('idGrupo', '==', grupoId)));

  for (const planDoc of planesSnapshot.docs) {
    const planData = planDoc.data();
    const colaboradores: string[] = planData['colaboradores'] || [];

    if (!colaboradores.includes(nuevoUid)) {
      colaboradores.push(nuevoUid);
      await updateDoc(planDoc.ref, { colaboradores });
    }
  }
}

 //Genero código aleatorio para poder unirse a un grupo
   generateShareCode(length:number=6):string{

  const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let resultado='';
  for(let i=0;i<length;i++){
    resultado+=chars.charAt(Math.floor(Math.random()*chars.length));
  }

  return resultado;

 }
 setGrupoId(id: string) {
    this.grupoIdSubject.next(id);
  }

  getGrupoId() {
    return this.grupoIdSubject.asObservable();
  }


  async obtenerGrupoPorId(id: string): Promise<Grupo | null> {
    const grupoRef = doc(db, 'grupos', id);
    const grupoSnap = await getDoc(grupoRef);
   return grupoSnap.exists()
      ? { id: grupoSnap.id, ...(grupoSnap.data() as Omit<Grupo, 'id'>) }
      : null;
  }

   async proponerFecha(grupoId: string, fecha: string) {
    const ref = collection(db, 'grupos', grupoId, 'fechasPropuestas');
    return addDoc(ref, {
      fecha,
      creadorId: auth.currentUser?.uid,
      votos: [auth.currentUser?.uid]
    });
  }

  escucharFechas(grupoId: string, callback: (fechas: any[]) => void) {
    const ref = collection(db, 'grupos', grupoId, 'fechasPropuestas');
    const q = query(ref, orderBy('fecha'));
    return onSnapshot(q, snapshot => {
      const fechas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(fechas);
    });
  }

  async votarFecha(grupoId: string, fechaId: string, uid: string) {
    const ref = doc(db, 'grupos', grupoId, 'fechasPropuestas', fechaId);
    return updateDoc(ref, {
      votos: arrayUnion(uid)
    });
  }

  async quitarVoto(grupoId: string, fechaId: string, uid: string) {
    const ref = doc(db, 'grupos', grupoId, 'fechasPropuestas', fechaId);
    return updateDoc(ref, {
      votos: arrayRemove(uid)
    });
  }

  
  
}
