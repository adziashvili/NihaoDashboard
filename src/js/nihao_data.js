/**
 * Created by itzhakadziashvili on 17/6/16.
 */


var Constants = function () {
    /**
     * Periods to evaluate performance for
     * @type {number[]}
     */
    this.PERIODS = [7, 15, 30, 60, 90];

    /**
     * The set of features we calculate for various session sets.
     * @type {string[]}
     */
    this.FEATURES = ["Brand Pages", "Collections", "Products", "Multi Products", "Translations", "Featured",
        "Galleries", "Shopping Cart", "Associate", "Buy No Buy", "Audio", "Close - Timeout",
        "Close - New", "Close - Settings", "Emails", "Multiple Emails", "Android", "iOS"];

    /**
     * Marks session stat as global that goes beyond a period.
     * @type {number}
     */
    this.PERIOD_ALL = 0;

    /**
     * * Marks as specific session stat as global
     * @type {number}
     */
    this.EVAL_REF_PERIOD = 3;
};

/**
 * Global variable to gold constants
 * @type {Constants}
 */
var ngc = new Constants();

var PeriodMetrics = function () {
    this.TOTAL_T1        = 1;
    this.AVG_T1          = 2;
    this.TOTAL_T0        = 3;
    //noinspection JSUnusedGlobalSymbols
    this.AVG_T0          = 4;
    this.T1_TO_T0_CHANGE = 5;

    this.GROUP_SESSION = "SESSIONS";
    this.GROUP_PRODUCT = "PRODUCTS";
};

var PERIOD_METRICS = new PeriodMetrics();

var PerformanceMetrics = function () {
    this.AVG_SESSION_PER_STORE  = 1;
    this.AVG_CUSTOMER_PER_STORE = 2;
    this.GROWTH                 = 3;
};

var PERFORMANCE_METRICS = new PerformanceMetrics();

/**
 * METRICS
 */

/**
 *
 * @param arrayOfObjects
 * @param periods
 * @param bCompareToPrevious
 * @returns {Array}
 */
function evaluatePeriods(arrayOfObjects, periods, bCompareToPrevious) {

    bCompareToPrevious = typeof bCompareToPrevious !== 'undefined' ? bCompareToPrevious : false;

    var stats = [];

    periods.forEach(function (period) {

        //var s = processPeriod(arrayOfObjects, period, bCompareToPrevious);
        var s           = evaluatePeriod(arrayOfObjects, period, metricEvalSessionCount, bCompareToPrevious);
        s[s.length - 1] = PERIOD_METRICS.GROUP_SESSION;
        stats.push(s);

        s               = evaluatePeriod(arrayOfObjects, period, metricEvalProductCount, bCompareToPrevious);
        s[s.length - 1] = PERIOD_METRICS.GROUP_PRODUCT;
        stats.push(s);
    });

    return stats;
}

function metricEvalProductCount(sessions) {

    if (undefined === sessions || sessions === null) {
        return 0;
    }

    var productCount = 0;

    for (var i = 0; i < sessions.length; i++) {
        productCount += sessions[i].products;
    }

    return productCount;
}

function metricEvalSessionCount(sessions) {
    return sessions.length;
}

function metricEvalPeriod(arrayOfObjects, metricEval, period) {

    var metric    = metricEval(arrayOfObjects);
    var metricAvg = metric / period;

    return {"metric": metric, "avg": metricAvg};
}

