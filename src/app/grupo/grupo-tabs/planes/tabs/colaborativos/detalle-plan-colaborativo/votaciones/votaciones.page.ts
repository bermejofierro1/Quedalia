import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { db,auth } from 'src/app/core/firebase.config';
import {Chart,registerables} from 'chart.js'
Chart.register(...registerables);
import { PlanService } from 'src/app/core/services/plan.service';
import { VotacionService } from 'src/app/core/services/votacion.service';

@Component({
  selector: 'app-votaciones',
  templateUrl: './votaciones.page.html',
  styleUrls: ['./votaciones.page.scss'],
  standalone:false
})
export class VotacionesPage implements OnInit {
    @ViewChild('graficoFechas') graficoFechas!: ElementRef<HTMLCanvasElement>;
     @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;

  planId!: string;
  plan: any;
  votosFechas: { [fecha: string]: boolean } = {};
  loading = true;
  chart: any;
  currentUserId:string|null=null;
  isLoading=false;

  constructor(private route: ActivatedRoute,
             private planService: PlanService,
            private votacionesService:VotacionService
  ) {}

  ngOnInit() {
    this.planService.getPlanId().subscribe(async (id) => {
      console.log('Plan ID recibido:', id);
      if (id) {
        this.planId = id;
        this.currentUserId = auth.currentUser?.uid ?? null;
    console.log('UID actual:', this.currentUserId);
        await this.cargarPlanYVotos();
        this.escucharVotosTiempoReal(); 
        
      } else {
        console.warn('planId no disponible');
      }
    });
  }

  ngAfterViewInit() {
    
  }

 async cerrarVotacion() {
  if (!this.planId || this.plan?.creadoPor !== auth.currentUser?.uid) {
    alert('No tienes permiso para cerrar esta votación.');
    return;
  }

  try {
    // Primero obtener el conteo de votos para saber qué fecha gana
    const conteo = await this.votacionesService.obtenerVotos(this.planId, this.plan.fechasPropuestas);

    // Obtener la fecha con más votos
    let fechaGanadora = '';
    let maxVotos = -1;
    for (const [fecha, votos] of Object.entries(conteo)) {
      if (votos > maxVotos) {
        maxVotos = votos;
        fechaGanadora = fecha;
      }
    }

    // Guardar la fecha final elegida en Firestore
    await this.votacionesService.guardarFechaFinalElegida(this.planId, fechaGanadora);

    // Marcar votacion como cerrada
    await this.votacionesService.cerrarVotacion(this.planId);

    this.plan.votacionEstado = 'cerrada';
    this.plan.fechaFinalElegida = fechaGanadora;

    alert(`La votación se ha cerrado correctamente. Fecha final elegida: ${fechaGanadora}`);
  } catch (err) {
    console.error('Error al cerrar votación', err);
    alert('No se pudo cerrar la votación.');
  }
}

 async cargarPlanYVotos() {
  try {
    this.plan = await this.votacionesService.obtenerPlan(this.planId);
    if (!this.plan) return;

    const conteo = await this.votacionesService.obtenerVotos(this.planId, this.plan.fechasPropuestas);
    this.loading = false;

    setTimeout(() => this.generarGrafico(conteo), 0);
  } catch (err) {
    console.error('Error al cargar plan y votos', err);
    this.loading = false;
  }
}

  generarGrafico(conteoFechas: { [fecha: string]: number }) {
    const ctx = this.graficoFechas?.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener contexto 2d del canvas');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(conteoFechas),
        datasets: [
          {
            label: 'Votos por fecha',
            data: Object.values(conteoFechas),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Resultados de votación por fecha'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  actualizarGrafico(conteoFechas: { [fecha: string]: number }) {
    if (!this.chart) return;
    this.chart.data.labels = Object.keys(conteoFechas);
    this.chart.data.datasets[0].data = Object.values(conteoFechas);
    this.chart.update();
  }

  escucharVotosTiempoReal() {
  this.votacionesService.escucharVotosTiempoReal(
    this.planId,
    this.plan.fechasPropuestas,
    (conteo) => this.actualizarGrafico(conteo)
  );
}

 
async enviarVoto() {
  const fechasSeleccionadas = Object.keys(this.votosFechas).filter(f => this.votosFechas[f]);
  if (fechasSeleccionadas.length === 0) {
    alert('Selecciona al menos una fecha antes de votar.');
    return;
  }

  try {
    await this.votacionesService.enviarVoto(this.planId, fechasSeleccionadas);
    alert('¡Tu voto ha sido registrado correctamente!');
  } catch (err) {
    console.error('Error enviando voto', err);
    alert('Error al registrar tu voto.');
  }
}

async doRefresh(event: any) {
  this.isLoading=true;
  const content = this.contentRef?.nativeElement;
    if (content) content.classList.add('blur-activo');
  try {
    await this.cargarPlanYVotos();
    // this.escucharVotosTiempoReal(); 
  } catch (error) {
    console.error('Error al refrescar votación:', error);
  } finally {
    this.isLoading=false;
     if (content) content.classList.remove('blur-activo');
    event.target.complete();
  }
}


}
