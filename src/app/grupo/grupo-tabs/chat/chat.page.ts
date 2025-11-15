import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { auth } from 'src/app/core/firebase.config';
import { ChatService } from 'src/app/core/services/chat.service';
import { GrupoService } from 'src/app/core/services/grupo.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit {
  grupoId!: string;
  mensajesAgrupados: any[] = [];
  nuevoMensaje: string = '';
  usuarioNombre: string = '';
  userId: string = '';
  unsubscribe: any;

  constructor(
    private chatService: ChatService,
    private grupoService: GrupoService
  ) { }

  ngOnInit() {
    this.grupoService.getGrupoId().subscribe(grupoId => {
      if (!grupoId) {
        console.error('grupoId no disponible');
        return;
      }

      this.grupoId = grupoId;
      const user = auth.currentUser;
      this.usuarioNombre = user?.displayName || 'Anónimo';
      this.userId = user?.uid || '';

      this.unsubscribe = this.chatService.escucharMensajes(this.grupoId, (mensajes) => {
        // Procesamos y agrupamos los mensajes cada vez que llegan
        this.mensajesAgrupados = this.chatService.agruparMensajes(mensajes);

        // Notificar solo si el último mensaje NO es mío
        const ultimo = mensajes[mensajes.length - 1];
        if (ultimo?.autorId !== this.userId) {
          this.notificar();
        }
      });
    });
  }

  enviar() {
    if (this.nuevoMensaje.trim()) {
      this.chatService.enviarMensaje(this.grupoId, this.nuevoMensaje, this.usuarioNombre);
      this.nuevoMensaje = '';
    }
  }

  notificar() {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