function evaluatePeriod(arrayOfObjects, period, metricEval, bCompareToPrevious) {

    bCompareToPrevious = typeof bCompareToPrevious !== 'undefined' ? bCompareToPrevious : false;

    var today = new Date();
    var periodStatsT1;

    periodStatsT1 = arrayOfObjects.filter(function (obj) {
        return daysBetween(today, obj.date) <= period;
    });

    var metricT1    = metricEvalPeriod(periodStatsT1, metricEval, period);
    var metricT0    = {"metric": 0, "avg": 0};
    var changeRatio = 0;

    if (bCompareToPrevious) {

        var periodStatsT0 = arrayOfObjects.filter(function (obj) {
            return daysBetween(today, obj.date) > period &&
                daysBetween(today, obj.date) <= 2 * period;
        });

        if (periodStatsT0.length > 0) {
            metricT0 = metricEvalPeriod(periodStatsT0, metricEval, period);
        }

        changeRatio = (metricT0.metric === 0) ? 100 : (100 * ((metricT1.avg / metricT0.avg) - 1));
    }

    return [
        period,
        metricT1.metric,
        metricT1.avg.toFixed(2),
        metricT0.metric,
        metricT0.avg.toFixed(2),
        changeRatio.toFixed(2),
        "SOME_NAME"
    ];
}

