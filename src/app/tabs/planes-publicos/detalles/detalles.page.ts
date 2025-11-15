import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';
import { auth } from 'src/app/core/firebase.config';
import { PlanService } from 'src/app/core/services/plan.service';
import { UserService } from 'src/app/core/services/user.service';




// Reparo el problema del icono por defecto
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});



@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.page.html',
  styleUrls: ['./detalles.page.scss'],
  standalone: false
})
export class DetallesPage implements OnInit {


  planId!: string;
  plan: any;
  map!: L.Map;
  usuarioActualId: string = '';
  esCreador: boolean = false;
  esColaborador: boolean = false;
  yaSolicitado: boolean = false;
  solicitudes: any[] = [];
  estadoSolicitud: 'pendiente' | 'aceptada' | 'rechazada' | null = null;
  miembrosPlan: { uid: string, nombre: string, foto?: string, rol: 'creador' | 'colaborador' | 'participante' }[] = [];
  mostrarMiembros = false;
  creadorNombre = '';
  creadorFoto = '';
  esFavorito: boolean = false;
  isLoading = false;
  @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;


  constructor(
    private router: Router,
    private planService: PlanService,
    private alertCtrl: AlertController,
    private userService: UserService
  ) { }

  ngOnInit() {

    this.usuarioActualId = auth.currentUser?.uid || '';
    this.planService.getPlanId().subscribe(id => {
      if (id) {
        this.planId = id;
        this.cargarPlan();
      } else {
        console.warn('planId no disponible');
        this.router.navigate(['/tabs/grupos']);
      }
    });
  }


  async cargarPlan() {
    const data = await this.planService.cargarPlan(this.planId);
    if (data) {
      this.plan = data;
      if (this.plan.creadoPor) {
        const creador = await this.userService.getUserById(this.plan.creadoPor);
        this.creadorNombre = creador?.nombre || 'Sin nombre';
        this.creadorFoto = creador?.foto || '';
      }


      this.esCreador = this.usuarioActualId === this.plan.creadoPor;
      this.esColaborador = this.plan.colaboradores.includes(this.usuarioActualId);

      this.solicitudes = await this.planService.obtenerSolicitudesConNombres(this.planId);
      this.yaSolicitado = this.plan.solicitudes.some((s: any) => s.uid === this.usuarioActualId);
      const solicitudUsuario = this.plan.solicitudes.find((s: any) => s.uid === this.usuarioActualId);
      this.estadoSolicitud = solicitudUsuario?.estado || null;

      if (this.planService.esMiembroAutorizado(this.plan, this.usuarioActualId)) {
        // Cargar miembros solo si está autorizado
        const miembrosUIDs = [
          this.plan.creadoPor,
          ...(this.plan.colaboradores || []),
          ...(this.plan.miembrosExternos || [])
        ];
        const miembrosUnicos = Array.from(new Set(miembrosUIDs));

        this.miembrosPlan = [];
        for (const uid of miembrosUnicos) {
          const userData = await this.planService.obtenerUsuarioPorId(uid);
          let rol: 'creador' | 'colaborador' | 'participante' = 'participante';
          if (uid === this.plan.creadoPor) {
            rol = 'creador';
          } else if (this.plan.colaboradores.includes(uid)) {
            rol = 'colaborador';
          }
          this.miembrosPlan.push({
            uid,
            nombre: userData?.['nombre'] || 'Sin nombre',
            foto: userData?.['foto'] || '',
            rol
          });
        }
      } else {
        this.miembrosPlan = [];
      }

      setTimeout(() => this.initMapa(), 0);
      // Comprobar si es favorito
      this.esFavorito = await this.userService.esFavoritoPlan(this.usuarioActualId, this.planId);
    } else {
      console.warn('Plan no encontrado');
    }
  }

  esMiembroAutorizado(): boolean {
    return this.planService.esMiembroAutorizado(this.plan, this.usuarioActualId);
  }

