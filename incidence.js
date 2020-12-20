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

const Colors = {
    warn: new Color('#dbc43d'),
    darkdarkred: new Color('#6b1200'),
    darkred: new Color('#a1232b'),
    red: new Color('#f6000f'),
    orange: new Color('#ff7927'),
    yellow: new Color('#f5D800'),
    green: new Color('#1CC747'),
    gray: new Color('#d0d0d0'),
}

const ENV = {
    align: {
        left: 'align_left',
        center: 'align_center',
        right: 'align_right',
    },
    layout: {
        horizontal: 'h',
        vertical: 'v',
    },
    color: {
        warn: Colors.warn,
    },
    incidence: {
        darkdarkred: {limit: 250, color: Colors.darkdarkred},
        darkred: {limit: 100, color: Colors.darkred},
        red: {limit: 50, color: Colors.red},
        orange: {limit: 35, color: Colors.orange},
        yellow: {limit: 25, color: Colors.yellow},
        green: {limit: 1, color: Colors.green},
        gray: {limit: 0, color: Colors.gray},
    },
    trend: {
        up: '↑',
        down: '↓',
        right: '→',
        up_right: '↗'

    },
    states: {
        '1': {short: 'SH', name: 'Schleswig-Holstein'},
        '2': {short: 'HH', name: 'Hamburg'},
        '3': {short: 'NI', name: 'Niedersachsen'},
        '4': {short: 'HB', name: 'Bremen'},
        '5': {short: 'NRW', name: 'Nordrhein-Westfalen'},
        '6': {short: 'HE', name: 'Hessen'},
        '7': {short: 'RP', name: 'Rheinland-Pfalz'},
        '8': {short: 'BW', name: 'Baden-Württemberg'},
        '9': {short: 'BY', name: 'Bayern'},
        '10': {short: 'SL', name: 'Saarland'},
        '11': {short: 'BE', name: 'Berlin'},
        '12': {short: 'BB', name: 'Brandenburg'},
        '13': {short: 'MV', name: 'Mecklenburg-Vorpommern'},
        '14': {short: 'SN', name: 'Sachsen'},
        '15': {short: 'ST', name: 'Sachsen-Anhalt'},
        '16': {short: 'TH', name: 'Thüringen'},
    },
    areaIBZ: {
        '40': 'KS', // Kreisfreie Stadt
        '41': 'SK', // Stadtkreis
        '42': 'K',  // Kreis
        '43': 'LK', // Landkreis
        '45': 'LK', // Sonderverband offiziell Kreis
        '46': 'K',  // Sonderverband offiziell Landkreis
        null: 'BZ',
        '': 'BZ',
    },
    fonts: {
        xlarge: Font.boldSystemFont(26),
        large: Font.mediumSystemFont(20),
        medium: Font.mediumSystemFont(14),
        normal: Font.mediumSystemFont(12),
        small: Font.boldSystemFont(11),
        small2: Font.boldSystemFont(10),
        xsmall: Font.boldSystemFont(9),
        xlarge_mono: Font.boldMonospacedSystemFont(26),
        large_mono: Font.mediumMonospacedSystemFont(20),
        medium_mono: Font.mediumMonospacedSystemFont(14),
        normal_mono: Font.mediumMonospacedSystemFont(12),
        small_mono: Font.boldMonospacedSystemFont(11),
        small2_mono: Font.boldMonospacedSystemFont(10),
        xsmall_mono: Font.boldMonospacedSystemFont(9),
    },
    statusTextNew: {
        no_gps: '🌍',
        offline: '⚡',
        error: '🚫',
        current: '📍',
        cached: '💾',
        static_loc: ''
    },
    request: {
        json: 'json',
        string: 'string'
    },
    state: {
        nameIndex: CFG.state.useShortName ? 'short' : 'name'
    },
    staticCoords: [],
    cache: {},
    statusText: {
        ok: '',
        failed: 'failed',
        offline: 'offline',
        cached: 'cached'
    },
    locStatus: {
        failed: 0,
        current: 1,
        cached: 2,
        static_loc: 3,
    },
    locStatusText: {
        failed: '🚫',
        current: '📍',
        cached: '💾',
        static_loc: '',
    },
    errTxt: '⚡️ Daten konnten nicht geladen werden. \nWidget öffnen für reload. \n\nTIPP: Cache Id in Widgetparamter setzen für Offline modus.',
    widget: {
        size: {
            small: 'small',
            medium: 'medium',
            large: 'large',
            default: 'medium',
        },
    },
    graph: {
        show: {
            cases: 'cases',
            incidence: 'incidence',
        },
    },
}

