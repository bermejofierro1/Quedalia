import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-swipe-back-wrapper',
  standalone:false,
  template: `
    <ion-router-outlet #gestureArea></ion-router-outlet>
  `,
  styles: [`
    ion-router-outlet {
      height: 100%;
      display: block;
    }
  `]
})
export class SwipeBackWrapperComponent implements AfterViewInit {
  @ViewChild('gestureArea', { static: true, read: ElementRef }) gestureArea!: ElementRef;

  private gesture?: Gesture;

  constructor(private gestureCtrl: GestureController, private location: Location) {}

  ngAfterViewInit() {
    this.gesture = this.gestureCtrl.create({
      el: this.gestureArea.nativeElement,
      gestureName: 'swipe-to-go-back',
      threshold: 15,
      onEnd: ev => {
        if (ev.deltaX > 100 && Math.abs(ev.deltaY) < 50) {
          this.location.back();
        }
      }
    });
    this.gesture.enable(true);
  }
}