var Evaluator = function () {

    this.scores = [

        {
            "metric": PERFORMANCE_METRICS.AVG_SESSION_PER_STORE,
            "scale" : [
                {"score": 1, "normalised": -3, "assessment": "Very Low Volume", "class": ""},
                {"score": 5, "normalised": -2, "assessment": "Low Volume", "class": ""},
                {"score": 10, "normalised": -1, "assessment": "Some Volume", "class": ""},
                {"score": 15, "normalised": 0, "assessment": "Good Volume", "class": ""},
                {"score": 20, "normalised": 1, "assessment": "Very Good Volume", "class": ""},
                {"score": 25, "normalised": 2, "assessment": "Excellent Volume", "class": ""},
                {"score": 30, "normalised": 3, "assessment": "Outstanding Volume", "class": ""}
            ]
        },

        {
            "metric": PERFORMANCE_METRICS.AVG_CUSTOMER_PER_STORE,
            "scale" : [
                {"score": 1, "normalised": -3, "assessment": "Very Low", "class": ""},
                {"score": 5, "normalised": -2, "assessment": "Low", "class": ""},
                {"score": 10, "normalised": -1, "assessment": "Some", "class": ""},
                {"score": 15, "normalised": 0, "assessment": "Good", "class": ""},
                {"score": 20, "normalised": 1, "assessment": "Very Good", "class": ""},
                {"score": 25, "normalised": 2, "assessment": "Excellent", "class": ""},
                {"score": 30, "normalised": 3, "assessment": "Amazing", "class": ""}
            ]
        },

        {
            "metric": PERFORMANCE_METRICS.GROWTH,
            "scale" : [
                {"score": -50, "normalised": -3, "assessment": "Free Falling", "class": ""},
                {"score": -30, "normalised": -2, "assessment": "Declining Fast", "class": ""},
                {"score": -15, "normalised": -1, "assessment": "Declining", "class": ""},
                {"score": 0, "normalised": -0, "assessment": "Stale", "class": ""},
                {"score": 15, "normalised": 1, "assessment": "Growing", "class": ""},
                {"score": 30, "normalised": 2, "assessment": "Growing Fast", "class": ""},
                {"score": 50, "normalised": 3, "assessment": "Rocketing Up", "class": ""}
            ]
        }
    ];

    this.getScale = function (metric, value) {

        // Find score
        var scale = null;

        for (var i = 0; i < this.scores.length; i++) {
            if (metric === this.scores[i].metric) {
                scale = this.scores[i].scale;
                break;
            }
        }

        if (scale === null) {
            console.log("Unable to find metric " + metric);
            return "";
        }

        var scaleIndex;

        for (scaleIndex = 0; scaleIndex < scale.length; scaleIndex++) {
            if (value <= scale[scaleIndex].score) {
                break;
            }
        }

        if (scaleIndex === scale.length) {
            scaleIndex--;
        }

        return scale[scaleIndex];

    };

    /**
     * Evaluates the session performance metric.
     * @param evalObj
     * @param evaluationPeriods
     * @param locCount
     * @returns {{hint: string, sentiment: *, sentimentClass: string}}
     */
    this.evaluateSessionPerformance = function (evalObj, evaluationPeriods, locCount) {

        var averages = evalObj.getStats(
            evaluationPeriods,
            PERIOD_METRICS.AVG_T1,
            PERIOD_METRICS.GROUP_SESSION);

        averages [0] = (1.0 * averages [0]) / locCount;      // Normalise to Metrics
        averages [1] = (1.0 * averages [1]) / locCount;      // Normalise to Metrics

        var diff = averages [0] / averages [1];
        var hint = "";

        if (diff > 1) {

            diff = diff - 1;
            hint = "+";

        } else if (diff < 1) {

            diff = diff - 1;

        } else {

            diff = 0;
        }

        diff = diff * 100.0;

        var volumeScale = this.getScale(PERFORMANCE_METRICS.AVG_SESSION_PER_STORE, averages[0]);
        var growthScale = this.getScale(PERFORMANCE_METRICS.GROWTH, diff);

        //var sentiment = volumeScale.assessment + " and " + growthScale.assessment;
        var sentiment      = growthScale.assessment;
        var sentimentClass = "";

        hint = hint + diff.toFixed(1) + "% in last " + evalObj.periodLabels[ngc.EVAL_REF_PERIOD] + " days";

        if (growthScale.normalised <= -2
            || (growthScale.normalised <= -1 && volumeScale.normalised <= 0)
            || (growthScale.normalised === 0 && volumeScale.normalised <= -2)
            || (growthScale.normalised === 1 && volumeScale.normalised === -3)) {

            sentimentClass = "text-danger";     // RED

        } else if (
            (growthScale.normalised === -1 && volumeScale.normalised >= 1)
            || (growthScale.normalised === 0 && volumeScale.normalised >= -1 && volumeScale.normalised <= 1)
            || (growthScale.normalised === 1 && volumeScale.normalised >= -2 && volumeScale.normalised <= -1)
            || (growthScale.normalised === 2 && volumeScale.normalised <= -2)) {

            sentimentClass = "text-stable";     // YELLOW

        } else {

            sentimentClass = "text-growing";    // GREEN

        }
        return {hint: hint, sentiment: sentiment, sentimentClass: sentimentClass};
    };

    /**
     * Evaluate the performance of product presentations for the respective holding object, evalObj
     * @param evalObj
     * @param evaluationPeriods
     * @param locCount
     * @returns {{hint: string, sentiment: string, sentimentClass: *}}
     */
    this.evaluateProductPerformance = function (evalObj, evaluationPeriods, locCount) {

        var averages = evalObj.getStats(
            evaluationPeriods,
            PERIOD_METRICS.AVG_T1,
            PERIOD_METRICS.GROUP_PRODUCT);

        averages [0] = (1.0 * averages [0]) / locCount;      // Normalise to Metrics
        averages [1] = (1.0 * averages [1]) / locCount;      // Normalise to Metrics

        var diff = averages [0] / averages [1];
        var hint = "";

        if (diff > 1) {

            diff = diff - 1;
            hint = "+";

        } else if (diff < 1) {

            diff = diff - 1;

        } else {

            diff = 0;
        }

        diff = diff * 100.0;

        var growthScale = this.getScale(PERFORMANCE_METRICS.GROWTH, diff);

        var sentimentClass = "";

        hint = hint + diff.toFixed(1) + "% in last " + evalObj.periodLabels[ngc.EVAL_REF_PERIOD] + " days";

        if (growthScale.normalised < 0) {

            sentimentClass = "text-danger";     // RED

        } else if (growthScale.normalised === 0) {

            sentimentClass = "text-stable";     // YELLOW

        } else {

            sentimentClass = "text-growing";    // GREEN

        }

        return {hint: hint, sentiment: growthScale.assessment, sentimentClass: sentimentClass};
    };

    /**
     * Evaluates the <code>evalObj</code> for its performance for sessions and products.
     * @param evalObj Assume to have a method getStats and has a public member sentiments
     * @param locCount Count of location in analysed account.
     */
    this.evaluate = function (evalObj, locCount) {

        // Safety
        if (evalObj.periodLabels.length < ngc.EVAL_REF_PERIOD) {
            return;
        }

        // Compare performance of period 0 to the reference period
        var evaluationPeriods = [evalObj.periodLabels[0], evalObj.periodLabels[ngc.EVAL_REF_PERIOD]];

        // 1. Evaluate session based performance
        var evaluation = this.evaluateSessionPerformance(evalObj, evaluationPeriods, locCount);
        evalObj.sentiments.push([evaluation.sentiment, evaluation.sentimentClass, evaluation.hint]);

        // 2. Evaluate session based performance
        evaluation = this.evaluateProductPerformance(evalObj, evaluationPeriods, locCount);
        evalObj.sentiments.push([evaluation.sentiment, evaluation.sentimentClass, evaluation.hint]);
    };
};

