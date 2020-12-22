// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: briefcase-medical;
/**
 * Licence: Robert Koch-Institut (RKI), dl-de/by-2-0
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * BASE VERSION FORKED FROM AUTHOR: kevinkub https://gist.github.com/kevinkub/46caebfebc7e26be63403a7f0587f664/c5db6e2c1c45a41bdd4a85990c0d0b883915b3c3
 * FORKED FROM THIS VERSION (AUTHOR: https://github.com/rphl) https://github.com/rphl/corona-widget/
 * THIS VERSION (AUTHOR: https://github.com/TiborAdk) https://github.com/TiborAdk/corona-widget
 *
 */

// ============= EXTRA KONFIGURATION ============= ============= ===========
const CFG = {
    area: {
        showIcon: true // show "Icon" before AreaName: Like KS = Kreisfreie Stadt, LK = Landkreis,...
    },
    state: {
        useShortName: true, // use short name of stateRow
    },
    graph: {
        shownDays: 21, // number of days shown in graphs
        aboveTitle: false,  // show graphs above there title
        upsideDown: false,   // show graphs upside down (0 is top, max is bottom, default is: 0 at bottom and max at the top)
        showTrendCases: true, // show trend arrow of cases
        showIndex: 'cases', // values used for the graph. 'cases' for cases or 'incidence' for incidence
    },
    storage: {
        maxDays: 28, // WARNING!!! Smaller values will delete saved days > CONFIG_CACHE_MAX_DAYS. Backup JSON first ;-)
        directory: 'CoronaWidgetNextDev',
        file: 'coronaWidget_'
    },
    api: {
        csvRvalueField: ['Schätzer_7_Tage_R_Wert', 'Punktschätzer des 7-Tage-R Wertes'], // numbered field (column), because of possible encoding changes in columns names on each update

    },
    widget: {
        refreshInterval: 3600,  // interval the widget is updated after (in seconds),
        openUrlOnTap: false, // open url on tap
        openUrl: "https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4"
    },
    gpsCache: {
        accuracy: 2, // accuracy the gps staticCoords are cached with (0: 111 Km; 1: 11,1 Km; 2: 1,11 Km; 3: 111 m; 4: 11,1 m)
    }
}

// ============= ============= ============= ============= =================
// HALT, STOP !!!
// NACHFOLGENDE ZEILEN NUR AUF EIGENE GEFAHR ÄNDERN !!!
// ============= ============= ============= ============= =================
// ZUR KONFIGURATION SIEHE README:
// https://github.com/tiboradk/corona-widget/blob/master/README.md
// ============= ============= ============= ============= =================

/**
 * Predefined colors
 * @enum {Color}
 */
const Colors = {
  WARN: new Color('#dbc43d'),
  DARKDARKRED: new Color('#6b1200'),
  DARKRED: new Color('#a1232b'),
  RED: new Color('#f6000f'),
  ORANGE: new Color('#ff7927'),
  YELLOW: new Color('#f5D800'),
  GREEN: new Color('#1CC747'),
  GRAY: new Color('#d0d0d0'),
  DEBUG_BLUE: new Color('#0047bb'),
  DEBUG_GREEN: new Color('#00b140'),
};

/**
 * Predefined Fonts
 * @enum {Font}
 */
const Fonts = {
  XLARGE: Font.boldSystemFont(26),
  LARGE: Font.mediumSystemFont(20),
  MEDIUM: Font.mediumSystemFont(14),
  NORMAL: Font.mediumSystemFont(12),
  SMALL: Font.boldSystemFont(11),
  SMALL2: Font.boldSystemFont(10),
  XSMALL: Font.boldSystemFont(9),
  XLARGE_MONO: Font.boldMonospacedSystemFont(26),
  LARGE_MONO: Font.mediumMonospacedSystemFont(20),
  MEDIUM_MONO: Font.mediumMonospacedSystemFont(14),
  NORMAL_MONO: Font.mediumMonospacedSystemFont(12),
  SMALL_MONO: Font.boldMonospacedSystemFont(11),
  SMALL2_MONO: Font.boldMonospacedSystemFont(10),
  XSMALL_MONO: Font.boldMonospacedSystemFont(9),
};

/**
 * Alignments
 * @enum {string}
 */
const Align = {
  LEFT: 'align_left',
  CENTER: 'align_center',
  RIGHT: 'align_right',
};

/**
 * Available Layout directions
 * @enum {string}
 */
const Layout = {
  HORIZONTAL: 'h',
  VERTICAL: 'v',
};

/**
 * Available trend arrows
 * @enum {string}
 */
const TrendArrow = {
  UP: '↑',
  DOWN: '↓',
  RIGHT: '→',
  UP_RIGHT: '↗',
};

/**
 *
 * @enum {string}
 */
const AreaTypes = {
  KS: 'KS', // Kreisfreie Stadt
  SK: 'SK', // Stadtkreis
  K: 'K',  // Kreis
  LK: 'LK', // Landkreis
  SV_K: 'K', // Sonderverband offiziell Kreis
  SV_LK: 'LK',  // Sonderverband offiziell Landkreis
  BZ: 'BZ', // Bezirk?
};

/**
 *
 * @enum {{color: Colors, limit: number}}
 */
const Incidence = {
  DARKDARKRED: {limit: 250, color: Colors.DARKDARKRED},
  DARKRED: {limit: 100, color: Colors.DARKRED},
  RED: {limit: 50, color: Colors.RED},
  ORANGE: {limit: 35, color: Colors.ORANGE},
  YELLOW: {limit: 25, color: Colors.YELLOW},
  GREEN: {limit: 1, color: Colors.GREEN},
  GRAY: {limit: 0, color: Colors.GRAY},
};

/**
 *
 * @enum {string}
 */
const RequestType = {
  JSON: 'json',
  STRING: 'string',
};

/**
 *
 * @enum {{icon: string, text: string}}
 */
const DataStatus = {
  OK: {icon: '🆗', text: 'OK'},
  OFFLINE: {icon: '⚡️', text: 'offline'},
  CACHED: {icon: '💾', text: 'cached'},
  ERROR: {icon: '🚫', text: 'error'},
  NOT_FOUND: {icon: '🚫', text: 'not found'},
  NO_GPS: {icon: '📡', text: 'GPS?'},
  STATIC_LOC: {icon: '', text: ''},
  CURRENT_LOC: {icon: '📍', text: 'GPS'},
};

/**
 *
 * @enum {string}
 */
const LocationStatus = {
  /** current location */
  CURRENT: 'current',
  /** static location set via parameters*/
  STATIC: 'static',
  /** failed to optain a location */
  FAILED: 'failed',
};

/**
 *
 * @enum {string}
 */
const WidgetSizes = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  DEFAULT: 'medium',
};

