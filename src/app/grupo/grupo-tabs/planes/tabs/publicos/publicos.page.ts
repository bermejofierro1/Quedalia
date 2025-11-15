import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'src/app/core/firebase.config';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { PlanService } from 'src/app/core/services/plan.service';

@Component({
  selector: 'app-publicos',
  templateUrl: './publicos.page.html',
  styleUrls: ['./publicos.page.scss'],
  standalone:false
})
export class PublicosPage  {
  planes: any[] = [];
  grupoId:string='';
  constructor(private router:Router,private planService:PlanService,private route:ActivatedRoute) { }

   async ionViewWillEnter() {
     const planesRef = collection(db, 'planesColaborativos');
    const q = query(planesRef, where('esPublico', '==', true));
    const snapshot = await getDocs(q);
    this.planes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

verDetalle(planId: string) {
    this.planService.setPlanId(planId);
   this.router.navigate(['detalle-plan-publico'], { relativeTo: this.route });
}

}
