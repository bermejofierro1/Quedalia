import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-seleccionar-ubicacion',
  templateUrl: './seleccionar-ubicacion.page.html',
  styleUrls: ['./seleccionar-ubicacion.page.scss'],
  standalone:false
})
export class SeleccionarUbicacionPage implements OnInit {

   map: any;
  marker: any;
  ubicacionSeleccionada: { lat: number; lng: number } | null = null;

  constructor(private router:Router,private navCtrl:NavController) { }

  ngOnInit() {
  }

  
  ionViewDidEnter() {
    this.map = L.map('map').setView([37.38, -5.99], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const geocoder = (L.Control as any).geocoder({
      defaultMarkGeocode: false
    })
      .on('markgeocode', (e: any) => {
        const center = e.geocode.center;

        if (this.marker) {
          this.marker.setLatLng(center);
        } else {
          this.marker = L.marker(center).addTo(this.map);
        }

        this.map.setView(center, 16);
        this.ubicacionSeleccionada = { lat: center.lat, lng: center.lng };
      })
      .addTo(this.map);
  }

confirmarUbicacion() {
 

  this.router.navigate(['/grupo/tabs/planes/agregar'], {
    state: {
      ubicacion: this.ubicacionSeleccionada
    }
  });
}




}
