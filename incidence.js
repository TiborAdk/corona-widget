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
        useShortName: true, // use short name of states
    },
    graph: {
        showDays: 14, // number of days shown in graphs
        aboveTitle: false,  // show graphs above there title
        upsideDown: false,   // show graphs upside down (0 is top, max is bottom, default is: 0 at bottom and max at the top)
        showTrendCases: true, // show trend arrow of cases
    },
    storage: {
        maxDays: 21, // WARNING!!! Smaller values will delete saved days > CONFIG_CACHE_MAX_DAYS. Backup JSON first ;-)
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
        accuracy: 2, // accuracy the gps coordinates are cached with (0: 111 Km; 1: 11,1 Km; 2: 1,11 Km; 3: 111 m; 4: 11,1 m)
    }
}

// ============= ============= ============= ============= =================
// HALT, STOP !!!
// NACHFOLGENDE ZEILEN NUR AUF EIGENE GEFAHR ÄNDERN !!!
// ============= ============= ============= ============= =================
// ZUR KONFIGURATION SIEHE README:
// https://github.com/tiboradk/corona-widget/blob/master/README.md
// ============= ============= ============= ============= =================


const outputFields = 'GEN,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL,RS,IBZ';
const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`
const outputFieldsStates = 'Fallzahl,LAN_ew_GEN,cases7_bl_per_100k,Aktualisierung';
const apiUrlStates = `https://services7.arcgis.com/bmOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%E4lle_in_den_Bundesl%E4ndern/FeatureServer/0/query?where=1%3D1&outFields=${outputFieldsStates}&returnGeometry=false&outSR=4326&f=json`
const apiUrlNewCases = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&resultType=standard&cacheHint=true'
const apiRUrl = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Projekte_RKI/Nowcasting_Zahlen_csv.csv?__blob=publicationFile`

const ENV = {
    align: {
        left: 'align_left',
        center: 'align_center',
        right: 'align_right'
    },
    incidenceLimit: {
        darkdarkred: 250,
        darkred: 100,
        red: 50,
        orange: 35,
        yellow: 25,
        green: 1
    },
    incidenceColor: {
        darkdarkred: new Color('#6b1200'),
        darkred: new Color('#a1232b'),
        red: new Color('#f6000f'),
        orange: new Color('#ff7927'),
        yellow: new Color('#F5D800'),
        green: new Color('#1CC747'),
        gray: new Color('#d0d0d0')
    },
    trendLabel: {
        up: '↑',
        down: '↓',
        right: '→',
        up_right: '↗'

    },
    color: {
        warn: new Color('#dbc43d'),
    },
    statesAbbr: {
        'Baden-Württemberg': 'BW',
        'Bayern': 'BY',
        'Berlin': 'BE',
        'Brandenburg': 'BB',
        'Bremen': 'HB',
        'Hamburg': 'HH',
        'Hessen': 'HE',
        'Mecklenburg-Vorpommern': 'MV',
        'Niedersachsen': 'NI',
        'Nordrhein-Westfalen': 'NRW',
        'Rheinland-Pfalz': 'RP',
        'Saarland': 'SL',
        'Sachsen': 'SN',
        'Sachsen-Anhalt': 'ST',
        'Schleswig-Holstein': 'SH',
        'Thüringen': 'TH'
    },
    requestType: {
        json: 'json',
        string: 'string'
    },
    state: {
        nameIndex: CFG.state.useShortName ? 'BL' : 'name'
    },
    widget: {
        isMedium: config.widgetFamily === 'medium',
    },
    coordinates: [],
    response: {
        ok: 200,
        created: 201,
        failed: 404,
        offline: 418,
        from_cache: 700,
        no_gps: 701,

    },
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
        static_loc: ''
    },
    errTxt: "⚡️ Daten konnten nicht geladen werden. \nWidget öffnen für reload. \n\nTIPP: Cache Id in Widgetparamter setzen für Offline modus."
}

if (args.widgetParameter) {
    ENV.coordinates = parseInput(args.widgetParameter)
    if (typeof ENV.coordinates[1] !== 'undefined' && Object.keys(ENV.coordinates[1]).length >= 3) {
        ENV.widget.isMedium = ENV.widget.isMedium && true
    }
} else {
    ENV.coordinates = parseInput("1,50.33,8.75,,06440")
    ENV.widget.isMedium = true
}

function addErrorBlockTo(view, padding, errTxt = ENV.errTxt) {
    const errorBox = view.addStack()
    errorBox.setPadding(2, 0, 10, 0)
    errorBox.layoutHorizontally()
    errorBox.addSpacer(10)
    addLabelTo(errorBox, errTxt, Font.mediumSystemFont(10), Color.gray())
    errorBox.addSpacer(padding)
}

function addAreaTo(view, dataResponse, dates, padding) {
    const status = dataResponse.status
    if (status === ENV.response.ok || status === ENV.response.from_cache || status === ENV.response.offline) {
        const data = dataResponse.data
        let showDate = true
        let showStatus = false

        const key = dateStr2DateKey(data.area.updated)
        if (dates.length === 1 && dates.includes(key)) {
            showDate = false
        } else if (!dates.includes(key)) {
            showDate = true
            dates.push(dateStr2DateKey(data.area.updated))
        }

        if (status !== ENV.response.ok) {
            showStatus = true
            showDate = true
        }

        addIncidenceBlockTo(view, data.area, data.state, [2, 10, 10, padding], showDate, dataResponse.status)
    } else {
        addErrorBlockTo(view, padding);

    }
}

class IncidenceWidget {
    async init() {
        const widget = await this.createWidget()
        widget.setPadding(0, 0, 0, 0)
        if (!config.runsInWidget) {
            if (ENV.widget.isMedium) {
                await widget.presentMedium()
            } else {
                await widget.presentSmall()
            }
        }
        Script.setWidget(widget)
        Script.complete()
    }

    async createWidget() {
        const list = new ListWidget()
        const headerRow = addHeaderRowTo(list)

        // R
        const rData = await rkiService.getRData()
        headerRow.addSpacer(3)
        addLabelTo(headerRow, ('' + rData.r.toFixed(2)).replace('.', ',') + 'ᴿ', Font.mediumSystemFont(14))
        headerRow.addSpacer()

        // GER
        const dataResponseGer = await getDataGer()
        const statusGer = dataResponseGer.status
        if (statusGer === ENV.response.ok || statusGer === ENV.response.from_cache || statusGer === ENV.response.offline) {
            const dataGer = dataResponseGer.data

            let chartdata = getChartData(dataGer.data)
            let chartDataTitle = getLastCasesAndTrend(dataGer.data)
            addChartBlockTo(headerRow, chartDataTitle, chartdata, ENV.align.right)
            headerRow.addSpacer(0)
            list.addSpacer(3)
        }

        // AREAS
        let padding = (ENV.widget.isMedium) ? 5 : 10
        let dates = []

        const incidenceRow = list.addStack()
        incidenceRow.layoutHorizontally()
        incidenceRow.centerAlignContent()

        const maxIndex = ENV.widget.isMedium ? 2 : 1

        for (let i = 0; i < maxIndex; i++) {
            const dataResponse = await getDataAreaState(i)
            addAreaTo(incidenceRow, dataResponse, dates, padding);
        }

        if (CFG.widget.openUrlOnTap) list.url = CFG.widget.openUrl
        list.refreshAfterDate = new Date(Date.now() + CFG.widget.refreshInterval * 1000)

        return list
    }
}

function getLastCasesAndTrend(data) {
    // TODAY
    let casesTrendStr;
    let todayData = getDataForDate(data);
    let todayCases = todayData.dailyCases;
    let yesterdayCases = false;
    let beforeYesterdayCases = false;
    if (todayCases !== -1) {
        casesTrendStr = '+' + formatNumber(todayCases)
        // YESTERDAY
        let yesterdayData = getDataForDate(data, 1)
        if (yesterdayData) yesterdayCases = yesterdayData.dailyCases;
        // BEFOREYESTERDAY
        let beforeYesterdayData = getDataForDate(data, 2)
        if (beforeYesterdayData) beforeYesterdayCases = beforeYesterdayData.dailyCases;
        if (todayCases && yesterdayCases !== false && beforeYesterdayCases !== false) {
            casesTrendStr += getTrendUpArrow(todayCases - yesterdayCases, yesterdayCases - beforeYesterdayCases)
        }
    } else {
        casesTrendStr = 'n/v'
    }
    return casesTrendStr
}

function getChartData(data) {
    const allKeys = Object.keys(data).reverse()
    const showDays = CFG.graph.showDays
    const chartdata = new Array(showDays).fill({value: 0, incidence: 0});
    allKeys.forEach((key, index) => {
        if (typeof chartdata[showDays - 1 - index] !== 'undefined') {
            chartdata[showDays - 1 - index] = {
                value: data[key]['dailyCases'],
                incidence: data[key]['incidence']
            }
        }
    })
    return chartdata
}

function addIncidenceBlockTo(view, area, state, padding, showDate, status = ENV.response.ok) {
    const incidenceBlockBox = view.addStack()
    incidenceBlockBox.setPadding(padding[0], 0, padding[2], 0)
    incidenceBlockBox.layoutHorizontally()
    incidenceBlockBox.addSpacer(padding[1])

    const incidenceBlockRows = incidenceBlockBox.addStack()
    incidenceBlockRows.backgroundColor = new Color('#cccccc', 0.1)
    incidenceBlockRows.setPadding(0, 0, 0, 0)
    incidenceBlockRows.cornerRadius = 14
    incidenceBlockRows.layoutVertically()

    addIncidence(incidenceBlockRows, area, state, showDate, status)
    addTrendsBarToIncidenceBlock(incidenceBlockRows, area.data, state.data)
    incidenceBlockRows.addSpacer(2)
    incidenceBlockBox.addSpacer(padding[3])

    return incidenceBlockBox;
}

function addIncidence(view, area, state, showDate = false, status = ENV.response.ok) {
    const todayDataArea = getDataForDate(area.data)
    const yesterdayDataArea = getDataForDate(area.data, 1)

    const incidenceBox = view.addStack()
    incidenceBox.setPadding(6, 8, 6, 8)
    incidenceBox.cornerRadius = 12
    incidenceBox.backgroundColor = new Color('#999999', 0.1)
    incidenceBox.layoutHorizontally()

    const stackMainRowBox = incidenceBox.addStack()
    stackMainRowBox.layoutVertically()
    stackMainRowBox.addSpacer(0)

    const locationStatus = area.locationStatus

    LOG('status', status, getStatusText(status))
    LOG('locationStatus', locationStatus, getLocStatusText(locationStatus))

    if (showDate && status === ENV.response.ok) {
        addLabelTo(stackMainRowBox, getLocStatusText(locationStatus) + dateStr2DateKey(todayDataArea.updated), Font.mediumSystemFont(10), new Color('#888888'))
        stackMainRowBox.addSpacer(0)
    } else if (showDate && status === ENV.response.from_cache) {
        addLabelTo(stackMainRowBox, getLocStatusText(locationStatus) + dateStr2DateKey(todayDataArea.updated) + ' ' + getStatusText(status), Font.mediumSystemFont(10), ENV.color.warn)
        stackMainRowBox.addSpacer(0)
    } else {
        stackMainRowBox.addSpacer(10)
    }
    const stackMainRow = stackMainRowBox.addStack()
    stackMainRow.centerAlignContent()

    // === INCIDENCE
    let incidence = formatNumber(todayDataArea.incidence.toFixed(1), 1)
    if (todayDataArea.incidence >= 100) incidence = formatNumber(Math.round(todayDataArea.incidence));
    addLabelTo(stackMainRow, formatNumber(incidence), Font.boldSystemFont(27), getIncidenceColor(incidence))

    if (yesterdayDataArea) {
        const incidenceTrend = getTrendArrow(todayDataArea.incidence, yesterdayDataArea.incidence);
        let incidenceLabelColor;
        if (incidenceTrend === ENV.trendLabel.up) {
            incidenceLabelColor = ENV.incidenceColor.red;
        } else if (incidenceTrend === ENV.trendLabel.down) {
            incidenceLabelColor = ENV.incidenceColor.green;
        } else {
            incidenceLabelColor = new Color('#999999');
        }
        addLabelTo(stackMainRow, incidenceTrend, Font.boldSystemFont(27), incidenceLabelColor)
    }
    stackMainRow.addSpacer(4)

    // === BL INCIDENCE
    const todayDataState = getDataForDate(state.data)
    const yesterdayDataState = getDataForDate(state.data, 1)

    const incidenceBLStack = stackMainRow.addStack();
    incidenceBLStack.layoutVertically()
    incidenceBLStack.backgroundColor = new Color('#dfdfdf')
    incidenceBLStack.cornerRadius = 4
    incidenceBLStack.setPadding(2, 3, 2, 3)

    let incidenceBL = formatNumber(todayDataState.incidence.toFixed(1), 1);
    if (todayDataState.incidence >= 100) incidenceBL = formatNumber(Math.round(todayDataState.incidence))
    if (yesterdayDataState) {
        incidenceBL += getTrendArrow(todayDataState.incidence, yesterdayDataState.incidence)
    }
    const stateName = state[ENV.state.nameIndex]
    addLabelTo(incidenceBLStack, incidenceBL, Font.mediumSystemFont(9), '#444444')
    addLabelTo(incidenceBLStack, stateName, Font.mediumSystemFont(9), '#444444')

    const areaNameStack = stackMainRowBox.addStack();
    areaNameStack.layoutHorizontally()
    areaNameStack.setPadding(0,0,0,0)
    areaNameStack.centerAlignContent()

    let areaNameFontSize = 14
    let areaIcon = getAreaIcon(area.areaIBZ)
    if (areaIcon && CFG.area.showIcon) {
        let areaNameIconBox = areaNameStack.addStack()
        areaNameIconBox.borderColor = new Color('#999999', 0.3)
        areaNameIconBox.borderWidth = 2
        areaNameIconBox.cornerRadius = 2
        areaNameIconBox.setPadding(1, 3, 1, 3)
        let areaIconLabel = areaNameIconBox.addText(areaIcon)
        areaIconLabel.font = Font.mediumSystemFont(9)
        areaNameStack.addSpacer(3)

        areaNameFontSize = 12
    }

    let areaName = area.name
    if (showDate) {
        const coords = ENV.coordinates[showDate]
        if (typeof coords !== 'undefined' && coords.name !== false) {
            areaName = ENV.coordinates[showDate].name
        }
    }
    areaName = areaName.toUpperCase().padEnd(50, ' ')
    const areaNameLabel = addLabelTo(areaNameStack, areaName, Font.mediumSystemFont(areaNameFontSize))
    areaNameLabel.lineLimit = 1
    areaNameStack.addSpacer()
    stackMainRowBox.addSpacer(0)
}

function getAreaIcon(areaIBZ) {
    switch (areaIBZ) {
        case 40: // Kreisfreie Stadt
            return 'KS'
        case 41: // Stadtkreis
            return 'SK'
        case 42: // Kreis
        case 46: // Sonderverband offiziell Kreis
            return 'K'
        case 43: // Landkreis
        case 45: // Sonderverband offiziell Landkreis
            return 'LK'
    }
    return 'BZ' // Bezirk
}

function getLocStatusText(locationStatus) {
    for (const statusKey in ENV.locStatus) {
        if (ENV.locStatus[statusKey] === locationStatus) {
            const res = ENV.locStatusText[statusKey]
            return typeof res === 'undefined' ? statusKey : res;
        }
    }
    return '<locStatus>'
}

function getStatusText(status) {
    for (const statusKey in ENV.response) {
        if (ENV.response[statusKey] === status) {
            const res = ENV.statusText[statusKey]
            return typeof res === 'undefined' ? statusKey : res;
        }
    }
    return '<status>'
}

function addLabelTo(view, text, font = false, textColor = false, minScale = 1.0) {
    const label = view.addText('' + text)
    label.minimumScaleFactor = minScale
    if (font) label.font = font
    if (textColor) label.textColor = (typeof textColor === 'string') ? new Color(textColor) : textColor;
    return label
}

function formatNumber(number, minimumFractionDigits = 0) {
    return Number(number).toLocaleString('de-DE', { minimumFractionDigits: minimumFractionDigits })
}

function getTrendUpArrow(now, prev) {
    if (!CFG.graph.showTrendCases) return ''
    return (now < prev) ? ENV.trendLabel.up_right : (now > prev) ? ENV.trendLabel.up : ENV.trendLabel.right
}

function getTrendArrow(value1, value2) {
    return (value1 < value2) ? ENV.trendLabel.down : (value1 > value2) ? ENV.trendLabel.up : ENV.trendLabel.right
}

function addTrendsBarToIncidenceBlock(view, dataArea, dataState) {
    const trendsBarBox = view.addStack()
    trendsBarBox.setPadding(3, 8, 3, 8)
    trendsBarBox.layoutHorizontally()

    // AREA TREND
    let chartdata = getChartData(dataArea)
    let chartDataTitle = getLastCasesAndTrend(dataArea)
    /*DEMO!!!! chartdata = [{incidence: 0, value: 0},{incidence: 10, value: 10}{incidence: 20, value: 20},{incidence: 30, value: 30},{incidence: 40, value: 40},{incidence: 50, value: 50},{incidence: 70, value: 70},{incidence: 100, value: 100},{incidence: 60, value: 60},{incidence: 70, value: 70},{incidence: 39, value: 39},{incidence: 20, value: 25},{incidence: 10, value: 20},{incidence: 30, value: 30},]*/
    addChartBlockTo(trendsBarBox, chartDataTitle, chartdata, ENV.align.left)
    trendsBarBox.addSpacer()

    // STATE TREND
    let chartdataBL = getChartData(dataState)
    let chartDataBLTitle = getLastCasesAndTrend(dataState)
    /* DEMO!!!! chartdataBL = [{incidence: 0, value: 0},{incidence: 20, value: 20},{incidence: 40, value: 40},{incidence: 50, value: 50},{incidence: 70, value: 70},{incidence: 100, value: 100},{incidence: 110, value: 110},{incidence: 77, value: 77},{incidence: 70, value: 70},{incidence: 39, value: 39},{incidence: 30, value: 40},{incidence: 30, value: 30},{incidence: 40, value: 60},{incidence: 30, value: 20}]*/
    addChartBlockTo(trendsBarBox, chartDataBLTitle, chartdataBL, ENV.align.right)
}

function addHeaderRowTo(view) {
    const headerRow = view.addStack()
    headerRow.setPadding(8, 8, 4, 8)
    headerRow.centerAlignContent()
    const headerIcon = headerRow.addText("🦠")
    headerIcon.font = Font.mediumSystemFont(16)
    return headerRow;
}

function addChartBlockTo(view, trendtitle, chartdata, align = ENV.align.left) {
    let block = view.addStack()
    block.setPadding(0, 0, 0, 0)
    block.layoutVertically()
    block.size = new Size(58, 24)

    let graphImg = generateGraph(chartdata, 58, 10, align).getImage()
    let chartImg

    if (CFG.graph.aboveTitle) chartImg = block.addImage(graphImg)

    let textRow = block.addStack()
    if (align === ENV.align.right) textRow.addSpacer()
    let chartText = textRow.addText(trendtitle)
    if (align === ENV.align.left) textRow.addSpacer()
    chartText.font = Font.mediumSystemFont(10)

    if (!CFG.graph.aboveTitle) chartImg = block.addImage(graphImg)

    chartImg.resizable = false
}

function generateGraph(data, width, height, align = ENV.align.left, upsideDown = CFG.graph.upsideDown) {
    let context = new DrawContext()
    context.size = new Size(width, height)
    context.opaque = false
    let max = Math.max.apply(Math, data.map((o) => {
        return o.value;
    }))
    max = (max <= 0) ? 10 : max;
    let w = Math.round((width - (data.length * 2)) / data.length)

    let xOffset
    if (align === ENV.align.center) {
        xOffset = (width - (data.length * (w + 1))) / 2
    } else if (align === ENV.align.right) {
        xOffset = width - (data.length * (w + 1))
    } else {
        // ALIGN_LEFT as default for unknown values
        xOffset = 0
    }

    data.forEach((item, index) => {
        let value = parseFloat(item.value)
        if (value === -1 && index === 0) value = 10
        let h = Math.max(2, Math.round((Math.abs(value) / max) * height))
        let x = xOffset + (w + 1) * index
        let y = (!upsideDown) ? height - h : 0
        let rect = new Rect(x, y, w, h)
        context.setFillColor(getIncidenceColor((item.value > 1) ? item.incidence : 0))
        context.fillRect(rect)
    })
    return context
}

async function getLocation(staticCoordinateIndex = false) {
    try {
        if (staticCoordinateIndex !== false && typeof ENV.coordinates[staticCoordinateIndex] !== 'undefined') {
            const coords = ENV.coordinates[staticCoordinateIndex]
            if (Object.keys(coords).length >= 3) {
                coords.status = ENV.locStatus.static_loc
                return coords
            }
        } else {
            Location.setAccuracyToThreeKilometers()
            const coords = await Location.current()
            coords.status = ENV.locStatus.current
            return coords
        }
    } catch (e) {
        console.warn(e)
        return null
    }

}

function gps2Key(latitude, longitude, accuracy = CFG.gpsCache.accuracy) {
    const lon = parseFloat(latitude.toFixed(accuracy));
    const lat = parseFloat(longitude.toFixed(accuracy));
    return `${lat},${lon}`
}

async function getCachedIdByLocation(location) {
    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') return false;

    const response = await fm.loadData('GPS');
    if (response.status === ENV.response.ok) {
        const data = response.data;

        const cached = data[gps2Key(location.latitude, location.longitude)]
        return typeof cached === 'undefined' ? false : cached;

    } else {
        return false
    }
}

async function cacheIdByLocation(location, areaId, stateId) {
    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') return;

    const response = await fm.loadData('GPS');
    if (response.status === ENV.response.ok) {
        const data = response.data;
        data [gps2Key(location.latitude, location.longitude)] = {area: areaId, state: stateId}

        fm.saveData('GPS', data)
    }
}

function genDaterange(start, end) {
    if (!(start instanceof Date && start instanceof Date)) return [];
    if (start > end) return [];

    let dates = [];
    let curr = start;
    while (curr < end) {
        dates.push(curr);
        curr.setDate(curr.getDate() + 1);
    }
    return dates;

}

async function getDataOffline(dataId, defaultData = {}, locationStatus = ENV.locStatus.failed) {
    const response = await fm.loadData(dataId)
    if (response.status === ENV.response.ok) {
        const entity = response.data
        const data = entity.data

        const today = new Date();
        const dateToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (Object.keys(data).includes(date2DateKey(dateToday))) return entity;


        const dateStart = new Date(dateToday.getDate() - CFG.graph.showTrendCases);
        const dates = genDaterange(dateStart, today);
        let newData = {};

        dates.forEach(date => {
            const dateKey = date2DateKey(date)
            const value = data[dateKey];
            if (typeof value !== 'undefined') {
                newData[dateKey] = value;
            } else {
                newData[dateKey] = defaultData;
                entity.updated = dateKey;

            }
        })

        entity.data = data
        entity.locationStatus = locationStatus
        return new DataResponse(entity, ENV.response.offline)

    } else {
        return new DataResponse({}, ENV.response.failed)
    }
}


async function getDataGer() {
    const dataGer = await rkiService.getGerData()
    if (dataGer) {
        const country = {
            name: 'GER',
            data: {
                incidence: parseFloat(dataGer.incidence.toFixed(1)),
                dailyCases: dataGer.dailyCases,
                r: dataGer.r,
                updated: date2UpdatedStr(new Date(dataGer.updatedTS)),
                updatedTS: dataGer.updatedTS,
            },

        }

        const preparedDataCountry = await Data.prepareData(country.name, country.data, false)
        if (preparedDataCountry.status === ENV.response.ok) {
            country.data = preparedDataCountry.data
            fm.saveData(country.name, country)
        }

        return new DataResponse(country, preparedDataCountry.status)
    } else {
        const today = new Date()
        const dateToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        return await getDataOffline('GER', {
            incidence: null,
            dailyCases: -1,
            r: {date: null, r: 0},
            updated: date2UpdatedStr(dateToday),
            updatedTS: dateToday.getTime(),
        }, ENV.locStatus.cached)
    }

}

async function getArea(location) {
    const dataArea = await rkiService.getLocationData(location)
    if (!dataArea) {
        console.warn('Requesting area failed. Trying to get data from cache.')

        const today = new Date()
        const dateToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const dataId = getCachedIdByLocation(location).area;

        if (dataId) {
            return await getDataOffline(dataId, {
                incidence: null,
                areaCases: null,
                dailyCases: -1,
                updated: date2UpdatedStr(dateToday),
                updatedTS: dateToday.getTime()
            }, ENV.locStatus.cached);

        } else {
            return new DataResponse({}, ENV.response.failed)
        }

    } else {
        const entity = {
            name: dataArea.GEN,
            rs: dataArea.RS,
            areaIBZ: dataArea.IBZ,
            BL: ENV.statesAbbr[dataArea.BL],
            data: {
                incidence: parseFloat(dataArea.cases7_per_100k.toFixed(1)),
                areaCases: parseFloat(dataArea.cases.toFixed(1)),
                dailyCases: -1,
                updated: dataArea.last_update,
                updatedTS: getTimestamp(dataArea.last_update)
            }

        }

        const preparedData = await Data.prepareData(entity.rs, entity.data)
        if (preparedData.status === ENV.response.ok) {
            entity.data = preparedData.data
            fm.saveData(entity.rs, entity)
        } else {
            console.warn('Preparing area failed.')
        }
        entity.updated = Object.keys(entity.data)[Object.keys(entity.data).length - 1]
        entity.locationStatus = ENV.locStatus.failed

        return new DataResponse(entity, preparedData.status)
    }
}

async function getState(bl) {
    const dataState = await rkiService.getStateData(bl);
    if (!dataState) {
        console.warn('Requesting state failed. Trying to get data from cache.')

        const today = new Date()
        const dateToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        return await getDataOffline(bl, {
            incidence: null,
            areaCases: null,
            dailyCases: -1,
            updated: date2UpdatedStr(dateToday),
            updatedTS: dateToday.getTime()
        });
    } else {
        const entity = {
            name: dataState.name,
            BL: dataState.BL,
            data: {
                incidence: parseFloat(dataState.incidence.toFixed(1)),
                cases: parseFloat(dataState.cases.toFixed(1)),
                dailyCases: -1,
                updatedTS: dataState.updatedTS,
                updated: date2UpdatedStr(new Date(dataState.updatedTS))
            }
        }

        const preparedData = await Data.prepareData(entity.BL, entity.data)
        if (preparedData.status === ENV.response.ok) {
            entity.data = preparedData.data
            fm.saveData(entity.BL, entity)
        } else {
            console.warn('Preparing state failed.')
        }
        entity.updated = Object.keys(entity.data)[Object.keys(entity.data).length - 1]

        return new DataResponse(entity, preparedData.status)
    }
}

async function getDataAreaState(useStaticCoordsIndex = false) {
    let loadArea = async function () {
    }
    let loadState = async function () {
    }
    let onsuccess, location, locationStatus;

    // check if id for offline use is set
    const coords = ENV.coordinates[useStaticCoordsIndex]
    if (typeof coords !== 'undefined' && coords.cacheId) {
        console.warn('Loading data from cache...' + coords.cacheId);
        loadArea = async () => {
            return await fm.loadData(coords.cacheId)
        }
        loadState = async (...args) => {
            return await fm.loadData(...args)
        }
        onsuccess = ENV.response.from_cache
        location = coords.cacheId
        locationStatus = ENV.locStatus.cached

    } else {
        console.log('Requesting data...')
        loadArea = getArea
        loadState = getState
        onsuccess = ENV.response.ok
        location = await getLocation(useStaticCoordsIndex)

        if (!location) {
            console.warn('No cache id in "WidgetParameter" found. See readme.');
            return new DataResponse({}, ENV.response.failed)
        }
        locationStatus = location.status
    }

    let stateId = null;
    let areaId = null;
    // AREA
    let area = null;
    const dataArea = await loadArea(location);
    if (dataArea.status === ENV.response.ok || dataArea.status === ENV.response.from_cache) {
        area = dataArea.data;
        areaId = area.rs
        area.updated = Object.keys(area.data)[Object.keys(area.data).length - 1]
        console.log(location)
        area.locationStatus = locationStatus
    } else {
        return new DataResponse({}, ENV.response.failed)
    }

    //STATE
    let state;
    const dataState = await loadState(area.BL);
    if (dataState.status === ENV.response.ok || dataState.status === ENV.response.from_cache) {
        state = dataState.data;
        stateId = state.BL
        state.updated = Object.keys(state.data)[Object.keys(state.data).length - 1]

    } else {
        state = null;
    }

    if (dataArea.status === ENV.response.ok && dataState.status === ENV.response.ok) await cacheIdByLocation(location, areaId, stateId)

    return new DataResponse({area: area, state: state}, onsuccess);

}

function getTimestamp(dateStr) {
    const regex = /([\d]+)\.([\d]+)\.([\d]+), ([0-2]?[0-9]):([0-5][0-9])/g;
    let m = regex.exec(dateStr)
    return new Date(m[3], m[2] - 1, m[1], m[4], m[5]).getTime()
}

function getIncidenceColor(incidence) {
    for (const entry of Object.entries(ENV.incidenceLimit)) {
        const limit = entry[1]
        if (incidence >= limit) {
            const key = entry[0]
            return ENV.incidenceColor[key]
        }
    }

    return ENV.incidenceColor.gray
}

function parseInput (input) {
    const _coords = []
    const _staticCoordinates = input.split(";").map(coords => {
        return coords.split(',')
    })
    _staticCoordinates.forEach(coords => {
        _coords[parseInt(coords[0])] = {
            index: parseInt(coords[0]),
            latitude: parseFloat(coords[1]),
            longitude: parseFloat(coords[2]),
            name: (coords[3]) ? coords[3] : false,
            cacheId: (coords[4]) ? coords[4] : false
        }
    })
    return _coords
}

function prepend(str, n, padding) {
    return ('' + str).padStart(n, padding)
}

function date2DateKey(date) {
    const day = prepend(date.getDate(), 2, '0')
    const month = prepend(date.getMonth() + 1, 2, '0')
    return `${day}.${month}.${date.getFullYear()}`
}

function date2UpdatedStr(date) {
    const hour = prepend(date.getHours(), 2, '0')
    const min = prepend(date.getMinutes(), 2, '0')
    return date2DateKey(date) + ', ' + hour + ':' + min
}

function dateStr2DateKey(str) {
    return str.substr(0, 10)
}

function getDataForDate(data, dayOffset = 0) {
    const dateKeys = Object.keys(data)
    const dateKey = dateKeys[dateKeys.length - 1 - dayOffset]
    return (typeof data[dateKey] !== 'undefined') ? data[dateKey] : false;
}

function parseRCSV(rDataStr) {
    let lines = rDataStr.split(/(?:\r\n|\n)+/).filter((el) => {
        return el.length !== 0
    })
    let headers = lines.splice(0, 1)[0].split(";");
    let valuesRegExp = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\")|([^\";]+)/g;
    let elements = []
    for (let i = 0; i < lines.length; i++) {
        let element = {};
        let j = 0, matches;
        while (matches = valuesRegExp.exec(lines[i])) {
            let value = matches[1] || matches[2]
            value = value.replace(/\"\"/g, "\"")
            element[headers[j]] = value;
            j++;
        }
        elements.push(element)
    }
    return elements
}

function LOG(...data) {
    console.log(data.map(JSON.stringify).join(' | '))
}

class Arguments {
    constructor(inputParameter, parsingFun) {
        this.arguments = inputParameter ? parsingFun(inputParameter) : [];
    }

    get(index) {
        return index < this.arguments.length ? this.arguments[index] : false;
    }

    size() {
        return this.arguments.length
    }
}

class DataResponse {
    constructor(data, status = ENV.response.ok) {
        this.data = data
        this.status = status
    }
}

class CustomFileManager {
    constructor(directory, fileName) {
        try {
            this.fm = FileManager.iCloud()
        } catch (e) {
            this.fm = FileManager.local()
        }
        // check if user logged in iCloud
        try {
            this.fm.documentsDirectory()
        } catch (e) {
            this.fm = FileManager.local()
        }
        this.configDirectory = this.fm.joinPath(this.fm.documentsDirectory(), directory)
        this.fileName = fileName
    }

    saveData(dataId, newData) {
        let path = this.fm.joinPath(this.configDirectory, this.fileName + dataId + '.json')
        this.fm.writeString(path, JSON.stringify(newData))
    }

    migrateDataFiles(dataId, oldAreaName) {
        if (!this.fm.isDirectory(this.configDirectory)) this.fm.createDirectory(this.configDirectory)
        let configPath = this.fm.joinPath(this.configDirectory, this.fileName + dataId + '.json')
        let oldConfigPaths = [
            this.fm.joinPath(this.fm.documentsDirectory(), 'covid19' + oldAreaName + '.json'),
            this.fm.joinPath(this.fm.documentsDirectory(), this.fileName + dataId + '.json')
        ]
        oldConfigPaths.forEach(oldPath => {
            if (this.fm.isFileStoredIniCloud(oldPath) && !this.fm.isFileDownloaded(oldPath)) this.fm.downloadFileFromiCloud(oldPath)
            if (this.fm.fileExists(oldPath) && !this.fm.fileExists(configPath)) try {
                this.fm.move(oldPath, configPath)
            } catch (e) {
                console.warn(e)
            }
            // if (this.fm.fileExists(oldPath)) try { this.fm.remove(oldPath) } catch(e) { console.warn(e) }
        })
    }

    async loadData(dataId) {
        let path = this.fm.joinPath(this.configDirectory, this.fileName + dataId + '.json')
        if (this.fm.isFileStoredIniCloud(path) && !this.fm.isFileDownloaded(path)) {
            await this.fm.downloadFileFromiCloud(path)
        }
        if (this.fm.fileExists(path)) {
            try {
                return new DataResponse(JSON.parse(this.fm.readString(path)))
            } catch (e) {
                return new DataResponse(null, 500)
            }
        }
        return new DataResponse(null, ENV.response.failed)
    }
}

class Data {
    static async prepareData(dataId, newData, calcDailyCases = true) {
        const dataResponse = await fm.loadData(dataId)
        let data = {}
        if (dataResponse.status === ENV.response.ok) {
            // const migratedData = this.migrateData(dataResponse.data)
            // if (Object.keys(migratedData).length > 0) {
            //     data = migratedData;
            // } else {
            //     data = dataResponse.data
            // }

            // 1st data: get data from response object, 2nd data: get field `data` from stored object
            if (typeof dataResponse.data.data !== 'undefined') data = dataResponse.data.data
        }
        data[dateStr2DateKey(newData.updated)] = newData
        data = this.limitData(data)
        if (calcDailyCases) data = Data.populateDailyCases(data);
        return new DataResponse(data)
    }

    static populateDailyCases(data) {
        const keys = Object.keys(data).reverse()
        keys.forEach((key) => {
            let yesterday = new Date(data[key].updatedTS - (60 * 60 * 24) * 1000)
            let yesterdayKey = `${('' + yesterday.getDate()).padStart(2, '0')}.${('' + (yesterday.getMonth() + 1)).padStart(2, '0')}.${yesterday.getFullYear()}`
            let keyCases
            if (typeof data[key].areaCases !== 'undefined') {
                keyCases = 'areaCases'
            } else {
                keyCases = 'cases'
            }
            if (typeof data[yesterdayKey] !== 'undefined') {
                data[key].dailyCases = data[key][keyCases] - data[yesterdayKey][keyCases]
            } else {
                if (data[key].dailyCases === null) data[key].dailyCases = -1
            }
        });
        return data
    }

    static limitData(data, days = CFG.storage.maxDays) {
        const dataKeys = Object.keys(data);
        const lastKeys = dataKeys.slice(Math.max(dataKeys.length - days, 0))
        let dataLimited = {}
        lastKeys.forEach(key => {
            dataLimited[key] = data[key]
        })
        return dataLimited
    }

    static migrateData(loggedData) {
        let migratedData = {}
        Object.keys(loggedData).forEach((key) => {
            // CHECK FOR OLD FORMAT
            if (typeof loggedData[key].incidence !== 'undefined') {
                const stateData = getStateData(loggedData[key].incidencePerState, loggedData[key].nameBL)
                migratedData[key] = {
                    area: {
                        incidence: loggedData[key].incidence,
                        name: loggedData[key].areaName,
                        dailyCases: -1,
                        areaCases: loggedData[key].areaCases,
                    },
                    state: {
                        incidence: loggedData[key].incidenceBL,
                        name: loggedData[key].nameBL,
                        cases: stateData.cases,
                        dailyCases: -1
                    },
                    d: {
                        incidence: loggedData[key].averageIncidence,
                        dailyCases: loggedData[key].cases,
                        r: loggedData[key].r
                    },
                    updated: loggedData[key].updated,
                    updatedTS: getTimestamp(loggedData[key].updated),
                    rs: loggedData[key].RS,
                }
            }
        })
        return migratedData
    }
}

class RkiService {

    constructor() {
        this.cache = {
            request: {}
        }

    }

    async getLocationData(location) {
        const outputFields = 'GEN,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL,RS,IBZ';
        const url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`
        const response = await this.cachedRequest(url)
        return (response.status === ENV.response.ok) ? response.data.features[0].attributes : false
    }

    async getStatesData() {
        const cacheKey = 'states'
        const cached = this.getCached(cacheKey)

        if (cached) {
            return cached
        }

        const url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%E4lle_in_den_Bundesl%E4ndern/FeatureServer/0/query?where=1%3D1&outFields=${outputFieldsStates}&returnGeometry=false&outSR=4326&f=json`
        const response = await this.cachedRequest(url)

        if (response.status === ENV.response.ok) {
            const allStatesData = response.data.features.map((f) => {
                return {
                    name: f.attributes.LAN_ew_GEN,
                    BL: ENV.statesAbbr[f.attributes.LAN_ew_GEN],
                    incidence: f.attributes.cases7_bl_per_100k,
                    cases: f.attributes.Fallzahl,
                    updatedTS: f.attributes.Aktualisierung
                }
            })

            const res = {
                states: allStatesData,
                averageIncidence: allStatesData.reduce((a, b) => a + b.incidence, 0) / allStatesData.length
            }
            this.cache[cacheKey] = res
            return res
        } else {
            return false
        }

    }

    async getStateData(stateBL) {
        const statesData = await this.getStatesData()
        if (statesData) {
            return statesData.states.filter(item => {
                return item.BL === stateBL
            }).pop()
        } else {
            return false
        }
    }

    async getCases() {
        const response = await this.cachedRequest(apiUrlNewCases)
        return (response.status === ENV.response.ok) ? response.data.features[0].attributes.value : -1
    }

    async getRData() {
        const cacheKey = 'r'
        const cached = this.getCached(cacheKey)
        if (cached) {
            return cached
        }

        const response = await this.cachedRequest(apiRUrl, ENV.requestType.string)
        let lastR = 0
        let lastDate = null
        let res = {date: lastDate, r: lastR}
        if (response.status === ENV.response.ok) {
            const data = parseRCSV(response.data)

            if (data.length === 0) return res
            // find used key
            let rValueField
            Object.keys(data[0]).forEach(key => {
                CFG.api.csvRvalueField.forEach(possibleRKey => {
                    if (key === possibleRKey) rValueField = possibleRKey;
                })
            });

            const firstDateField = Object.keys(data[0])[0];
            if (rValueField) {
                data.forEach(item => {
                    const date = item[firstDateField]
                    const value = item[rValueField]
                    if (typeof date !== 'undefined' && date.includes('.') && typeof value !== 'undefined' && parseFloat(value.replace(',', '.')) > 0) {
                        lastR = parseFloat(item[rValueField].replace(',', '.'));
                        lastDate = item['Datum'];
                    }
                })
            }

            res = {date: lastDate, r: lastR}
            this.cache[cacheKey] = res
        }
        return res
    }

    async getGerData() {
        const rData = await this.getRData()
        const cases = await rkiService.getCases()
        const statesData = await rkiService.getStatesData()

        if (!statesData) {
            return false
        }

        const updatedTS = statesData.states[Object.keys(statesData.states)[0]].updatedTS

        return {
            incidence: statesData.averageIncidence,
            dailyCases: cases,
            r: rData,
            updatedTS: updatedTS,
        }
    }

    async request(url, type = ENV.requestType.json) {
        try {
            const resData = new Request(url)
            let data
            switch (type) {
                case ENV.requestType.json:
                    data = await resData.loadJSON()
                    break;
                case ENV.requestType.string:
                    data = await resData.loadString()
                    break;
            }
            return new DataResponse(data)
        } catch (e) {
            console.warn(e)
            return new DataResponse({}, ENV.response.failed)
        }
    }

    async cachedRequest(url, type = ENV.requestType.json) {
        const cacheKey = type + '_' + url
        const cached = this.getCached(cacheKey, 'request')

        let res;
        if (!cached) {
            res = await this.request(url, type);
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

const fm = new CustomFileManager('/coronaWidget', 'coronaWidget')
const rkiService = new RkiService()
await new IncidenceWidget().init()