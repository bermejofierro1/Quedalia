import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from 'src/app/core/services/plan.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone:false
})
export class FavoritosPage implements OnInit {
favoritos: any[] = [];
  cargando = true;
  

  constructor(
    private router: Router,
    private userService: UserService,
    private route:ActivatedRoute,
    private planService:PlanService
  ) {}

  async ngOnInit() {
    this.cargando = true;
    this.favoritos = await this.userService.getPlanesFavoritos();
    this.cargando = false;
  }

  verDetalle(planId: string) {
    this.planService.setPlanId(planId);
    this.router.navigate(['detalles'], { relativeTo: this.route });
  }

}