const ENV = {
  states: new Map([
        ['1', {short: 'SH', name: 'Schleswig-Holstein'}],
        ['2', {short: 'HH', name: 'Hamburg'}],
        ['3', {short: 'NI', name: 'Niedersachsen'}],
        ['4', {short: 'HB', name: 'Bremen'}],
        ['5', {short: 'NRW', name: 'Nordrhein-Westfalen'}],
        ['6', {short: 'HE', name: 'Hessen'}],
        ['7', {short: 'RP', name: 'Rheinland-Pfalz'}],
        ['8', {short: 'BW', name: 'Baden-Württemberg'}],
        ['9', {short: 'BY', name: 'Bayern'}],
        ['10', {short: 'SL', name: 'Saarland'}],
        ['11', {short: 'BE', name: 'Berlin'}],
        ['12', {short: 'BB', name: 'Brandenburg'}],
        ['13', {short: 'MV', name: 'Mecklenburg-Vorpommern'}],
        ['14', {short: 'SN', name: 'Sachsen'}],
        ['15', {short: 'ST', name: 'Sachsen-Anhalt'}],
        ['16', {short: 'TH', name: 'Thüringen'}],
      ],
  ),
  areaIBZ: new Map([
        [40, AreaTypes.KS], // Kreisfreie Stadt
        [41, AreaTypes.SK], // Stadtkreis
        [42, AreaTypes.K],  // Kreis
        [43, AreaTypes.LK], // Landkreis
        [45, AreaTypes.SV_K], // Sonderverband offiziell Kreis
        [46, AreaTypes.SV_LK],  // Sonderverband offiziell Landkreis
      ],
  ),
  state: {
    nameIndex: CFG.state.useShortName ? 'short' : 'name',
  },
  staticCoords: [],
  cache: new Map(),
  errTxt: '⚡️ Daten konnten nicht geladen werden. \nWidget öffnen für reload. \n\nTIPP: Cache Id in Widgetparamter setzen für Offline modus.',
  graph: {
    show: {
      cases: 'cases',
      incidence: 'incidence',
    },
  },
};

class CustomWidget {
  constructor() {}

    async init() {
        this.widget = await this.createWidget();
        this.widget.setPadding(0, 0, 0, 0);
        if (!config.runsInWidget) {
            await this.present();
        }
        Script.setWidget(this.widget);
        Script.complete();
    }

    async present() {
        if (this.isLarge()) {
            await this.widget.presentLarge()
        } else if (this.isMedium()) {
            await this.widget.presentMedium()
        } else if (this.isSmall()) {
          await this.widget.presentSmall();
        } else {
          // medium as default
          await this.widget.presentMedium();
        }
    }

  async createWidget() {}

  /**
   *
   * @param {string} family
   */
  setSizeByWidgetFamily(family) {
    switch (family) {
      case 'small':
        this.size = WidgetSizes.SMALL;
        break;
      case 'medium':
        this.size = WidgetSizes.MEDIUM;
        break;
      case 'large':
        this.size = WidgetSizes.LARGE;
        break;
      default:
        this.size = WidgetSizes.MEDIUM;
        break;
    }
  }

  /**
   *
   * @param {number} count
   */
  setSizeByParameterCount(count) {
    if (count < 0) {
      throw `count must be at least 0 (is: ${count})`;
    } else if (count < 2) {
      this.size = WidgetSizes.SMALL;
    } else if (count < 3) {
      this.size = WidgetSizes.MEDIUM;
    } else if (count <= 6) {
      this.size = WidgetSizes.LARGE;
    } else {
      throw `count must not be larger then 6 (is: ${count})`;
    }
  }

  isLarge() {
    return CustomWidget.isLarge(this.size);
  }

  isMedium() {
    return CustomWidget.isMedium(this.size);
  }

  isSmall() {
    return CustomWidget.isSmall(this.size);
  }

  static isLarge(size) {
    return size === WidgetSizes.LARGE;
  }

  static isMedium(size) {
    return size === WidgetSizes.MEDIUM;
  }

  static isSmall(size) {
    return size === WidgetSizes.SMALL;
  }
}

class IncidenceWidget extends CustomWidget {
  /**
   *
   * @param {string} parameters
   * @param {string} family
   * @param {{index : number, latitude: number, longitude: number, name: (string|name)}[]} coords
   */
  constructor(parameters, family, coords = []) {
    super();
    parameters = parameters ?? '0, 52.52, 13.42; 1,52.02,8.54'; // current location and Berlin as default

    /** @type {{index: number, latitude: number, longitude: number, name: (string|null)}[]} */
    this.parameters = [...Parse.input(parameters), ...coords];

    if (family ?? false) {
      this.setSizeByWidgetFamily(family);
      //cfm.write('family: ' + family + ' -> ' + this.size, '_debug.txt')
    } else {
      this.setSizeByParameterCount(this.parameters.length);
      //cfm.write('parameters: ' + family + ' -> ' + this.size, '_debug.txt')
    }

    // this.selfUpdate()
  }

  /**
   *
   * @returns {Promise<ListWidget>}
   */
  async createWidget() {
    const list = new ListWidget();
    // setting up layout

    // making sure padding of widget parts is constant
    // if we set the padding for the ListWidget some inner elements 'overflow'
    // if we use this method they wont
    const padL = 6;
    const padR = 6;
    list.addSpacer(6); // ListWidget top padding

    const show = this.isLarge() ? 6 : this.isMedium() ? 2 : 1;
    this.parameters.slice(0, show);

    const topBar = new UI(list).stack(Layout.HORIZONTAL,
        [0, padL + 1, 0, padR + 1]);
    topBar.text('🦠', Font.mediumSystemFont(22));
    topBar.space(3);

    const topRStack = new UI(topBar).stack(Layout.VERTICAL);

    list.addSpacer(4);
    const areaStack = new UI(list).stack(Layout.VERTICAL,
        [0, padL, 0, padR]); // stack for areas

    //list.addSpacer(4); // spacing between elements
    list.addSpacer(); // align stateBar bottom
    const stateBar = new UI(list).stack(Layout.VERTICAL,
        [0, padL + 1, 0, padR + 1]); // stack for states

    // GER
    const respGer = await CustomData.loadCountry('GER');
    if (respGer.succeeded()) {
      const dataGer = Helper.calcIncidence(respGer.data);
      topBar.space();
      if (!this.isSmall()) {
        UIComp.smallIncidenceRow(topBar, dataGer, {}, '#99999900');
      }
      // if the widget is small, GER is added as a 2nd state

      // R
      const r = dataGer.meta.r;
      topRStack.text(Format.number(r.r, 2, 'n/v') + 'ᴿ',
          Fonts.MEDIUM);
      topRStack.text(Format.dateStr(dataGer.getDay().date), Fonts.XSMALL,
          '#777');
    }

    // AREAS
    let maxI = 0;
    let maxC = 0;

    const confId = btoa('cID' +
        JSON.stringify(this.parameters).replace(/[^a-zA-Z ]/g, ''));

    // [{index, lat, lon, name}] => [ {status: status, data: [data, name]} ]
    /** @type {({data: [CustomData, string] | [null], status: DataStatus})[]} */
    const rows = await Promise.all(this.parameters.map(
        async ({index, latitude, longitude, name}) => {
          const respArea =
              await CustomData.loadArea(confId, index, latitude, longitude,
                  name);
          const status = respArea.status;
          if (!respArea.succeeded()) {
            console.warn('loading Area failed. DataStatus: ' + status);
            return {status: status, data: [null, null]};
          }
          const area = respArea.data;
          const areaWithIncidence = Helper.calcIncidence(area);

          const lMaxI = areaWithIncidence.getMaxIncidence();
          if (lMaxI > maxI) {
            maxI = lMaxI;
          }

          const lMaxC = areaWithIncidence.getMaxCases();
          if (lMaxC > maxC) {
            maxC = lMaxC;
          }
          return {status: status, data: [areaWithIncidence, name]};

        },
    ));

    // UIComp.areas(areaStack, this.size, rows.slice(0, show), {cases: maxC, incidence: maxI})
    UIComp.areas(areaStack, this.size, rows);

    if (this.isSmall()) {
      const status = DataResponse.isSuccess(rows[0].status)
          ? rows[0].data[0].location.status
          : rows[0].status;
      UIComp.statusBlock(topBar, status);
      topBar.space();
    }

    // STATES
    const processed = {};
    const states = [];
    for (const row of rows) {
      const meta = row.data[0].meta;
      const id = meta.BL_ID;
      if (processed[id]) continue; // skip duplicated areas
      const resp = await CustomData.loadState(id, meta.BL, meta.EWZ_BL);

      if (DataResponse.isSuccess(resp.status)) {
        states.push(Helper.calcIncidence(resp.data));
        processed[id] = true;
      } else {
        console.warn('Loading state failed. status: %s', resp.status);
      }
    }

    if (this.isSmall() && respGer.succeeded()) {
      states.push(respGer.data);
    }
    for (let i = 0; i < states.length; i += 2) {
      const state0 = states[i];
      const state1 = (i + 1) < states.length ? states[i + 1] : null;
      UIComp.stateRow(stateBar, this.size, state0, state1);
      stateBar.space(4);
    }

    list.addSpacer(6); // bottom padding for ListWidget

    // UI ===
    if (CFG.widget.openUrlOnTap) list.url = CFG.widget.openUrl;
    list.refreshAfterDate = new Date(
        Date.now() + CFG.widget.refreshInterval * 1000);

    return list;
  }
}

