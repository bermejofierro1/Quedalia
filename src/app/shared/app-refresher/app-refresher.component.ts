import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-refresher',
  templateUrl: './app-refresher.component.html',
  styleUrls: ['./app-refresher.component.scss'],
  standalone:false
})
export class AppRefresherComponent  {
  @Output() refresher = new EventEmitter<any>();

  onRefresh(event: any) {
    this.refresher.emit(event);
  }
}
