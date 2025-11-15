import { Component } from '@angular/core';
import { NotificacionesService } from '../core/services/notificaciones.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {

  tieneNotis$: Observable<boolean>;

  constructor(private notisService: NotificacionesService) {
    this.tieneNotis$ = this.notisService.tieneNotisNoLeidas$;
  }

}