class UIComp {

  /**
   *
   * @param {UI} view
   * @param {string} size
   * @param {[{status: DataStatus, data: [CustomData, string]}]} dataRows
   * @param {{cases: number, incidence: number}} maxValues
   */
  static areas(view, size, dataRows, maxValues = {}) {
    const rows = new UI(view).stack(Layout.VERTICAL, [1, 1, 0, 1],
        '#99999920', 10);
    const padding =
        !IncidenceWidget.isSmall(size) ? [2, 8, 2, 8] : [4, 6, 4, 4];

    for (const dataRow of dataRows) {
      const data = dataRow.data;
      const status = dataRow.status;

      if (DataResponse.isSuccess(status)) {
        UIComp.area(rows, size, data[0], data[1], maxValues, padding);
      } else {
        console.warn('Area can not be displayed. status: ' + status);
        // TODO display error
        //UIComp.error(rows, padding)
      }
      rows.space(1);
    }
  }

  /**
   *
   * @param {UI} viewRows
   * @param {string} size
   * @param {CustomData} data
   * @param {null|string} name
   * @param {{cases: number, incidence: number}} maxValues
   * @param {[number]} padding
   */
  static area(
      viewRows, size, data, name = null, maxValues = {}, padding = []) {
    const stack = new UI(viewRows).stack(Layout.VERTICAL, padding,
        '#99999920', 10);
    const row0 = new UI(stack).stack();

    // Incidence
    const incidence = data.getDay().incidence;
    const incidenceParts = Format.number(incidence, 1, 'n/v', 100).
        split(',');
    const incidenceColor = UI.getIncidenceColor(incidence);
    const trendArrow = UI.getTrendArrow(data.getDay().incidence,
        data.getDay(1).incidence);

    const stackIncidence = new UI(row0).stack(Layout.HORIZONTAL, [],
        '', 0, 0, [72, 26]);
    stackIncidence.text(incidenceParts[0], Fonts.XLARGE_MONO,
        incidenceColor, 1, 1);
    if (incidence.length > 1) {
      stackIncidence.text(',' + incidenceParts[1], Fonts.LARGE_MONO,
          incidenceColor, 1, 1);
    }
    stackIncidence.text(trendArrow, Font.boldRoundedSystemFont(20),
        UI.getTrendArrowColor(trendArrow), 1, 0.9);

    // Name
    const meta = data.meta;
    let areaName;
    if (typeof name === 'string' && name.length > 0) {
      areaName = name;
    } else {
      areaName = '' + meta.GEN;
    }
    let stackName, minScale;
    if (!IncidenceWidget.isSmall(size)) {
      stackName = row0;
      minScale = 1;
      stackName.space(5);
    } else {
      stackName = new UI(stack).stack(Layout.HORIZONTAL, [], '', 0, 0, [0, 15]);
      minScale = 0.9;
      //stackName.space();
    }
    UIComp.areaIcon(stackName, meta.IBZ);
    stackName.space(3);
    stackName.text(areaName.toUpperCase(), Fonts.MEDIUM, '', 1, minScale);

    if (IncidenceWidget.isSmall(size)) {
      //stackName.space();
    }

    // Location status
    if (!CustomWidget.isSmall(size)) {
      UIComp.statusBlock(row0, data.location.status, false, [13, 26]);
    }

    // TrendArrow
    row0.space(); // align graph right
    const trendStack = new UI(row0).stack(Layout.VERTICAL, [2, 0, 0, 0], '', 0,
        undefined, [63, 30]);
    //const chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]

    const graphImg = UI.generateGraph(data.data, 63, 16, maxValues,
        CFG.graph.showIndex, 'incidence', Align.RIGHT).getImage();
    trendStack.image(graphImg);

    const casesStack = new UI(trendStack).stack(Layout.HORIZONTAL);
    casesStack.space();
    casesStack.text('+' + Format.number(data.getDay().cases), Fonts.XSMALL,
        '#888', 1, 1);
    casesStack.space(0);

  }

  /**
   *
   * @param {UI} view
   * @param {string} size
   * @param {CustomData} state0
   * @param {CustomData|null} state1
   */
  static stateRow(view, size, state0, state1 = null) {
    function exec(view, size, state, maxValues) {
      if (!IncidenceWidget.isSmall(size)) {
        UIComp.smallIncidenceRow(view, state, maxValues);
      } else {
        UIComp.smallIncidenceBlock(view, state, {});
      }
    }

    const max0 = {
      cases: state0.getMaxCases(),
      incidence: state0.getMaxIncidence(),
    };
    const max1 = state1 === null ?
        {} :
        {
          cases: state1.getMaxCases(),
          incidence: state1.getMaxIncidence(),
        };
    const maxValues = {
      cases: Math.max(max0.cases, max1.cases),
      incidence: Math.max(max0.incidence, max1.incidence),
    };

    const row = new UI(view).stack(Layout.HORIZONTAL, [0, 0, 0, 0]);

    exec(row, size, state0, maxValues);
    if (state1 !== null) {
      row.space();
      exec(row, size, state1, maxValues);
    } else {
      // todo add empty dummy?
    }
  }