  toggleMostrarMiembros() {
    this.mostrarMiembros = !this.mostrarMiembros;
  }


  initMapa() {
    const existingMap = L.DomUtil.get('map');
    if (existingMap && (existingMap as any)._leaflet_id != null) {
      existingMap.replaceWith(existingMap.cloneNode(true)); // reinicia contenedor
    }

    if (!this.plan?.ubicacion?.lat || !this.plan?.ubicacion?.lng) {
      console.warn('Ubicación del evento no disponible.');
      return;
    }

    this.map = L.map('map').setView([this.plan.ubicacion.lat, this.plan.ubicacion.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([this.plan.ubicacion.lat, this.plan.ubicacion.lng])
      .addTo(this.map)
      .bindPopup('Ubicación del evento')
      .openPopup();
  }


  async eliminarPlan() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este plan? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.planService.eliminarPlan(this.planId);
              const successAlert = await this.alertCtrl.create({
                header: 'Eliminado',
                message: 'El plan ha sido eliminado correctamente.',
                buttons: ['OK']
              });
              await successAlert.present();
              this.router.navigate(['/planes-publicos']);
            } catch (error: any) {
              const errorAlert = await this.alertCtrl.create({
                header: 'Error',
                message: error.message || 'Error desconocido al eliminar el plan.',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async expulsarMiembro(miembroId: string) {
    if (!this.esCreador) {
      const alertNoPermiso = await this.alertCtrl.create({
        header: 'Permiso denegado',
        message: 'Solo el creador puede expulsar miembros',
        buttons: ['OK']
      });
      await alertNoPermiso.present();
      return;
    }

    const alertConfirm = await this.alertCtrl.create({
      header: 'Confirmar expulsión',
      message: '¿Seguro que quieres expulsar a este miembro del plan?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Expulsar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.planService.expulsarMiembro(this.planId, miembroId);
              await this.cargarPlan();

              const alertExito = await this.alertCtrl.create({
                header: 'Miembro expulsado',
                message: 'El miembro ha sido expulsado correctamente.',
                buttons: ['OK']
              });
              await alertExito.present();

            } catch (error: any) {
              const alertError = await this.alertCtrl.create({
                header: 'Error',
                message: error.message || 'Error al expulsar miembro',
                buttons: ['OK']
              });
              await alertError.present();
            }
          }
        }
      ]
    });

    await alertConfirm.present();
  }

  volver() {
    this.router.navigate(['/planes-publicos']);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = undefined as any;
    }
  }

  async solicitarUnirse() {
    try {
      await this.planService.solicitarUnirseAlPlan(this.planId);
      await this.cargarPlan();
      alert('Solicitud enviada.');
    } catch (err: any) {
      alert(err.message);
    }
  }

  async votarSolicitud(uid: string, voto: 'aceptar' | 'rechazar') {
    try {
      await this.planService.votarSolicitud(this.planId, uid, voto);
      await this.cargarPlan();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async decidirSolicitud(uid: string, decision: 'aceptada' | 'rechazada') {
    try {
      await this.planService.decidirSolicitud(this.planId, uid, decision);
      await this.cargarPlan();
    } catch (err: any) {
      alert(err.message);
    }
  }

  contarVotos(solicitud: any, tipo: 'aceptar' | 'rechazar'): number {
    return Object.values(solicitud.votos || {}).filter(v => v === tipo).length;
  }


  async toggleFavorito() {
    const nuevoEstado = await this.userService.toggleFavoritoPlan(this.usuarioActualId, this.planId);
    this.esFavorito = nuevoEstado;
  }

  async doRefresh(event: any) {
    this.isLoading = true;
    const content = this.contentRef?.nativeElement;
    if (content) content.classList.add('blur-activo');
    try {
     await this.cargarPlan();

    } catch (error) {
      console.error('Error al refrescar datos Tricoins:', error);
    } finally {
      this.isLoading = false;
      if (content) content.classList.remove('blur-activo');
      event.target.complete();

    }
  }

}
