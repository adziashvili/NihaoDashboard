/**
 * Created by itzhakadziashvili on 25/6/16.
 */

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

function newAnchor (hrefValue, txt, className, id) {

    let link = newElement("a",className, id, txt);
    link.setAttribute("href", hrefValue);

    return link;
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

//noinspection JSUnusedGlobalSymbols
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

function getSeriesColors(count) {

    var colors = ["rgba(154,154,161,0.4)", "rgba(30,30,218,0.4)", "rgba(64,204,255,0.4)", "rgba(216,218,30,0.4)"];

    return colors.slice(0,count);
}

// DRAW CHARTS

function addListBadge(list, id, text, value, optional_style) {

    var ctxId = genRandomId();

    var li       = document.createElement('li');
    var badge    = document.createElement("span");
    var textSpan = document.createElement("span");

    li.setAttribute("class", "list-group-item" + " " + optional_style);
    li.setAttribute("id", ctxId);

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

    // Adding this object to the grid manager for later cleanup
    gridManager.add(new GridElement(ctxId));
}

function drawBarChart(gridChartElement, chartTitle, chartLabels, chartData, barColors) {

    var gde = (gridChartElement instanceof GridChart) ?
        gridChartElement :
        new GridChart(gridChartElement);

    var ctx = document.getElementById(gde.id);

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

    gde.chart = new Chart(ctx, chartDataStructure);
    gridManager.add(gde);
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

function drawLineChart(gridChartElement, chartTitle, chartLabels, chartData) {

    var gde = (gridChartElement instanceof GridChart) ?
        gridChartElement :
        new GridChart(gridChartElement);

    var ctx   = document.getElementById(gde.id);
    //noinspection JSUnusedLocalSymbols
    gde.chart = new Chart(ctx, {
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

    gridManager.add(gde);
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

function drawBarChartSeries(gridChartElement, labels, series_a_title, series_a_data, series_b_labels, series_b_data) {

    var gde = (gridChartElement instanceof GridChart) ?
        gridChartElement :
        new GridChart(gridChartElement);

    var ctx = document.getElementById(gridChartElement);

    gde.chart = new Chart(ctx, {
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

    gridManager.add(gde);
}

function drawBarChartSeriesSets(gridChartElement, labels, datasets) {

    var gde = (gridChartElement instanceof GridChart) ?
        gridChartElement :
        new GridChart(gridChartElement);

    var ctx = document.getElementById(gridChartElement);
    var colors = getSeriesColors(datasets.length);

    for (let i = 0 ; i < datasets.length ; i++) {
        datasets[i].borderWidth = 0.5;
        datasets[i].backgroundColor = colors[i];
        datasets[i].hoverBackgroundColor = colors[i].replace("0.4","0.7");
    }

    gde.chart = new Chart(ctx, {
        type   : 'bar',
        data   : {
            labels  : labels,
            datasets: datasets
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

    gridManager.add(gde);
}

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

function genRandomId() {
    return Math.random().toString(36).substring(7);
}

/**
 * Utility class to help manage collections easily.
 *
 * Requires comparable() and key() functions to be defined on the objects added to the collection.
 * @constructor
 */
function Collection() {
    this.list = [];
}

Collection.prototype.size = function () {
    return this.list.length;
};

Collection.prototype.all = function () {
    return this.list
};

Collection.prototype.at = function (index) {
    return this.list[index];
};

Collection.prototype.find = function (obj) {

    // Allows to search by OBJECT REF or by KEY Value
    var key = (typeof obj.key === 'function') ? obj.key() : obj;

    var index = -1;

    for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].key() === key) {
            index = i;
            break;
        }
    }

    return index;
};

Collection.prototype.add = function (obj) {

    assert(undefined !== obj || null !== null, "Expecting value or object");
    assert(typeof obj.key === "function", "Expecting key function for objects managed by Collection");
    assert(typeof obj.comparable === "function", "Expecting compare function for objects managed by Collection");

    if (-1 === this.find(obj.key())) this.list.push(obj);
};

Collection.prototype.removeAt = function (index) {
    if (index >= 0 && index < this.list.length) {
        this.list.splice(index, 1);
    }
};

Collection.prototype.remove = function (obj) {

    var index = this.find(obj);

    if (index !== -1) {
        this.removeAt(index);
    }

};

Collection.prototype.keys = function () {

    var keys = [];

    for (var i = 0; i < this.list.length; i++) {
        keys.push(this.list[i].key());
    }

    return keys;
};

//noinspection JSUnusedGlobalSymbols
Collection.prototype.calcStat = function (stats_func, filter_func) {

    var filteredList = this.list;

    if (undefined !== filter_func) {
        filteredList = this.list.filter(filter_func);
    }

    var stat = {
        "value"  : 0,
        "average": 0,
        "entries": filteredList.length
    };

    for (var i = 0; i < filteredList.length; i++) {
        stat.value += stats_func(filteredList[i]);
    }

    if (0 !== stat.value) {
        stat.average = stat.value / filteredList.length;
    }

    return stat;
};
Collection.prototype.sort     = function (b_ascending) {
    this.list.sort(function (a, b) {

        var asc_dec = -1;

        if (b_ascending !== undefined) {
            asc_dec = 1;
        }

        return (a.comparable() < b.comparable()) ? -1 * asc_dec :
            (a.comparable() > b.comparable()) ? asc_dec : 0;
    });
};
