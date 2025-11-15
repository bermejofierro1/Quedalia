import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GrupoService } from 'src/app/core/services/grupo.service';

@Component({
  selector: 'app-grupo-tabs',
  templateUrl: './grupo-tabs.page.html',
  styleUrls: ['./grupo-tabs.page.scss'],
  standalone:false
})
export class GrupoTabsPage implements OnInit {
 grupoId: string | null=null;

  constructor(private route: ActivatedRoute,private grupoService:GrupoService) {
  
  }
 ngOnInit() {
    this.grupoService.getGrupoId().subscribe((id) => {
      this.grupoId = id;
      console.log('Id del grupo en grupopage', this.grupoId);
    });
}
}
