import { Component, OnInit } from '@angular/core';
import { NotificacionesService } from 'src/app/core/services/notificaciones.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone:false
})
export class TabsPage implements OnInit {

  constructor(private notificacionesService:NotificacionesService) { }

  ngOnInit() {
  }

}