class CustomWidget {
    constructor() {
        this.parameters = null;
        this.family = null;
    }

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
            await this.widget.presentSmall()
        } else {
            // medium as default
            await this.widget.presentMedium()
        }
    }

    async createWidget(){}

    setSizeByWidgetFamily(family) {
        const size = ENV.widget.size[family]
        this.size = size ? size : ENV.widget.size.default
    }

    setSizeByParameterCount(count) {
        if (count < 0) {
            throw `count must be at least 0 (is: ${count})`;
        } else if (count < 2) {
            this.size = ENV.widget.size.small;
        } else if (count < 3) {
            this.size = ENV.widget.size.medium;
        } else if (count <= 6) {
            this.size = ENV.widget.size.large;
        } else {
            throw `count must not be larger then 6 (is: ${count})`;
        }
    }

    isLarge() {
        return CustomWidget.isLarge(this.size)
    }

    isMedium() {
        return CustomWidget.isMedium(this.size)
    }

    isSmall() {
        return CustomWidget.isSmall(this.size)
    }

    static isLarge(size) {
        return size === ENV.widget.size.large
    }

    static isMedium(size) {
        return size === ENV.widget.size.medium
    }

    static isSmall(size) {
        return size === ENV.widget.size.small
    }
}

class IncidenceWidget extends CustomWidget{
    constructor(parameters, family, coords = []) {
        super();
        if (parameters ?? false) {
            this.parameters = Parse.input(parameters);
        } else {
            //this.parameters = Parse.input("0") // current location
            this.parameters = Parse.input('0; 1, 52.52, 13.42'); // current location + Berlin
        }
        this.parameters = [...this.parameters, ...coords];

        if (family ?? false) {
            this.setSizeByWidgetFamily(family);
            //cfm.write('family: ' + family + ' -> ' + this.size, '_debug.txt')
        } else {
            this.setSizeByParameterCount(this.parameters.length);
            //cfm.write('parameters: ' + family + ' -> ' + this.size, '_debug.txt')
        }

        // this.selfUpdate()
    }