  /**
   *
   * @param {UI} view
   * @param {CustomData} data
   * @param {{cases: (number|undefined), incidence: (number|undefined)}} maxValues
   */
  static smallIncidenceBlock(view, data, maxValues = {}) {
    const stack = new UI(view).stack(Layout.VERTICAL, [],
        '#99999915', 12);

    const row0 = new UI(stack).stack(Layout.HORIZONTAL, [4, 0, 0, 5]);
    row0.space(); // align Text right
    const incidence = data.getDay().incidence;
    row0.text(Format.number(incidence, 1, 'n/v', 100), Fonts.SMALL2,
        UI.getIncidenceColor(incidence), 1, 1);
    const trendArrow = UI.getTrendArrow(data.getDay().incidence,
        data.getDay(1).incidence);
    row0.text(trendArrow, Fonts.SMALL2,
        UI.getTrendArrowColor(trendArrow), 1, 1);
    const name = (typeof data.meta.BL_ID !== 'undefined')
        ? ENV.states.get(data.meta.BL_ID)[ENV.state.nameIndex] ?? data.dataId
        : data.dataId;
    row0.text(name.toUpperCase(), Fonts.SMALL2, '#777', 1, 1);

    const row1 = new UI(stack).stack(Layout.HORIZONTAL, [0, 0, 0, 5]);
    row1.space(); // align graph right
    //let chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]
    const graphImg = UI.generateGraph(data.data, 58, 8, maxValues,
        CFG.graph.showIndex, 'incidence', Align.RIGHT).getImage();
    row1.image(graphImg, 0.9);

    const row2 = new UI(stack).stack(Layout.HORIZONTAL, [0, 0, 1, 5]);
    row2.space(); // align text right
    row2.text('+' + Format.number(data.getDay().cases), Fonts.XSMALL,
        '#777', 1, 0.9);
    // row2.text('↗', Fonts.XSMALL, '#777', 1, 0.9)
    stack.space(2);
  }

  /**
   *
   * @param {UI} view
   * @param {CustomData} data
   * @param {{cases: (number|undefined), incidence: (number|undefined)}} maxValues
   * @param {Color | string} bgColor
   */
  static smallIncidenceRow(
      view, data, maxValues = {}, bgColor = '#99999915') {
    const meta = data.meta;

    const container =
        new UI(view).stack(Layout.HORIZONTAL, [], bgColor, 12);
    const b = new UI(container).stack(Layout.VERTICAL);

    const row0 = new UI(b).stack(Layout.HORIZONTAL, [2, 0, 0, 6]);
    row0.space();

    const incidence = data.getDay().incidence;
    row0.text(Format.number(incidence, 1, 'n/v', 100), Fonts.NORMAL,
        UI.getIncidenceColor(incidence));
    const trendArrow = UI.getTrendArrow(data.getDay().incidence,
        data.getDay(1).incidence);
    row0.text(trendArrow, Fonts.NORMAL,
        UI.getTrendArrowColor(trendArrow));
    row0.space(2);

    let name;
    if (typeof meta.BL_ID !== 'undefined') {
      name = ENV.states.get(meta.BL_ID).short ?? data.dataId;
    } else {
      name = data.dataId;
    }
    row0.text(name.toUpperCase(), Fonts.NORMAL);

    const row1 = new UI(b).stack(Layout.HORIZONTAL, [0, 0, 2, 6]);
    row1.space();
    row1.text('+' + Format.number(data.getDay().cases), Fonts.XSMALL,
        '#999', 1, 0.9);
    //row1.text('↗', Fonts.XSMALL, '#999', 1, 0.9)

    const row2 =
        new UI(container).stack(Layout.HORIZONTAL, [0, 0, 0, 6]);
    row2.space(2);
    //let chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]
    const graphImg = UI.generateGraph(data.data, 63, 10, maxValues,
        CFG.graph.showIndex, 'incidence', Align.RIGHT).getImage();

    row2.image(graphImg, 0.9);

    container.space(4);
  }

  /**
   *
   * @param {UI} view
   * @param ibzID
   */
  static areaIcon(view, ibzID) {
    let b = new UI(view).stack(Layout.HORIZONTAL, [1, 3, 1, 3],
        '#99999930', 2, 2);
    b.text(getAreaIcon(ibzID), Fonts.XSMALL);
  }

  /**
   *
   * @param {UI} view
   * @param status
   * @param {boolean} showText
   * @param {number} width
   * @param {number} height
   */
  static statusBlock(
      view, status, showText = true, [width = 0, height = 0] = []) {
    let icon;
    let text;
    switch (status) {
      case DataStatus.OK:
        icon = '🆗';
        text = 'OK';
        break;
      case DataStatus.OFFLINE:
        icon = '⚡️';
        text = 'offline';
        break;
      case DataStatus.CACHED:
        icon = '💾';
        text = 'cached';
        break;
      case DataStatus.NO_GPS:
        icon = '📡';
        text = 'GPS?';
        break;
      case DataStatus.STATIC_LOC:
        icon = '';
        text = '';
        break;
      case DataStatus.CURRENT_LOC:
        icon = '📍';
        text = 'GPS';
        break;
      default:
        icon = '';
        text = '';
    }
    const topStatusStack = new UI(view).stack(Layout.VERTICAL, [],
        '', 0, 0, [width, height]);
    if (icon && text) {
      topStatusStack.text(icon, Fonts.SMALL);
      if (showText === true) topStatusStack.text(text, Fonts.XSMALL,
          '#999999');
    }
  }
}

class UI {
  constructor(view) {
    if (view instanceof UI) {
      this.view = this.elem = view.elem;
    } else {
      this.view = this.elem = view;
    }
  }

  /**
   *
   * @param data
   * @param {number} width
   * @param {number} height
   * @param {{cases: (number|undefined), incidence: (number|undefined)}} maxValues
   * @param {string} valueIndex
   * @param {string} colorIndex
   * @param {Align} align
   * @param {boolean} upsideDown
   * @returns {DrawContext}
   */
  static generateGraph(
      data, width, height, maxValues = {}, valueIndex = 'cases',
      colorIndex = 'incidence', align = Align.LEFT,
      upsideDown = CFG.graph.upsideDown) {

    let context = new DrawContext();
    context.size = new Size(width, height);
    context.opaque = false;
    context.respectScreenScale = true;

    const spacing = 1; // space between the bars
    const minW = 2; // minimum width of the bars
    const minH = 2; // minimum height of a bar
    // const minHeight = 10; // minimum height of the graph

    let showLen = Math.floor((width + spacing) / (minW + spacing));
    showLen = Math.min(data.length, CFG.graph.shownDays, showLen);
    const iOffset = data.length - showLen;

    let max = Math.max(maxValues[valueIndex] ?? 0,
        ...data.slice(iOffset).map(o => o[valueIndex]));
    max = max <= 0 ? 10 : max;
    //const w = Math.max(2, Math.round((width - (showLen * 2)) / showLen));

    console.log(
        `data.length: ${data.length}, width: ${width}, showLen: ${showLen}, startIndex: ${iOffset}, max: ${max}`);

    //const w = Math.floor(Math.max(2, ((width + spacing) / showLen) - spacing));
    const w = Math.max(2, ((width + spacing) / showLen) - spacing);

    let xOffset;
    if (align === Align.CENTER) {
      xOffset = (width - (showLen * (w + spacing))) / 2;
    } else if (align === Align.RIGHT) {
      xOffset = width - (showLen * (w + spacing) - spacing);
    } else if (align === Align.LEFT) {
      xOffset = 0;
    } else {
      // Align.LEFT as default
      xOffset = 0;
    }

    console.log('used space: ' + ((showLen * (w + spacing)) - spacing));
    console.log(`align: ${align}, xOffset: ${xOffset}`);

    for (let i = 0; i + iOffset < data.length; i++) {
      const item = data[i + iOffset];
      let value = parseFloat(item[valueIndex]);
      if (value === -1 && i === 0) value = 10;
      const h = Math.max(minH, (Math.abs(value) / max) * height);
      const x = xOffset + (w + spacing) * i;
      const y = (!upsideDown) ? height - h : 0;
      const rect = new Rect(x, y, w, h);
      context.setFillColor(
          UI.getIncidenceColor((item[valueIndex] >= 1) ? item[colorIndex] : 0),
      );
      console.log(`offset: ${xOffset}, x: ${x}, y: ${y}, w: ${w}, h: ${h}`);
      context.fillRect(rect);
    }
    return context;
  }