var evaluator = new Evaluator();

function readValue(obj, arrPropName, objPropName) {

    if (obj[arrPropName] !== undefined) {
        return obj[arrPropName];
    } else if (obj[objPropName] !== undefined) {
        return obj[objPropName];
    } else {
        return "";
    }
}

function readDate(obj, arrPropName, objPropName) {

    if (obj[arrPropName] !== undefined) {
        return new Date(obj[arrPropName]);
    } else {
        return obj[objPropName];
    }
}

/* ---------------------------------------------------------------------------------------------
 Data Objects
 /* --------------------------------------------------------------------------------------------- */

/**
 * An object to hold specific calculations for a given set of sessions
 * @type {{}}
 */
Stats.prototype = {};
Stats.constructor = Stats;
function Stats(name) {
    this.name        = name;
    this.total       = 0;
    this.totalPrev   = 0;
    this.ratio       = 0;
    this.ratioPrev   = 0;
    this.ratioChange = 0;
}

/**
 * SessionStats holds the stats for a given set of sessions.
 * @type {{}}
 */
SessionStats.prototype = {};
SessionStats.prototype.constructor     = SessionStats;
SessionStats.prototype.indexOf         = function (feature) {

    var index = -1;

    for (var i = 0; i < this.stats.length; i++) {
        if (feature === this.stats[i].name) {
            index = i;
            break;
        }
    }

    return index;
};
SessionStats.prototype.find            = function (feature) {
    let index = this.indexOf(feature);
    let res   = null;

    if (index !== -1) {
        res = this.stats[index];
    }

    return res;
};
SessionStats.prototype.inc             = function (feature) {

    var index = this.indexOf(feature);

    if (-1 !== index) {
        this.stats[index].total++;
    }
};
SessionStats.prototype.incIf           = function (feature, bIfCondition) {
    if (bIfCondition) {
        this.inc(feature);
    }
};
//noinspection JSUnusedGlobalSymbols
SessionStats.prototype.getFeatureRatio = function (feature) {

    var ratio = 0;
    var index = this.indexOf(feature);

    if (-1 !== index) {
        ratio = this.stats[index].ratio;
    }

    return ratio;
};
SessionStats.prototype.getRatios       = function () {

    let ratios = [];

    for (let i = 0; i < ngc.FEATURES.length; i++) {
        ratios.push(this.getFeatureRatio(ngc.FEATURES[i]));
    }
};
SessionStats.prototype.setPrevious     = function (prevStats) {

    for (let i = 0; i < ngc.FEATURES.length; i++) {
        let feature     = this.find(ngc.FEATURES[i]);
        let featurePrev = prevStats.find(ngc.FEATURES[i]);

        if (feature !== null && featurePrev !== null) {
            feature.totalPrev   = featurePrev.total;
            feature.ratioPrev   = featurePrev.ratio;
            feature.ratioChange = feature.ratio / feature.ratioPrev;
        }
    }
};
SessionStats.prototype.init            = function (sessions) {

    for (var i = 0; i < sessions.length; i++) {

        var session = sessions[i];

        this.incIf("Brand Pages", session.pages > 0);
        this.incIf("Collections", session.collections > 0);
        this.incIf("Products", session.products > 0);
        this.incIf("Multi Products", session.products > 1);
        this.incIf("Translations", session.languages > 1);
        this.incIf("Featured", session.featured > 1);
        this.incIf("Galleries", session.gallery > 0);
        this.incIf("Shopping Cart", session.shoppingCart > 0);
        this.incIf("Associate", session.associate !== "" && session.associate !== "Other");
        this.incIf("Buy No Buy", session.buy !== "");
        this.incIf("Audio", session.audio);
        this.incIf("Close - Settings", session.closureEvent === "Settings");
        this.incIf("Close - Timeout", session.closureEvent === "Timeout - No Response");
        this.incIf("Close - New", session.closureEvent === "New Session"
            || session.closureEvent === "Timeout - Start New Response");
        this.incIf("Emails", session.emailsSent > 0);
        this.incIf("Multiple Emails", session.emailsSent > 1);
        this.incIf("Android", session.os === "Android");
        this.incIf("iOS", session.os === "iOS");
    }

    for (let j = 0; j < this.stats.length; j++) {
        this.stats[j].ratio = this.stats[j].total / sessions.length;
    }
};

