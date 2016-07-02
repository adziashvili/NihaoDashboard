/**
 * Created by Itzhak Adziashvili on 12/6/16.
 */

/**
 *  GLOBAL VARIABLES
 */
var accountInputData = {files: [], data: null};
var account;

GridElement.prototype             = {};
GridElement.prototype.constructor = GridElement;
GridElement.prototype.key         = function () {
    return this.id;
};
GridElement.prototype.comparable  = function () {
    return this.timeCreated.getMilliseconds();
};
GridElement.prototype.delete      = function () {

    var element = document.getElementById(this.id);
    element.parentNode.removeChild(element);
};

function GridElement(id) {

    Object.call(this);
    this.timeCreated = new Date();
    this.id          = id;
}

GridPlaceHolder.prototype             = new GridElement();
GridPlaceHolder.prototype.constructor = GridPlaceHolder;
GridPlaceHolder.prototype.delete      = function () {

    var element = document.getElementById(this.id);

    while (element.childNodes.length > 0) {
        element.removeChild(element.childNodes[0]);
    }

};

function GridPlaceHolder(id) {

    GridElement.call(this, id);
}

GridChart.prototype             = new GridElement();
GridChart.prototype.constructor = GridChart;
GridChart.prototype.delete      = function () {

    if (this.chart !== undefined && this.chart !== null) {
        this.chart.clear();
        this.chart.destroy();
        this.chart = null;
    }

    var element = document.getElementById(this.id);

    if (null !== element) {
        element.removeAttribute("height");
        element.removeAttribute("width");
        element.removeAttribute("style");
    }
};

function GridChart(id, chartObj) {

    GridElement.call(this, id);

    this.chart = chartObj;

}

GridManager.prototype             = new Collection();
GridManager.prototype.constructor = GridManager;
GridManager.prototype.reset       = function () {

    while (this.size() > 0) {
        var eg = this.at(0);
        this.remove(eg);
        eg.delete();
    }
};

function GridManager() {
    Collection.call(this);
}

var gridManager = new GridManager();

// HANDLERS

function dashboardOnLoadHandler() {
    addNavbar();
    document.getElementById('files').addEventListener('change', handleFileSelect, false);
}

function onResetAll() {

    gridManager.reset();

    accountInputData.files = [];
    accountInputData.data  = null;
    account                = null;
}

// DATA PROCESSING

function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function (sheetName) {
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if (roa.length > 0) {
            result[sheetName] = roa;
        }
    });
    return result;
}

function handleFileSelect(evt) {

    var files = evt.target.files;

    for (var i = 0, f; i < files.length; i++) {

        f          = files[i];
        var reader = new FileReader();
        accountInputData.files.push(f.name);

        reader.onload = function (e) {
            // Read the file
            var data = e.target.result;
            var wb   = XLSX.read(data, {type: 'binary'});

            accountInputData.data = to_json(wb);

            $("#process").click();
            $("#loadReport").trigger('click');
        };

        reader.readAsBinaryString(f);
    }
}

// HTML DOCUMENT MANIPULATORS

function buildLocationGrid(location) {

    var div = document.createElement("div");

    div.setAttribute("class", "container padd-bottom");
    div.setAttribute("id", location.id);

    var row = document.createElement("div");

    row.setAttribute("class", "row");
    row.setAttribute("id", location.id + "_ROW_HEAD");

    var col = document.createElement("div");

    col.setAttribute("class", "col-lg-12");
    col.setAttribute("id", location.id + "_COL_TITLE");

    var well = document.createElement("div");

    well.setAttribute("class", "well");
    well.setAttribute("id", location.id + "_COL_TITLE_WELL");

    well.innerHTML = location.name;

    var closeBtn = document.createElement("span");

    closeBtn.setAttribute("class", "close glyphicon glyphicon-minus-sign");
    closeBtn.setAttribute("aria-label", "close");
    closeBtn.setAttribute("data-target", div.getAttribute("id"));
    closeBtn.setAttribute("id", location.id + "_hide");

    closeBtn.onclick = function (e) {
        var close = document.getElementById(e.target.id);
        var domE  = document.getElementById(close.getAttribute("data-target"));
        domE.parentNode.removeChild(domE);
    };

    well.appendChild(closeBtn);

    var rowData = document.createElement("div");

    rowData.setAttribute("class", "row");
    rowData.setAttribute("id", location.id + "_ROW_DATA_1");

    for (var i = 0; i < 3; i++) {

        var colData = document.createElement("div");

        colData.setAttribute("class", "col-lg-4");
        colData.setAttribute("id", location.id + "_ROW_DATA_1_CELL_" + i);

        var canvas = document.createElement("canvas");

        canvas.setAttribute("class", "col-lg-4");
        canvas.setAttribute("id", location.id + "_CANVAS_" + i);

        colData.appendChild(canvas);
        rowData.appendChild(colData);
    }

    col.appendChild(well);
    row.appendChild(col);
    div.appendChild(row);
    div.appendChild(rowData);

    var top = document.getElementById("top_summary");

    top.parentNode.insertBefore(div, document.getElementById("myModal"));

    gridManager.add(new GridElement(location.id));
}

