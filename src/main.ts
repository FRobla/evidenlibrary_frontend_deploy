import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { appConfig } from './app/app.config';

// Importar el compilador antes de iniciar el bootstrap
import '@angular/compiler';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));