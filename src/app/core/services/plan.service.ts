import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, query, where, getFirestore, Timestamp, doc, getDoc, deleteDoc, updateDoc, } from 'firebase/firestore';
import { db } from '../firebase.config';
import { auth } from '../firebase.config';
import { BehaviorSubject, timestamp } from 'rxjs';
import { GrupoService } from './grupo.service';
import { NotificacionesService } from './notificaciones.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  constructor(private grupoService: GrupoService, private notificacionesService: NotificacionesService,
    private alertController: AlertController
  ) { }
  private planId$ = new BehaviorSubject<string | null>(null);


  //método para crear un plan
  async crearPlan(grupoId: string, datosPlan: { titulo: string, descripcion: string, fechasPropuestas: string, lugaresPropuestos: string, ubicacion?: { lat: number, lng: number }, foto?: string, esPublico: boolean, solicitudes: [], ciudad: string }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    /*Recorro el grupo para añadir los miembros ya existentes en el grupo*/
    const datosGrupo = await this.grupoService.obtenerGrupoPorId(grupoId);
    if (!datosGrupo) {
      throw new Error('El grupo no existe');
    }

    // Extraigo los miembros del grupo
    const miembrosGrupo: string[] = datosGrupo.miembros || [];

    const plan = {
      idGrupo: grupoId,
      titulo: datosPlan.titulo,
      descripcion: datosPlan.descripcion,
      creadoPor: user.uid,
      fechaCreacion: Timestamp.now(),
      estado: 'activo',

      votacionEstado: 'abierta',
      fechasPropuestas: Array.isArray(datosPlan.fechasPropuestas)
        ? datosPlan.fechasPropuestas
        : datosPlan.fechasPropuestas.split(',').map(f => f.trim()),
      colaboradores: miembrosGrupo,
      solicitudes: [],

      ciudad: datosPlan.ciudad,
      foto: datosPlan.foto || '',
      esPublico: datosPlan.esPublico || false,

    };

    const planesRef = collection(db, 'planesColaborativos');
    return await addDoc(planesRef, plan);
  }


  //método para darle permisos a los usuarios en ciertas cosas
  esMiembroAutorizado(plan: any, usuarioId: string): boolean {
    if (!plan) return false;
    if (usuarioId === plan.creadoPor) return true;
    if (plan.colaboradores?.includes(usuarioId)) return true;
    if (plan.miembrosExternos?.includes(usuarioId)) return true;
    return false;
  }

  //método para obtener los planes creados para un grupo en específico
  async obtenerPlanesPorGrupo(grupoId: string): Promise<any[]> {
    const planesRef = collection(db, 'planesColaborativos');
    const q = query(planesRef, where('idGrupo', '==', grupoId));
    const querySnapshot = await getDocs(q);

    const planes: any[] = [];
    querySnapshot.forEach(doc => {
      planes.push({ id: doc.id, ...doc.data() });
    });

    return planes;
  }



  setPlanId(id: string) {
    this.planId$.next(id);
  }

  getPlanId() {
    return this.planId$.asObservable();
  }


  //servicio para eliminar un plan de un grupo
  async eliminarPlan(planId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // Obtener el plan para verificar que el usuario es el creador
    const docRef = doc(db, 'planesColaborativos', planId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error('El plan no existe');

    const planData = docSnap.data();
    if (planData['creadoPor'] !== user.uid) {
      throw new Error('No tienes permiso para eliminar este plan');
    }

    // Si todo está bien, lo borramos
    await deleteDoc(docRef);
  }

  async expulsarMiembro(planId: string, miembroId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const docRef = doc(db, 'planesColaborativos', planId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Plan no encontrado');

    const planData = docSnap.data();

    // Solo el creador puede expulsar
    if (planData['creadoPor'] !== user.uid) throw new Error('No tienes permiso para expulsar miembros');

    // Filtramos colaboradores y miembrosExternos para eliminar el miembro
    const colaboradores = (planData['colaboradores'] || []).filter((id: string) => id !== miembroId);
    const miembrosExternos = (planData['miembrosExternos'] || []).filter((id: string) => id !== miembroId);

    // Actualizamos Firestore con los arrays modificados
    await updateDoc(docRef, {
      colaboradores,
      miembrosExternos
    });

  }


  /*=====SERVICIO PARA DETALLES DEL PLAN ============*/

  async cargarPlan(planId: string) {
    const docRef = doc(db, 'planesColaborativos', planId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Plan no encontrado');
    return { id: docSnap.id, ...docSnap.data() };
  }

  async obtenerFechaGanadora(planId: string, fechasPropuestas: string[]): Promise<string | null> {
    const votosRef = collection(db, `votos/${planId}/usuarios`);
    const votosSnap = await getDocs(votosRef);

    const conteoFechas: { [fecha: string]: number } = {};
    fechasPropuestas.forEach((fecha) => {
      conteoFechas[fecha] = 0;
    });

    votosSnap.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data['fechas'])) {
        data['fechas'].forEach((fecha: string) => {
          if (conteoFechas[fecha] !== undefined) {
            conteoFechas[fecha]++;
          }
        });
      }
    });

    let fechaGanadora: string | null = null;
    let maxVotos = -1;
    for (const [fecha, votos] of Object.entries(conteoFechas)) {
      if (votos > maxVotos) {
        maxVotos = votos;
        fechaGanadora = fecha;
      }
    }

    return fechaGanadora;
  }

  /*LÓGICA PARA LA PARTE DE PLANES PÚBLICOS*/
  async solicitarUnirseAlPlan(planId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const docRef = doc(db, 'planesColaborativos', planId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Plan no encontrado');

    const planData = docSnap.data();
    const solicitudes = planData['solicitudes'] || [];

    const yaSolicitado = solicitudes.some((s: any) => s.uid === user.uid);
    if (yaSolicitado) throw new Error('Ya has solicitado unirte a este plan');

    solicitudes.push({
      uid: user.uid,
      estado: 'pendiente',
      votos: {}
    });

    await updateDoc(docRef, { solicitudes });

    const mensaje = `Nuevo usuario quiere unirse al plan "${planData['titulo']}"`;

    // Notificar a creador y colaboradores
    const uidsNotificar = [planData['creadoPor'], ...(planData['colaboradores'] || [])];
    const notis = uidsNotificar.filter(uid => uid !== user.uid).map(uid =>
      this.notificacionesService.crearNotificacion(uid, mensaje, planId)
    );
    await Promise.all(notis);
  }

  /*Lógica para votar*/
  async votarSolicitud(planId: string, solicitanteUid: string, voto: 'aceptar' | 'rechazar'): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const docRef = doc(db, 'planesColaborativos', planId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Plan no encontrado');

    const planData = docSnap.data();
    const solicitudes = planData['solicitudes'] || [];

    const solicitud = solicitudes.find((s: any) => s.uid === solicitanteUid);
    if (!solicitud) throw new Error('Solicitud no encontrada');
    if (solicitud.estado !== 'pendiente') return;

    if (!solicitud.votos) solicitud.votos = {};
    solicitud.votos[user.uid] = voto;

    await updateDoc(docRef, { solicitudes });
  }

  /*El creador decide si finalmente acepta o rechaza*/
  async decidirSolicitud(planId: string, solicitanteUid: string, decision: 'aceptada' | 'rechazada'): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const docRef = doc(db, 'planesColaborativos', planId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Plan no encontrado');

    const planData = docSnap.data();
    if (planData['creadoPor'] !== user.uid) throw new Error('No tienes permiso');

    const solicitudes = planData['solicitudes'] || [];
    const solicitud = solicitudes.find((s: any) => s.uid === solicitanteUid);
    if (!solicitud) throw new Error('Solicitud no encontrada');

    solicitud.estado = decision;

    if (decision === 'aceptada') {
      const miembrosExternos = planData['miembrosExternos'] || [];
      if (!miembrosExternos.includes(solicitanteUid)) {
        miembrosExternos.push(solicitanteUid);
      }
      await updateDoc(docRef, {
        solicitudes,
        miembrosExternos
      });
    } else {
      await updateDoc(docRef, { solicitudes });
    }
  }

  // Devuelve solicitudes con nombreUsuario agregado
  async obtenerSolicitudesConNombres(planId: string): Promise<any[]> {
    const docRef = doc(db, 'planesColaborativos', planId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Plan no encontrado');

    const planData = docSnap.data();
    const solicitudes = planData?.['solicitudes'] || [];

    const promesasUsuarios = solicitudes.map(async (solicitud: any) => {
      try {
        const docUser = await getDoc(doc(db, 'users', solicitud.uid));
        const dataUser = docUser.exists() ? docUser.data() : null;
        return {
          ...solicitud,
          nombreUsuario: dataUser?.['nombre'] || 'Sin nombre',
          fotoUsuario: dataUser?.['fotoURL'] || null
        };
      } catch {
        return {
          ...solicitud,
          nombreUsuario: 'Error al cargar',
        };
      }
    });

    return await Promise.all(promesasUsuarios);
  }

  async crearPlanPublico(planData: any): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');

  const plan = {
    ...planData,
    esPublico: true,
    creadoPor: user.uid,
    fechaCreacion: Timestamp.now(),
    estado: 'activo',
    colaboradores: [],
    solicitudes: [],
    miembrosExternos: []
  };

  const planesRef = collection(db, 'planesColaborativos');
  await addDoc(planesRef, plan);
}



  async obtenerUsuarioPorId(uid: string) {
    const ref = doc(db, 'usuarios', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }



  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar'],
    });
    await alert.present();
  }



}
