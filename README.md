# SAIP - Sistema de Agentes de Inteligencia Artificial de Petroil

## 📋 Descripción

SAIP (Sistema de Automatización Inteligente Petroil) es una plataforma web moderna desarrollada con React que integra múltiples agentes de IA especializados para diferentes propósitos dentro de Petroil. Cada agente tiene su módulo específico y componentes dedicados.

## 🏗️ Arquitectura del Sistema

La plataforma está organizada en módulos, donde cada módulo contiene uno o más agentes especializados:

### Módulos Disponibles

- **🤖 Petroil-GPT**: Agente conversacional con capacidades de RAG (Retrieval-Augmented Generation)
- **📰 Noticias**: Módulo de investigación con agentes de noticias y scraping web
- **📄 OCR**: Procesamiento de documentos con reconocimiento óptico de caracteres
- **💰 Módulo Financiero**: Consulta de datos financieros
- **📊 Monitoreo**: Sistema de monitoreo (próximamente)

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca principal de UI
- **Vite 6.3.5** - Herramienta de construcción y desarrollo
- **React Router DOM 6.30.0** - Enrutamiento
- **Tailwind CSS 4.1.7** - Framework de estilos
- **Heroicons** - Iconografía
- **Framer Motion** - Animaciones

### Librerías Adicionales
- **React Markdown** - Renderizado de markdown
- **React Syntax Highlighter** - Resaltado de sintaxis
- **React Toastify** - Notificaciones
- **jsPDF** - Generación de PDFs
- **date-fns** - Manipulación de fechas

## 📁 Estructura del Proyecto

```
saip/
├── public/
│   ├── petroil.png
│   └── vite.svg
├── src/
│   ├── assets/
│   │   ├── cif.png
│   │   └── react.svg
│   ├── components/
│   │   ├── admin/
│   │   ├── AgentNavigation.jsx
│   │   ├── AuthContext.jsx
│   │   ├── ChatAgent.jsx
│   │   ├── MainLayout.jsx
│   │   ├── MainSidebar.jsx
│   │   ├── ModuleNavigation.jsx
│   │   ├── NewsAgentPage.jsx
│   │   ├── OCRAgentPage.jsx
│   │   ├── ResearchModulePage.jsx
│   │   └── [otros componentes...]
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── package.json
├── vite.config.js
├── tailwind.config.js
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd AgentAlchemy-front/saip (Cambiar según nombre del repo)
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración del entorno local
VITE_API_BASE_URL=/api
VITE_BACKEND_URL=http://localhost:8000 (Dirección del backend entry point)

# Configuración de productivo
VITE_BACKEND_URL=https://dd4rcbh8rf.execute-api.us-east-1.amazonaws.com (API gateway de aws)
VITE_API_BASE_URL=/api
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción
- `npm run lint` - Ejecuta el linter ESLint

## 🌐 Despliegue en Google Cloud Platform (VM)

### Prerrequisitos
- Instancia VM de GCP con Ubuntu/Debian
- Acceso SSH a la instancia
- Dominio configurado (opcional)

### Pasos de Despliegue

1. **Conectar a la instancia VM**
```bash
gcloud compute ssh tu-instancia --zone=tu-zona
```

2. **Instalar Node.js y npm**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Instalar Nginx**
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

4. **Clonar y configurar el proyecto**
```bash
git clone <url-del-repositorio>
cd AgentAlchemy-front/saip
npm install
```

5. **Configurar variables de entorno para producción**
```bash
cp .env .env.production
# Editar .env.production con la IP externa de la VM (Aquí como el backend está aún en la instancia de AWS seguir usando la url del api gateway)
echo "VITE_BACKEND_URL=http://TU_IP_EXTERNA:8000" > .env.production
echo "VITE_API_BASE_URL=/api" >> .env.production
```

6. **Construir la aplicación**
```bash
npm run build
```

7. **Configurar Nginx**
```bash
sudo nano /etc/nginx/sites-available/saip
```

Agregar la siguiente configuración:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;  # o la IP externa
    root /home/usuario/AgentAlchemy-front/saip/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }    
}
```

8. **Activar el sitio**
```bash
sudo ln -s /etc/nginx/sites-available/saip /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

9. **Configurar firewall**
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

10. **Configurar reglas de firewall en GCP**
```bash
gcloud compute firewall-rules create allow-http --allow tcp:80
gcloud compute firewall-rules create allow-https --allow tcp:443
```

La aplicación estará disponible en `http://TU_IP_EXTERNA`

## 🔐 Autenticación

El sistema incluye un sistema de autenticación completo con:

- **Login/Registro** de usuarios
- **Rutas protegidas** con ProtectedRoute
- **Roles de usuario** (admin/usuario)
- **Gestión de tokens** JWT
- **Contexto de autenticación** global

## 🎨 Personalización

### Colores del Tema

Los colores personalizados están definidos en `tailwind.config.js`:

```javascript
colors: {
  'saip-blue': '#0013A6',
  'saip-yellow': '#FFFF00',
}
```

### Configuración del Proxy

El proxy para desarrollo está configurado en `vite.config.js` para redirigir las llamadas API al backend.

## 📱 Características Principales

- **Interfaz Responsiva** - Optimizada para desktop y móvil
- **Sidebar Colapsible** - Navegación adaptable
- **Módulos Dinámicos** - Carga de agentes por módulo
- **Chat en Tiempo Real** - Streaming de respuestas
- **Gestión de Documentos** - Upload y procesamiento de archivos
- **Notificaciones** - Sistema de alertas y mensajes
- **Temas Personalizables** - Colores corporativos de Petroil

## 🔧 Configuración de Desarrollo

### ESLint

El proyecto incluye configuración de ESLint para mantener la calidad del código:

```bash
npm run lint
```

### Variables de Entorno

- `VITE_BACKEND_URL` - URL del backend API
- `VITE_API_BASE_URL` - Prefijo base para las rutas API
- `VITE_NEWS_AGENT_ENDPOINT` - Endpoint del agente de noticias
- `VITE_SCRAPER_AGENT_ENDPOINT` - Endpoint del agente scraper

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de CORS**: Verificar configuración del proxy en `vite.config.js`
2. **Variables de entorno no cargadas**: Asegurar que el archivo `.env` esté en la raíz
3. **Errores de construcción**: Verificar versiones de Node.js y dependencias

### Logs de Desarrollo

Para habilitar logs detallados:
```bash
DEBUG=* npm run dev
```

## 📄 Licencia

Este proyecto es propiedad de Grupo Petroil y está destinado para uso interno.

## 👥 Equipo de Desarrollo

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: API REST con Fast API [python]

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contactar con:
 - Mauro Alejandro Montenegro (m.montenegro.meza@gmail.com, pprocesos1@petroil.com.mx)
---

**Versión del Sistema**: v2.1.0  
**Última Actualización**: 2024  
**Desarrollado por**: Equipo de Desarrollo Petroil