  /**
   *
   * @param {string} layout
   * @param {[number]} padding
   * @param {Color | string} borderBgColor
   * @param {number} radius
   * @param {number} borderWidth
   * @param {number} height
   * @param {number} width
   * @returns {UI}
   */
  stack(
      layout = Layout.HORIZONTAL, padding = [], borderBgColor = '',
      radius = 0, borderWidth = 0, [width = 0, height = 0] = []) {
    this.elem = this.view.addStack();

    if (radius > 0) this.elem.cornerRadius = radius;

    if (borderWidth > 0) {
      this.elem.borderWidth = borderWidth;
      this.setBorderColor(borderBgColor);
    } else if (borderBgColor) {
      this.setBackgroundColor(borderBgColor);
    }

    if (Array.isArray(padding) && padding.length === 4) {
      this.elem.setPadding(...padding);
    }

    if (height > 0 || width > 0) this.elem.size = new Size(width, height);

    if (layout === Layout.HORIZONTAL) {
      this.elem.layoutHorizontally();
    } else {
      this.elem.layoutVertically(); // vertical layout as default
    }

    this.elem.centerAlignContent();
    return this;
  }

  /**
   *
   * @param {string} text
   * @param {Font | undefined} font
   * @param {Color | string} color
   * @param {number} maxLines
   * @param {number} minScale
   * @returns {UI}
   */
  text(text, font = undefined, color = '', maxLines = 0, minScale = 0.75) {
    let t = this.elem.addText(text);
    UI.setColorOfElementByIndex(t, 'textColor', color);

    t.font = font ?? Fonts.NORMAL;
    t.lineLimit = (maxLines > 0 && minScale < 1) ? maxLines + 1 : maxLines;
    t.minimumScaleFactor = minScale;
    return this;
  }

  /**
   *
   * @param {Image} image
   * @param {number} imageOpacity
   */
  image(image, imageOpacity = 1.0) {
    let i = this.elem.addImage(image);
    i.resizable = false;
    i.imageOpacity = imageOpacity;
  }

  space(size) {
    this.elem.addSpacer(size);
    return this;
  }

  /**
   *
   * @param {Color | string} color
   */
  setBackgroundColor(color) {
    if (this.elem instanceof WidgetStack
        || this.elem instanceof ListWidget
        || this.elem instanceof UITableRow) {
      UI.setColorOfElementByIndex(this.elem, 'backgroundColor', color);
    } else {
      console.warn(`BackgroundColor of ${color} can not be set.`);
    }
  }

  /**
   *
   * @param {Color | string} color
   */
  setBorderColor(color) {
    if (this.elem instanceof WidgetStack
        || this.elem instanceof WidgetImage) {
      UI.setColorOfElementByIndex(this.elem, 'borderColor', color);
    } else {
      console.warn(`BorderColor of ${color} can not be set.`);
    }
  }

  /**
   *
   * @param element
   * @param {string} index
   * @param {Color | string} color
   */
  static setColorOfElementByIndex(element, index, color) {
    if (typeof element[index] === 'undefined') {
      console.warn(`${element} has no attribute ${index}.`);
      return;
    }

    if (color instanceof Color) {
      element[index] = color;
    } else if (typeof color === 'string') {
      // TODO check if string is color value
      if (color.length > 0) {
        element[index] = new Color(color);
      } else {
        console.warn(`${color} is not a valid color.`);
      }
    } else {
      console.warn(`${color} is not a valid color.`);
    }
  }

  /**
   *
   * @param  {number} now
   * @param {number} prev
   * @returns {TrendArrow}
   */
  static getTrendUpArrow(now, prev) {
    if (now < 0 && prev < 0) {
      now = Math.abs(now);
      prev = Math.abs(prev);
    }
    if (now < prev) {
      return TrendArrow.UP_RIGHT;
    } else if (now > prev) {
      return TrendArrow.UP;
    } else {
      return TrendArrow.RIGHT;
    }
  }

  /**
   *
   * @param {number} value1
   * @param {number} value2
   * @returns {TrendArrow}
   */
  static getTrendArrow(value1, value2) {
    if (value1 < value2) {
      return TrendArrow.DOWN;
    } else if (value1 > value2) {
      return TrendArrow.UP;
    } else {
      return TrendArrow.RIGHT;
    }
  }

  /**
   *
   * @param {number} incidence
   * @returns {Color}
   */
  static getIncidenceColor(incidence) {
    for (const value of Object.values(Incidence).
        sort((a, b) => {return b.limit - a.limit;})) {
      if (incidence >= value.limit) {
        return value.color;
      }
    }
    return Colors.GRAY;
  }

  /**
   *
   * @param {TrendArrow} arrow
   * @returns {Color}
   */
  static getTrendArrowColor(arrow) {
    switch (arrow) {
      case TrendArrow.UP:
        return Incidence.RED.color;
      case TrendArrow.DOWN:
        return Incidence.GREEN.color;
      case TrendArrow.RIGHT:
        return Incidence.GRAY.color;
      default:
        return Colors.GRAY;
    }
  }

  /**
   *
   * @param {number} areaIBZ
   */
  static getAreaIcon(areaIBZ) {

  }
}

/**
 *
 * @param {number} areaIBZ
 * @returns {string}
 */
function getAreaIcon(areaIBZ) {
  return ENV.areaIBZ.get(areaIBZ) ?? AreaTypes.BZ;
}

class DataResponse {
  /**
   *
   * @param {CustomData|*} data
   * @param {DataStatus} status
   */
  constructor(data, status = DataStatus.OK) {
    this.data = data;
    this.status = status;
  }

  /**
   *
   * @returns {boolean}
   */
  succeeded() {
    return DataResponse.isSuccess(this.status);
  }

  static fromDataResponse(response, status = null) {
    const new_status = status !== null ? status : response.status;
    return new DataResponse(response.data, new_status);
  }

  /**
   *
   * @param {DataStatus} status
   * @returns {boolean}
   */
  static isSuccess(status) {
    return status === DataStatus.OK || status === DataStatus.NO_GPS ||
        status === DataStatus.CACHED;
  }

  /**
   *
   * @returns {DataResponse}
   */
  static error() {
    return new DataResponse({}, DataStatus.ERROR);
  }

  /**
   *
   * @returns {DataResponse}
   */
  static notFound() {
    return new DataResponse({}, DataStatus.NOT_FOUND);
  }

}

