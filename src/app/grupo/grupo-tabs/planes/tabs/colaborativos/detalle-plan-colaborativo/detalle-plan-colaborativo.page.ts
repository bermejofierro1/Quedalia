import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from 'src/app/core/firebase.config';
import { PlanService } from 'src/app/core/services/plan.service';
import * as L from 'leaflet';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';


// Reparar el problema del icono por defecto
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-detalle-plan-colaborativo',
  templateUrl: './detalle-plan-colaborativo.page.html',
  styleUrls: ['./detalle-plan-colaborativo.page.scss'],
  standalone: false
})
export class DetallePlanColaborativoPage implements OnInit {
  grupoId!: string;
  planId!: string;
  plan: any;
  map!: L.Map;
  fechaFinalElegida: string | null = null;
  creadorNombre = '';
  creadorFoto = '';
  colaboradores: { uid: string; nombre: string; foto?: string }[] = [];
  isLoading: boolean=false;

   @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;

  constructor(private route: ActivatedRoute, private router: Router, private planService: PlanService,
    private alertCtrl: AlertController,
    private userService: UserService
  ) { }

  ngOnInit() {
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
        this.creadorFoto = creador?.fotoURL || '';
      }

      if (this.plan.votacionEstado === 'cerrada') {
        this.fechaFinalElegida = await this.planService.obtenerFechaGanadora(this.planId, this.plan.fechasPropuestas);
      }

      setTimeout(() => this.initMapa(), 0);
    } else {
      console.warn('Plan no encontrado');
    }
  }


  initMapa() {
    console.log('Inicializando mapa...');

    // ✅ Evitar reinicialización
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

    // Marcador del evento principal
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
        {
          text: 'Cancelar',
          role: 'cancel'
        },
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
              this.router.navigate(['/grupo/tabs/planes/colaborativos']);
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
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  verVotaciones(planId: string) {
    this.planService.setPlanId(planId);
    this.router.navigate(['votaciones'], { relativeTo: this.route });
  }

  //destruir el mapa cuando salgo de la vista
  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  async doRefresh(event: any) {
  this.isLoading = true;
  const content = this.contentRef?.nativeElement;
    if (content) content.classList.add('blur-activo');

  try {
    await this.cargarPlan();
  } catch (error) {
    console.error('Error al refrescar la página:', error);
  } finally {
    this.isLoading = false;
     if (content) content.classList.remove('blur-activo');
    event.target.complete();
  }
}


}
