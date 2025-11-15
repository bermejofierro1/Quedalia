import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'src/app/core/firebase.config';
import { PlanService } from 'src/app/core/services/plan.service';

@Component({
  selector: 'app-planes-publicos',
  templateUrl: './planes-publicos.page.html',
  styleUrls: ['./planes-publicos.page.scss'],
  standalone: false
})
export class PlanesPublicosPage {
  planes: any[] = [];
  planesFiltrados: any[] = [];
  filtroCiudad: string = '';
  filtroFechaExacta: string = '';
  cargandoFiltros = false;
  isLoading=false;


  @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;


  constructor(
    private router: Router,
    private planService: PlanService,
    private route: ActivatedRoute
  ) { }

  async ionViewWillEnter() {
    try {
      await this.cargarPlanesPublicos();
    } catch (error) {
      console.error('Erorr al cargar los planes públicos',error);
    }
  }

  async cargarPlanesPublicos(){
    const planesRef=collection(db,'planesColaborativos');
    const q=query(planesRef,where('esPublico','==',true));
    const snapshot=await getDocs(q);
    this.planes=snapshot.docs.map(doc=> ({id:doc.id,...doc.data()}));
   this.planesFiltrados = [...this.planes];
  }

  aplicarFiltros() {
    this.cargandoFiltros = true;

    setTimeout(() => {
      this.planesFiltrados = this.planes.filter(plan => {
        const ciudadCoincide =
          this.filtroCiudad.trim() === '' ||
          plan.ciudad?.toLowerCase().includes(this.filtroCiudad.trim().toLowerCase());

        const fechasPlan: string[] = plan.fechasPropuestas || [];
        const fechaFiltrada = this.filtroFechaExacta?.split('T')[0]; // Formato YYYY-MM-DD

        const coincideFecha = !fechaFiltrada || fechasPlan.includes(fechaFiltrada);

        return ciudadCoincide && coincideFecha;
      });

      this.cargandoFiltros = false;
    }, 300);
  }

  resetFiltros() {
    this.filtroCiudad = '';
    this.filtroFechaExacta = '';
    this.planesFiltrados = [...this.planes];
  }

  verDetalle(planId: string) {
    this.planService.setPlanId(planId);
    this.router.navigate(['detalles'], { relativeTo: this.route });
  }

  onFechaSeleccionada(popover: any) {
    this.aplicarFiltros();
    popover.dismiss();
  }

  seleccionarHoy(popover: any) {
    const hoy = new Date().toISOString().split('T')[0];
    this.filtroFechaExacta = hoy;
    this.aplicarFiltros();
    popover.dismiss();
  }

  limpiarFecha(popover: any) {
    this.filtroFechaExacta = '';
    this.aplicarFiltros();
    popover.dismiss();
  }

  irACrearPlanPublico() {
    this.router.navigate(['crear-plan-publico'], { relativeTo: this.route });
  }

 async doRefresh(event:any){
    this.isLoading=true;
     const content = this.contentRef?.nativeElement;
    if (content) content.classList.add('blur-activo');
    try {
      await this.cargarPlanesPublicos();
      
    } catch (error) {
      console.error('Error al recargar la página');
    }finally{
      this.isLoading=false;
       if (content) content.classList.remove('blur-activo');
    event.target.complete();
    }
  }


}
