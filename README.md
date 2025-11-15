# Quedalia

La app para organizar quedadas, planes colaborativos y gastos entre amigos.

<p align="center"> <img src="https://img.shields.io/badge/Ionic-6.0-blue?logo=ionic" /> <img src="https://img.shields.io/badge/Angular-17-red?logo=angular" /> <img src="https://img.shields.io/badge/Firebase-Cloud-orange?logo=firebase" /> <img src="https://img.shields.io/badge/Leaflet-Maps-1E824C?logo=leaflet" /> <img src="https://img.shields.io/badge/Status-In_Development-yellow" /> </p>

<b> 📱  Descripción </b>

Quedalia es una aplicación móvil diseñada para simplificar la organización de planes en grupo, votaciones, chat en tiempo real y gestión de gastos compartidos (Tricoins).
Construida con Ionic + Angular y potenciada por Firebase, ofrece sincronización en tiempo real, almacenamiento seguro y una experiencia moderna y colaborativa.

## DESCARGA DE APK
 Enlace ---> https://drive.google.com/file/d/14w48LZvkNqVLbT_ZEvyxN9ywpkfcXi_W/view?usp=drive_link

## ✨ Características Principales
### 👥 1. Grupos

Creación y gestión de grupos de amigos o comunidades.

Votaciones internas para elegir fechas y detalles.

Miembros reales y ficticios.

Registro histórico de participación.

### 📅 2. Planes (Colaborativos y Públicos)

Creación de planes privados y públicos.

Sistema de votaciones integrado.

Solicitud de participación aprobada colaborativamente.

Mapas interactivos con Leaflet.

### 💰 3. Tricoins — Gestión de Gastos

Registro de pagos y deudores.

Cálculo automático de saldos.

Inclusión de miembros ficticios para repartir gastos de forma precisa.

### 📸 4. Álbumes y Fotos

Subida, almacenamiento y visualización de fotos por grupo/álbum.

Filtros avanzados por fecha o usuario.

Reconocimiento de ciudad con IA (roadmap).

### 💬 5. Chat en Tiempo Real

Chat interno por grupo.

Comunicación centralizada para planes, votaciones y decisiones.

### 🔔 6. Notificaciones

Alertas por solicitudes, votaciones, mensajes y cambios.

Estado de notificaciones con contador dinámico.

### 🧑 7. Perfil e Historial

Edición de nombre y foto.

Historial de actividad: futuros, en progreso y realizados.

## 🛠 Tecnologías Utilizadas
Capa	Tecnología
Frontend	Ionic, Angular
Backend	Firebase Auth, Firestore, Cloud Functions
Almacenamiento	Firebase Storage
Mapas	Leaflet
Gráficos	Chart.js
Nativo	Capacitor
Flujo / Rx	RxJS

## 🧩 Arquitectura Simplificada
flowchart TD
    A[App Ionic/Angular] --> B[Firebase Auth]
    A --> C[Firestore - Datos en tiempo real]
    A --> D[Cloud Storage - Fotos]
    A --> E[Cloud Functions - Lógica avanzada]
    A --> F[Leaflet - Mapas]
    C --> A
    D --> A

## 🚀 Instalación y Ejecución Web
### Clonar el repositorio
git clone https://github.com/tu-usuario/app-quedadas.git

### Entrar al proyecto
cd app-quedadas

### Instalar dependencias
npm install

### Ejecutar en modo desarrollo
ionic serve

## 🚀 Instalación y Ejecución APK



## 🎨 Capturas de Pantalla

### INICIO DE SESIÓN
![IMG-20251115-WA0027](https://github.com/user-attachments/assets/bbf55f7d-ca8d-45af-8289-2d553fb9d781)
![IMG-20251115-WA0028](https://github.com/user-attachments/assets/961278e4-0929-4580-99ad-7c78b6cf865b)


### HOME
![IMG-20251115-WA0025](https://github.com/user-attachments/assets/3365a325-9fdc-48ca-91ee-36491d53ec95)


### PLANES
![IMG-20251115-WA0022](https://github.com/user-attachments/assets/e5a2abd2-62d6-403f-be76-02db77a2bc1e)

### NOTIFICACIONES Y PERFIL
![IMG-20251115-WA0019](https://github.com/user-attachments/assets/2df4bc89-1c7a-47fd-86ae-48debb22ee3d)
![IMG-20251115-WA0018](https://github.com/user-attachments/assets/c0d89374-7719-46ca-ba7f-edf3f98d80d5)

### GRUPOS PRIVADOS Y PÚBLICOS (Con tricoins, chat, crear plan, votaciones de fecha... )

![IMG-20251115-WA0015](https://github.com/user-attachments/assets/da0fb363-df2b-45e6-ba67-32c43db49c47)
![IMG-20251115-WA0014](https://github.com/user-attachments/assets/90278100-ecfb-4208-8bd3-ee85fd40acae)
![IMG-20251115-WA0024](https://github.com/user-attachments/assets/69ac8c3e-dd4b-47ce-896e-089bc3766f17)
![IMG-20251115-WA0023](https://github.com/user-attachments/assets/d1d71bd0-c14c-48b1-a0bf-a948b09b82be)
![IMG-20251115-WA0020](https://github.com/user-attachments/assets/ee70e73e-a14a-4b10-b6bd-8ee14e877894)
![IMG-20251115-WA0017](https://github.com/user-attachments/assets/2dc55988-4c95-4f29-9929-7e83c4fc74bf)
![IMG-20251115-WA0016](https://github.com/user-attachments/assets/2a686c10-32a9-4e4a-9707-5e86d358b779)

## 🗂 Estructura de Directorios
src/
  app/
    modules/
    pages/
    services/
    components/
    models/
  assets/
    images/
    icons/
  environments/

## 🧭 Roadmap

 IA para reconocimiento de ubicación en fotos

 Modo offline (Firestore cache avanzado)

 Avatar Maker / sistema de perfiles mejorado

 Reacciones en el chat

 Exportar gastos a PDF

 Panel web de administración


## ⭐ Apoya el proyecto

Si te gusta Quedalia, deja una estrella ⭐ en GitHub.
