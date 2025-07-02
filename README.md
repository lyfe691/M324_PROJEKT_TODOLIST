## CI/CD-Pipeline

Dieses Projekt verwendet eine GitHub Actions Pipeline, die bei jedem Merge Request (Pull Request) auf den Branch `main` automatisch ausgeführt wird.

### Ablauf:
- **Backend (Java + Maven)**  
  - Führt automatisierte Tests aus (`mvn test`)  
  - Baut ein `.jar`-Artefakt (`mvn package`)

- **Frontend (React + Vitest)**  
  - Führt Tests mit Vitest aus (`npm run test:run`)  
  - Erstellt ein Produktionsbuild im Ordner `dist/` (`npm run build`)

### Artefakte:
Die gebauten Artefakte (Backend `.jar`, Frontend `dist/`) werden nach jedem Lauf als **Download-Artefakte** im jeweiligen Actions-Run bereitgestellt. Sie können manuell heruntergeladen und lokal verwendet werden, z. B.:

- Backend starten:  
  `java -jar target/app.jar`

- Frontend lokal serven:  
  `npx serve dist/`
