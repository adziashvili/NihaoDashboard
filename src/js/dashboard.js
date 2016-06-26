/**
 * Created by Itzhak Adziashvili on 12/6/16.
 */

/* GLOBAL VARIABLES */

var fileName = "";
var wb;
var db;

// HANDLERS

function dashboardOnLoadHandler() {
    document.getElementById('files').addEventListener('change', handleFileSelect, false);
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

    for (var i = 0, f; i< files.length; i++) {

        f = files[i];
        var reader = new FileReader();
        fileName   = f.name;

        reader.onload = function (e) {

            // Read the file
            var data = e.target.result;
            wb       = XLSX.read(data, {type: 'binary'});
            db       = to_json(wb);

            // Acknowledge to user processing ok.
            var span = newElement("span",
                "fileOK",
                "glyphicon glyphicon-ok-circle",
                "FILE UPLOADED: " + fileName);
            document.getElementById('source').insertBefore(wrapElement(span, "span"), null);

            $("#process").click();
            $("#loadReport").trigger('click');
        };

        reader.readAsBinaryString(f);
    }
}

// HELPERS and UTILITIES

function createElement(tag, innerHtml) {

    var e = document.createElement(tag);
    if (undefined !== innerHtml) {
        e.innerHTML = innerHtml;
    }

    return e;
}

function newElement(tag, sClass, id, innerHtml) {

    var e = document.createElement(tag);

    if (id !== "" && id !== undefined && id !== null) {
        e.setAttribute("id", id);
    }

    if (sClass !== "" && sClass !== undefined && sClass !== null) {
        e.setAttribute("class", sClass);
    }

    if (innerHtml !== "" && innerHtml !== undefined && innerHtml !== null) {
        e.innerHTML = innerHtml;
    }

    return e;
}

function wrapElement(e, withTag, sClass, id) {

    var wrapper = newElement(withTag, sClass, id);

    if (e !== undefined && e !== null) {
        wrapper.appendChild(e);
    }

    return wrapper;
}

function daysBetween(first, second) {

    var ONE_DAY = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((first.getTime() - second.getTime()) / (ONE_DAY)));
}

function suffix(arr, suffix, space) {

    var result = [];

    arr.forEach(function (item) {
        result.push(item + (space ? " " : "") + suffix);
    });

    return result;
}

function getColors(values) {

    var colors = [];

    var RGB_OK      = "rgba(64,204,255,0.4)";
    var RGB_WARNING = "rgba(138,109,59,0.4)";
    var RGB_DANGER  = "rgba(169,68,66,0.4)";

    for (var i = 0; i < values.length; i++) {
        if (values[i] < 30) {
            colors.push(RGB_DANGER);
        } else if (values[i] < 60) {
            colors.push(RGB_WARNING);
        } else {
            colors.push(RGB_OK);
        }
    }

    return colors;
}

// DRAW CHARTS

function addListBadge(list, id, text, value, optional_style) {

    var li       = document.createElement('li');
    var badge    = document.createElement("span");
    var textSpan = document.createElement("span");

    li.setAttribute("class", "list-group-item" + " " + optional_style);

    if (typeof id !== 'undefined' && id !== "") {
        badge.setAttribute("id", id);
    }

    badge.setAttribute("class", "badge bg-color-nihao");
    badge.innerHTML = value;

    textSpan.setAttribute("class", "text-capitalize");
    textSpan.innerHTML = text;

    li.appendChild(textSpan);
    li.insertBefore(badge, null);

    list.append(li);
}

