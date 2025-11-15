import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { PlanService } from 'src/app/core/services/plan.service';


@Component({
  selector: 'app-colaborativos',
  templateUrl: './colaborativos.page.html',
  styleUrls: ['./colaborativos.page.scss'],
  standalone:false
})
export class ColaborativosPage implements OnInit {
    grupoId!: string;
  planes: any[] = [];
  loading = true;
  isLoading: boolean=false;
  @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;

  constructor(private route: ActivatedRoute,
    private planService: PlanService,private router:Router,
  private grupoService:GrupoService) {}

 ngOnInit() {
    this.grupoService.getGrupoId().subscribe(async id => {
    if (id) {
      this.grupoId = id;
      await this.cargarPlanes();
    } else {
      console.warn('grupoId no está disponible');
    }
  });
  }

  async ionViewWillEnter() {
    // Se ejecuta cada vez que se entra en la vista
    if (this.grupoId) {
      await this.cargarPlanes();
    }
  }

  
  async cargarPlanes() {
    this.loading = true;
    this.planes = await this.planService.obtenerPlanesPorGrupo(this.grupoId);
    this.loading = false;
  }

  verDetalle(planId: string) {
    this.planService.setPlanId(planId);
   this.router.navigate(['detalle-plan-colaborativo'], { relativeTo: this.route });
}

async doRefresh(event: any) {
  this.isLoading = true;
   const content = this.contentRef?.nativeElement;
    if (content) content.classList.add('blur-activo');

  try {
    await this.cargarPlanes();
  } catch (error) {
    console.error('Error al refrescar planes:', error);
  } finally {
    this.isLoading = false;
     if (content) content.classList.remove('blur-activo');
    event.target.complete();
  }
}

}
