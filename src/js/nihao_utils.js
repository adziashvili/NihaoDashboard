/**
 * Created by itzhakadziashvili on 25/6/16.
 */

// function TestCollection() {
//
//     var aCollection = new Location("test");
//
//     for (var i = 0; i < account.sessions.all().length; i++) {
//         aCollection.add(account.sessions.at(i));
//     }
//
//     console.log(aCollection.toString());
//     console.log(aCollection.find("16622"));
//
//     aCollection.removeAt(aCollection.find("16622"));
//     console.log(aCollection.toString());
//     console.log(aCollection.find("16622"));
//
//     var session = aCollection.at(aCollection.find("16614"));
//     aCollection.remove(session);
//     console.log(aCollection.toString());
//     console.log(aCollection.find(session));
//
//     console.log(aCollection.keys());
//     aCollection.sort();
//
//     console.log(aCollection.keys());
//
//     console.log(
//         aCollection.calcStat(
//             function (session) {
//                 return session.pages;
//             }
//             ,
//
//             function (session) {
//                 return daysBetween(new Date(), session.date) <= 7;
//             }));
// }
//
// function TestSessions() {
//
//     var sessions = new SessionCollection();
//
//     for (var i = 0; i < account.sessions.all().length; i++) {
//         sessions.add(account.sessions.at(i));
//     }
//
//     console.log(sessions.toString());
//     console.log("Sentiments: " + sessions.sentiments);
//
//     sessions.analyze();
//     console.log("Sentiments: " + sessions.sentiments);
//
//     // Dump locations
//     console.log("Locations: " + sessions.locationNames);
//
//     // Dump associates
//     console.log("Associates: " + sessions.associates);
//
//     // Dump Customers
//     console.log("Associates: " + sessions.customers);
//
//     // Dump Customers
//     console.log("Total product sessions: " + sessions.productsPresented);
//
//
// }

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
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

Collection.prototype.size     = function () {
    return this.list.length;
};
Collection.prototype.all      = function () {
    return this.list
};
Collection.prototype.at       = function (index) {
    return this.list[index];
};
Collection.prototype.find     = function (obj) {

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
Collection.prototype.add      = function (obj) {

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
Collection.prototype.remove   = function (obj) {

    var index = this.find(obj);

    if (index !== -1) {
        this.removeAt(index);
    }

};
Collection.prototype.keys     = function () {

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
