import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';
import { auth } from 'src/app/core/firebase.config';
import { PlanService } from 'src/app/core/services/plan.service';




// Reparar el problema del icono por defecto
delete (L.Icon.Default.prototype as any)._getIconUrl;


L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});
@Component({
  selector: 'app-detalle-plan-publico',
  templateUrl: './detalle-plan-publico.page.html',
  styleUrls: ['./detalle-plan-publico.page.scss'],
  standalone: false
})
export class DetallePlanPublicoPage implements OnInit {

  planId!: string;
  plan: any;
  map!: L.Map;
  usuarioActualId:string='';
  esCreador:boolean=false;
  esColaborador:boolean=false;
  yaSolicitado:boolean=false;
  solicitudes:any[]=[];
estadoSolicitud: 'pendiente' | 'aceptada' | 'rechazada' | null = null;

  constructor(
    private router: Router,
    private planService: PlanService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {

    this.usuarioActualId=auth.currentUser?.uid||'';
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

      this.esCreador=this.usuarioActualId===this.plan.creadoPor;
      this.esColaborador=this.plan.colaboradores.includes(this.usuarioActualId);

      this.solicitudes=this.plan.solicitudes || [];
      this.yaSolicitado=this.plan.solicitudes.some((s:any)=> s.uid ===this.usuarioActualId)

      // Extraemos el estado de la solicitud del usuario actual (si existe)
const solicitudUsuario = this.plan.solicitudes.find((s: any) => s.uid === this.usuarioActualId);
this.estadoSolicitud = solicitudUsuario?.estado || null;



      setTimeout(() => this.initMapa(), 0);
    } else {
      console.warn('Plan no encontrado');
    }
  }

  initMapa() {
    if (this.map) {
      this.map.remove();
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

  volver() {
    this.router.navigate(['/planes-publicos']);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
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


}