class CustomFileManager {
  /**
   *
   * @param {string} directory
   * @param {string} fileName
   */
  constructor(directory, fileName) {
    try {
      this.fm = FileManager.iCloud();
      this.fm.documentsDirectory();
    } catch (e) {
      console.warn(e);
      this.fm = FileManager.local();
    }
    this.configDirectory = directory;
    this.configPath = this.fm.joinPath(this.fm.documentsDirectory(),
        this.configDirectory);
    this.fileName = fileName;

    if (!this.fm.isDirectory(this.configPath)) this.fm.createDirectory(
        this.configPath);
  }

  /**
   *
   * @param {string} from
   * @param {string} to
   * @returns {Promise<void>}
   */
  async copy(from, to) {
    const pathFrom = this.fm.joinPath(this.configDirectory, from);
    const pathTo = this.fm.joinPath(this.configDirectory, to);
    await this.fm.copy(pathFrom, pathTo);
  }

  /**
   *
   * @param {CustomData,string} data
   * @param {string} filename
   * @returns {Promise<void>}
   */
  async write(data, filename = '') {
    let path;
    let dataStr;
    if (filename === '') {
      path = this.fm.joinPath(this.configPath,
          this.fileName + data.dataId + '.json');
      dataStr = JSON.stringify(data.getStorageObject());
    } else {
      path = this.fm.joinPath(this.fm.documentsDirectory(), filename);
      dataStr = data;
    }
    this.fm.writeString(path, dataStr);
  }

  /**
   *
   * @param {string} filename
   * @returns {Promise<DataResponse>}
   */
  async read(filename) {
    let path = this.fm.joinPath(this.configPath, filename + '.json');
    let type = 'json';
    if (filename.includes('.')) {
      path = this.fm.joinPath(this.fm.documentsDirectory(), filename);
      type = 'string';
    }
    if (this.fm.isFileStoredIniCloud(path) &&
        !this.fm.isFileDownloaded(path)) await this.fm.downloadFileFromiCloud(
        path);
    if (this.fm.fileExists(path)) {
      try {
        let resStr = await this.fm.readString(path);
        let res = (type === 'json') ? JSON.parse(resStr) : resStr;
        return new DataResponse(res);
      } catch (e) {
        console.error(e);
        return DataResponse.error();
      }
    }
    return DataResponse.notFound();
  }
}

class CustomLocation {
    constructor() {
        this.lon = null
        this.lat = null
        this.type = null
        this.cachedId = null
    }

    static gps(lon, lat) {
        if (lon < 0 || lat < 0) return false
        // TODO sanitize input!
        const loc = new CustomLocation()
        loc.lon = lon
        loc.lat = lat
        return loc
    }

    static no_gps(type, name) {
        // TODO sanitize input!
        //if (!type in Object.keys(CustomLocation.types)) return false

        const loc = new CustomLocation()
        loc.type = type
        loc.name = name
        return loc
    }
}

class CustomData {
  /**
   *
   * @param {string} dataId
   * @param {{}[]} data
   * @param {{}} meta
   * @param {{index: number, latitude: number, longitude: number, name: string|undefined}} location
   */
  constructor(dataId, data = [], meta = {}, location = {}) {
    this.dataId = dataId;
    this.data = data;
    this.meta = meta;
    this.location = location;
  }

  /**
   *
   * @param {DataResponse} response
   * @returns {CustomData}
   */
  static fromResponse(response) {
    const data = response.data;
    return new CustomData(data.dataId, data.data, data.meta, data.location);
  }

  /**
   *
   * @param {number} offset
   * @returns {boolean}
   */
  getDay(offset = 0) {
    const day = this.data[this.data.length - 1 - offset];
    return typeof day !== 'undefined' ? day : false;
  }

  /**
   *
   * @param {string} index
   * @returns {number}
   */
  getMaxIndexFromArrayOfObjects(index) {
    return CustomData.getMaxIndexFromArrayOfObjects(this.data, index);
  }

  /**
   *
   * @returns {number}
   */
  getMaxCases() {
    return this.getMaxIndexFromArrayOfObjects('cases');
  }

  /**
   *
   * @returns {number}
   */
  getMaxIncidence() {
    return this.getMaxIndexFromArrayOfObjects('incidence');
  }

  getStorageObject() {
    const data = new CustomData(this.dataId, this.data, this.meta);
    delete data.location;
    return data;
  }

  /**
   *
   * @param {any[]} data
   * @returns {{cases: number, date: number, date_str: string}[]}
   */
  static completeHistory(data) {
    const lastDateHistory = data[data.length - 1].date;
    const completeDataObj = {};
    for (let i = 0; i <= CFG.graph.shownDays + 7; i++) {
      const lastReportDate = new Date(lastDateHistory);
      const prevDate = lastReportDate.setDate(
          lastReportDate.getDate() - i);
      completeDataObj[Format.dateStr(prevDate)] = {
        cases: 0,
        date: prevDate,
        date_str: Format.dateStr(prevDate),
      };
    }
    data.map((value) => {
      const curDate = Format.dateStr(value.date);
      completeDataObj[curDate].cases = value.cases;
    });
    const completeData = Object.values(completeDataObj);
    return completeData.reverse();
  }

  /**
   *
   * @param {string} cacheID
   * @param index
   * @returns {Promise<DataResponse>}
   */
  static async tryLoadFromCache(cacheID, index) {
    const cached = ENV.cache.get(index);
    if (typeof cached !== 'undefined') {
      return new DataResponse(cached);
    }

    const dataResponse = await cfm.read(
        cfm.configDirectory + '/coronaWidget_config.json');
    if (dataResponse.status !== DataStatus.OK) return DataResponse.error();

    const cacheIDs = JSON.parse(dataResponse.data);
    const dataIds = cacheIDs[cacheID];
    if (typeof dataIds === 'undefined') return DataResponse.error();

    const resp = await cfm.read('coronaWidget_' + index);
    if (!resp.succeeded()) return resp;

    const data = CustomData.fromResponse(resp);
    ENV.cache.set(index, data);

    return new DataResponse(data);
  }

  /**
   *
   * @param {string} code
   * @returns {Promise<DataResponse>}
   */
  static async loadCountry(code) {
    const cached = ENV.cache.get(code);
    if (typeof cached !== 'undefined') {
      return new DataResponse(cached);
    }

    // GER DATA
    const cases = await rkiService.casesGer();
    const data = new CustomData(code, cases);
    data.meta = {
      r: await rkiService.rData(),
      EWZ: 83.02 * 1000000, // @TODO real number?
    };
    await cfm.write(data);
    ENV.cache.set(code, data);
    return new DataResponse(data);
  }