function drawBarChart(chartCanvas, chartTitle, chartLabels, chartData, barColors) {

    var ctx = document.getElementById(chartCanvas);

    var chartDataStructure = {
        type   : 'bar',
        data   : {
            labels  : chartLabels,
            datasets: [{
                label      : chartTitle,
                data       : chartData,
                borderWidth: 0.5
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };

    if (undefined !== barColors) {
        chartDataStructure.data.datasets[0].backgroundColor = barColors;
    }

    //noinspection JSUnusedLocalSymbols
    var myChart = new Chart(ctx, chartDataStructure);
}

//noinspection JSUnusedGlobalSymbols
function drawPolarChart(placeholder) {

    var ctx = document.getElementById(placeholder);

    var data = {
        datasets: [{
            data           : [
                11,
                16,
                7,
                3,
                14
            ],
            backgroundColor: [
                "#FF6384",
                "#4BC0C0",
                "#FFCE56",
                "#E7E9ED",
                "#36A2EB"
            ],
            label          : 'Feature Usage'
        }],
        labels  : [
            "Red",
            "Green",
            "Yellow",
            "Grey",
            "Blue"
        ]
    };

    //noinspection JSUnusedLocalSymbols
    var chart = new Chart(ctx, {
        data   : data,
        type   : 'polarArea',
        options: {
            legend: {
                display: false
            }
        }
    });

}

function drawLineChart(chartCanvas, chartTitle, chartLabels, chartData) {

    var ctx     = document.getElementById(chartCanvas);
    //noinspection JSUnusedLocalSymbols
    var myChart = new Chart(ctx, {
        type   : 'line',
        data   : {
            labels  : chartLabels,
            datasets: [{
                label               : chartTitle,
                data                : chartData,
                borderWidth         : 0.5,
                pointBackgroundColor: "rgba(64,204,255,0.4)",
                pointBorderWidth    : 1,
                pointRadius         : 5,
                pointHoverRadius    : 10

            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

//noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
function drawDoughnutChart(chartCanvas, chartTitle, chartLabels, chartData) {

    var ctx = document.getElementById(chartCanvas);

    //noinspection JSUnusedLocalSymbols
    var myDoughnutChart = new Chart(ctx, {
        type     : 'doughnut',
        animation: {
            animateScale: true
        },

        options: {
            cutoutPercentage: 75
        },

        data: {
            labels  : chartLabels,
            datasets: [{
                data                : chartData,
                borderWidth         : 0.5,
                pointBackgroundColor: "rgba(64,204,255,0.4)"
            }]
        }
    });
}

function drawBarChartSeries(chartCanvas, labels, series_a_title, series_a_data, series_b_labels, series_b_data) {

    var ctx     = document.getElementById(chartCanvas);
    //noinspection JSUnusedLocalSymbols
    var myChart = new Chart(ctx, {
        type   : 'bar',
        data   : {
            labels  : labels,
            datasets: [
                {
                    label      : series_a_title,
                    data       : series_a_data,
                    borderWidth: 0.5
                },
                {
                    label               : series_b_labels,
                    data                : series_b_data,
                    backgroundColor     : "rgba(64,204,255,0.4)",
                    hoverBackgroundColor: "rgba(64,204,255,0.7)",
                    borderWidth         : 0.5
                }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {

                        beginAtZero: true
                    }
                }]
            }
        }
    });
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
}

function addTitleSummary(ctx) {

    var title    = createElement("span");
    var sessions = account.sessions;

    title.appendChild(createElement("h3", sessions.size().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Sessions"));
    title.appendChild(createElement("span", sessions.from.toDateString() + " - " + sessions.to.toDateString()));
    title.appendChild(createElement("br"));
    title.appendChild(createElement("span", daysBetween(sessions.to, sessions.from) + " days usage data across " + account.locations.size() + " Locations"));

    document.getElementById(ctx).appendChild(title);
}

function addAccountSummarySection(placeholder, glyphicon, sectionTitle, sentiment, sentiment_class, performance_hint) {

    var ctx = newElement("div", "col-lg-4 text-center");

    ctx.appendChild(wrapElement(newElement("span", "glyphicon " + glyphicon + " icon-header"), "div"));
    ctx.appendChild(newElement("div", "text-muted", "", sectionTitle));
    ctx.appendChild(newElement("hr", "line-half"));
    ctx.appendChild(wrapElement(newElement("h4", sentiment_class, "", sentiment), "div"));
    ctx.appendChild(wrapElement(newElement("span", "", "", performance_hint), "div"));

    document.getElementById(placeholder).appendChild(ctx);

}

//noinspection JSUnusedLocalSymbols
function addProductCharts(placeholder1, placeholder2) {

    var data   = [];
    var labels = [];
    var title  = "Features use rate";

    var stats = account.sessions.stats.stats;

    for (var i = 0; i < stats.length; i++) {
        labels.push(stats[i].name);
        data.push(((stats[i].ratio) * 100.0).toFixed(2));
    }

    var colors = getColors(data);

    drawBarChart(placeholder1, title, labels, data, colors);

}
