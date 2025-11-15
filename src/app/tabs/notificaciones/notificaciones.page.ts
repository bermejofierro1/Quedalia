import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificacionesService } from 'src/app/core/services/notificaciones.service';


@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone:false
})
export class NotificacionesPage implements OnInit {
 
  notificaciones: any[] = [];
  private subs?: Subscription;
  isLoading = false;
  @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;


  constructor(private notisService: NotificacionesService) {}

  ngOnInit() {
   this.obtenerNotis();
  }

 async obtenerNotis(){
  //evito múltiples suscripciones
   this.subs?.unsubscribe();
 // Suscribirse al observable de notificaciones en tiempo real
    this.subs = this.notisService.notificaciones$.subscribe(notis => {
      console.log('Notificaciones cargadas:', notis); 
      this.notificaciones = notis;
    });
  }

  ngOnDestroy() {
    this.subs?.unsubscribe();
  }

  async marcarLeida(id: string) {
    await this.notisService.marcarComoLeida(id);
    // No hace falta recargar manualmente, la suscripción lo actualiza
  }

  async eliminar(id: string) {
    await this.notisService.eliminarNotificacion(id);
    // Tampoco hace falta recargar manualmente
  }

  async doRefresh(event: any) {
    this.isLoading = true;
    const content = this.contentRef?.nativeElement;
    if (content) content.classList.add('blur-activo');
    try {
    await this.obtenerNotis();

    } catch (error) {
      console.error('Error al refrescar datos Tricoins:', error);
    } finally {
      this.isLoading = false;
      if (content) content.classList.remove('blur-activo');
      event.target.complete();

    }
  }

}