/**
 *
 * @param sessions
 * @param period
 * @constructor
 */
function SessionStats(sessions, period) {

    this.period = (period !== undefined) ? period : ngc.PERIOD_ALL;
    this.stats  = [];

    for (let i = 0; i < ngc.FEATURES.length; i++) {
        this.stats.push(new Stats(ngc.FEATURES[i]));
    }

    this.init(sessions)
}

/**
 * Session Analytics Manager
 * @type {{}}
 */
SessionsAnalyticsManager.prototype = {};
SessionsAnalyticsManager.constructor             = SessionsAnalyticsManager;
//noinspection JSUnusedGlobalSymbols
SessionsAnalyticsManager.prototype.getStats      = function (optional_period) {

    optional_period = (optional_period !== undefined) ? optional_period : ngc.PERIOD_ALL;
    let res_stats   = this.sessionStats.filter(function (obj) {
        return obj.period === optional_period;
    });

    return res_stats[0];
};
SessionsAnalyticsManager.prototype.analyzePeriod = function (period) {

    let today = new Date();

    let tmpSessions = this.sessions.filter(function (session) {
        return daysBetween(today, session.date) <= period;
    });

    let tmpStats = new SessionStats(tmpSessions, period);

    if (this.bCompareToPrevious) {

        tmpSessions = this.sessions.filter(function (session) {
            return daysBetween(today, session.date) > period &&
                daysBetween(today, session.date) <= 2 * period;
        });

        tmpStats.setPrevious(new SessionStats(tmpSessions, period));
    }

    this.sessionStats.push(tmpStats);
};
SessionsAnalyticsManager.prototype.analyze       = function () {

    this.sessionStats.push(new SessionStats(this.sessions));

    for (let i = 0; i < this.periods.length; i++) {
        this.analyzePeriod(this.periods[i]);
    }
};
SessionsAnalyticsManager.prototype.getRatios     = function (periods) {

    let data = [];

    for (let i = 0; i < periods.length; i++) {

        let currentPeriodStat = this.getStats(periods[i]);
        let period_data           = [];

        for (let j = 0; j < ngc.FEATURES.length; j++) {
            period_data.push(currentPeriodStat.getFeatureRatio(ngc.FEATURES[j]).toFixed(2));
        }

        data.push(period_data);
    }

    return data;
};

/**
 * Calculates the metrics for a given set of sessions.
 * @param sessions a Set of sessions to analyze
 * @param periods An array of periods to process
 * @param bCompareToPrevious Indicator to process a comparison period
 * @constructor
 */
function SessionsAnalyticsManager(sessions, periods, bCompareToPrevious) {

    this.sessions           = sessions;
    this.periods            = periods;
    this.sessionStats       = [];
    this.sentiments         = [];
    this.bCompareToPrevious = bCompareToPrevious;

    this.analyze();
}

