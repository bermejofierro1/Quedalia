import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Gesture, GestureController, ModalController } from '@ionic/angular';


@Component({
  selector: 'app-modal-imagen-ampliada',
  standalone: false,
  template: `
    <ion-content class="modal-ampliada" scrollY="false">
      <div class="wrapper-imagen" #imagenContainer (click)="cerrar()">
        <ion-img [src]="imagenActual?.url" class="imagen-ampliada"></ion-img>
      </div>
    </ion-content>
  `,
  styles: [`
    .modal-ampliada {
      --background: rgba(0, 0, 0, 0.95);
      position: relative;
    }

    .wrapper-imagen {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      touch-action: pan-y; /* Permite gestos horizontales */
    }

    .imagen-ampliada {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.2s ease-in-out;
    }
  `]
})
export class ModalImagenAmpliadaComponent implements AfterViewInit{
  @Input() listaImagenes: any[] = [];
  @Input() imagenActual: any;

  @ViewChild('imagenContainer', { static: true }) imagenContainer!: ElementRef;
  private gesture?: Gesture;
  animando = false;

  private bloqueado = false; // evita gestos dobles

  constructor(
    private modalCtrl: ModalController,
    private gestureCtrl: GestureController
  ) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }

  ngAfterViewInit() {
    let desplazamiento = 0;

    this.gesture = this.gestureCtrl.create({
      el: this.imagenContainer.nativeElement,
      gestureName: 'swipe-imagen',
      threshold: 0,
      gesturePriority: 100,
      onStart: () => {
        desplazamiento = 0;
      },
      onMove: ev => {
        if (this.bloqueado) return;

        desplazamiento += ev.deltaX;

        if (desplazamiento > 20) {
          this.cambiarImagen(-1);
          desplazamiento = 0;
        } else if (desplazamiento < -20) {
          this.cambiarImagen(1);
          desplazamiento = 0;
        }
      }
    });

    this.gesture.enable(true);
  }

  get indiceActual(): number {
    return this.listaImagenes.findIndex(img => img.id === this.imagenActual.id);
  }

  cambiarImagen(direccion: 1 | -1) {
    const nuevoIndice = this.indiceActual + direccion;
    if (nuevoIndice < 0 || nuevoIndice >= this.listaImagenes.length) return;

    this.bloqueado = true;
    this.animando = true;

    // espera la animación
    setTimeout(() => {
      this.imagenActual = this.listaImagenes[nuevoIndice];
      this.animando = false;

      // desbloquea después de un corto retardo
      setTimeout(() => {
        this.bloqueado = false;
      }, 100);
    }, 150);
  }
}