  /**
   *
   * @param configId
   * @param {number} cacheId
   * @param {number} lat
   * @param {number} lon
   * @param {string|null} name
   * @returns {Promise<DataResponse>}
   */
  static async loadArea(
      configId, cacheId, lat = -1, lon = -1, name = null) {
    // check if data already cached

    const cacheIndex = 's' + cacheId;
    const cached = ENV.cache.get(cacheIndex);
    if (typeof cached !== 'undefined') {
      return new DataResponse(cached);
    }

    const location = await Helper.getLocation(cacheId, lat, lon, name);
    if (!location) {
      const resp = await CustomData.tryLoadFromCache(configId, cacheId);
      resp.status = resp.status === DataStatus.OK
          ? DataStatus.NO_GPS
          : DataStatus.ERROR;
      return resp;
    }

    // get information for area
    const info = await rkiService.locationData(location);
    if (!info) {
      const resp = await CustomData.tryLoadFromCache(configId, cacheId);
      resp.status = resp.status === DataStatus.OK
          ? DataStatus.CACHED
          : DataStatus.ERROR;
      return resp;
    }

    const id = info.RS;
    const cases = await rkiService.casesArea(id);
    await CustomData.geoCache(configId, cacheId, id);

    const data = new CustomData(id, cases);
    data.meta = info;
    data.location = location;

    await cfm.write(data);

    ENV.cache.set(cacheIndex, data);
    return new DataResponse(data);
  }

  /**
   *
   * @param {string} id
   * @param {string} name
   * @param {number} ewz
   * @returns {Promise<DataResponse>}
   */
  static async loadState(id, name, ewz) {
    const cached = ENV.cache.get(id);
    if (typeof cached !== 'undefined') {
      return new DataResponse(cached);
    }

    const cases = await rkiService.casesState(id);
    const data = new CustomData(id, cases);
    data.meta = {
      BL_ID: id,
      BL: name,
      EWZ: ewz,
    };

    await cfm.write(data);
    ENV.cache.set(id, data);
    return new DataResponse(data);
  }

  /**
   *
   * @param {string} configId
   * @param dataIndex
   * @param rsid
   * @returns {Promise<void>}
   */
  static async geoCache(configId, dataIndex, rsid) {
    let data = {};
    const dataResponse = await cfm.read(
        cfm.configDirectory + '/coronaWidget_config.json');
    if (dataResponse.status === DataStatus.OK) data = JSON.parse(
        dataResponse.data);
    if (typeof data[configId] === 'undefined') data[configId] = {};
    data[configId]['dataIndex' + dataIndex] = rsid;
    await cfm.write(JSON.stringify(data),
        cfm.configDirectory + '/coronaWidget_config.json');
  }

  /**
   *
   * @param {{}[]} array
   * @param {string} index
   * @returns {number}
   */
  static getMaxIndexFromArrayOfObjects(array = [{}], index = '') {
    if (!Array.isArray(array)) return 0;
    return Math.max(...array.map(value => value[index] ?? 0));
  }
}

class Format {
  /**
   *
   * @param {number|string} timestamp
   * @returns {string}
   */
  static dateStr(timestamp) {
    let date = new Date(timestamp);
    return `${('' + date.getDate()).padStart(2, '0')}` +
        `.${('' + (date.getMonth() + 1)).padStart(2, '0')}` +
        `.${date.getFullYear()}`;
  }

  /**
   *
   * @param {number} number
   * @param {number} fractionDigits
   * @param {string|undefined} placeholder
   * @param limit
   * @returns {string}
   */
  static number(
      number, fractionDigits = 0, placeholder = undefined, limit = false) {
    if (typeof placeholder !== 'undefined' && number === 0) return placeholder;
    if (limit !== false && number >= limit) fractionDigits = 0;
    return Number(number).toLocaleString('de-DE', {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    });
  }

  static timestamp(dateStr) {
    const regex = /([\d]+)\.([\d]+)\.([\d]+),\ ([0-2]?[0-9]):([0-5][0-9])/g;
    let m = regex.exec(dateStr);
    return new Date(m[3], m[2] - 1, m[1], m[4], m[5]).getTime();
  }

  /**
   *
   * @param data
   * @returns {{date: (number|null), r: number}}
   */
  static rValue(data) {
    const parsedData = Parse.rCSV(data);
    /** @type {{date: number|null, r: number}} */
    let res = {date: null, r: 0};
    if (parsedData.length === 0) return res;
    // find used key
    let rValueField;
    Object.keys(parsedData[0]).forEach(key => {
      CFG.api.csvRvalueField.forEach(possibleRKey => {
        if (key === possibleRKey) rValueField = possibleRKey;
      });
    });
    const firstDateField = Object.keys(parsedData[0])[0];
    if (rValueField) {
      parsedData.forEach(item => {
        const date = item[firstDateField];
        const value = item[rValueField];
        if (typeof date !== 'undefined' && date.includes('.') &&
            typeof value !== 'undefined' &&
            parseFloat(value.replace(',', '.')) > 0) {
          res.r = parseFloat(item[rValueField].replace(',', '.'));
          res.date = item['Datum'];
        }
      });
    }
    return res;
  }

  static prepend(str, n, padding) {
    return ('' + str).padStart(n, padding);
  }
}

class RkiRequest {

  constructor() {
    /** * @type {Map<string, DataResponse>} */
    this.cache = new Map();

  }

  /**
   *
   * @param {number} longitude
   * @param {number} latitude
   * @returns {Promise<ActiveX.ISchemaItemCollection|boolean|NamedNodeMap|ActiveX.IXMLDOMNamedNodeMap|boolean>}
   */
  async locationData({longitude, latitude} = {}) {
    const lon = longitude.toFixed(3);
    const lat = latitude.toFixed(3);
    const outputFields = 'GEN,RS,EWZ,EWZ_BL,BL_ID,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL,IBZ';
    const url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1` +
        `&outFields=${outputFields}&geometry=${lon}%2C${lat}&` +
        `geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`;
    const response = await this.execCached(url);

    if (response.status === DataStatus.OK) {
      return response.data.features[0].attributes;
    } else {
      return false;
    }
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<boolean|{cases: number, date: number, date_str: string}[]>}
   */
  async casesArea(id) {
    const apiStartDate = Helper.getDateBefore(CFG.graph.shownDays + 7);
    const urlToday = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)+AND+IdLandkreis=${id}&objectIds=&time=&resultType=standard&outFields=&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D&having=&resultOffset=&resultRecordCount=&sqlFormat=none&token=`;
    const urlHistory = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdLandkreis=${id}+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;

    return await this.getCases(urlToday, urlHistory);
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<boolean|{cases: number, date: number, date_str: string}[]>}
   */
  async casesState(id) {
    const apiStartDate = Helper.getDateBefore(CFG.graph.shownDays + 7);
    const urlToday = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)+AND+IdBundesland=${id}&objectIds=&time=&resultType=standard&outFields=&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D&having=&resultOffset=&resultRecordCount=&sqlFormat=none&token=`;
    const urlHistory = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdBundesland=${id}+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;

    return await this.getCases(urlToday, urlHistory);
  }

  /**
   *
   * @returns {Promise<boolean | {cases: number, date: number, date_str: string}[]>}
   */
  async casesGer() {
    const apiStartDate = Helper.getDateBefore(CFG.graph.shownDays + 7);
    let urlToday = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)&returnGeometry=false&geometry=42.000%2C12.000&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D&resultType=standard&cacheHint=true`;
    urlToday += `&groupByFieldsForStatistics=MeldeDatum`;
    const urlHistory = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;