var Session = function (session) {

    this.id          = readValue(session, "Session ID", "id");
    this.location    = readValue(session, "Location", "location");
    this.date        = readDate(session, "Date / Time", "date");
    this.duration    = readValue(session, "Session Duration (min)", "duration") * 1.0;
    //noinspection JSUnusedGlobalSymbols
    this.netDuration = readValue(session, "Net Presentation Time (min)", "netDuration") * 1.0;
    this.associate   = readValue(session, "Sales Associate", "associate");

    this.customer = new Customer(session);

    if (session.topProducts !== "" && session.topProducts !== undefined) {
        this.topProducts = session.topProducts;
    } else {
        this.topProducts = new Array(3);
        this.topProducts.push(session["Top product 1"]);
        this.topProducts.push(session["Top product 2"]);
        this.topProducts.push(session["Top product 3"]);
    }

    if (session.emails !== "" && session.emails !== undefined) {
        this.emails = session.emails;
    } else {
        this.emails = (session["Emails"] === "" || session["Emails"] === undefined) ?
            [] : session["Emails"].slice(",");
    }

    this.pages        = 1.0 * readValue(session, "Number of unique storyline pages presented", "pages");
    this.collections  = 1.0 * readValue(session, "Number of unique collection presented", "collections");
    this.products     = 1.0 * readValue(session, "Number of unique products presented", "products");
    this.languages    = 1.0 * readValue(session, "Number of languages used", "languages");
    this.featured     = 1.0 * readValue(session, "Number of feature page opening", "featured");
    this.gallery      = 1.0 * readValue(session, "Number of gallery page opening", "gallery");
    this.shoppingCart = 1.0 * readValue(session, "Products in shopping cart", "shoppingCart");
    this.buy          = readValue(session, "Buy?", "buy");
    this.audio        = (session.audio !== undefined) ? session.audio : session["Audio used"] === "YES";
    this.closureEvent = readValue(session, "Ended Due To", "closureEvent");

    this.emailsSent = this.emails.length;

    //noinspection JSUnusedGlobalSymbols
    this.deviceId = readValue(session, "Device ID", "deviceId");
    this.os       = readValue(session, "Device OS", "os");

    //noinspection JSUnusedGlobalSymbols
    this.model = readValue(session, "Device Model", "model");

    this.equals = function (another) {
        return this.key() === another.key();
    };

    this.key = function () {
        return this.id;
    };

    this.comparable = function () {
        return this.date;
    };

    this.toString = function () {
        return "Session Id:" + this.key() + (!this.customer.isEmpty() ? "Customer: " + this.customer.toString() : " No customer details");
    };
};

var Customer = function (session) {

    var sourceObject = (session.customer !== undefined) ? session.customer : session;

    this.date     = readDate(sourceObject, "Date / Time", "date");
    this.location = readValue(sourceObject, "Location", "location");

    this.name    = readValue(sourceObject, "Customer Name", "name");
    this.email   = readValue(sourceObject, "Customer Email", "email");
    this.contact = readValue(sourceObject, "Customer Contact", "contact");

    this.id = this.name + this.email + this.contact;

    //noinspection JSUnusedGlobalSymbols
    this.contactable = false; // session["Customer Wiling To Be Contacted"];

    //noinspection JSUnusedGlobalSymbols
    this.gender = readValue(sourceObject, "Customer Gender", "gender");

    //noinspection JSUnusedGlobalSymbols
    this.city = readValue(sourceObject, "Customer Location", "city");

    if (sourceObject.dob !== undefined) {
        this.dob = sourceObject.dob;
    } else if (sourceObject["Customer DOB"] !== "") {
        //noinspection JSUnusedGlobalSymbols
        this.dob = new Date(sourceObject["Customer DOB"]);
    }

    this.language = readValue(sourceObject, "Customer Primary Language", "language");

    //noinspection JSUnusedGlobalSymbols
    this.rating = 1 * readValue(sourceObject, "Customer Rating", "rating");

    this.isEmpty = function () {
        return this.name === "" && this.email === "" && this.contact === "";
    };

    this.equals = function (another) {
        return this.key() === another.key();
    };

    this.key = function () {
        return this.name + this.email + this.contact;
    };

    this.comparable = function () {
        return this.date;
    };

    this.toString = function () {
        return "Customer Name:" + this.name + ", Email: " + this.email;
    };
};

