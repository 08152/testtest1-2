# Risky Engine 0.1

Eine kleine eigene 3D/2D-orientierte Game-Engine als Browser-Prototyp.

## Enthalten
- GLB/GLTF Import
- Anzeige von importierten Modellen
- Erkennung und Abspielen von GLB-Animationen
- Textur-Import
- Texturen per Drag & Drop auf Objekte
- Würfel, Kugel und Ebene
- Transform-Werkzeuge
- einfache Terrain-/Gras-Pinsel-Funktion
- Szene speichern
- Asset-Liste
- Inspector
- Szene-Baum
- vorbereitetes 2D-/Menü-System

## Dateien
Alle Dateien liegen absichtlich direkt im Hauptordner. Es gibt keine Unterordner.

## Start
Am zuverlässigsten über einen lokalen Webserver öffnen, weil Browser ES-Module und lokale Dateien je nach Browser blockieren können.

Beispiel:
python -m http.server 8000

Danach im Browser:
http://localhost:8000

Die Engine lädt Three.js und Loader über CDN.