    async createWidget() {
        const list = new ListWidget();

        // setting up layout

        // making sure padding of widget parts is constant
        // if we set the padding for the ListWidget some inner elements 'overflow'
        // if we use this method they wont
        const padL = 6;
        const padR = 6;
        if (!this.isSmall()) list.addSpacer(6); // ListWidget top padding

        const topBar = new UI(list).stack(ENV.layout.horizontal,
            [0, padL + 1, 0, padR + 1]);
        topBar.text('🦠', Font.mediumSystemFont(22));
        topBar.space(3);

        const topRStack = new UI(topBar).stack(ENV.layout.vertical);

        const show = this.isLarge() ? 6 : this.isMedium() ? 2 : 1;
        this.parameters.slice(0, show);

        list.addSpacer(4);
        const areaStack = new UI(list).stack(ENV.layout.vertical,
            [0, padL, 0, padR]); // stack for areas

        list.addSpacer(4); // spacing between elements
        const stateBar = new UI(list).stack(ENV.layout.vertical,
            [0, padL + 1, 0, padR + 1]); // stack for states

        // GER
        const respGer = await Data.loadCountry('GER');
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
                ENV.fonts.medium);
            topRStack.text(Format.dateStr(dataGer.getDay().date),
                ENV.fonts.xsmall, '#777');
        }

        // AREAS
        let maxI = 0;
        let maxC = 0;

        const configId = btoa(
            'cID' + JSON.stringify(this.parameters).replace(/[^a-zA-Z ]/g, ''));

        // [{index, lat, lon, name}] => [ {status: status, data: [data, name]} ]
        const rows = await Promise.all(this.parameters.map(
            async (value) => {
                const respArea = await Data.loadArea(configId,
                    ...Object.values(value));
                const status = respArea.status;
                if (!respArea.succeeded()) {
                    console.warn('loading Area failed. Status: ' + status);
                    return {status: status, data: [null, false]};
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
                return {status: status, data: [areaWithIncidence, value.name]};

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
            const resp = await Data.loadState(id, meta.BL, meta.EWZ_BL);

            if (DataResponse.isSuccess(resp.status)) {
                states.push(Helper.calcIncidence(resp.data));
                processed[id] = true;
            } else {
                console.warn('Loading state failed. status: %s', resp.status);
            }
        }

        if (this.isSmall() && respGer.succeeded()) {
            states.push(respGer.data)
        }
        for (let i = 0; i < states.length; i += 2) {
            const state0 = states[i]
            const state1 = (i + 1) < states.length ? states[i + 1] : null
            UIComp.stateRow(stateBar, this.size, state0, state1)
            stateBar.space(4)
        }

        list.addSpacer(6) // bottom padding for ListWidget

        // UI ===
        if (CFG.widget.openUrlOnTap) list.url = CFG.widget.openUrl
        list.refreshAfterDate = new Date(Date.now() + CFG.widget.refreshInterval * 1000)

        return list
    }
}

class UIComp {

    static areas(view, size, dataRows, maxValues = {}) {
        const rows = new UI(view).stack(ENV.layout.vertical, [1, 1, 0, 1],
            '#99999920', 10);
        const padding =
            !IncidenceWidget.isSmall(size) ? [2, 8, 2, 8] : [4, 6, 4, 4];

        for (const dataRow of dataRows) {
            const data = dataRow.data;
            const status = dataRow.status;

            if (DataResponse.isSuccess(status)) {
                UIComp.area(rows, size, ...data, maxValues, padding);
            } else {
                console.warn('Area can not be displayed. status: ' + status);
                // TODO display error
                //UIComp.error(rows, padding)
            }
            rows.space(1);
        }
    }

    static area(
        viewRows, size, data, name = false, maxValues = {}, padding = false) {
        const stack = new UI(viewRows).stack(ENV.layout.vertical, padding,
            '#99999920', 10);
        const row0 = new UI(stack).stack(ENV.layout.horizontal, false,
            '#000099');

        // Incidence
        const incidence = data.getDay().incidence;
        const incidenceParts = Format.number(incidence, 1, 'n/v', 100).
            split(',');
        const incidenceColor = UI.getIncidenceColor(incidence);
        const trendArrow = UI.getTrendArrow(data.getDay().incidence,
            data.getDay(1).incidence);

        const stackIncidence = new UI(row0).stack(ENV.layout.horizontal, false,
            false, false, false, [72, 26]);
        stackIncidence.text(incidenceParts[0], ENV.fonts.xlarge_mono,
            incidenceColor, 1, 1);
        if (incidence.length > 1) {
            stackIncidence.text(',' + incidenceParts[1], ENV.fonts.large_mono,
                incidenceColor, 1, 1);
        }
        stackIncidence.text(trendArrow, Font.boldRoundedSystemFont(20),
            UI.getTrendArrowColor(trendArrow), 1, 0.9);

        // Name
        const meta = data.meta;
        const areaName = name !== false ? name : meta.GEN;
        let stackName, minScale;
        if (!IncidenceWidget.isSmall(size)) {
            stackName = row0;
            minScale = 1;
            stackName.space(5);
        } else {
            stackName = new UI(stack).stack(ENV.layout.horizontal, false,
                '#009900');
            minScale = 0.9;
            //stackName.space();
        }
        UIComp.areaIcon(stackName, meta.IBZ);
        stackName.space(3);
        stackName.text(areaName.toUpperCase(), ENV.fonts.medium, false, 1,
            minScale);

        if (IncidenceWidget.isSmall(size)) {
            //stackName.space();
        }

        // Location status
        if (!CustomWidget.isSmall(size)) {
            UIComp.statusBlock(row0, data.location.status, false, [13, 26]);
        }

        // Trend
        row0.space(); // align graph right
        const trendStack = new UI(row0).stack(ENV.layout.vertical, [2, 0, 0, 0],
            false, false, false, [58, 30]);
        //const chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]

        const graphImg = UI.generateGraph(data.data, 58, 16, maxValues,
            CFG.graph.showIndex, 'incidence', ENV.align.right).getImage();
        trendStack.image(graphImg);

        const casesStack = new UI(trendStack).stack(ENV.layout.horizontal);
        casesStack.space();
        casesStack.text('+' + Format.number(data.getDay().cases),
            ENV.fonts.xsmall, '#888', 1, 1);
        casesStack.space(0);

    }

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
        const max1 = state1 === null ? {} : {
            cases: state1.getMaxCases(),
            incidence: state1.getMaxIncidence(),
        };
        const maxValues = {
            cases: Math.max(max0.cases, max1.cases),
            incidence: Math.max(max0.incidence, max1.incidence),
        };

        const row = new UI(view).stack(ENV.layout.horizontal, [0, 0, 0, 0]);

        exec(row, size, state0, maxValues);
        if (state1 !== null) {
            row.space();
            exec(row, size, state1, maxValues);
        } else {
            // todo add empty dummy?
        }
    }

    static smallIncidenceBlock(view, data, maxValues = {}) {
        const stack = new UI(view).stack(ENV.layout.vertical, false,
            '#99999915', 12);

        const row0 = new UI(stack).stack(ENV.layout.horizontal, [4, 0, 0, 5]);
        row0.space(); // align Text right
        const incidence = data.getDay().incidence;
        row0.text(Format.number(incidence, 1, 'n/v', 100), ENV.fonts.small2,
            UI.getIncidenceColor(incidence), 1, 1);
        const trendArrow = UI.getTrendArrow(data.getDay().incidence,
            data.getDay(1).incidence);
        row0.text(trendArrow, ENV.fonts.small2,
            UI.getTrendArrowColor(trendArrow), 1, 1);
        const name = (typeof data.meta.BL_ID !== 'undefined')
            ? ENV.states[data.meta.BL_ID][ENV.state.nameIndex]
            : data.dataId;
        row0.text(name.toUpperCase(), ENV.fonts.small2, '#777', 1, 1);

        const row1 = new UI(stack).stack(ENV.layout.horizontal, [0, 0, 0, 5]);
        row1.space(); // align graph right
        //let chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]
        const graphImg = UI.generateGraph(data.data, 58, 8, maxValues,
            CFG.graph.showIndex, 'incidence', ENV.align.right).getImage();
        row1.image(graphImg, 0.9);

        const row2 = new UI(stack).stack(ENV.layout.horizontal, [0, 0, 1, 5]);
        row2.space(); // align text right
        row2.text('+' + Format.number(data.getDay().cases), ENV.fonts.xsmall,
            '#777', 1, 0.9);
        // row2.text('↗', ENV.fonts.xsmall, '#777', 1, 0.9)
        stack.space(2);
    }

    static smallIncidenceRow(
        view, data, maxValues = {}, bgColor = '#99999915') {
        const meta = data.meta;

        const container =
            new UI(view).stack(ENV.layout.horizontal, false, bgColor, 12);
        const b = new UI(container).stack(ENV.layout.vertical);

        const row0 = new UI(b).stack(ENV.layout.horizontal, [2, 0, 0, 6]);
        row0.space();
        const incidence = data.getDay().incidence;
        row0.text(Format.number(incidence, 1, 'n/v', 100), ENV.fonts.normal,
            UI.getIncidenceColor(incidence));
        const trendArrow = UI.getTrendArrow(data.getDay().incidence,
            data.getDay(1).incidence);
        row0.text(trendArrow, ENV.fonts.normal,
            UI.getTrendArrowColor(trendArrow));
        row0.space(2);
        let name;
        if (typeof meta.BL_ID !== 'undefined') {
            name = ENV.states[meta.BL_ID].short;
        } else {
            name = data.dataId;
        }
        row0.text(name.toUpperCase(), ENV.fonts.normal);

        const row1 = new UI(b).stack(ENV.layout.horizontal, [0, 0, 2, 6]);
        row1.space();
        row1.text('+' + Format.number(data.getDay().cases), ENV.fonts.xsmall,
            '#999', 1, 0.9);
        //row1.text('↗', ENV.fonts.xsmall, '#999', 1, 0.9)

        const row2 =
            new UI(container).stack(ENV.layout.horizontal, [0, 0, 0, 6]);
        row2.space(2);
        //let chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]
        const graphImg = UI.generateGraph(data.data, 58, 10, maxValues,
            CFG.graph.showIndex, 'incidence', ENV.align.right).getImage();
        row2.image(graphImg, 0.9);

        container.space(4);
    }

    static areaIcon(view, ibzID) {
        let b = new UI(view).stack(ENV.layout.horizontal, [1, 3, 1, 3],
            '#99999930', 2, 2);
        b.text(getAreaIcon(ibzID), ENV.fonts.xsmall);
    }

    static statusBlock(view, status, showText = true, size = false) {
        let icon;
        let text;
        switch (status) {
            case DataResponse.OK:
                icon = '🆗';
                text = 'OK';
                break;
            case DataResponse.OFFLINE:
                icon = '⚡️';
                text = 'offline';
                break;
            case DataResponse.CACHED:
                icon = '💾';
                text = 'cached';
                break;
            case DataResponse.NO_GPS:
                icon = '📡';
                text = 'GPS?';
                break;
            case ENV.locStatus.static_loc:
                icon = '';
                text = '';
                break;
            case ENV.locStatus.current:
                icon = '📍';
                text = 'GPS';
                break;
            case ENV.locStatus.cached:
                icon = '💾';
                text = 'cached';
                break;
            default:
                icon = '';
                text = '';
        }
        const topStatusStack = new UI(view).stack(ENV.layout.vertical, false,
            false, false, false, size);
        if (icon && text) {
            topStatusStack.text(icon, ENV.fonts.small);
            if (showText === true) topStatusStack.text(text, ENV.fonts.xsmall,
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

    static generateGraph(
        data, width, height, maxValues = {}, indexValue = 'cases',
        indexColor = 'incidence', align = ENV.align.left,
        upsideDown = CFG.graph.upsideDown) {
        let graphData = data.slice(
            Math.max(data.length - CFG.graph.shownDays, 1));

        let context = new DrawContext();
        context.size = new Size(width, height);
        context.opaque = false;
        let max = Math.max.apply(Math, graphData.map((o) => {
            return o[indexValue];
        }));
        max = maxValues[indexValue] > max ? maxValues[indexValue] : max;
        max = max <= 0 ? 10 : max;
        const w = Math.max(2,
            Math.round((width - (graphData.length * 2)) / graphData.length));

        let xOffset;
        if (align === ENV.align.center) {
            xOffset = (width - (data.length * (w + 1))) / 2;
        } else if (align === ENV.align.right) {
            xOffset = width - (data.length * (w + 1));
        } else {
            // ALIGN_LEFT as default for unknown values
            xOffset = 0;
        }

        data.forEach((item, index) => {
            let value = parseFloat(item[indexValue]);
            if (value === -1 && index === 0) value = 10;
            const h = Math.max(2, Math.round((Math.abs(value) / max) * height));
            const x = xOffset + (w + 1) * index;
            const y = (!upsideDown) ? height - h : 0;
            const rect = new Rect(x, y, w, h);
            context.setFillColor(UI.getIncidenceColor(
                (item[indexValue] >= 1) ? item[indexColor] : 0));
            context.fillRect(rect);
        })
        return context;
    }

    stack(
        layout = ENV.layout.horizontal, padding = false, borderBgColor = false,
        radius = false, borderWidth = false, size = false) {
        this.elem = this.view.addStack();
        if (radius) this.elem.cornerRadius = radius;
        if (borderWidth !== false) {
            this.elem.borderWidth = borderWidth;
            this.elem.borderColor = new Color(borderBgColor);
        } else if (borderBgColor) {
            this.elem.backgroundColor = new Color(borderBgColor);
        }
        if (padding) this.elem.setPadding(...padding);
        if (size) this.elem.size = new Size(...size);
        if (layout === ENV.layout.horizontal) {
            this.elem.layoutHorizontally();
        } else {
            this.elem.layoutVertically(); // vertical layout as default
        }

        this.elem.centerAlignContent();
        return this;
    }

    text(text, font = false, color = false, maxLines = 0, minScale = 0.75) {
        let t = this.elem.addText(text)
        if (color) t.textColor = (typeof color === 'string') ? new Color(color) : color
        t.font = (font) ? font : ENV.fonts.normal
        t.lineLimit = (maxLines > 0 && minScale < 1) ? maxLines + 1 : maxLines
        t.minimumScaleFactor = minScale
        return this
    }

    image(image, imageOpacity = 1.0) {
        let i = this.elem.addImage(image)
        i.resizable = false
        i.imageOpacity = imageOpacity
    }

    space(size) {
        this.elem.addSpacer(size)
        return this
    }

    static getTrendUpArrow(now, prev) {
        if (now < 0 && prev < 0) {
            now = Math.abs(now)
            prev = Math.abs(prev)
        }
        return (now < prev) ? ENV.trend.up_right : (now > prev) ? ENV.trend.up : ENV.trend.right
    }

    static getTrendArrow(value1, value2) {
        return (value1 < value2) ? ENV.trend.down : (value1 > value2) ? ENV.trend.up : ENV.trend.right
    }

    static getIncidenceColor(incidence) {
        for (const value of Object.values(ENV.incidence)) {
            const limit = value.limit;
            if (incidence >= limit) {
                return value.color;
            }
        }
        return Colors.gray;
    }

    static getTrendArrowColor(arrow) {
        switch (arrow) {
            case ENV.trend.up:
                return ENV.incidence.red.color;
            case ENV.trend.down:
                return ENV.incidence.green.color;
            case ENV.trend.right:
                return ENV.incidence.gray.color;
            default:
                return ENV.incidence.gray.color;
        }
    }
}

function getAreaIcon(areaIBZ) {
    const res = ENV.areaIBZ[areaIBZ];
    return typeof res !== 'undefined' ? res : ENV.areaIBZ[''];
}

function gps2Key(latitude, longitude, accuracy = CFG.gpsCache.accuracy) {
    const lon = parseFloat(latitude.toFixed(accuracy));
    const lat = parseFloat(longitude.toFixed(accuracy));
    return `${lat},${lon}`;
}

function dateStr2DateKey(str) {
    return str.substr(0, 10);
}

class DataResponse {
    constructor(data, status = DataResponse.OK) {
        this.data = data
        this.status = status
    }

    succeeded() {
        return DataResponse.isSuccess(this.status)
    }

    static fromDataResponse(response, status = null) {
        const new_status = status !== null ? status : response.status
        return new DataResponse(response.data, new_status)
    }

    static isSuccess(status) {
        return status === DataResponse.OK || status === DataResponse.NO_GPS || status === DataResponse.CACHED
    }

    static error() {
        return new DataResponse({}, DataResponse.ERROR)
    }

    static notFound() {
        return new DataResponse({}, DataResponse.NOT_FOUND)
    }

    static get OK() {
        return 200;
    }

    static get CREATED() {
        return 201;
    }

    static get NOT_FOUND() {
        return 404;
    }

    static get OFFLINE() {
        return 418;
    }

    static get ERROR() {
        return 500;
    }

    static get CACHED() {
        return 700;
    }

    static get NO_GPS() {
        return 701;
    }


}

class CustomFileManager {
    constructor(directory, fileName) {
        try {
            this.fm = FileManager.iCloud()
            this.fm.documentsDirectory()
        } catch (e) {
            console.warn(e)
            this.fm = FileManager.local()
        }
        this.configDirectory = directory
        this.configPath = this.fm.joinPath(this.fm.documentsDirectory(), this.configDirectory)
        this.fileName = fileName

        if (!this.fm.isDirectory(this.configPath)) this.fm.createDirectory(this.configPath)
    }

    async copy(from, to) {
        const pathFrom = this.fm.joinPath(this.configDirectory, from)
        const pathTo = this.fm.joinPath(this.configDirectory, to)
        await this.fm.copy(pathFrom, pathTo)
    }

    async write(data, filename = '') {
        let path
        let dataStr
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

    async read(filename) {
        let path = this.fm.joinPath(this.configPath, filename + '.json');
        let type = 'json'
        if (filename.includes('.')) {
            path = this.fm.joinPath(this.fm.documentsDirectory(), filename);
            type = 'string'
        }
        if (this.fm.isFileStoredIniCloud(path) && !this.fm.isFileDownloaded(path)) await this.fm.downloadFileFromiCloud(path);
        if (this.fm.fileExists(path)) {
            try {
                let resStr = await this.fm.readString(path)
                let res = (type === 'json') ? JSON.parse(resStr) : resStr
                return new DataResponse(res);
            } catch (e) {
                console.error(e)
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

class Data {
    constructor(dataId, data = {}, meta = {}, location) {
        this.dataId = dataId;
        this.data = data;
        this.meta = meta;
        this.location = location;
    }

    static fromStoredResponse(response) {
        const data = response.data;
        return new Data(data.dataId, data.data, data.meta, data.location);
    }

    getDay(offset = 0) {
        const day = this.data[this.data.length - 1 - offset];
        return typeof day !== 'undefined' ? day : false;
    }

    getMaxIndexFromArrayOfObjects(index) {
        return Data.getMaxIndexFromArrayOfObjects(this.data, index);
    }

    getMaxCases() {
        return this.getMaxIndexFromArrayOfObjects('cases');
    }

    getMaxIncidence() {
        return this.getMaxIndexFromArrayOfObjects('incidence');
    }

    getStorageObject() {
        const data = new Data(this.dataId, this.data, this.meta);
        delete data.location;
        return data;
    }

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
            completeDataObj[curDate].cases = value.cases
        })
        const completeData = Object.values(completeDataObj);
        return completeData.reverse();
    }

    static async tryLoadFromCache(cacheID, index) {
        const cached = ENV.cache[index]
        if (typeof cached !== 'undefined') return cached

        const dataResponse = await cfm.read(cfm.configDirectory + '/coronaWidget_config.json')
        if (dataResponse.status !== DataResponse.OK) return DataResponse.error()

        const cacheIDs = JSON.parse(dataResponse.data)
        const dataIds = cacheIDs[cacheID]
        if (typeof dataIds === 'undefined') return DataResponse.error()

        const resp = await cfm.read('coronaWidget_' + index)
        if (!resp.succeeded()) return resp

        const data = Data.fromStoredResponse(resp)
        ENV.cache[index] = data

        return new DataResponse(data)
    }

    static async loadCountry(code) {
        const cached = ENV.cache[code]
        if (typeof cached !== 'undefined') {
            return new DataResponse(cached);
        }

        // GER DATA
        const cases = await rkiService.casesGer();
        const data = new Data(code);
        data.data = cases;
        data.meta = {
            r: await rkiService.rData(),
            EWZ: 83.02 * 1000000, // @TODO real number?
        };
        await cfm.write(data);
        ENV.cache[code] = data;
        return new DataResponse(data);
    }

    static async loadArea(
        configId, cacheId = false, lat = false, lon = false, name = false) {
        // check if data already cached

        const cacheIndex = 's' + cacheId;
        const cached = ENV.cache[cacheIndex];
        if (typeof cached !== 'undefined') {
            return new DataResponse(cached);
        }

        const coords = cacheId !== false ? [cacheId, lat, lon, name] : [];
        const location = await Helper.getLocation(...coords);
        if (!location) {
            const resp = await Data.tryLoadFromCache(configId, cacheId);
            resp.status = resp.status === DataResponse.OK
                ? DataResponse.NO_GPS
                : DataResponse.ERROR;
            return resp;
        }

        // get information for area
        const info = await rkiService.locationData(location);
        if (!info) {
            const resp = await Data.tryLoadFromCache(configId, cacheId);
            resp.status = resp.status === DataResponse.OK
                ? DataResponse.CACHED
                : DataResponse.ERROR;
            return resp;
        }

        const id = info.RS;
        const cases = await rkiService.casesArea(id);
        await Data.geoCache(configId, cacheId, id);

        const data = new Data(id);
        data.data = cases;
        data.meta = info;
        data.location = location;

        await cfm.write(data);

        ENV.cache[cacheIndex] = data;

        return new DataResponse(data);
    }

    static async loadState(id, name, ewz) {
        const cached = ENV.cache[id]
        if (typeof cached !== 'undefined') {
            return new DataResponse(cached)
        }

        const cases = await rkiService.casesState(id)
        const data = new Data(id)
        data.data = cases
        data.meta = {
            BL_ID: id,
            BL: name,
            EWZ: ewz
        }

        await cfm.write(data)
        ENV.cache[id] = data

        return new DataResponse(data)
    }

    static async geoCache(configId, dataIndex, rsid) {
        let data = {};
        const dataResponse = await cfm.read(
            cfm.configDirectory + '/coronaWidget_config.json');
        if (dataResponse.status === DataResponse.OK) data = JSON.parse(
            dataResponse.data);
        if (typeof data[configId] === 'undefined') data[configId] = {};
        data[configId]['dataIndex' + dataIndex] = rsid;
        await cfm.write(JSON.stringify(data),
            cfm.configDirectory + '/coronaWidget_config.json');
    }

    static getMaxIndexFromArrayOfObjects(array = [{}], index = '') {
        if (!Array.isArray(array)) return 0;

        return array.reduce((acc, x) => {
            const value = x[index] ?? 0;
            return value > acc ? value : acc;
        }, 0);
    }
}

class Format {
    static dateStr(timestamp) {
        let date = new Date(timestamp)
        return `${('' + date.getDate()).padStart(2, '0')}.${('' + (date.getMonth() + 1)).padStart(2, '0')}.${date.getFullYear()}`
    }

    static number(number, fractionDigits = 0, placeholder = null, limit = false) {
        if (!!placeholder && number === 0) return placeholder
        if (limit !== false && number >= limit) fractionDigits = 0
        return Number(number).toLocaleString('de-DE', {
            maximumFractionDigits: fractionDigits,
            minimumFractionDigits: fractionDigits
        })
    }

    static timestamp(dateStr) {
        const regex = /([\d]+)\.([\d]+)\.([\d]+),\ ([0-2]?[0-9]):([0-5][0-9])/g;
        let m = regex.exec(dateStr)
        return new Date(m[3], m[2] - 1, m[1], m[4], m[5]).getTime()
    }

    static rValue(data) {
        const parsedData = Parse.rCSV(data)
        let res = {date: null, r: 0}
        if (parsedData.length === 0) return res
        // find used key
        let rValueField
        Object.keys(parsedData[0]).forEach(key => {
            CFG.api.csvRvalueField.forEach(possibleRKey => {
                if (key === possibleRKey) rValueField = possibleRKey;
            })
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
        this.cache = {
            request: {},
        };

    }

    async locationData(location) {
        const longitude = location.longitude.toFixed(3);
        const latitude = location.latitude.toFixed(3);
        const outputFields = 'GEN,RS,EWZ,EWZ_BL,BL_ID,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL,IBZ';
        const url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1` +
            `&outFields=${outputFields}&geometry=${longitude}%2C${latitude}&` +
            `geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`;
        const response = await this.execCached(url);
        return (response.status === DataResponse.OK)
            ? response.data.features[0].attributes
            : false;
    }

    async casesArea(id) {
        const apiStartDate = Helper.getDateBefore(CFG.graph.shownDays + 7);
        const urlToday = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)+AND+IdLandkreis=${id}&objectIds=&time=&resultType=standard&outFields=&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D&having=&resultOffset=&resultRecordCount=&sqlFormat=none&token=`;
        const urlHistory = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdLandkreis=${id}+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;

        return await this.getCases(urlToday, urlHistory);
    }

    async casesState(id) {
        const apiStartDate = Helper.getDateBefore(CFG.graph.shownDays + 7);
        const urlToday = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)+AND+IdBundesland=${id}&objectIds=&time=&resultType=standard&outFields=&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D&having=&resultOffset=&resultRecordCount=&sqlFormat=none&token=`;
        const urlHistory = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdBundesland=${id}+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;

        return await this.getCases(urlToday, urlHistory);
    }

    async casesGer() {
        const apiStartDate = Helper.getDateBefore(CFG.graph.shownDays + 7);
        let urlToday = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)&returnGeometry=false&geometry=42.000%2C12.000&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D&resultType=standard&cacheHint=true`;
        urlToday += `&groupByFieldsForStatistics=MeldeDatum`;
        const urlHistory = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;

        return await this.getCases(urlToday, urlHistory);
    }

    async rData() {
        const cacheKey = 'r';
        const cached = this.getCached(cacheKey);
        if (cached) {
            return cached;
        }

        const url = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Projekte_RKI/Nowcasting_Zahlen_csv.csv?__blob=publicationFile`;
        const response = await this.execCached(url, ENV.request.string);

        return response.status === DataResponse.OK ? Format.rValue(
            response.data) : {date: null, r: 0};
    }

    async getCases(urlToday, urlHistory) {
        const keyCases = 'MeldeDatum';
        const responseToday = await this.execCached(urlToday);
        const responseHistory = await this.execCached(urlHistory);
        if (responseToday.status === DataResponse.OK &&
            responseHistory.status === DataResponse.OK) {
            let data = responseHistory.data.features.map(day => {
                return {
                    cases: day.attributes.cases,
                    date: day.attributes[keyCases],
                };
            });
            const todayCases = responseToday.data.features.reduce(
                (a, b) => a + b.attributes.cases, 0);
            const lastDateHistory = Math.max(
                ...responseHistory.data.features.map(
                    a => a.attributes[keyCases]));
            const lastDateToday = Math.max(...responseToday.data.features.map(
                a => a.attributes[keyCases]));
            let lastDate = lastDateHistory;
            if (!!lastDateToday ||
                new Date(lastDateToday).setHours(0, 0, 0, 0) <=
                new Date(lastDateHistory).setHours(0, 0, 0, 0)) {
                const lastReportDate = new Date(lastDateHistory);
                lastDate = lastReportDate.setDate(lastReportDate.getDate() + 1);
            }
            const lastDateStr = Format.dateStr(lastDate);
            data.push(
                {cases: todayCases, date: lastDate, date_str: lastDateStr});
            data = Data.completeHistory(data);
            return data;
        }
        return false;
    }

    async exec(url, type = ENV.request.json) {
        try {
            const resData = new Request(url);
            resData.timeoutInterval = 20;

            let data;
            let status = DataResponse.NOT_FOUND;
            switch (type) {
                case ENV.request.json:
                    data = await resData.loadJSON();
                    status = typeof data.features !== 'undefined'
                        ? DataResponse.OK
                        : DataResponse.NOT_FOUND;
                    break;
                case ENV.request.string:
                    data = await resData.loadString();
                    status = typeof data.length !== ''
                        ? DataResponse.OK
                        : DataResponse.NOT_FOUND;
                    break;
                default:
                    data = {};
            }
            return new DataResponse(data)
        } catch (e) {
            console.warn(e)
            return DataResponse.notFound()
        }
    }

    async execCached(url, type = ENV.request.json) {
        const cacheKey = type + '_' + url
        const cached = this.getCached(cacheKey, 'exec')

        let res;
        if (!cached) {
            res = await this.exec(url, type);
            this.cache.request[cacheKey] = res;
        } else {
            res = cached;
        }
        return res
    }

    getCached(key, parameter = null) {
        const cache = parameter !== null ? this.cache[parameter] : this.cache
        if (typeof cache === 'undefined' || Object.keys(cache).length <= 0) return false;

        const cached = cache[key];
        return typeof cached !== 'undefined' && cached !== null ? cached : false;
    }

}

class Parse {
    static input(input) {
        const _coords = []
        const _staticCoordinates = input.split(";").map(coords => {
            return coords.split(',')
        })
        _staticCoordinates.forEach(coords => {
            _coords[parseInt(coords[0])] = {
                index: parseInt(coords[0]),
                latitude: parseFloat(coords[1]) ?? false,
                longitude: parseFloat(coords[2]) ?? false,
                name: coords[3] ?? false,
            }
        })
        return _coords
    }

    static rCSV(rDataStr) {
        let lines = rDataStr.split(/(?:\r\n|\n)+/).filter(function (el) {
            return el.length !== 0
        })
        let headers = lines.splice(0, 1)[0].split(";");
        let elements = []
        for (let i = 0; i < lines.length; i++) {
            let element = {};
            let values = lines[i].split(';')
            element = values.reduce(function (result, field, index) {
                result[headers[index]] = field;
                return result;
            }, {})
            elements.push(element)
        }
        return elements
    }
}

class Helper {
    static calcIncidence(state) {
        const reversedData = state.data.reverse();
        for (let i = 0; i < CFG.graph.shownDays; i++) {
            const theDays = reversedData.slice(i + 1, i + 1 + 7); // without today
            const sumCasesLast7Days = theDays.reduce((a, b) => a + b.cases, 0);
            reversedData[i].incidence = (sumCasesLast7Days / state.meta.EWZ) *
                100000;
        }
        state.data = reversedData.reverse();
        return state;
    }

    static getDateBefore(offset, startDate = new Date()) {
        let offsetDate = new Date();
        offsetDate.setDate(startDate.getDate() - offset);
        return offsetDate.toISOString().split('T').shift();
    }

    static async getLocation(index, lat = false, lon = false, name = false) {
        if (lat && lon) {
            return {
                index: index,
                latitude: lat,
                longitude: lon,
                name: name,
                status: ENV.locStatus.static_loc,
            };
        }

        // gps
        try {
            Location.setAccuracyToThreeKilometers();
            const coords = await Location.current();
            coords.status = ENV.locStatus.current;
            return coords;
        } catch (e) {
            console.warn(e)
        }
        return null;
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