    return await this.getCases(urlToday, urlHistory);
  }

  /**
   *
   * @returns {Promise<{date: (number|null), r: number}>}
   */
  async rData() {
    const url = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Projekte_RKI/Nowcasting_Zahlen_csv.csv?__blob=publicationFile`;
    const response = await this.execCached(url, RequestType.STRING);

    if (response.status === DataStatus.OK) {
      return Format.rValue(response.data);
    } else {
      return {date: null, r: 0};
    }
  }

  /**
   *
   * @param {string} urlToday
   * @param {string} urlHistory
   * @returns {Promise<boolean | {cases: number, date: number, date_str: string}[]>}
   */
  async getCases(urlToday, urlHistory) {
    const keyCases = 'MeldeDatum';
    const responseToday = await this.execCached(urlToday);
    const responseHistory = await this.execCached(urlHistory);
    if (responseToday.status === DataStatus.OK &&
        responseHistory.status === DataStatus.OK) {

      let data = responseHistory.data.features.map(day => {
        return {
          cases: day.attributes.cases,
          date: day.attributes[keyCases],
        };
      });
      const todayCases = responseToday.data.features.
          reduce((a, b) => a + b.attributes.cases, 0);
      const lastDateHistory =
          Math.max(...responseHistory.data.features.
              map(a => a.attributes[keyCases]));
      const lastDateToday =
          Math.max(...responseToday.data.features.
              map(a => a.attributes[keyCases]));

      let lastDate = lastDateHistory;
      if (!!lastDateToday ||
          new Date(lastDateToday).setHours(0, 0, 0, 0) <=
          new Date(lastDateHistory).setHours(0, 0, 0, 0)) {
        const lastReportDate = new Date(lastDateHistory);
        lastDate = lastReportDate.setDate(lastReportDate.getDate() + 1);
      }
      const lastDateStr = Format.dateStr(lastDate);
      data.push(
          {
            cases: todayCases,
            date: lastDate,
            date_str: lastDateStr,
          },
      );
      data = CustomData.completeHistory(data);
      return data;
    }
    return false;
  }

  /**
   *
   * @param {string} url
   * @param {RequestType} type
   * @returns {Promise<DataResponse>}
   */
  async exec(url, type = RequestType.JSON) {
    try {
      const resData = new Request(url);
      resData.timeoutInterval = 20;

      let data;
      let status = DataStatus.NOT_FOUND;
      switch (type) {
        case RequestType.JSON:
          data = await resData.loadJSON();
          status = typeof data.features !== 'undefined'
              ? DataStatus.OK
              : DataStatus.NOT_FOUND;
          break;
        case RequestType.STRING:
          data = await resData.loadString();
          status = typeof data.length !== ''
              ? DataStatus.OK
              : DataStatus.NOT_FOUND;
          break;
        default:
          data = {};
      }
      return new DataResponse(data);
    } catch (e) {
      console.warn(e);
      return DataResponse.notFound();
    }
  }

  /**
   *
   * @param {string} url
   * @param {RequestType} type
   * @returns {Promise<DataResponse>}
   */
  async execCached(url, type = RequestType.JSON) {
    const cacheKey = type + '_' + url;
    const cached = this.cache.get(cacheKey);

    let res;
    if (typeof cached === 'undefined') {
      res = await this.exec(url, type);
      this.cache.set(cacheKey, res);
    } else {
      res = cached;
    }
    return res;
  }
}

class Parse {
  /**
   *
   * @param {string} input
   * @returns {[{index: number, latitude: number, longitude: number, name: string | null}]}
   */
  static input(input) {
    const _coords = [];
    const _staticCoordinates = input.split(';').map(coords => {
      return coords.split(',');
    });
    _staticCoordinates.forEach(coords => {
      _coords[parseInt(coords[0])] = {
        index: parseInt(coords[0]),
        latitude: parseFloat(coords[1]) ?? -1,
        longitude: parseFloat(coords[2]) ?? -1,
        name: coords[3] ?? null,
      };
    });
    return _coords;
  }

  static rCSV(rDataStr) {
    let lines = rDataStr.split(/(?:\r\n|\n)+/).filter(function(el) {
      return el.length !== 0;
    });
    let headers = lines.splice(0, 1)[0].split(';');
    let elements = [];
    for (let i = 0; i < lines.length; i++) {
      let element = {};
      let values = lines[i].split(';');
      element = values.reduce(function(result, field, index) {
        result[headers[index]] = field;
        return result;
      }, {});
      elements.push(element);
    }
    return elements;
  }
}

class Helper {
  /**
   *
   * @param {CustomData} dataObject
   * @returns {CustomData}
   */
  static calcIncidence(dataObject) {
    const reversedData = dataObject.data.reverse();
    for (let i = 0; i < CFG.graph.shownDays; i++) {
      const theDays = reversedData.slice(i + 1, i + 1 + 7); // without today
      const sumCasesLast7Days = theDays.reduce((a, b) => a + b.cases, 0);
      reversedData[i].incidence = (sumCasesLast7Days /
          dataObject.meta.EWZ) *
          100000;
    }
    dataObject.data = reversedData.reverse();
    return dataObject;
  }

  /**
   *
   * @param {number} offset
   * @param {Date} startDate
   * @returns {string}
   */
  static getDateBefore(offset, startDate = new Date()) {
    let offsetDate = new Date();
    offsetDate.setDate(startDate.getDate() - offset);
    return offsetDate.toISOString().split('T').shift();
  }

  /**
   *
   * @param {number} index
   * @param {number} lat
   * @param {number} lon
   * @param {string | null} name
   * @returns {Promise<{latitude: number, name: (string|null), index: number, longitude: number, status: (LocationStatus|string)}>}
   */
  static async getLocation(index, lat = -1, lon = -1, name = null) {
    if (lat >= 0 && lon >= 0) {
      return {
        index: index,
        latitude: lat,
        longitude: lon,
        name: name,
        status: LocationStatus.STATIC,
      };
    }

    // gps
    try {
      Location.setAccuracyToThreeKilometers();
      const coords = await Location.current();
      coords.status = LocationStatus.CURRENT;
      coords.name = name;
      return coords;
    } catch (e) {
      console.warn(e);
    }
    return {
      index: index,
      latitude: lat,
      longitude: lon,
      name: name,
      status: LocationStatus.FAILED,
    };
  }

    static log(...data) {
        console.log(data.map(JSON.stringify).join(' | '))
    }
}

class CustomLogger {
    constructor() {
        //TODO get output
        // either console or file
        this.out = 'console'
    }

    static logConsole(...data) {
        console.log(data.map(JSON.stringify).join(' | '))

    }

    static logFile(str) {

    }

    static warnConsole(...data) {
        console.warn(data.map(JSON.stringify).join(' | '))
    }

    static warnFile(str) {

    }

    static errorConsole(...data) {
        console.error(data.map(JSON.stringify).join(' | '))

    }

    static errorFile(str) {

    }

    smth(data, funConsole, funFile) {
        if (this.out === 'file') {
            funFile(...data)
        } else {
            funConsole(...data)
        }
    }

    log(...data) {
        this.smth(data, CustomLogger.logConsole, CustomLogger.logFile)
    }

    warn(...data) {
        this.smth(data, CustomLogger.warnConsole, CustomLogger.warnFile)
    }

    error(...data) {
        this.smth(data, CustomLogger.errorConsole, CustomLogger.errorFile)
    }
}

const cfm = new CustomFileManager(CFG.storage.directory, CFG.storage.file)
const logger = new CustomLogger()
const rkiService = new RkiRequest()
await new IncidenceWidget(args.widgetParameter, config.widgetFamily).init()