//noinspection JSUnusedGlobalSymbols
var Email = function () {
};

/* ---------------------------------------------------------------------------------------------
 Collections
 /* --------------------------------------------------------------------------------------------- */
var Emails = function (data) {

    this.list = [];

    this.length = function () {
        return this.list.length
    };

    this.all = function () {
        return this.list
    };

    this.init = function init(data) {
        if (undefined !== data) {
            this.list = data;
        }
    };

    this.init(data);
};

/**
 * Session collection with built in utility functions
 * @type {Collection}
 */
SessionCollection.prototype = new Collection();
SessionCollection.prototype.constructor = SessionCollection;
SessionCollection.prototype.getStats    = function (periods, metric, metric_group) {

    var sessions = [];

    for (var i = 0; i < periods.length; i++) {

        var val = 0;

        for (var j = 0; j < this.periodStats.length; j++) {
            if (this.periodStats[j][0] === periods[i] && this.periodStats[j][6] === metric_group) {
                val += this.periodStats[j][metric];
            }
        }

        sessions.push(val);
    }

    return sessions;
};
// SessionCollection.prototype.addBulk             = function (sessions) {
//
//     for (var i = 0; i < sessions.length(); i++) {
//         this.add(sessions[i]);
//     }
// };
// SessionCollection.prototype.getSumProducts      = function () {
//
//     var stat = this.calcStat(function (session) {
//         return session.products;
//     });
//
//     return stat.value;
// };
SessionCollection.prototype.toString = function () {
    return "SessionCollection: size =" + this.size() + " Earliest:" + this.from + " Latest: " + this.to;
};
SessionCollection.prototype.analyze  = function () {

    this.periodStats = evaluatePeriods(this.all(), this.periodLabels, true);
    this.stats       = new SessionStats(this.all());
    evaluator.evaluate(this, this.locationNames.length);

    this.analytics = new SessionsAnalyticsManager(this.all(), this.periodLabels, true);
};
SessionCollection.prototype.add      = function (session) {

    // filter testing POSs
    if (session.location === "Itzik - Test") {
        return;
    }

    Collection.prototype.add.call(this, session);

    // Add to the list of locations
    if (-1 === this.locationNames.indexOf(session.name)) {
        this.locationNames.push(session.name);
    }

    // Check to update associates
    if (-1 === this.associates.indexOf(session.associate)) {
        this.associates.push(session.associate);
    }

    // Check to update customer
    var customerInArray = false;

    for (var i = 0; i < this.customers.length; i++) {
        if (this.customers[i].id === session.customer.id) {
            customerInArray = true;
        }
    }

    if (!customerInArray) {
        this.customers.push(session.customer);
    }

    this.productsPresented += session.products;

    // Update range of dates
    if (this.from === null) {
        this.from = session.date;
    } else if (this.from > session.date) {
        this.from = session.date;
    }

    if (this.to === null) {
        this.to = session.date;
    } else if (this.to < session.date) {
        this.to = session.date;
    }
};

function SessionCollection() {

    Collection.call(this);

    this.periodLabels = ngc.PERIODS;
    this.sentiments   = [];
    this.periodStats  = new Array(this.periodLabels.length);

    // Name of locations reported in sessions
    this.locationNames = [];

    // Name of associates reported in sessions
    this.associates = [];

    // Name of customers serviced in this location
    this.customers = [];

    // Earliest session in the collection
    this.from = null;

    // Latest session in the collection
    this.to = null;

    // Number of products presented
    this.productsPresented = 0;

    // Stats object
    this.stats = new SessionStats(this.list);

    // Analytics
    this.analytics = {};
}

/**
 * Location is a SessionCollection.
 *
 * @type {Collection}
 */
