# Corona Inzidenz Widget für iOS (Scriptable)

Widget zeigt die Inzidenz, tägl. neue Fälle, sowie den Verlauf für 14 Tage an.

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/screenshot.png)

_Dank der positiven Resonanz, jetzt im Repo zur einfacheren Wartung/Erweiterung ( [Mein original GIST](https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5) ) Feedback, PRs, etc. sind Willkommen._

**☕️ Rphl einen Kaffee ausgeben 🙃:** https://ko-fi.com/rapha

# Features

* _Inzidenz_ + Trend für Stadt/Kreis, Bundesland
* _neue tägl. Fälle_ für Stadt/Kreis, Bundesland und Bund.
* Trend für _neue tägl. Fälle_ je Stadt/Kreis, Bundesland und Bund.
* 14 Tage Diagram für _neue tägl. Fälle_ je Stadt/Kreis, Bundesland und Bund.
* 7 Tage Schätzwert für _Reproduktionszahl (R)_
* iCloud Sync
* Offline Modus
* Dark/Light Mode unterstützung
* ...

**Hinweis**: Tägl. neue Fälle für Stadt/Bundesland + Trend sind erst nach 1-2 Tagen verfügbar (Caching nötig)

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/info.png)

# Installation/Update

**Manuell**
* Safari öffnen: https://raw.githubusercontent.com/rphl/corona-widget/master/incidence.js
* Skripttext kopieren
* Scriptable öffnen, kopierten Skripttext als neues Scriptablescript einfügen oder altes ersetzen.

**Automatisch** (Für dieses Repository nicht unterstützt)

Anleitung vom Basis-Repository
* Via Kurzbefehle (Shortcuts) App
* ...andere Option: https://github.com/rphl/corona-widget/issues/24
* ...andere Option: https://github.com/rphl/corona-widget/issues/6#issuecomment-721099314


# Konfiguration

* Daten werden unter **Dateien (App)** > **iCloud** > **Scriptable** > **coronaWidget** > *.json zwischengespeichert.
* Die allgemeine Konfiguration erfolgt mittels **WidgetParameter**:

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/widgetparameter.jpg)


## Statischen Standort Koordinaten

Das Widget erkennt automatisch den Standort. Es ist jedoch möglich, den Standort fest zu setzten. Die Koordinaten können z.B. über die Karten App ermittelt werden. Format: `{POSITION},{LAT},{LON};{POSITION},{LAT},{LON}`

* `{POSITION}` = Position im Widget. z.B.: 0=ErsterStandort, 1=ZweiterStandort (Zweispaltiges MediumWidget)
* `{LAT}` = Breitengrad. z.B.: 51.1234 _(NICHT 51,1234 - Kein Komma!)_
* `{LON}` = Längengrad. z.B.: 11.1234 _(NICHT 11,1234 - Kein Komma!)_

**Beispiele**

* Erster Standort statisch (SmallWidget): `0,51.1244,6.7353`
* Zweiter Standort ist statisch (MediumWidget): `1,51.1244,6.7353`
* Beide Standorte sind statisch (MediumWidget): `0,51.1244,6.7353;1,51.1244,6.7353`
* Nur zweiter Standort ist statisch (MediumWidget): `1,51.1244,6.7353`
 

## Eigene Standortnamen

Standorte selbst benennen. Format: `{POSITION},{LAT},{LON},{NAME};{POSITION},{LAT},{LON},{NAME}`

* `{NAME}` = Name der anstelle der offiziellen Bezeichnung aus der API verwendet wird.

**Beispiele**

 * Eigener Name z.B. "Home" für den ersten Standort: `0,51.1244,6.7353,Home`
 * Eigener Name z.B. "Work" für den zweiten Standort: `1,51.1244,6.7353,Work`


## Offline Modus

Falls mal keine Daten abgerufen werden können, kann der Offline Modus eingerichtet werden. Dafür muss die CacheID gesetzt werden: Format: `{POSITION},{LAT},{LON},{NAME},{CACHEID};{POSITION},{LAT},{LON},{NAME},{CACHEID}` 

Die `{CACHEID}` ist der numerische Teil der JSON Dateien die im Cacheordner zu finden sind: **Dateien (App)** > **iCloud** > **Scriptable** > **coronaWidget** > *.json

**Beispiel**: 

 * Dateiname = `coronaWidget01511.json `CacheID = `01511`
 * Cache für Düsselforf setzen: `0,51.1244,6.7353,Work,01511`