function addTitleSummary(ctx) {

    var title    = createElement("span");
    var sessions = account.sessions;

    title.appendChild(createElement("h3", sessions.size().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Sessions"));
    title.appendChild(createElement("span", sessions.from.toDateString() + " - " + sessions.to.toDateString()));
    title.appendChild(createElement("br"));
    title.appendChild(createElement("span", daysBetween(sessions.to, sessions.from) + " days usage data across " + account.locations.size() + " Locations"));

    document.getElementById(ctx).appendChild(title);
    gridManager.add(new GridPlaceHolder(ctx));
}

function addAccountSummarySection(placeholder,
                                  glyphicon,
                                  sectionTitle,
                                  sentiment,
                                  sentiment_class,
                                  performance_hint) {

    var ctx = newElement("div", "col-lg-4 text-center");

    ctx.appendChild(wrapElement(newElement("span", "glyphicon " + glyphicon + " icon-header"), "div"));
    ctx.appendChild(newElement("div", "text-muted", "", sectionTitle));
    ctx.appendChild(newElement("hr", "line-half"));
    ctx.appendChild(wrapElement(newElement("h4", sentiment_class, "", sentiment), "div"));
    ctx.appendChild(wrapElement(newElement("span", "", "", performance_hint), "div"));

    document.getElementById(placeholder).appendChild(ctx);
    gridManager.add(new GridPlaceHolder(placeholder));
}

function addAccountSummary(placeholder) {

    addAccountSummarySection(
        placeholder,
        "glyphicon-signal glyphicon-border-nihao",
        "Usage",
        account.sentiments[0][0],   // Sentiment
        account.sentiments[0][1],   // Class
        account.sentiments[0][2]);  // Hint

    addAccountSummarySection(
        placeholder,
        "glyphicon-user glyphicon-border-nihao",
        "Leads",
        account.customers.sentiments[0][0],   // Sentiment
        account.customers.sentiments[0][1],   // Class
        account.customers.sentiments[0][2]);  // Hint

    addAccountSummarySection(
        placeholder,
        "glyphicon-sunglasses glyphicon-border-nihao",
        "Products",
        account.sentiments[1][0],   // Sentiment
        account.sentiments[1][1],   // Class
        account.sentiments[1][2]);  // Hint
}

function addProductCharts(placeholder) {

    let datasets = account.sessions.analytics.getRatios([ngc.PERIOD_ALL, ngc.PERIODS[2], ngc.PERIODS[0]]);

    let display_datasets = [
        {label: "Avg.", data: datasets[0]},
        {label: "Last " + ngc.PERIODS[2] + " days", data: datasets[1]},
        {label: "Last " + ngc.PERIODS[0] + " days", data: datasets[2]}
    ];

    drawBarChartSeriesSets(placeholder, ngc.FEATURES, display_datasets);
}

function addNavbar() {
    let htmlPageName = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);

    let nav = newElement("nav", "navbar navbar-default");
    let ctx = newElement("div", "container-fluid");
    nav.appendChild(ctx);

    // Building The Header
    let navBrand = newElement("a", "navbar-brand", "", "DASHBOARD");
    navBrand.setAttribute("href", "dashboard.html");
    let navHeader = wrapElement(navBrand, "div", "navbar-header");
    ctx.appendChild(navHeader);

    let navbarList = newElement("ul", "nav navbar-nav");

    let slsViewed = (htmlPageName.toLowerCase() === "sales.html") ? "active" : "";
    let dshViewed = (htmlPageName.toLowerCase() === "dashboard.html") ? "active" : "";

    navbarList.appendChild(wrapElement(newAnchor("dashboard.html", "HOME"), "li", dshViewed, "dashboard_li_id"));
    navbarList.appendChild(wrapElement(newAnchor("sales.html", "SALES"), "li", slsViewed, "sales_li_id"));

    ctx.appendChild(navbarList);

    document.body.insertBefore(nav, document.body.firstChild);
}