Location.prototype = new SessionCollection();
Location.prototype.constructor = Location;
Location.prototype.key         = function () {
    return this.name;
};
Location.prototype.comparable  = function () {
    return this.list.length;
};
Location.prototype.toString    = function () {
    return "Location " + this.name + ". Session count: " + this.list.length;
};

function Location(name) {

    SessionCollection.call(this);

    this.name = name;
    this.id   = this.name + "_LOC";
}

/**
 * Locations is a collection of Locations.
 *
 * This collection stores an instance of <code>Location</code>
 * per location reported in the data.
 *
 * @type {Collection}
 */
Locations.prototype = new Collection();
Locations.prototype.constructor       = Locations;
Locations.prototype.toString          = function () {
    return "Location count: " + this.size();
};
Locations.prototype.add               = function (location) {
    Collection.prototype.add.call(this, location);
    this.locationNames.push(location.name);
};
Locations.prototype.productsPresented = function () {

    var products = 0;

    for (var i = 0; i < this.size(); i++) {
        products += this.at(i).productsPresented;
    }

    return products;
};
Locations.prototype.analyze           = function () {

    this.all().forEach(function (location) {
        location.analyze();
    });
};

function Locations(sessions) {
    // Name of locations reported in sessions
    Collection.call(this);
    this.locationNames = [];

    for (var i = 0; i < sessions.size(); i++) {
        var session = sessions.at(i);
        var index   = this.find(session.location);

        if (-1 == index) { // NEW
            var location = new Location(session.location);
            location.add(session);
            this.add(location);
        } else {
            this.at(index).add(session);
        }
    }
}

/**
 * Customers is a collection of Customer objects.
 *
 * @type {SessionCollection}
 */
Customers.prototype = new SessionCollection();
Customers.prototype.constructor = Customers;
Customers.prototype.toString    = function () {
    return "CUSTOMERS Count: " + this.size();
};

function Customers(sessions) {

    SessionCollection.call(this);

    for (var i = 0; i < sessions.size(); i++) {
        var session = sessions.at(i);

        if (!session.customer.isEmpty()) {
            this.add(session);
        }
    }
}

/**
 * AccountData holds all key Nihao objects.
 * @param db Data to be processed
 * @constructor Reads the data from <code>db</code> and processes it.
 */
var AccountData = function (db) {

    this.emails = new Emails(db["Emails"]);

    // Init sessions
    this.sessions = new SessionCollection();

    let tmp_sessions      = [];
    let b_create_sessions = false;

    if (db["Sessions"] !== undefined) {
        b_create_sessions = true;
        tmp_sessions      = db["Sessions"];
    } else {
        b_create_sessions = false;
        tmp_sessions      = db.sessions;
    }

    for (let i = 0; i < tmp_sessions.length; i++) {
        this.sessions.add(b_create_sessions ? new Session(tmp_sessions[i]) : tmp_sessions[i]);
    }
    this.sessions.analyze();

    // Init locations
    this.locations = new Locations(this.sessions);
    this.locations.sort();
    this.locations.analyze();

    // Init customers
    this.customers = new Customers(this.sessions, this.locations.size());
    this.customers.analyze();

    this.periodLabels = ngc.PERIODS;
    this.periodStats  = new Array(this.periodLabels.length);

    this.sentiments = [];

    this.analyze = function () {
        this.periodStats = evaluatePeriods(this.sessions.all(), this.periodLabels, true);
        evaluator.evaluate(this, this.locations.size());
    };

    /*
     Gets total sessions for a relevant periods
     */
    this.getStats = function (periods, metric, metric_group) {

        var sessions = [];

        for (var i = 0; i < periods.length; i++) {

            var val = 0;

            for (var j = 0; j < this.periodStats.length; j++) {
                if (this.periodStats[j][0] === periods[i] && this.periodStats[j][6] === metric_group) {
                    val += this.periodStats[j][metric];
                }
            }

            sessions.push(val);
        }

        return sessions;
    };

    this.analyze();

};


