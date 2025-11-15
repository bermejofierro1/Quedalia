import { Component, OnInit } from '@angular/core';
import { auth, db } from 'src/app/core/firebase.config';
import { FechasService } from 'src/app/core/services/fechas.service';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { PropuestaFecha } from 'src/app/models/propuesta-fecha.model';
import { Chart, registerables } from 'chart.js';
import { ViewChild, ElementRef } from '@angular/core';
import { collection, doc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';

Chart.register(...registerables);



@Component({
  selector: 'app-fechas-grupo',
  templateUrl: './fechas-grupo.page.html',
  styleUrls: ['./fechas-grupo.page.scss'],
  standalone: false
})
export class FechasGrupoPage implements OnInit {
  grupoId!: string;
  tipoFecha: 'dia' | 'rango' = 'dia';
  fechaUnica = '';
  fechaInicio = '';
  fechaFin = '';
  propuestas: PropuestaFecha[] = [];
  userId = auth.currentUser?.uid ?? '';
  mostrarFormulario: boolean = false;
  votacionEstado: string = 'abierta';  // estado votación sincronizado
  fechaFinalElegida: string | null = null;
  minDate = new Date().toISOString();

  @ViewChild('graficoCanvas') graficoCanvas!: ElementRef;
  chart: Chart | undefined;

  constructor(
    private fechasService: FechasService,
    private grupoService: GrupoService
  ) {}

  ngOnInit() {
    this.grupoService.getGrupoId().subscribe(id => {
      if (id) {
        this.grupoId = id;

        // Escuchar cambios en el documento grupo para sincronizar estado votación y fecha final
        const grupoDocRef = doc(db, 'grupos', this.grupoId);
        onSnapshot(grupoDocRef, docSnap => {
          if (docSnap.exists()) {
            const grupoData = docSnap.data();
            this.votacionEstado = grupoData['votacionEstado'] || 'abierta';
            this.fechaFinalElegida = grupoData['fechaFinalElegida'] || null;
          }
        });

        // Escuchar propuestas de fechas
        this.fechasService.escucharPropuestas(id, propuestas => {
          this.propuestas = propuestas;
          this.dibujarGrafico();
        });
      }
    });
  }

  validarFormulario(): boolean {
  if (this.tipoFecha === 'dia') {
    return !!this.fechaUnica;
  } else {
    return !!this.fechaInicio && !!this.fechaFin && this.fechaFin >= this.fechaInicio;
  }
}

  proponerFecha() {
    if (!this.grupoId) return;

    const propuesta: PropuestaFecha = {
      tipo: this.tipoFecha,
      creadorId: this.userId,
      votos: [],
      ...(this.tipoFecha === 'dia'
        ? { fecha: this.fechaUnica }
        : { fechaInicio: this.fechaInicio, fechaFin: this.fechaFin })
    };

    this.fechasService.proponerFecha(this.grupoId, propuesta);
    this.resetFormulario();
  }

  votar(id: string) {
    if (this.votacionEstado !== 'abierta') {
    alert('La votación está cerrada, no puedes votar.');
    return;
  }
    this.fechasService.votarFecha(this.grupoId, id, this.userId);
  }

  yaHaVotado(p: PropuestaFecha) {
    return p.votos.includes(this.userId);
  }

  obtenerLabel(p: PropuestaFecha): string {
    if (p.tipo === 'dia' && p.fecha) {
      return `📅 ${this.formatDate(p.fecha)}`;
    }
    if (p.tipo === 'rango' && p.fechaInicio && p.fechaFin) {
      return `📆 Del ${this.formatDate(p.fechaInicio)} al ${this.formatDate(p.fechaFin)}`;
    }
    return 'Fecha no válida';
  }

  formatDate(fecha: string | undefined): string {
    return fecha ? new Date(fecha).toLocaleDateString() : '';
  }

  resetFormulario() {
    this.tipoFecha = 'dia';
    this.fechaUnica = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.mostrarFormulario = false;
  }

  dibujarGrafico() {
    if (!this.graficoCanvas || !this.propuestas.length) return;

    const canvas = this.graficoCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = this.propuestas.map(p => this.obtenerLabel(p));
    const votos = this.propuestas.map(p => p.votos.length);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Votos',
          data: votos,
          backgroundColor: '#4e8cff',
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  async cerrarVotacion() {
    if (this.votacionEstado === 'cerrada') {
      alert('La votación ya está cerrada.');
      return;
    }

    // Obtener todas las propuestas actuales
    const fechasRef = collection(db, 'grupos', this.grupoId, 'fechas');
    const fechasSnap = await getDocs(fechasRef);

    // Contar votos agrupados por "label"
    const conteoFechas: { [label: string]: number } = {};
    const etiquetas: { [label: string]: string } = {};

    fechasSnap.forEach(docSnap => {
      const data = docSnap.data() as PropuestaFecha;
      let label = '';
      let visual = '';

      if (data.tipo === 'dia' && data.fecha) {
        label = data.fecha;
        visual = new Date(data.fecha).toLocaleDateString();
      } else if (
        data.tipo === 'rango' &&
        data.fechaInicio &&
        data.fechaFin
      ) {
        label = `${data.fechaInicio}|${data.fechaFin}`;
        visual = `Del ${new Date(data.fechaInicio).toLocaleDateString()} al ${new Date(data.fechaFin).toLocaleDateString()}`;
      } else {
        return;
      }

      const votos = data.votos?.length || 0;
      etiquetas[label] = visual;
      conteoFechas[label] = (conteoFechas[label] || 0) + votos;
    });

    // Encontrar fecha con más votos
    let fechaGanadora: string | null = null;
    let maxVotos = -1;

    for (const [label, votos] of Object.entries(conteoFechas)) {
      if (votos > maxVotos) {
        maxVotos = votos;
        fechaGanadora = label;
      }
    }

    const fechaFinalTexto = fechaGanadora ? etiquetas[fechaGanadora] : 'No determinada';

    // Actualizar documento del grupo
    const grupoRef = doc(db, 'grupos', this.grupoId);
    await updateDoc(grupoRef, {
      votacionEstado: 'cerrada',
      fechaFinalElegida: fechaFinalTexto
    });

    // Actualizar estado local
    this.votacionEstado = 'cerrada';
    this.fechaFinalElegida = fechaFinalTexto;

    alert(`Votación cerrada con éxito. Fecha elegida: ${fechaFinalTexto}`);
  }

  desvotar(id: string) {
    if (this.votacionEstado !== 'abierta') {
    alert('La votación está cerrada, no puedes quitar el voto.');
    return;
  }
  if (!this.grupoId) return;
  this.fechasService.desvotarFecha(this.grupoId, id, this.userId);
}

}
