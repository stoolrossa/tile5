/*!
 * Sidelab Tile5 Javascript Library v0.9.5
 * http://tile5.org/
 *
 * Copyright 2010, Damon Oehlman <damon.oehlman@sidelab.com>
 * Licensed under the MIT licence
 * https://github.com/sidelab/tile5/blob/master/LICENSE.mdown
 *
 * Build Date: @DATE
 */

/*jslint white: true, safe: true, onevar: true, undef: true, nomen: true, eqeqeq: true, newcap: true, immed: true, strict: true */

/*!
 * Sidelab COG Javascript Library v0.2.0
 * http://www.sidelab.com/
 *
 * Copyright 2011, Damon Oehlman <damon.oehlman@sidelab.com>
 * Licensed under the MIT licence
 * https://github.com/sidelab/cog
 *
 */

COG = typeof COG !== 'undefined' ? COG : {};

/**
# COG.extend
*/
COG.extend = function() {
    var target = arguments[0] || {},
        source;

    for (var ii = 1, argCount = arguments.length; ii < argCount; ii++) {
        if ((source = arguments[ii]) !== null) {
            for (var name in source) {
                var copy = source[name];

                if (target === copy) {
                    continue;
                } // if

                if (copy !== undefined) {
                    target[name] = copy;
                } // if
            } // for
        } // if
    } // for

    return target;
}; // extend

(function() {
    var REGEX_TEMPLATE_VAR = /\$\{(.*?)\}/ig;

    var hasOwn = Object.prototype.hasOwnProperty,
        objectCounter = 0,
        extend = COG.extend;

    /* exports */

    var exports = {},

        toID = exports.toID = function(text) {
            return text.replace(/\s/g, "-");
        },

        objId = exports.objId = function(prefix) {
            return (prefix ? prefix : "obj") + objectCounter++;
        };

var isFunction = exports.isFunction = function( obj ) {
    return toString.call(obj) === "[object Function]";
};

var isArray = exports.isArray = function( obj ) {
    return toString.call(obj) === "[object Array]";
};

var isPlainObject = exports.isPlainObject = function( obj ) {
    if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
        return false;
    }

    if ( obj.constructor &&
        !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
    }


    var key;
    for ( key in obj ) {}

    return key === undefined || hasOwn.call( obj, key );
};

var isEmptyObject = exports.isEmptyObject = function( obj ) {
    for ( var name in obj ) {
        return false;
    }
    return true;
};

var isXmlDocument = exports.isXmlDocument = function(obj) {
    return toString.call(obj) === "[object Document]";
};
/**
### contains(obj, members)
This function is used to determine whether an object contains the specified names
as specified by arguments beyond and including index 1.  For instance, if you wanted
to check whether object 'foo' contained the member 'name' then you would simply call
COG.contains(foo, 'name').
*/
var contains = exports.contains = function(obj, members) {
    var fnresult = obj;
    var memberArray = arguments;
    var startIndex = 1;

    if (members && module.isArray(members)) {
        memberArray = members;
        startIndex = 0;
    } // if

    for (var ii = startIndex; ii < memberArray; ii++) {
        fnresult = fnresult && (typeof foo[memberArray[ii]] !== 'undefined');
    } // for

    return fnresult;
}; // contains
/**
### formatStr(text, args*)
*/
var formatStr = exports.formatStr = function(text) {
    if ( arguments.length <= 1 )
    {
        return text;
    }
    var tokenCount = arguments.length - 2;
    for( var token = 0; token <= tokenCount; token++ )
    {
        text = text.replace( new RegExp( "\\{" + token + "\\}", "gi" ),
                                                arguments[ token + 1 ] );
    }
    return text;
}; // formatStr

var wordExists = exports.wordExists = function(stringToCheck, word) {
    var testString = "";

    if (word.toString) {
        word = word.toString();
    } // if

    for (var ii = 0; ii < word.length; ii++) {
        testString += (! (/\w/).test(word[ii])) ? "\\" + word[ii] : word[ii];
    } // for

    var regex = new RegExp("(^|\\s|\\,)" + testString + "(\\,|\\s|$)", "i");

    return regex.test(stringToCheck);
}; // wordExists

    COG.extend(COG, exports);
})();


(function() {
    var traceAvailable = window.console && window.console.markTimeline,
        logError = writer('error'),
        logInfo = writer('info');

    /* internal functions */

    function writer(level) {
        if (typeof console !== 'undefined') {
            return function() {
                console[level](Array.prototype.slice.call(arguments, 0).join(' '));

                return true;
            };
        }
        else {
            return function() {
                return false;
            };
        } // if..else
    } // writer

    /* exports */

    var trace = (function() {
        if (traceAvailable) {
            return function(message, startTicks) {
                console.markTimeline(message + (startTicks ? ": " +
                    (new Date().getTime() - startTicks) + "ms" : ""));
            };
        }
        else {
            return function() {};
        } // if..else
    })();

    COG.extend(COG, {
        trace: trace,
        debug: writer('debug'),
        info: logInfo,
        warn: writer('warn'),
        error: logError,

        exception: function(error) {
            if (logError) {
                for (var keyname in error) {
                    logInfo("ERROR DETAIL: " + keyname + ": " + error[keyname]);
                } // for
            }
        }

    });
})();


(function() {
    var callbackCounter = 0;

    function getHandlers(target) {
        return target.hasOwnProperty('obsHandlers') ?
                target.obsHandlers :
                null;
    } // getHandlers

    function getHandlersForName(target, eventName) {
        var handlers = getHandlers(target);
        if (! handlers[eventName]) {
            handlers[eventName] = [];
        } // if

        return handlers[eventName];
    } // getHandlersForName

    /**
    # COG.observable
    */
    COG.observable = function(target) {
        if (! target) { return null; }

        /* initialization code */

        if (! getHandlers(target)) {
            target.obsHandlers = {};
        } // if

        var attached = target.hasOwnProperty('bind');
        if (! attached) {
            target.bind = function(eventName, callback) {
                var callbackId = "callback" + (callbackCounter++);
                getHandlersForName(target, eventName).unshift({
                    fn: callback,
                    id: callbackId
                });

                return callbackId;
            }; // bind

            target.triggerCustom = function(eventName, args) {
                var eventCallbacks = getHandlersForName(target, eventName),
                    evt = {
                        cancel: false,
                        name: eventName,
                        source: this
                    },
                    eventArgs;

                if (args) {
                    COG.extend(evt, args);
                } // if

                if (! eventCallbacks) {
                    return null;
                } // if

                eventArgs = Array.prototype.slice.call(arguments, 2);

                if (target.eventInterceptor) {
                    target.eventInterceptor(eventName, evt, eventArgs);
                } // if

                eventArgs.unshift(evt);

                for (var ii = eventCallbacks.length; ii-- && (! evt.cancel); ) {
                    eventCallbacks[ii].fn.apply(this, eventArgs);
                } // for

                return evt;
            };

            target.trigger = function(eventName) {
                var eventArgs = Array.prototype.slice.call(arguments, 1);
                eventArgs.splice(0, 0, eventName, null);

                return target.triggerCustom.apply(this, eventArgs);
            }; // trigger

            target.unbind = function(eventName, callbackId) {
                if (typeof eventName === 'undefined') {
                    target.obsHandlers = {};
                }
                else {
                    var eventCallbacks = getHandlersForName(target, eventName);
                    for (var ii = 0; eventCallbacks && (ii < eventCallbacks.length); ii++) {
                        if (eventCallbacks[ii].id === callbackId) {
                            eventCallbacks.splice(ii, 1);
                            break;
                        } // if
                    } // for
                } // if..else

                return target;
            }; // unbind
        } // if

        return target;
    };
})();

(function() {
    var configurables = {},
        counter = 0;

    /* internal functions */

    function attachHelper(target, helperName) {
        if (! target[helperName]) {
            target[helperName] = function(value) {
                return target.configure(helperName, value);
            };
        } // if
    } // attachHelper

    function getSettings(target) {
        return target.gtConfig;
    } // getSettings

    function getConfigCallbacks(target) {
        return target.gtConfigFns;
    } // getConfigGetters

    function initSettings(target) {
        target.gtConfId = 'configurable' + (counter++);
        target.gtConfig = {};
        target.gtConfigFns = [];

        return target.gtConfig;
    } // initSettings

    /* define the param tweaker */

    COG.paramTweaker = function(params, getCallbacks, setCallbacks) {
        return function(name, value) {
            if (typeof value !== "undefined") {
                if (name in params) {
                    params[name] = value;
                } // if

                if (setCallbacks && (name in setCallbacks)) {
                    setCallbacks[name](name, value);
                } // if
            }
            else {
                return (getCallbacks && (name in getCallbacks)) ?
                    getCallbacks[name](name) :
                    params[name];
            } // if..else

            return undefined;
        };
    }; // paramTweaker

    /* define configurable */

    COG.configurable = function(target, configParams, callback, bindHelpers) {
        if (! target) { return; }

        if (! target.gtConfId) {
            initSettings(target);
        } // if

        var ii,
            targetId = target.gtConfId,
            targetSettings = getSettings(target),
            targetCallbacks = getConfigCallbacks(target);

        configurables[targetId] = target;

        targetCallbacks.push(callback);

        for (ii = configParams.length; ii--; ) {
            targetSettings[configParams[ii]] = true;

            if (bindHelpers) {
                attachHelper(target, configParams[ii]);
            } // if
        } // for

        if (! target.configure) {
            target.configure = function(name, value) {
                if (targetSettings[name]) {
                    for (var ii = targetCallbacks.length; ii--; ) {
                        var result = targetCallbacks[ii](name, value);
                        if (typeof result !== "undefined") {
                            return result;
                        } // if
                    } // for

                    return configurables[targetId];
                } // if

                return null;
            };
        } // if
    };
})();

/**
Lightweight JSONP fetcher - www.nonobstrusive.com
The JSONP namespace provides a lightweight JSONP implementation.  This code
is implemented as-is from the code released on www.nonobtrusive.com, as per the
blog post listed below.  Only two changes were made. First, rename the json function
to get around jslint warnings. Second, remove the params functionality from that
function (not needed for my implementation).  Oh, and fixed some scoping with the jsonp
variable (didn't work with multiple calls).

http://www.nonobtrusive.com/2010/05/20/lightweight-jsonp-without-any-3rd-party-libraries/
*/
(function(){
    var counter = 0, head, query, key, window = this;

    function load(url) {
        var script = document.createElement('script'),
            done = false;
        script.src = url;
        script.async = true;

        script.onload = script.onreadystatechange = function() {
            if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                done = true;
                script.onload = script.onreadystatechange = null;
                if ( script && script.parentNode ) {
                    script.parentNode.removeChild( script );
                }
            }
        };
        if ( !head ) {
            head = document.getElementsByTagName('head')[0];
        }
        head.appendChild( script );
    } // load

    COG.jsonp = function(url, callback, callbackParam) {
        url += url.indexOf("?") >= 0 ? "&" : "?";

        var jsonp = "json" + (++counter);
        window[ jsonp ] = function(data){
            callback(data);
            window[ jsonp ] = null;
            try {
                delete window[ jsonp ];
            } catch (e) {}
        };

        load(url + (callbackParam ? callbackParam : "callback") + "=" + jsonp);
        return jsonp;
    }; // jsonp
}());

(function() {
    var BACK_S = 1.70158,
        HALF_PI = Math.PI / 2,
        ANI_WAIT = 1000 / 60 | 0,

        abs = Math.abs,
        pow = Math.pow,
        sin = Math.sin,
        asin = Math.asin,
        cos = Math.cos,

        tweenWorker = null,
        updatingTweens = false;

    /*
    Easing functions

    sourced from Robert Penner's excellent work:
    http://www.robertpenner.com/easing/

    Functions follow the function format of fn(t, b, c, d, s) where:
    - t = time
    - b = beginning position
    - c = change
    - d = duration
    */
    var easingFns = {
        linear: function(t, b, c, d) {
            return c*t/d + b;
        },

        /* back easing functions */

        backin: function(t, b, c, d) {
            return c*(t/=d)*t*((BACK_S+1)*t - BACK_S) + b;
        },

        backout: function(t, b, c, d) {
            return c*((t=t/d-1)*t*((BACK_S+1)*t + BACK_S) + 1) + b;
        },

        backinout: function(t, b, c, d) {
            return ((t/=d/2)<1) ? c/2*(t*t*(((BACK_S*=(1.525))+1)*t-BACK_S))+b : c/2*((t-=2)*t*(((BACK_S*=(1.525))+1)*t+BACK_S)+2)+b;
        },

        /* bounce easing functions */

        bouncein: function(t, b, c, d) {
            return c - easingFns.bounceout(d-t, 0, c, d) + b;
        },

        bounceout: function(t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
            }
        },

        bounceinout: function(t, b, c, d) {
            if (t < d/2) return easingFns.bouncein(t*2, 0, c, d) / 2 + b;
            else return easingFns.bounceout(t*2-d, 0, c, d) / 2 + c/2 + b;
        },

        /* cubic easing functions */

        cubicin: function(t, b, c, d) {
            return c*(t/=d)*t*t + b;
        },

        cubicout: function(t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        },

        cubicinout: function(t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        },

        /* elastic easing functions */

        elasticin: function(t, b, c, d, a, p) {
            var s;

            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
            if (!a || a < abs(c)) { a=c; s=p/4; }
            else s = p/TWO_PI * asin (c/a);
            return -(a*pow(2,10*(t-=1)) * sin( (t*d-s)*TWO_PI/p )) + b;
        },

        elasticout: function(t, b, c, d, a, p) {
            var s;

            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
            if (!a || a < abs(c)) { a=c; s=p/4; }
            else s = p/TWO_PI * asin (c/a);
            return (a*pow(2,-10*t) * sin( (t*d-s)*TWO_PI/p ) + c + b);
        },

        elasticinout: function(t, b, c, d, a, p) {
            var s;

            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(0.3*1.5);
            if (!a || a < abs(c)) { a=c; s=p/4; }
            else s = p/TWO_PI * asin (c/a);
            if (t < 1) return -0.5*(a*pow(2,10*(t-=1)) * sin( (t*d-s)*TWO_PI/p )) + b;
            return a*pow(2,-10*(t-=1)) * sin( (t*d-s)*TWO_PI/p )*0.5 + c + b;
        },

        /* quad easing */

        quadin: function(t, b, c, d) {
            return c*(t/=d)*t + b;
        },

        quadout: function(t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },

        quadinout: function(t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        },

        /* sine easing */

        sinein: function(t, b, c, d) {
            return -c * cos(t/d * HALF_PI) + c + b;
        },

        sineout: function(t, b, c, d) {
            return c * sin(t/d * HALF_PI) + b;
        },

        sineinout: function(t, b, c, d) {
            return -c/2 * (cos(Math.PI*t/d) - 1) + b;
        }
    };

    /* animation internals */

    function simpleTypeName(typeName) {
        return typeName.replace(/[\-\_\s\.]/g, '').toLowerCase();
    } // simpleTypeName

    /* tween exports */

    /**
    # COG.tweenValue
    */
    COG.tweenValue = function(startValue, endValue, fn, duration, callback) {

        var startTicks = new Date().getTime(),
            lastTicks = 0,
            change = endValue - startValue,
            tween = {};

        function runTween(tickCount) {
            tickCount = tickCount ? tickCount : new Date().getTime();

            if (lastTicks + ANI_WAIT < tickCount) {
                var elapsed = tickCount - startTicks,
                    updatedValue = fn(elapsed, startValue, change, duration),
                    complete = startTicks + duration <= tickCount,
                    cont = !complete,
                    retVal;

                if (callback) {
                    retVal = callback(updatedValue, complete, elapsed);

                    cont = typeof retVal != 'undefined' ? retVal && cont : cont;
                } // if

                if (cont) {
                    animFrame(runTween);
                } // if
            } // if
        } // runTween

        animFrame(runTween);

        return tween;
    }; // T5.tweenValue

    /**
    # COG.easing
    */
    var easing = COG.easing = function(typeName) {
        return easingFns[simpleTypeName(typeName)];
    }; // easing

    /**
    # COG.registerEasingType
    */
    COG.registerEasingType = function(typeName, callback) {
        easingFns[simpleTypeName(typeName)] = callback;
    }; // registerEasingType
})();

(function() {
    var DAY_SECONDS = 86400;

    var periodRegex = /^P(\d+Y)?(\d+M)?(\d+D)?$/,
        timeRegex = /^(\d+H)?(\d+M)?(\d+S)?$/,
        durationParsers = {
            8601: parse8601Duration
        };

    /* internal functions */

    /*
    Used to convert a ISO8601 duration value (not W3C subset)
    (see http://en.wikipedia.org/wiki/ISO_8601#Durations) into a
    composite value in days and seconds
    */
    function parse8601Duration(input) {
        var durationParts = input.split('T'),
            periodMatches = null,
            timeMatches = null,
            days = 0,
            seconds = 0;

        periodRegex.lastIndex = -1;
        periodMatches = periodRegex.exec(durationParts[0]);

        days = days + (periodMatches[3] ? parseInt(periodMatches[3].slice(0, -1), 10) : 0);

        timeRegex.lastIndex = -1;
        timeMatches = timeRegex.exec(durationParts[1]);

        seconds = seconds + (timeMatches[1] ? parseInt(timeMatches[1].slice(0, -1), 10) * 3600 : 0);
        seconds = seconds + (timeMatches[2] ? parseInt(timeMatches[2].slice(0, -1), 10) * 60 : 0);
        seconds = seconds + (timeMatches[3] ? parseInt(timeMatches[3].slice(0, -1), 10) : 0);

        return new Duration(days, seconds);
    } // parse8601Duration

    /* exports */

    var Duration = COG.Duration = function(days, seconds) {
        return {
            days: days ? days : 0,
            seconds: seconds ? seconds : 0
        };
    };

    /**
    ### addDuration(duration*)
    This function is used to return a new duration that is the sum of the duration
    values passed to the function.
    */
    var addDuration = COG.addDuration = function() {
        var result = new Duration();

        for (var ii = arguments.length; ii--; ) {
            result.days = result.days + arguments[ii].days;
            result.seconds = result.seconds + arguments[ii].seconds;
        } // for

        if (result.seconds >= DAY_SECONDS) {
            result.days = result.days + ~~(result.seconds / DAY_SECONDS);
            result.seconds = result.seconds % DAY_SECONDS;
        } // if

        return result;
    }; // increaseDuration

    /**
    ### formatDuration(duration)

    This function is used to format the specified duration as a string value

    #### TODO
    Add formatting options and i18n support
    */
    var formatDuration = COG.formatDuration = function(duration) {

        var days, hours, minutes, totalSeconds,
            output = '';

        if (duration.days) {
            output = duration.days + ' days ';
        } // if

        if (duration.seconds) {
            totalSeconds = duration.seconds;

            if (totalSeconds >= 3600) {
                hours = ~~(totalSeconds / 3600);
                totalSeconds = totalSeconds - (hours * 3600);
            } // if

            if (totalSeconds >= 60) {
                minutes = Math.round(totalSeconds / 60);
                totalSeconds = totalSeconds - (minutes * 60);
            } // if

            if (hours) {
                output = output + hours +
                    (hours > 1 ? ' hrs ' : ' hr ') +
                    (minutes ?
                        (minutes > 10 ?
                            minutes :
                            '0' + minutes) + ' min '
                        : '');
            }
            else if (minutes) {
                output = output + minutes + ' min';
            }
            else if (totalSeconds > 0) {
                output = output +
                    (totalSeconds > 10 ?
                        totalSeconds :
                        '0' + totalSeconds) + ' sec';
            } // if..else
        } // if

        return output;
    }; // formatDuration

    var parseDuration = COG.parseDuration = function(duration, format) {
        var parser = format ? durationParsers[format] : null;

        if (parser) {
            return parser(duration);
        }

        COG.Log.warn('Could not find duration parser for specified format: ' + format);
        return new Duration();
    }; // durationToSeconds
})();

COG.ObjectStore = function() {

    /* internals */

    var index = {},
        groups = {},
        objPrefix = 'obj_' + new Date().getTime(),
        objCounter = 0,
        hasOwn = Object.prototype.hasOwnProperty;

    /* exports */

    function add(object, group) {
        var objects;

        group = group ? group : 'default';

        if (object && object.constructor) {
            if (! hasOwn.call(object, 'id')) {
                object.id = objPrefix + (++objCounter);
            } // if
        } // if

        objects = groups[group] ? groups[group] : (groups[group] = []);

        index[object.id] = objects.length;

        objects[object.length] = object;
    } // add

    return {
        add: add
    };
};
var CANI = {};
(function(exports) {
    var tests = [],
        testIdx = 0,
        publishedResults = false;

    /* exports */

    var register = exports.register = function(section, runFn) {
        tests.push({
            section: section,
            run: runFn
        });
    };

    var init = exports.init = function(callback) {

        var tmpResults = {};

        function runCurrentTest() {
            if (testIdx < tests.length) {
                var test = tests[testIdx++];

                if (! tmpResults[test.section]) {
                    tmpResults[test.section] = {};
                } // if

                test.run(tmpResults[test.section], runCurrentTest);
            }
            else {
                for (var section in tmpResults) {
                    exports[section] = tmpResults[section];
                } // for

                publishedResults = true;

                if (callback) {
                    callback(exports);
                } // if
            } // if..else
        } // runCurrentTest

        if (publishedResults && callback) {
            callback(exports);
        }
        else {
            testIdx = 0;
            runCurrentTest();
        } // if..else
    }; // run

register('canvas', function(results, callback) {

    var testCanvas = document.createElement('canvas'),
        isFlashCanvas = typeof FlashCanvas != 'undefined',
        isExplorerCanvas = typeof G_vmlCanvasManager != 'undefnined';

    /* define test functions */

    function checkPointInPath() {
        var transformed,
            testContext = testCanvas.getContext('2d');

        testContext.save();
        try {
            testContext.translate(50, 50);

            testContext.beginPath();
            testContext.rect(0, 0, 20, 20);

            transformed = testContext.isPointInPath(10, 10);
        }
        finally {
            testContext.restore();
        } // try..finally

        return transformed;
    } // checkPointInPath

    /* initialise and run the tests */

    testCanvas.width = 200;
    testCanvas.height = 200;

    results.pipTransformed = isFlashCanvas || isExplorerCanvas ? false : checkPointInPath();

    callback();
});
})(CANI);

/**
# INTERACT
*/
INTERACT = (function() {
    var interactors = [];

var EventMonitor = function(target, handlers, params) {
    params = COG.extend({
        binder: null,
        unbinder: null,
        observable: null
    }, params);

    var MAXMOVE_TAP = 20, // pixels
        INERTIA_DURATION = 500, // ms
        INERTIA_MAXDIST = 300, // pixels
        INERTIA_TIMEOUT = 50, // ms
        INERTIA_IDLE_DISTANCE = 15; // pixels

    var observable = params.observable,
        pannableOpts = null,
        handlerInstances = [],
        pans = [],
        totalDeltaX,
        totalDeltaY;


    /* internals */

    function checkInertia(events) {
        var evtCount = events.length,
            includedCount,
            vectorX = 0,
            vectorY = 0,
            diffX,
            diffY,
            distance,
            theta,
            extraDistance,
            totalTicks = 0, // evtCount > 0 ? (new Date().getTime() - events[evtCount-1].ticks) : 0,
            xyRatio = 1,
            ii;

        ii = events.length;
        while (--ii > 1 && totalTicks < INERTIA_TIMEOUT) {
            totalTicks += (events[ii].ticks - events[ii - 1].ticks);
        } // while

        includedCount = evtCount - ii;

        if (includedCount > 1) {
            diffX = events[evtCount - 1].x - events[ii].x;
            diffY = events[evtCount - 1].y - events[ii].y;
            distance = Math.sqrt(diffX * diffX + diffY * diffY) | 0;

            if (distance > INERTIA_IDLE_DISTANCE) {
                diffX = events[evtCount - 1].x - events[0].x;
                diffY = events[evtCount - 1].y - events[0].y;
                distance = Math.sqrt(diffX * diffX + diffY * diffY) | 0;
                theta = Math.asin(diffY / distance);

                extraDistance = distance * INERTIA_DURATION / totalTicks | 0;
                extraDistance = extraDistance > INERTIA_MAXDIST ? INERTIA_MAXDIST : extraDistance;

                inertiaPan(
                    Math.cos(diffX > 0 ? theta : Math.PI - theta) * extraDistance,
                    Math.sin(theta) * extraDistance,
                    COG.easing('sine.out'),
                    INERTIA_DURATION);
            } // if
        } // if
    } // checkInertia

    function deltaGreaterThan(value) {
        return Math.abs(totalDeltaX) > value || Math.abs(totalDeltaY) > value;
    } // deltaGreaterThan

    function handlePointerMove(evt, absXY, relXY, deltaXY) {
        if (pannableOpts) {
            pans[pans.length] = {
                ticks: new Date().getTime(),
                x: deltaXY.x,
                y: deltaXY.y
            };

            observable.trigger('pan', deltaXY.x, deltaXY.y);
        } // if

        totalDeltaX += deltaXY.x ? deltaXY.x : 0;
        totalDeltaY += deltaXY.y ? deltaXY.y : 0;
    } // handlePanMove

    function handlePointerDown(evt, absXY, relXY) {
        pans = [];

        totalDeltaX = 0;
        totalDeltaY = 0;
    } // handlePointerDown

    function handlePointerUp(evt, absXY, relXY) {
        if (! deltaGreaterThan(MAXMOVE_TAP)) {
            observable.trigger('tap', absXY, relXY);
        }
        else if (pannableOpts) {
            checkInertia(pans);
        }
    } // handlePointerUP

    function inertiaPan(changeX, changeY, easing, duration) {
        var currentX = 0,
            currentY = 0,
            lastX = 0;


        COG.tweenValue(0, changeX, easing, duration, function(val, complete) {
            lastX = currentX;
            currentX = val;
        });

        COG.tweenValue(0, changeY, easing, duration, function(val, complete) {
            observable.trigger('pan', currentX - lastX, val - currentY);
            currentY = val;
        });
    } // inertia pan

    /* exports */

    function bind() {
        return observable.bind.apply(null, arguments);
    } // bind

    function pannable(opts) {
        pannableOpts = COG.extend({
            inertia: true
        }, opts);

        return self;
    } // pannable

    function unbind() {
        observable.unbind();

        for (var ii = 0; ii < handlerInstances.length; ii++) {
            handlerInstances[ii].unbind();
        } // for

        return self;
    } // unbind

    /* define the object */

    var self = {
        bind: bind,
        pannable: pannable,
        unbind: unbind
    };

    for (var ii = 0; ii < handlers.length; ii++) {
        handlerInstances.push(handlers[ii](target, observable, params));
    } // for

    observable.bind('pointerDown', handlePointerDown);
    observable.bind('pointerMove', handlePointerMove);
    observable.bind('pointerUp', handlePointerUp);

    return self;
};

    /* internal functions */

    function genBinder(useBody) {
        return function(evtName, callback, customTarget) {
            var target = customTarget ? customTarget : (useBody ? document.body : document);

            target.addEventListener(evtName, callback, false);
        };
    } // bindDoc

    function genUnbinder(useBody) {
        return function(evtName, callback, customTarget) {
            var target = customTarget ? customTarget : (useBody ? document.body : document);

            target.removeEventListener(evtName, callback, false);
        };
    } // unbindDoc

    function getHandlers(types, capabilities) {
        var handlers = [];

        for (var ii = interactors.length; ii--; ) {
            var interactor = interactors[ii],
                selected = (! types) || (types.indexOf(interactor.type) >= 0),
                checksPass = true;

            for (var checkKey in interactor.checks) {
                var check = interactor.checks[checkKey];
                COG.info('checking ' + checkKey + ' capability. require: ' + check + ', capability = ' + capabilities[checkKey]);

                checksPass = checksPass && (check === capabilities[checkKey]);
            } // for

            if (selected && checksPass) {
                handlers[handlers.length] = interactor.handler;
            } // if
        } // for

        return handlers;
    } // getHandlers

    function ieBind(evtName, callback, customTarget) {
        (customTarget ? customTarget : document).attachEvent('on' + evtName, callback);
    } // ieBind

    function ieUnbind(evtName, callback, customTarget) {
        (customTarget ? customTarget : document).detachEvent('on' + evtName, callback);
    } // ieUnbind

    function point(x, y) {
        return {
            x: x ? x : 0,
            y: y ? y : 0,
            count: 1
        };
    } // point

    /* exports */

    function register(typeName, opts) {
        interactors.push(COG.extend({
            handler: null,
            checks: {},
            type: typeName
        }, opts));
    } // register

    /**
    ### watch(target, opts, caps)
    */
    function watch(target, opts, caps) {
        opts = COG.extend({
            bindToBody: false,
            observable: null,
            isIE: typeof window.attachEvent != 'undefined',
            types: null
        }, opts);

        capabilities = COG.extend({
            touch: 'ontouchstart' in window
        }, caps);

        if (! opts.observable) {
            COG.info('creating observable');
            opts.observable = COG.observable({});
            globalOpts = opts;
        } // if

        opts.binder = opts.isIE ? ieBind : genBinder(opts.bindToBody);
        opts.unbinder = opts.isIE ? ieUnbind : genUnbinder(opts.bindToBody);

        return new EventMonitor(target, getHandlers(opts.types, capabilities), opts);
    } // watch

var InertiaMonitor = function(upX, upY, params) {
    params = COG.extend({
        inertiaTrigger: 20
    }, params);

    var INERTIA_TIMEOUT = 300,
        INERTIA_DURATION = 300,
        INERTIA_MAXDIST = 500;

    var startTicks = new Date().getTime(),
        worker;

    /* internals */

    function calcDistance(x1, y1, x2, y2) {
        var distX = x1 - x2,
            distY = y1 - y2;

        return Math.sqrt(distX * distX + distY * distY);
    } // calcDistance

    function calculateInertia(currentX, currentY, distance, tickDiff) {
        var theta = Math.asin((upY - currentY) / distance),
            extraDistance = distance * (INERTIA_DURATION / tickDiff) >> 0;

        extraDistance = extraDistance > INERTIA_MAXDIST ? INERTIA_MAXDIST : extraDistance;

        theta = currentX > upX ? theta : Math.PI - theta;

        self.trigger(
            'inertia',
            upX,
            upY,
            Math.cos(theta) * extraDistance | 0,
            Math.sin(theta) * -extraDistance | 0);
    } // calculateInertia

    /* exports */

    function check(currentX, currentY) {
        var distance = calcDistance(upX, upY, currentX, currentY),
            tickDiff = new Date().getTime() - startTicks;

        if ((tickDiff < INERTIA_TIMEOUT) && (distance > params.inertiaTrigger)) {
            calculateInertia(currentX, currentY, distance, tickDiff);
        }
        else if (tickDiff > INERTIA_TIMEOUT) {
            self.trigger('timeout');
        } // if..else
    } // check

    var self = {
        check: check
    };

    COG.observable(self);

    return self;
};

/* common pointer (mouse, touch, etc) functions */

function getOffset(obj) {
    var calcLeft = 0,
        calcTop = 0;

    if (obj.offsetParent) {
        do {
            calcLeft += obj.offsetLeft;
            calcTop += obj.offsetTop;

            obj = obj.offsetParent;
        } while (obj);
    } // if

    return {
        left: calcLeft,
        top: calcTop
    };
} // getOffset

function genEventProps(source, evt) {
    return {
        source: source,
        target: evt.target ? evt.target : evt.srcElement
    };
} // genEventProps

function matchTarget(evt, targetElement) {
    var targ = evt.target ? evt.target : evt.srcElement;
    while (targ && (targ !== targetElement) && targ.nodeName && (targ.nodeName.toUpperCase() != 'CANVAS')) {
        targ = targ.parentNode;
    } // while

    return targ && (targ === targetElement);
} // matchTarget

function pointerOffset(absPoint, offset) {
    return {
        x: absPoint.x - (offset ? offset.left : 0),
        y: absPoint.y - (offset ? offset.top : 0)
    };
} // triggerPositionEvent

function preventDefault(evt) {
    if (evt.preventDefault) {
        evt.preventDefault();
        evt.stopPropagation();
    }
    else if (evt.cancelBubble) {
        evt.cancelBubble();
    } // if..else
} // preventDefault
var MouseHandler = function(targetElement, observable, opts) {
    opts = COG.extend({
    }, opts);

    var WHEEL_DELTA_STEP = 120,
        WHEEL_DELTA_LEVEL = WHEEL_DELTA_STEP * 8;

    var ignoreButton = opts.isIE,
        isFlashCanvas = typeof FlashCanvas != 'undefined',
        buttonDown = false,
        start,
        currentX,
        currentY,
        lastX,
        lastY;

    /* internal functions */

    function getPagePos(evt) {
        if (evt.pageX && evt.pageY) {
            return point(evt.pageX, evt.pageY);
        }
        else {
            var doc = document.documentElement,
    			body = document.body;

            return point(
                evt.clientX +
                    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                    (doc && doc.clientLeft || body && body.clientLeft || 0),
                evt.clientY +
                    (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                    (doc && doc.clientTop  || body && body.clientTop  || 0)
            );
        } // if
    } // getPagePos

    function handleClick(evt) {
        if (matchTarget(evt, targetElement)) {
            var clickXY = getPagePos(evt);

            observable.triggerCustom(
                'tap',
                genEventProps('mouse', evt),
                clickXY,
                pointerOffset(clickXY, getOffset(targetElement))
            );
        } // if
    } // handleClick

    function handleDoubleClick(evt) {
        COG.info('captured double click');

        if (matchTarget(evt, targetElement)) {
            var clickXY = getPagePos(evt);

            observable.triggerCustom(
                'doubleTap',
                genEventProps('mouse', evt),
                clickXY,
                pointerOffset(clickXY, getOffset(targetElement))
            );
        } // if
    } // handleDoubleClick

    function handleMouseDown(evt) {
        if (matchTarget(evt, targetElement)) {
            buttonDown = isLeftButton(evt);

            if (buttonDown) {
                var pagePos = getPagePos(evt);

                targetElement.style.cursor = 'move';
                preventDefault(evt);

                lastX = pagePos.x;
                lastY = pagePos.y;
                start = point(lastX, lastY);

                observable.triggerCustom(
                    'pointerDown',
                    genEventProps('mouse', evt),
                    start,
                    pointerOffset(start, getOffset(targetElement))
                );
            }
        } // if
    } // mouseDown

    function handleMouseMove(evt) {
        var pagePos = getPagePos(evt);

        currentX = pagePos.x;
        currentY = pagePos.y;

        if (matchTarget(evt, targetElement)) {
            triggerCurrent(evt, buttonDown ? 'pointerMove' : 'pointerHover');
        } // if
    } // mouseMove

    function handleMouseUp(evt) {
        if (buttonDown && isLeftButton(evt)) {
            buttonDown = false;

            if (matchTarget(evt, targetElement)) {
                targetElement.style.cursor = 'default';
                triggerCurrent(evt, 'pointerUp');
            } // if
        } // if
    } // mouseUp

    function handleWheel(evt) {
        if (matchTarget(evt, targetElement)) {
            var deltaY;

            evt = evt || window.event;

            if (evt.detail) {
                deltaY = evt.axis === 2 ? -evt.detail * WHEEL_DELTA_STEP : 0;
            }
            else {
                deltaY = evt.wheelDeltaY ? evt.wheelDeltaY : evt.wheelDelta;
                if (window.opera) {
                    deltaY = -deltaY;
                } // if
            } // if..else

            if (deltaY !== 0) {
                var current = point(currentX, currentY);

                observable.triggerCustom(
                    'zoom',
                    genEventProps('mouse', evt),
                    current,
                    pointerOffset(current, getOffset(targetElement)),
                    deltaY / WHEEL_DELTA_LEVEL,
                    'wheel'
                );

                preventDefault(evt);
                evt.returnValue = false;
            } // if
        } // if
    } // handleWheel

    function isLeftButton(evt) {
        evt = evt || window.event;
        var button = evt.which || evt.button;
        return button == 1;
    } // leftPressed

    function triggerCurrent(evt, eventName, overrideX, overrideY, updateLast) {
        var evtX = typeof overrideX != 'undefined' ? overrideX : currentX,
            evtY = typeof overrideY != 'undefined' ? overrideY : currentY,
            deltaX = evtX - lastX,
            deltaY = evtY - lastY,
            current = point(evtX, evtY);

        observable.triggerCustom(
            eventName,
            genEventProps('mouse', evt),
            current,
            pointerOffset(current, getOffset(targetElement)),
            point(deltaX, deltaY)
        );

        if (typeof updateLast == 'undefined' || updateLast) {
            lastX = evtX;
            lastY = evtY;
        } // if
    } // triggerCurrent

    /* exports */

    function unbind() {
        opts.unbinder('mousedown', handleMouseDown, false);
        opts.unbinder('mousemove', handleMouseMove, false);
        opts.unbinder('mouseup', handleMouseUp, false);

        opts.unbinder("mousewheel", handleWheel, document);
        opts.unbinder("DOMMouseScroll", handleWheel, document);
    } // unbind

    opts.binder('mousedown', handleMouseDown, false);
    opts.binder('mousemove', handleMouseMove, false);
    opts.binder('mouseup', handleMouseUp, false);
    opts.binder('dblclick', handleDoubleClick, false);

    opts.binder('mousewheel', handleWheel, document);
    opts.binder('DOMMouseScroll', handleWheel, document);

    return {
        unbind: unbind
    };
}; // MouseHandler

register('pointer', {
    handler: MouseHandler,
    checks: {
        touch: false
    }
});
var TouchHandler = function(targetElement, observable, opts) {
    opts = COG.extend({
        detailed: false,
        inertia: false
    }, opts);

    var DEFAULT_INERTIA_MAX = 500,
        INERTIA_TIMEOUT_MOUSE = 100,
        INERTIA_TIMEOUT_TOUCH = 250,
        THRESHOLD_DOUBLETAP = 300,
        THRESHOLD_PINCHZOOM = 20,
        MIN_MOVEDIST = 7,
        EMPTY_TOUCH_DATA = {
            x: 0,
            y: 0
        };

    var TOUCH_MODE_UNKNOWN = 0,
        TOUCH_MODE_TAP = 1,
        TOUCH_MODE_MOVE = 2,
        TOUCH_MODE_PINCH = 3;

    var offset,
        touchMode,
        touchDown = false,
        touchesStart,
        touchesCurrent,
        startDistance,
        touchesLast,
        detailedEvents = opts.detailed,
        scaling = 1;

    /* internal functions */

    function calcChange(first, second) {
        var srcVector = (first && (first.count > 0)) ? first.touches[0] : null;
        if (srcVector && second && (second.count > 0)) {
            return calcDiff(srcVector, second.touches[0]);
        } // if

        return null;
    } // calcChange

    function calcTouchDistance(touchData) {
        if (touchData.count < 2) {
            return 0;
        } // if

        var xDist = touchData.x - touchData.next.x,
            yDist = touchData.y - touchData.next.y;

        return ~~Math.sqrt(xDist * xDist + yDist * yDist);
    } // touches

    function copyTouches(src, adjustX, adjustY) {
        adjustX = adjustX ? adjustX : 0;
        adjustY = adjustY ? adjustY : 0;

        var firstTouch = {
                x: src.x - adjustX,
                y: src.y - adjustY,
                id: src.id,
                count: src.count
            },
            touchData = firstTouch;

        while (src.next) {
            src = src.next;

            touchData = touchData.next = {
                x: src.x - adjustX,
                y: src.y - adjustY,
                id: src.id
            };
        } // while

        return firstTouch;
    } // copyTouches

    function getTouchCenter(touchData) {
        var x1 = touchData.x,
            x2 = touchData.next.x,
            y1 = touchData.y,
            y2 = touchData.next.y,
            minX = x1 < x2 ? x1 : x2,
            minY = y1 < y2 ? y1 : y2,
            width = Math.abs(x1 - x2),
            height = Math.abs(y1 - y2);

        return {
            x: minX + (width >> 1),
            y: minY + (height >> 1)
        };
    } // getTouchCenter

    function getTouchData(evt, evtProp) {
        var touches = evt[evtProp ? evtProp : 'touches'],
            firstTouch, touchData;

        if (touches.length === 0) {
            return null;
        } // if

        touchData = firstTouch = {
                x: touches[0].pageX,
                y: touches[0].pageY,
                id: touches[0].identifier,
                count: touches.length
        };

        for (var ii = 1, touchCount = touches.length; ii < touchCount; ii++) {
            touchData = touchData.next = {
                x: touches[ii].pageX,
                y: touches[ii].pageY,
                id: touches[ii].identifier
            };
        } // for

        return firstTouch;
    } // fillTouchData

    function handleTouchStart(evt) {
        if (matchTarget(evt, targetElement)) {
            offset = getOffset(targetElement);

            var changedTouches = getTouchData(evt, 'changedTouches'),
                relTouches = copyTouches(changedTouches, offset.left, offset.top);

            if (! touchesStart) {
                touchMode = TOUCH_MODE_TAP;

                observable.triggerCustom(
                    'pointerDown',
                    genEventProps('touch', evt),
                    changedTouches,
                    relTouches);
            } // if

            if (detailedEvents) {
                observable.triggerCustom(
                    'pointerDownMulti',
                    genEventProps('touch', evt),
                    changedTouches,
                    relTouches);
            } // if

            touchesStart = getTouchData(evt);

            if (touchesStart.count > 1) {
                startDistance = calcTouchDistance(touchesStart);
            } // if

            scaling = 1;

            touchesLast = copyTouches(touchesStart);
        } // if
    } // handleTouchStart

    function handleTouchMove(evt) {
        if (matchTarget(evt, targetElement)) {
            evt.preventDefault();

            touchesCurrent = getTouchData(evt);

            if (touchMode == TOUCH_MODE_TAP) {
                var cancelTap =
                        Math.abs(touchesStart.x - touchesCurrent.x) > MIN_MOVEDIST ||
                        Math.abs(touchesStart.y - touchesCurrent.y) > MIN_MOVEDIST;

                touchMode = cancelTap ? TOUCH_MODE_UNKNOWN : TOUCH_MODE_TAP;
            } // if

            if (touchMode != TOUCH_MODE_TAP) {
                touchMode = touchesCurrent.count > 1 ? TOUCH_MODE_PINCH : TOUCH_MODE_MOVE;

                if (touchMode == TOUCH_MODE_PINCH) {
                    if (touchesStart.count === 1) {
                        touchesStart = copyTouches(touchesCurrent);
                        startDistance = calcTouchDistance(touchesStart);
                    }
                    else {
                        var touchDistance = calcTouchDistance(touchesCurrent),
                            distanceDelta = Math.abs(startDistance - touchDistance);

                        if (distanceDelta < THRESHOLD_PINCHZOOM) {
                            touchMode = TOUCH_MODE_MOVE;
                        }
                        else {
                            var current = getTouchCenter(touchesCurrent),
                                currentScaling = touchDistance / startDistance,
                                scaleChange = currentScaling - scaling;

                            observable.triggerCustom(
                                'zoom',
                                genEventProps('touch', evt),
                                current,
                                pointerOffset(current, offset),
                                scaleChange,
                                'pinch'
                            );

                            scaling = currentScaling;
                        } // if..else
                    } // if..else
                } // if

                if (touchMode == TOUCH_MODE_MOVE) {
                    observable.triggerCustom(
                        'pointerMove',
                        genEventProps('touch', evt),
                        touchesCurrent,
                        copyTouches(touchesCurrent, offset.left, offset.top),
                        point(
                            touchesCurrent.x - touchesLast.x,
                            touchesCurrent.y - touchesLast.y)
                    );
                } // if

                if (detailedEvents) {
                    observable.triggerCustom(
                        'pointerMoveMulti',
                        genEventProps('touch', evt),
                        touchesCurrent,
                        copyTouches(touchesCurrent, offset.left, offset.top)
                    );
                } // if
            } // if

            touchesLast = copyTouches(touchesCurrent);
        } // if
    } // handleTouchMove

    function handleTouchEnd(evt) {
        if (matchTarget(evt, targetElement)) {
            var changedTouches = getTouchData(evt, 'changedTouches'),
                offsetTouches = copyTouches(changedTouches, offset.left, offset.top);

            touchesCurrent = getTouchData(evt);

            if (! touchesCurrent) {
                observable.triggerCustom(
                    'pointerUp',
                    genEventProps('touch', evt),
                    changedTouches,
                    offsetTouches
                );

                touchesStart = null;
            } // if

            if (detailedEvents) {
                observable.triggerCustom(
                    'pointerUpMulti',
                    genEventProps('touch', evt),
                    changedTouches,
                    offsetTouches
                );
            } // if..else
        } // if
    } // handleTouchEnd

    function initTouchData() {
        return {
            x: 0,
            y: 0,
            next: null
        };
    } // initTouchData

    /* exports */

    function unbind() {
        opts.unbinder('touchstart', handleTouchStart, false);
        opts.unbinder('touchmove', handleTouchMove, false);
        opts.unbinder('touchend', handleTouchEnd, false);
    } // unbind

    opts.binder('touchstart', handleTouchStart, false);
    opts.binder('touchmove', handleTouchMove, false);
    opts.binder('touchend', handleTouchEnd, false);

    COG.info('initialized touch handler');

    return {
        unbind: unbind
    };
}; // TouchHandler

register('pointer', {
    handler: TouchHandler,
    checks: {
        touch: true
    }
});

    return {
        register: register,
        watch: watch
    };
})();

var T5 = {};
(function(exports) {
window.animFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                setTimeout(function() {
                    callback(new Date().getTime());
                }, 1000 / 60);
            };
})();

var TWO_PI = Math.PI * 2,
    HALF_PI = Math.PI / 2;

var abs = Math.abs,
    ceil = Math.ceil,
    floor = Math.floor,
    min = Math.min,
    max = Math.max,
    pow = Math.pow,
    sqrt = Math.sqrt,
    log = Math.log,
    round = Math.round,
    sin = Math.sin,
    asin = Math.asin,
    cos = Math.cos,
    acos = Math.acos,
    tan = Math.tan,
    atan = Math.atan,
    atan2 = Math.atan2,

    proto = 'prototype',
    has = 'hasOwnProperty',
    isnan = {'NaN': 1, 'Infinity': 1, '-Infinity': 1},
    lowerCase = String[proto].toLowerCase,
    objectToString = Object[proto].toString,

    typeUndefined = 'undefined',
    typeFunction = 'function',
    typeString = 'string',
    typeObject = 'object',
    typeNumber = 'number',
    typeArray = 'array',

    isExplorerCanvas = typeof G_vmlCanvasManager != typeUndefined,
    isFlashCanvas = typeof FlashCanvas != typeUndefined;
/**
# T5
The T5 core module contains classes and functionality that support basic drawing
operations and math that are used in managing and drawing the graphical and tiling interfaces
that are provided in the Tile5 library.

## Module Functions
*/

/* exports */

/**
### ticks()
*/
function ticks() {
    return new Date().getTime();
} // getTicks

/**
### userMessage(msgType, msgKey, msgHtml)
*/
function userMessage(msgType, msgKey, msgHtml) {
    exports.trigger('userMessage', msgType, msgKey, msgHtml);
} // userMessage

/*
Dmitry Baranovskiy's wonderful is function, sourced from RaphaelJS:
https://github.com/DmitryBaranovskiy/raphael
*/
function isType(o, type) {
    type = lowerCase.call(type);
    if (type == "finite") {
        return !isnan[has](+o);
    }
    return  (type == "null" && o === null) ||
            (type == typeof o) ||
            (type == "object" && o === Object(o)) ||
            (type == "array" && Array.isArray && Array.isArray(o)) ||
            objectToString.call(o).slice(8, -1).toLowerCase() == type;
}; // is

/**
# T5.XY
This module contains simple functions for creating and manipulating an object literal that
contains an `x` and `y` value.  Previously this functionaliy lived in the T5.V module but has
been moved to communicate it's more generic implementation.  The T5.V module still exists, however,
and also exposes the functions of this module for the sake of backward compatibility.
*/
var XY = (function() {
    /* internal functions */

    /* exports */

    /**
    ### add(xy*)
    Return a new xy composite that is the value of all the xy values added together.
    */
    function add() {
        var sumX = 0, sumY = 0;
        for (var ii = arguments.length; ii--; ) {
            sumX += arguments[ii].x;
            sumY += arguments[ii].y;
        } // for

        return init(sumX, sumY);
    } // add

    /**
    ### absSize(vector)
    */
    function absSize(xy) {
        return max(abs(xy.x), abs(xy.y));
    } // absSize

    /**
    ### copy(src)
    Return a new xy composite that is a copy of the one passed to the function
    */
    function copy(src) {
        return src ? init(src.x, src.y) : null;
    } // copy

    /**
    ### diff(pt1, pt2)
    Return a point that is difference between the x and y values of `xy1` and `xy2`.
    */
    function difference(xy1, xy2) {
        return init(xy1.x - xy2.x, xy1.y - xy2.y);
    } // difference

    /**
    ### distance(xy*)
    Return the total euclidean distance between all the xy values passed to the
    function.
    */
    function distance(xy, count) {
        return edges(xy, count).total;
    } // distance

    /**
    ### edges(points, count)
    */
    function edges(points, count) {
        if (! count) {
            count = points.length;
        } // if

        if (count <= 1) {
            throw new Error("Cannot determine edge " +
                "distances for a vector array of only one vector");
        } // if

        var fnresult = {
            edges: new Array(count - 1),
            accrued: new Array(count - 1),
            total: 0
        };

        for (var ii = 0; ii < count - 1; ii++) {
            var diff = difference(points[ii], points[ii + 1]);

            fnresult.edges[ii] =
                sqrt((diff.x * diff.x) + (diff.y * diff.y));
            fnresult.accrued[ii] =
                fnresult.total + fnresult.edges[ii];

            fnresult.total += fnresult.edges[ii];
        } // for

        return fnresult;
    } // edges

    /**
    ### equals(pt1, pt2)
    Return true if the two points are equal, false otherwise.  __NOTE:__ This function
    does not automatically floor the values so if the point values are floating point
    then floating point precision errors will likely occur.
    */
    function equals(pt1, pt2) {
        return pt1.x === pt2.x && pt1.y === pt2.y;
    } // equals

    /**
    ### extendBy(xy, theta, delta)
    */
    function extendBy(xy, theta, delta) {
        var xDelta = cos(theta) * delta | 0,
            yDelta = sin(theta) * delta | 0;

        return init(xy.x - xDelta, xy.y - yDelta);
    } // extendBy

    /**
    ### floor(pt*)
    This function is used to take all the points in the array and convert them to
    integer values
    */
    function floorXY(points) {
        var results = new Array(points.length);
        for (var ii = points.length; ii--; ) {
            results[ii] = init(~~points[ii].x, ~~points[ii].y);
        } // for

        return results;
    } // floor

    /**
    ### getRect(xy*)
    Get a XYRect composite that is large enough to contain the xy values passed
    to the function.
    */
    function getRect(points) {
        var minX, minY, maxX, maxY;

        for (var ii = points.length; ii--; ) {
            var xy = points[ii];

            minX = isType(minX, typeUndefined) || xy.x < minX ? xy.x : minX;
            minY = isType(minY, typeUndefined) || xy.y < minY ? xy.y : minY;

            maxX = isType(maxX, typeUndefined) || xy.x > maxX ? xy.x : maxX;
            maxY = isType(maxY, typeUndefined) || xy.y > maxY ? xy.y : maxY;
        } // for

        return XYRect.init(minX, minY, maxX, maxY);
    } // getRect

    /**
    ### init(x, y)
    Initialize a new point that can be used in Tile5.  A point is simply an
    object literal with the attributes `x` and `y`.  If initial values are passed
    through when creating the point these will be used, otherwise 0 values will
    be used.
    */
    function init(initX, initY) {
        return {
            x: initX ? initX : 0,
            y: initY ? initY : 0
        };
    } // init

    /**
    ### invert(xy)
    Return a new composite xy value that is the inverted value of the one passed
    to the function.
    */
    function invert(xy) {
        return init(-xy.x, -xy.y);
    } // invert

    /**
    ### max(xy1, xy2)
    */
    function maxXY(xy1, xy2) {
        return init(
            xy1.x > xy2.x ? xy1.x : xy2.x,
            xy1.y > xy2.y ? xy1.y : xy2.y);
    } // max

    /**
    ### min(xy1, xy2)
    */
    function minXY(xy1, xy2) {
        return init(
            xy1.x < xy2.x ? xy1.x : xy2.x,
            xy1.y < xy2.y ? xy1.y : xy2.y);
    } // min

    /**
    ### offset(xy, offsetX, offsetY)
    Return a new composite xy which is offset by the specified amount.
    */
    function offset(xy, offsetX, offsetY) {
        return init(xy.x + offsetX, xy.y + (offsetY ? offsetY : offsetX));
    } // offset

    /**
    ### scale(xy, scaleFactor)
    Returns a new composite xy that has been scaled by the specified scale factor
    */
    function scale(xy, scaleFactor) {
        return init(xy.x / scaleFactor | 0, xy.y / scaleFactor | 0);
    } // scale

    /**
    ### simplify(xy*, generalization)
    This function is used to simplify a xy array by removing what would be considered
    'redundant' xy positions by elimitating at a similar position.
    */
    function simplify(points, generalization) {
        if (! points) {
            return null;
        } // if

        generalization = generalization ? generalization : XY.VECTOR_SIMPLIFICATION;

        var tidied = [],
            last = null;

        for (var ii = points.length; ii--; ) {
            var current = points[ii];

            include = !last || ii === 0 ||
                (abs(current.x - last.x) +
                    abs(current.y - last.y) >
                    generalization);

            if (include) {
                tidied.unshift(current);
                last = current;
            }
        } // for

        return tidied;
    } // simplify

    /**
    ### theta (xy1, xy2, distance)
    */
    function theta(xy1, xy2, distance) {
        var theta = asin((xy1.y - xy2.y) / distance);
        return xy1.x > xy2.x ? theta : Math.PI - theta;
    } // theta

    /**
    ### toString(xy)
    Return the string representation of the xy
    */
    function toString(xy) {
        return xy ? xy.x + ', ' + xy.y : '';
    } // toString

    /* module export */

    return {
        VECTOR_SIMPLIFICATION: 3,
        SIMPLIFICATION_MIN_VECTORS: 25,

        add: add,
        absSize: absSize,
        copy: copy,
        diff: difference,
        distance: distance,
        edges: edges,
        equals: equals,
        extendBy: extendBy,
        floor: floorXY,
        getRect: getRect,
        init: init,
        invert: invert,
        min: minXY,
        max: maxXY,
        offset: offset,
        scale: scale,
        simplify: simplify,
        theta: theta,
        toString: toString
    };
})();
/**
# T5.Vector
This module defines functions that are used to maintain T5.Vector objects and this
is removed from the actual Vector class to keep the Vector object lightweight.

## Functions
*/
var Vector = (function() {

    /* exports */

    function dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    } // dotProduct

    /*
    This method implements the Ramer–Douglas–Peucker algorithm for simplification instead.
    */
    function simplifyRDP(vectors, epsilon) {
        if ((! vectors) || (vectors.length <= 2)) {
            return vectors;
        } // if

        epsilon = epsilon ? epsilon : XY.VECTOR_SIMPLIFICATION;

        var distanceMax = 0,
            index = 0,
            lastIndex = vectors.length - 1,
            u,
            tailItem,
            results;

        u = unitize(vectors[0], vectors[lastIndex]);

        for (var ii = 1; ii < lastIndex; ii++) {
            var diffVector = difference(vectors[ii], vectors[0]),
                orthDist = dotProduct(diffVector, u);

            if (orthDist > distanceMax) {
                index = ii;
                distanceMax = orthDist;
            } // if
        } // for

        COG.info('max distance = ' + distanceMax + ', unitized distance vector = ', u);

        if (distanceMax >= epsilon) {
            var r1 = simplify(vectors.slice(0, index), epsilon),
                r2 = simplify(vectors.slice(index, lastIndex), epsilon);

            results = r1.slice(0, -1).concat(r2);
        }
        else {
            results = vectors;
        } // if..else

        if (tailItem) {
            results[results.length] = tailItem;
        } // if

        return results;
    } // simplify

    function unitize(v1, v2) {
        var unitLength = edges([v1, v2]).total,
            absX = unitLength !== 0 ? (v2.x - v1.x) / unitLength : 0,
            absY = unitLength !== 0 ? (v2.y - v1.y) / unitLength : 0;

        return XY.init(absX, absY);
    } // unitize

    /* define module */

    return {
        dotProduct: dotProduct
    };
})(); // vectorTools
/**
# T5.XYRect
This module provides helper functions for working with an object literal that represents a set of xy
values that represent the top-left and bottom-right corners of a rectangle respectively.

## XYRect Attributes
Calling the `T5.XYRect.init` function produces an object literal with the following
properties:


- `x1` - The x value for the top left corner
- `y1` - The y value for the top left corner
- `x2` - The x value for the bottom right corner
- `y2` - The y value for the bottom right corner
- `width` - The width of the rect
- `height` - The height of the rect


## Functions
*/
var XYRect = (function() {

    /* exports */

    /**
    ### buffer(rect, bufferX, bufferY)
    */
    function buffer(rect, bufferX, bufferY) {
        return XY.init(
            rect.x1 - bufferX,
            rect.y1 - bufferY ? bufferY : bufferX,
            rect.x1 + bufferX,
            rect.y1 + bufferY ? bufferY : bufferX);
    } // buffer

    /**
    ### center(rect)
    Return a xy composite for the center of the rect
    */
    function center(rect) {
        return XY.init(rect.x1 + (rect.width >> 1), rect.y1 + (rect.height >> 1));
    } // center

    /**
    ### copy(rect)
    Return a duplicate of the XYRect
    */
    function copy(rect) {
        return init(rect.x1, rect.y1, rect.x2, rect.y2);
    } // copy

    /**
    ### diagonalSize(rect)
    Return the distance from corner to corner of the rect
    */
    function diagonalSize(rect) {
        return sqrt(rect.width * rect.width + rect.height * rect.height);
    } // diagonalSize

    /**
    ### fromCenter(centerX, centerY, width, height)
    An alternative to the `init` function, this function can create a T5.XYRect
    given a center x and y position, width and height.
    */
    function fromCenter(centerX, centerY, width, height) {
        var halfWidth = width >> 1,
            halfHeight = height >> 1;

        return init(
            centerX - halfWidth,
            centerY - halfHeight,
            centerX + halfWidth,
            centerY + halfHeight);
    } // fromCenter

    /**
    ### init(x1, y1, x2, y2)
    Create a new XYRect composite object
    */
    function init(x1, y1, x2, y2) {
        x1 = x1 ? x1 : 0;
        y1 = y1 ? y1 : 0;
        x2 = isType(x2, typeNumber) ? x2 : x1;
        y2 = isType(y2, typeNumber) ? y2 : y2;

        return {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,

            width: x2 - x1,
            height: y2 - y1
        };
    } // init

    /**
    ### intersect(rect1, rect2)
    Returns the intersecting rect between the two specified XYRect composites
    */
    function intersect(rect1, rect2) {
        var x1 = max(rect1.x1, rect2.x1),
            y1 = max(rect1.y1, rect2.y1),
            x2 = min(rect1.x2, rect2.x2),
            y2 = min(rect1.y2, rect2.y2),
            r = init(x1, y1, x2, y2);

        return ((r.width > 0) && (r.height > 0)) ? r : null;
    } // intersect

    /**
    ### toString(rect)
    Return the string representation of the rect
    */
    function toString(rect) {
        return rect ? ('[' + rect.x1 + ', ' + rect.y1 + ', ' + rect.x2 + ', ' + rect.y2 + ']') : '';
    } // toString

    /**
    ### union(rect1, rect2)
    Return the minimum rect required to contain both of the supplied rects
    */
    function union(rect1, rect2) {
        if (rect1.width === 0 || rect1.height === 0) {
            return copy(rect2);
        }
        else if (rect2.width === 0 || rect2.height === 0) {
            return copy(rect1);
        }
        else {
            var x1 = min(rect1.x1, rect2.x1),
                y1 = min(rect1.y1, rect2.y1),
                x2 = max(rect1.x2, rect2.x2),
                y2 = max(rect1.y2, rect2.y2),
                r = init(x1, y1, x2, y2);

            return ((r.width > 0) && (r.height > 0)) ? r : null;
        } // if..else
    } // union

    /* module definition */

    return {
        buffer: buffer,
        center: center,
        copy: copy,
        diagonalSize: diagonalSize,
        fromCenter: fromCenter,
        init: init,
        intersect: intersect,
        toString: toString,
        union: union
    };
})();
/**
# T5.Dimensions
A module of utility functions for working with dimensions composites

## Dimension Attributes

Dimensions created using the init function will have the following attributes:
- `width`
- `height`


## Functions
*/
var Dimensions = (function() {

    /* exports */

    /**
    ### getAspectRatio(dimensions)
    Return the aspect ratio for the `dimensions` (width / height)
    */
    function getAspectRatio(dimensions) {
        return dimensions.height !== 0 ?
            dimensions.width / dimensions.height : 1;
    } // getAspectRatio

    /**
    ### getCenter(dimensions)
    Get the a XY composite for the center of the `dimensions` (width / 2, height  / 2)
    */
    function getCenter(dimensions) {
        return XY.init(dimensions.width >> 1, dimensions.height >> 1);
    } // getCenter

    /**
    ### getSize(dimensions)
    Get the size for the diagonal for the `dimensions`
    */
    function getSize(dimensions) {
        return sqrt(pow(dimensions.width, 2) + pow(dimensions.height, 2));
    } // getSize

    /**
    ### init(width, height)
    Create a new dimensions composite (width, height)
    */
    function init(width, height) {
        width = width ? width : 0;

        return {
            width: width,
            height: height ? height : width
        };
    } // init

    /* module definition */

    return {
        getAspectRatio: getAspectRatio,
        getCenter: getCenter,
        getSize: getSize,
        init: init
    };
})(); // dimensionTools
/**
# T5.Hits

Utility module for creating and managing hit tests and the hits that are
associated with that hit test.
*/
Hits = (function() {

    /* interials */

    /* exports */

    /**
    ### diffHits(oldHitData, newHitData)
    */
    function diffHits(oldHits, newHits) {
        var diff = [],
            objIds = {},
            ii;

        for (ii = newHits.length; ii--; ) {
            objIds[newHits[ii].target.id] = true;
        } // for

        for (ii = oldHits.length; ii--; ) {
            if (! objIds[oldHits[ii].target.id]) {
                diff[diff.length] = oldHits[ii];
            } // for
        } // for

        return diff;
    } // diff

    /**
    ### init
    */
    function init(hitType, absXY, relXY, scaledXY) {
        return {
            type: hitType,
            x: scaledXY.x | 0,
            y: scaledXY.y | 0,
            elements: [],

            absXY: absXY,
            relXY: relXY
        };
    } // init

    /**
    ### initHit(type, target, opts)
    */
    function initHit(type, target, drag) {
        return {
            type: type,
            target: target,
            drag: drag
        };
    } // initHit

    /**
    ### triggerEvent(hitData, target, evtSuffix, elements)
    */
    function triggerEvent(hitData, target, evtSuffix, elements) {
        target.triggerCustom(
            hitData.type + (evtSuffix ? evtSuffix : 'Hit'), {
                hitType: hitData.type
            },
            elements ? elements : hitData.elements,
            hitData.absXY,
            hitData.relXY,
            XY.init(hitData.x, hitData.y)
        );
    } // triggerEvent

    /* define the module */

    return {
        diffHits: diffHits,
        init: init,
        initHit: initHit,
        triggerEvent: triggerEvent
    };
})();
var INTERVAL_LOADCHECK = 100,
    INTERVAL_CACHECHECK = 10000,
    LOAD_TIMEOUT = 30000,
    imageCache = {},
    imageCount = 0,
    lastCacheCheck = new Date().getTime(),
    loadingData = {},
    loadingUrls = [],
    workerTimeout = 0;

/* internals */

function imageLoadWorker() {
    var tickCount = new Date().getTime(),
        ii = 0;

    clearTimeout(workerTimeout);
    workerTimeout = 0;


    while (ii < loadingUrls.length) {
        var url = loadingUrls[ii],
            imageData = loadingData[url],
            imageToCheck = loadingData[url].image,
            imageLoaded = isLoaded(imageToCheck),
            requestAge = tickCount - imageData.start,
            removeItem = imageLoaded || requestAge >= LOAD_TIMEOUT;

        if (imageLoaded) {
            triggerLoaded(url, imageData);
        } // if

        if (removeItem) {
            loadingUrls.splice(ii, 1);
            delete loadingData[url];
        }
        else {
            ii++;
        } // if..else
    } // while

    if (loadingUrls.length > 0) {
        workerTimeout = setTimeout(imageLoadWorker, INTERVAL_LOADCHECK);
    } // if
} // imageLoadWorker

function isLoaded(image) {
    return image && (isFlashCanvas || (image.complete && image.width > 0));
} // isLoaded

function loadImage(url, callback) {
    var data = loadingData[url];

    if (data) {
        data.callbacks.push(callback);
    }
    else {
        var imageToLoad = new Image();

        imageToLoad.id = '_ldimg' + (++imageCount);

        loadingData[url] = {
            start: new Date().getTime(),
            image: imageToLoad,
            callbacks: [callback]
        };

        imageToLoad.src = url;

        loadingUrls[loadingUrls.length] = url;
    } // if..else

    if (! workerTimeout) {
        workerTimeout = setTimeout(imageLoadWorker, INTERVAL_LOADCHECK);
    } // if
} // loadImage

function triggerLoaded(url, imageData) {
    var loadedImage = imageData.image,
        callbacks = imageData.callbacks;

    imageCache[url] = loadedImage;

    for (var ii = 0; ii < callbacks.length; ii++) {
        callbacks[ii](loadedImage, true);
    } // for
} // triggerLoaded

/**
# T5.getImage(url, callback)
This function is used to load an image and fire a callback when the image
is loaded.  The callback fires when the image is _really_ loaded (not
when the onload event handler fires).
*/
var getImage = T5.getImage = function(url, callback) {
    var image = url && callback ? imageCache[url] : null;

    if (image && isLoaded(image)) {
        callback(image);
    }
    else {
        loadImage(url, callback);
    } // if..else
};
/**
# T5.newCanvas(width, height)
*/
var newCanvas = T5.newCanvas = function(width, height) {
    var tmpCanvas = document.createElement('canvas');

    tmpCanvas.width = width ? width : 0;
    tmpCanvas.height = height ? height : 0;

    if (isFlashCanvas) {
        document.body.appendChild(tmpCanvas);
        FlashCanvas.initElement(tmpCanvas);
    } // if

    if (isExplorerCanvas) {
        G_vmlCanvasManager.initElement(tmpCanvas);
    } // if

    return tmpCanvas;
};
/**
# T5.Generator
The generator module is used to manage the registration and creation
of generators.  Image generators, etc
*/
var Generator = (function() {

    var generatorRegistry = {};

    /* private internal functions */

    /* exports */

    function init(id, params) {
        var generatorType = generatorRegistry[id],
            generator;

        if (! generatorType) {
            throw new Error('Unable to locate requested generator: ' + id);
        } // if

        return new generatorType(params);
    } // init

    function register(id, creatorFn) {
        generatorRegistry[id] = creatorFn;
    } // register

    /* module definition */

    return {
        init: init,
        register: register
    };
})();

/**
# T5.Renderer
*/
var Renderer = function(view, container, params) {

    /* internals */

    /* exports */

    return {
        /**
        ### applyStyle(style: T5.Style): string
        */
        applyStyle: function(style) {
        },

        /**
        ### applyTransform(drawable: T5.Drawable, offsetX: int, offsetY: int)
        */
        applyTransform: function(drawable, offsetX, offsetY) {
            return {
                restore: null,
                x: offsetX,
                y: offsetY
            };
        },

        checkSize: function() {
        },

        /**
        ### getDimensions()
        */
        getDimensions: function() {
            return {
                width: 0,
                height: 0
            };
        },

        /**
        ### getOffset()
        */
        getOffset: function() {
            return XY.init(0, 0);
        },

        /**
        ### getViewport()
        */
        getViewport: function() {
        },

        /**
        ### hitTest(drawData, hitX, hitY): boolean
        */
        hitTest: function(drawData, hitX, hitY) {
            return false;
        },

        /**
        ### prepare(layers, state, tickCount, hitData)
        */
        prepare: function(layers, state, tickCount, hitData) {
        },

        /**
        ### render
        */
        render: function() {
        },

        /**
        ### reset()
        */
        reset: function() {
        }
    };
};

var rendererRegistry = {};

/**
# T5.registerRenderer(id, creatorFn)
*/
var registerRenderer = exports.registerRenderer = function(id, creatorFn) {
    rendererRegistry[id] = creatorFn;
};

/**
# T5.attachRenderer(id, view, container, params)
*/
var attachRenderer = exports.attachRenderer = function(id, view, container, params) {
    var ids = id.split('/'),
        renderer = new Renderer(view, container, params);

    for (var ii = 0; ii < ids.length; ii++) {
        var rClass = rendererRegistry[ids[ii]];
        if (rClass) {
            renderer = new rClass(view, container, params, renderer);
        } // if
    } // for

    return renderer;
};
registerRenderer('canvas', function(view, container, params, baseRenderer) {
    params = COG.extend({
    }, params);

    /* internals */

    var vpWidth,
        vpHeight,
        canvas,
        context,
        viewport,
        drawOffsetX = 0,
        drawOffsetY = 0,
        transform = null,
        previousStyles = {},

        drawableDraw = function(viewX, viewY, state) {
            if (this.fill) {
                 context.fill();
            } // if

            if (this.stroke) {
                context.stroke();
            } // if
        },
        defaultDrawData = {
            draw: drawableDraw
        };

    function drawTile(tile, x, y) {
        if (tile.image) {
            context.drawImage(tile.image, x, y);
        }
        else if (! tile.loading) {
            tile.loading = true;

            getImage(tile.url, function(image, loaded) {
                tile.image = image;
                tile.loading = false;

                context.drawImage(image, tile.screenX, tile.screenY);
            });
        } // if..else
    } // drawTile

    function createCanvas() {
        if (container) {
            var isCanvas = container.tagName == 'CANVAS',
                sizeTarget = isCanvas ? container.parentNode : container;

            vpWidth = view.width = sizeTarget.offsetWidth;
            vpHeight = view.height = sizeTarget.offsetHeight;

            if (! isCanvas) {
                canvas = newCanvas(vpWidth, vpHeight);
                canvas.style.cssText = 'position: absolute; z-index: 1;';

                container.appendChild(canvas);
            }
            else {
                canvas = container;
                canvas.width = vpWidth;
                canvas.height = vpHeight;

                if (isFlashCanvas) {
                    FlashCanvas.initElement(canvas);
                } // if
            } // if..else

            context = null;
        } // if
    } // createCanvas

    /* exports */

    function applyStyle(styleId) {
        var nextStyle = getStyle(styleId),
            previousStyle = nextStyle && context && context.canvas ?
                previousStyles[context.canvas.id] :
                null;

        if (nextStyle) {
            previousStyles[context.canvas.id] = styleId;

            nextStyle.applyToContext(context);

            return previousStyle;
        } // if
    } // applyStyle

    function applyTransform(drawable) {
        var translated = drawable.translateX || drawable.translateY,
            transformed = translated || drawable.scaling !== 1 || drawable.rotatation;

        if (transformed) {
            context.save();

            transform = {
                undo: function() {
                    context.restore();
                    transform = null;
                },

                x: drawable.xy.x,
                y: drawable.xy.y
            };

            context.translate(
                drawable.xy.x - drawOffsetX + drawable.translateX,
                drawable.xy.y - drawOffsetY + drawable.translateY
            );

            if (drawable.rotation !== 0) {
                context.rotate(drawable.rotation);
            } // if

            if (drawable.scaling !== 1) {
                context.scale(drawable.scaling, drawable.scaling);
            } // if
        } // if

        return transform;
    } // applyTransform

    function arc(x, y, radius, startAngle, endAngle) {
        context.beginPath();
        context.arc(
            x - (transform ? transform.x : drawOffsetX),
            y - (transform ? transform.y : drawOffsetY),
            radius,
            startAngle,
            endAngle,
            false
        );

        return defaultDrawData;
    } // arc

    function drawTiles(tiles) {
        var tile,
            inViewport,
            offsetX = transform ? transform.x : drawOffsetX,
            offsetY = transform ? transform.y : drawOffsetY,
            minX = offsetX - 256,
            minY = offsetY - 256,
            maxX = offsetX + vpWidth,
            maxY = offsetY + vpHeight,
            relX, relY;

        for (var ii = tiles.length; ii--; ) {
            tile = tiles[ii];

            inViewport = tile.x >= minX && tile.x <= maxX &&
                tile.y >= minY && tile.y <= maxY;

            relX = tile.screenX = tile.x - offsetX;
            relY = tile.screenY = tile.y - offsetY;

            if (inViewport) {
                drawTile(tile, relX, relY);
            } // if
        } // for
    } // drawTiles

    function image(image, x, y, width, height) {
        var realX = x - (transform ? transform.x : drawOffsetX),
            realY = y - (transform ? transform.y : drawOffsetY);

        context.beginPath();
        context.rect(realX, realY, width, height);

        return {
            draw: function(viewX, viewY, state) {
                context.drawImage(image, realX, realY, width, height);
            }
        };
    } // image

    function prepare(layers, state, tickCount, hitData) {
        var ii,
            canClip = false,
            viewOffset = view.getOffset(),
            scaleFactor = view.getScaleFactor(),
            viewX = viewOffset.x,
            viewY = viewOffset.y;

        if (context) {
            context.restore();
        }
        else {
            context = canvas.getContext('2d');
        } // if..else

        for (ii = layers.length; ii--; ) {
            canClip = canClip || layers[ii].clip;
        } // for

        viewport = XYRect.init(viewX, viewY, viewX + vpWidth, viewY + vpHeight);
        viewport.scaleFactor = scaleFactor;

        if (scaleFactor !== 1) {
            var centerX = viewport.x1 + (vpWidth >> 1),
                centerY = viewport.y1 + (vpHeight >> 1);

            viewport = XYRect.fromCenter(
                centerX,
                centerY,
                vpWidth / scaleFactor | 0,
                vpHeight / scaleFactor | 0
            );
        } // if

        drawOffsetX = viewport.x1;
        drawOffsetY = viewport.y1;

        if (context) {
            if (! canClip) {
                context.clearRect(0, 0, vpWidth, vpHeight);
            } // if

            context.save();

            context.scale(scaleFactor, scaleFactor);
        } // if

        context.globalCompositeOperation = 'source-over';

        return context;
    } // prepare

    function path(points) {
        var first = true,
            offsetX = transform ? transform.x : drawOffsetX,
            offsetY = transform ? transform.y : drawOffsetY;

        context.beginPath();

        for (var ii = points.length; ii--; ) {
            var x = points[ii].x - offsetX,
                y = points[ii].y - offsetY;

            if (first) {
                context.moveTo(x, y);
                first = false;
            }
            else {
                context.lineTo(x, y);
            } // if..else
        } // for

        return defaultDrawData;
    } // path

    /* initialization */

    createCanvas();

    var _this = COG.extend(baseRenderer, {
        interactTarget: canvas,

        applyStyle: applyStyle,
        applyTransform: applyTransform,
        arc: arc,
        drawTiles: drawTiles,
        image: image,
        prepare: prepare,
        path: path,

        getContext: function() {
            return context;
        },

        getDimensions: function() {
            return {
                width: vpWidth,
                height: vpHeight
            };
        },

        getOffset: function() {
            return XY.init(drawOffsetX, drawOffsetY);
        },

        getViewport: function() {
            return viewport;
        }
    });

    return _this;
});
registerRenderer('dom', function(view, container, params, baseRenderer) {

    /* internals */

    var PROP_WK_TRANSFORM = '-webkit-transform',
        supportTransforms = typeof container.style[PROP_WK_TRANSFORM] != 'undefined',
        imageDiv = null;

    function createImageContainer() {
        imageDiv = document.createElement('div');
        imageDiv.id = COG.objId('domImages');
        imageDiv.style.cssText = COG.formatStr(
            'position: absolute; overflow: hidden; width: {0}px; height: {1}px;',
            container.offsetWidth,
            container.offsetHeight);

        container.insertBefore(imageDiv, baseRenderer.interactTarget);
    } // createImageContainer

    /* exports */

    function drawTiles(tiles) {
        var tile,
            image,
            offset = _this.getOffset(),
            viewport = _this.getViewport(),
            inViewport,
            offsetX = offset.x,
            offsetY = offset.y,
            minX = offsetX - 256,
            minY = offsetY - 256,
            maxX = offsetX + viewport.width,
            maxY = offsetY + viewport.height,
            relX, relY;

        for (var ii = tiles.length; ii--; ) {
            tile = tiles[ii];
            image = tile.image;

            inViewport = tile.x >= minX && tile.x <= maxX &&
                tile.y >= minY && tile.y <= maxY;

            relX = tile.x - offsetX;
            relY = tile.y - offsetY;

            if (! image) {
                image = tile.image = new Image();
                image.src = tile.url;

                imageDiv.appendChild(image);
                image.style.cssText = '-webkit-user-select: none; -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; position: absolute;';
            } // if

            if (supportTransforms) {
                image.style[PROP_WK_TRANSFORM] = 'translate3d(' + relX +'px, ' + relY + 'px, 0px)';
            }
            else {
                image.style.left = relX + 'px';
                image.style.top = relY + 'px';
            } // if..else

            image.style.display = 'block'; // inViewport ? 'block' : 'none';
        } // for
    } // drawTiles

    function reset() {
        imageDiv.innerHTML = '';
    } // reset

    /* initialization */

    createImageContainer();

    var _this = COG.extend(baseRenderer, {
        drawTiles: drawTiles,
        reset: reset
    });

    return _this;
});

/* internals */

var styleRegistry = {};

/**
### createStyle(params)
*/
function createStyle(params) {
    params = COG.extend({
        lineWidth: undefined,
        lineCap: undefined,
        lineJoin: undefined,
        miterLimit: undefined,
        lineStyle: undefined,

        fillStyle: undefined,

        globalAlpha: undefined,
        globalCompositeOperation: undefined
    }, params);

    var mods = [];

    /* internal functions */

    function fillMods(keyName) {
        var paramVal = params[keyName];

        if (! isType(paramVal, typeUndefined)) {
            mods.push(function(context) {
                context[keyName] = paramVal;
            });
        } // if
    } // fillMods

    function reloadMods() {
        mods = [];

        for (var keyName in params) {
            fillMods(keyName);
        } // for
    } // reloadMods

    /* exports */

    function update(keyName, keyVal) {
        params[keyName] = keyVal;
        reloadMods();
    } // update

    /* define _self */

    var _self = {
        applyToContext: function(context) {
            for (var ii = mods.length; ii--; ) {
                mods[ii](context);
            } // for
        },

        update: update
    };

    /* initialize */

    reloadMods();
    return _self;
} // createStyle

/* exports */

/**
# T5.defineStyle(id, data)
*/
var defineStyle = exports.defineStyle = function(id, data) {
    styleRegistry[id] = createStyle(data);

    return id;
};

/**
# T5.defineStyles(data)
*/
var defineStyles = exports.defineStyles = function(data) {
    for (var styleId in data) {
        defineStyle(styleId, data[styleId]);
    } // for
};

/**
# T5.getStyle(id)
*/
var getStyle = exports.getStyle = function(id) {
    return styleRegistry[id];
}; // getStyle

/**
# T5.loadStyles(path, callback)
*/
var loadStyles = exports.loadStyles = function(path) {
    COG.jsonp(path, function(data) {
        defineStyles(data);
    });
}; // loadStyles


defineStyles({
    basic: {
        lineWidth: 1,
        strokeStyle: '#000',
        fillStyle: '#fff'
    },

    waypoints: {
        lineWidth: 4,
        strokeStyle: 'rgba(0, 51, 119, 0.9)',
        fillStyle: '#FFF'
    },

    waypointsHover: {
        lineWidth: 4,
        strokeStyle: '#f00',
        fillStyle: '#FFF'
    }
});
var viewStates = {
    NONE: 0,
    ACTIVE: 1,
    ANIMATING: 4,
    PAN: 8,
    ZOOM: 16,
    FREEZE: 128
};

/**
# T5.viewState
The T5.viewState function is used to return the value of the view state requested of the function.  The
function supports a request for multiple different states and in those cases, returns a bitwise-or of the
states.

## View State Bitwise Values

- NONE = 0
- ACTIVE = 1
- _UNUSED_ = 2
- ANIMATING = 4
- PAN = 8
- ZOOM = 16
- _UNUSED_ = 32
- _UNUSED_ = 64
- FREEZE = 128


## Example Usage
~ // get the active state
~ var stateActive = T5.viewState('active');
~
~ // get the bitmask for a view state of active or panning
~ var stateActivePan = T5.viewState('active', 'pan');
~
~ // add the animating state to the stateActivePan variable
~ stateActivePan = stateActivePan | T5.viewState('animating');

~ // now test whether the updated state is still considered activate
~ if ((stateActive & stateActivePan) !== 0) {
~     // yep, we are active
~ } // if
*/
function viewState() {
    var result = 0;

    for (var ii = arguments.length; ii--; ) {
        var value = viewStates[arguments[ii].toUpperCase()];
        if (value) {
            result = result | value;
        } // if
    } // for

    return result;
} // viewState
/**
# T5.View
The View is the fundamental building block for tiling and
mapping interface.  Which this class does not implement any of
the logic required for tiling, it does handle the redraw logic.
Applications implementing Tile5 maps will not need to be aware of
the implementation specifics of the View, but for those interested
in building extensions or customizations should definitely take a look.
Additionally, it is worth being familiar with the core methods that
are implemented here around the layering as these are used extensively
when creating overlays and the like for the map implementations.

## Constructor

<pre>
var view = new T5.View(params);
</pre>

#### Initialization Parameters

- `container` (required)

- `autoSize`

- `id`

- `captureHover` - whether or not hover events should be intercepted by the View.
If you are building an application for mobile devices then you may want to set this to
false, but it's overheads are minimals given no events will be generated.

- `inertia`

- `pannable`

- `scalable`

- `panAnimationEasing`

- `panAnimationDuration`

- `fps` - (int, default = 25) - the frame rate of the view, by default this is set to
25 frames per second but can be increased or decreased to compensate for device
performance.  In reality though on slower devices, the framerate will scale back
automatically, but it can be prudent to set a lower framerate to leave some cpu for
other processes :)

- `turbo` - (bool, default = false) - whether or not all possible performance optimizations
should be implemented.  In this mode certain features such as transparent images in T5.ImageLayer
will not have these effects applied.  Additionally, clipping is disabled and clearing the background
rectangle never happens.  This is serious stuff folks.

- `zoomEasing` - (easing, default = `quad.out`) - The easing effect that should be used when
the user double taps the display to zoom in on the view.

- `zoomDuration` - (int, default = 300) - If the `zoomEasing` parameter is specified then
this is the duration for the tween.


## Events

### tapHit
This event is fired when the view has been tapped (or the left
mouse button has been pressed)
<pre>
view.bind('tapHit', function(evt, elements, absXY, relXY, offsetXY) {
});
</pre>

- elements ([]) - an array of elements that were "hit"
- absXY (T5.Vector) - the absolute position of the tap
- relXY (T5.Vector) - the position of the tap relative to the top left position of the view.
- gridXY (T5.Vector) - the xy coordinates of the tap relative to the scrolling grid offset.


### hoverHit
As per the tapHit event, but triggered through a mouse-over event.

### refresh
This event is fired once the view has gone into an idle state or every second
(configurable).
<pre>
view.bind('refresh', function(evt) {
});
</pre>

### drawComplete
Triggered when drawing the view has been completed (who would have thought).
<pre>
view.bind('drawComplete', function(evt, viewRect, tickCount) {
});
</pre>

- offset (T5.Vector) - the view offset that was used for the draw operation
- tickCount - the tick count at the start of the draw operation.


### zoomLevelChange
Triggered when the zoom level of the view has changed.  Given that Tile5 was primarily
built to serve as a mapping platform zoom levels are critical to the design so a view
has this functionality.

<pre>
view.bind('zoomLevelChange', function(evt, zoomLevel) {
});
</pre>

- zoomLevel (int) - the new zoom level


## Methods
*/
var View = function(params) {
    params = COG.extend({
        id: COG.objId('view'),
        container: "",
        captureHover: true,
        captureDrag: false,
        inertia: true,
        minRefresh: 1000,
        pannable: false,
        clipping: true,
        scalable: false,
        panAnimationEasing: COG.easing('sine.out'),
        panAnimationDuration: 750,
        pinchZoomAnimateTrigger: 400,
        autoSize: true,
        tapExtent: 10,
        guides: false,
        turbo: false,
        fps: 25,

        minZoom: 1,
        maxZoom: 1,
        renderer: 'canvas',
        zoomEasing: COG.easing('quad.out'),
        zoomDuration: 300,
        zoomLevel: 1
    }, params);

    var TURBO_CLEAR_INTERVAL = 500;

    var caps = {},
        layers = [],
        layerCount = 0,
        container = document.getElementById(params.container),
        dragObject = null,
        frameIndex = 0,
        mainContext = null,
        isIE = isType(window.attachEvent, typeFunction),
        hitFlagged = false,
        minRefresh = params.minRefresh,
        offsetX = 0,
        offsetY = 0,
        lastOffsetX = 0,
        lastOffsetY = 0,
        offsetMaxX = null,
        offsetMaxY = null,
        offsetWrapX = false,
        offsetWrapY = false,
        clipping = params.clipping,
        guides = params.guides,
        wakeTriggers = 0,
        hitData = null,
        interactOffset = null,
        interactCenter = null,
        interacting = false,
        lastRefresh = 0,
        lastClear = 0,
        lastHitData = null,
        rotation = 0,
        resizeCanvasTimeout = 0,
        scaleFactor = 1,
        scaleTween = null,
        lastScaleFactor = 0,
        lastCycleTicks = 0,
        eventMonitor = null,
        turbo = params.turbo,
        tweeningOffset = false,
        cycleDelay = 1000 / params.fps | 0,
        viewChanges = 0,
        zoomX, zoomY,
        zoomLevel = params.zoomLevel,

        /* state shortcuts */

        stateActive = viewState('ACTIVE'),
        statePan = viewState('PAN'),
        stateZoom = viewState('ZOOM'),
        stateAnimating = viewState('ANIMATING'),

        state = stateActive;

    /* event handlers */

    function handlePan(evt, x, y) {
        if (! dragObject) {
            updateOffset(offsetX - x, offsetY - y);
        } // if
    } // pan

    /* scaling functions */

    function handleZoom(evt, absXY, relXY, scaleChange, source) {
        scale(min(max(scaleFactor + pow(2, scaleChange) - 1, 0.5), 2));
    } // handleWheelZoom

    function scaleView() {
        var scaleFactorExp = log(scaleFactor) / Math.LN2 | 0;

        if (scaleFactorExp !== 0) {
            scaleFactor = pow(2, scaleFactorExp);
            setZoomLevel(zoomLevel + scaleFactorExp, zoomX, zoomY);
        }

        _self.redraw = true;
    } // scaleView

    function setZoomCenter(xy) {
    } // setZoomCenter

    function getScaledOffset(srcX, srcY) {
        var viewport = _self.getViewport(),
            invScaleFactor = 1 / scaleFactor,
            scaledX = viewport ? (viewport.x1 + srcX * invScaleFactor) : srcX,
            scaledY = viewport ? (viewport.y1 + srcY * invScaleFactor) : srcY;

        return XY.init(scaledX, scaledY);
    } // getScaledOffset

    function handleContainerUpdate(name, value) {
        container = document.getElementById(value);
        createRenderer();
    } // handleContainerUpdate

    function handleDoubleTap(evt, absXY, relXY) {
        triggerAll(
            'doubleTap',
            absXY,
            relXY,
            getScaledOffset(relXY.x, relXY.y));

        if (params.scalable) {
            scale(
                2,
                getScaledOffset(relXY.x, relXY.y),
                params.zoomEasing,
                null,
                params.zoomDuration);
        } // if
    } // handleDoubleTap

    function handlePointerDown(evt, absXY, relXY) {
        dragObject = null;

        initHitData('down', absXY, relXY);
    } // handlePointerDown

    function handlePointerHover(evt, absXY, relXY) {
        initHitData('hover', absXY, relXY);
    } // handlePointerHover

    function handlePointerMove(evt, absXY, relXY) {
        dragSelected(absXY, relXY, false);
    } // handlePointerMove

    function handlePointerUp(evt, absXY, relXY) {
        dragSelected(absXY, relXY, true);
    } // handlePointerUp

    function handleResize(evt) {
        clearTimeout(resizeCanvasTimeout);
        resizeCanvasTimeout = setTimeout(function() {
            renderer.checkSize();
        }, 250);
    } // handleResize

    function handleResync(evt, view) {
    } // handleResync

    function handleRotationUpdate(name, value) {
        rotation = value;
    } // handlePrepCanvasCallback

    function handlePointerTap(evt, absXY, relXY) {
        initHitData('tap', absXY, relXY);

        triggerAll('tap', absXY, relXY, getScaledOffset(relXY.x, relXY.y, true));
    } // handlePointerTap

    /* private functions */

    function createRenderer() {
        renderer = attachRenderer(params.renderer, _self, container);

        captureInteractionEvents();
    } // createRenderer

    function addLayer(id, value) {
        value.id = id;
        value.added = ticks();

        value.view = _self;
        value.trigger('parentChange', _self, container, mainContext);

        layers.push(value);

        layers.sort(function(itemA, itemB) {
            var result = itemB.zindex - itemA.zindex;
            if (result === 0) {
                result = itemB.added - itemA.added;
            } // if

            return result;
        });

        layerCount = layers.length;
        return value;
    } // addLayer

    function captureInteractionEvents() {
        if (eventMonitor) {
            eventMonitor.unbind();
        } // if

        if (renderer) {
            eventMonitor = INTERACT.watch(renderer.interactTarget);

            if (params.pannable) {
                eventMonitor.pannable().bind('pan', handlePan);
            } // if

            if (params.scalable) {
                eventMonitor.bind('zoom', handleZoom);
                eventMonitor.bind('doubleTap', handleDoubleTap);
            } // if

            eventMonitor.bind('pointerDown', handlePointerDown);
            eventMonitor.bind('pointerMove', handlePointerMove);
            eventMonitor.bind('pointerUp', handlePointerUp);

            if (params.captureHover) {
                eventMonitor.bind('pointerHover', handlePointerHover);
            } // if

            eventMonitor.bind('tap', handlePointerTap);
        } // if
    } // captureInteractionEvents

    /*
    The constrain offset function is used to keep the view offset within a specified
    offset using wrapping if allowed.  The function is much more 'if / then / elsey'
    than I would like, and might be optimized at some stage, but it does what it needs to
    */
    function constrainOffset(viewport, allowWrap) {
        if (! viewport) {
            return;
        } // if

        var testX = offsetWrapX ? offsetX + (viewport.width >> 1) : offsetX,
            testY = offsetWrapY ? offsetY + (viewport.height >> 1) : offsetY,
            viewWidth = viewport.width,
            viewHeight = viewport.height;

        if (offsetMaxX && offsetMaxX > viewWidth) {
            if (testX + viewWidth > offsetMaxX) {
                if (offsetWrapX) {
                    offsetX = allowWrap && (testX - offsetMaxX > 0) ? offsetX - offsetMaxX : offsetX;
                }
                else {
                    offsetX = offsetMaxX - viewWidth;
                } // if..else
            }
            else if (testX < 0) {
                offsetX = offsetWrapX ? (allowWrap ? offsetX + offsetMaxX : offsetX) : 0;
            } // if..else
        } // if

        if (offsetMaxY && offsetMaxY > viewHeight) {
            if (testY + viewHeight > offsetMaxY) {
                if (offsetWrapY) {
                    offsetY = allowWrap && (testY - offsetMaxY > 0) ? offsetY - offsetMaxY : offsetY;
                }
                else {
                    offsetY = offsetMaxY - viewHeight;
                } // if..else
            }
            else if (testY < 0) {
                offsetY = offsetWrapY ? (allowWrap ? offsetY + offsetMaxY : offsetY) : 0;
            } // if..else
        } // if
    } // constrainOffset

    function dragSelected(absXY, relXY, drop) {
        if (dragObject) {
            var scaledOffset = getScaledOffset(relXY.x, relXY.y),
                dragOk = dragObject.drag.call(
                    dragObject.target,
                    dragObject,
                    scaledOffset.x,
                    scaledOffset.y,
                    drop);

            if (dragOk) {
                _self.redraw = true;
            } // if

            if (drop) {
                dragObject = null;
            } // if
        }
    } // dragSelected

    function dragStart(hitElement, x, y) {
        var canDrag = hitElement && hitElement.drag &&
                ((! hitElement.canDrag) || hitElement.canDrag(hitElement, x, y));

        if (canDrag) {
            dragObject = hitElement;

            dragObject.startX = x;
            dragObject.startY = y;
        } // if

        return canDrag;
    } // dragStart

    function getLayerIndex(id) {
        for (var ii = layerCount; ii--; ) {
            if (layers[ii].id === id) {
                return ii;
            } // if
        } // for

        return -1;
    } // getLayerIndex

    /* draw code */

    function calcZoomRect(drawRect) {
        var invScaleFactor = 1 / scaleFactor,
            invScaleFactorNorm = (invScaleFactor - 0.5) * 2;

        zoomX = interactCenter.x + (offsetX - interactOffset.x);
        zoomY = interactCenter.y + (offsetY - interactOffset.y);

        /*
        COG.info(
            'scale factor = ' + scaleFactor +
            ', inv scale factor = ' + invScaleFactor +
            ', inv scale factor norm = ' + invScaleFactorNorm);

        COG.info('zoom x = ' + zoomX + ', y = ' + zoomY);
        COG.info('offset x = ' + offsetX + ', y = ' + offsetY);
        COG.info('interact offset x = ' + interactOffset.x + ', y = ' + interactOffset.y);
        */

        if (drawRect) {
            return XYRect.fromCenter(
                zoomX >> 0,
                zoomY >> 0,
                (drawRect.width * invScaleFactor) >> 0,
                (drawRect.height * invScaleFactor) >> 0);
        } // if
    } // calcZoomRect

    function drawView() {
        var drawLayer,
            rectCenter = XYRect.center(rect),
            rotation = Math.PI,
            ii = 0;

        /* first pass clip */

        if (canClip) {
            mainContext.beginPath();

            for (ii = layerCount; ii--; ) {
                if (layers[ii].clip) {
                    layers[ii].clip(mainContext, drawRect, drawState, _self, tickCount);
                } // if
            } // for

            mainContext.closePath();
            mainContext.clip();
        } // if

        /* second pass - draw */

        viewChanges = 0;

        triggerAll('drawComplete', rect, tickCount);
    } // drawView

    /*
    ### checkHits
    */
    function checkHits() {
        var elements = hitData ? hitData.elements : [],
            ii;

        if (lastHitData && lastHitData.type === 'hover') {
            var diffElements = Hits.diffHits(lastHitData.elements, elements);

            if (diffElements.length > 0) {
                Hits.triggerEvent(lastHitData, _self, 'Out', diffElements);
            } // if
        } // if

        if (elements.length > 0) {
            var downX = hitData.x,
                downY = hitData.y;

            for (ii = elements.length; ii--; ) {
                if (dragStart(elements[ii], downX, downY)) {
                    break;
                } // if
            } // for

            Hits.triggerEvent(hitData, _self);
        } // if

        lastHitData = elements.length > 0 ? COG.extend({}, hitData) : null;
    } // checkHits

    function cycle(tickCount) {
        var redrawBG,
            panning,
            newFrame = false;

        tickCount = tickCount ? tickCount : new Date().getTime();

        newFrame = tickCount - lastCycleTicks > cycleDelay;

        if (newFrame) {
            _self.trigger('enterFrame', tickCount, frameIndex++);

            if (tickCount - lastRefresh > minRefresh) {
                refresh();
            } // if

            lastCycleTicks = tickCount;
        }

        if (newFrame && _self.redraw) {
            panning = offsetX !== lastOffsetX || offsetY !== lastOffsetY;

            state = stateActive |
                        (scaleFactor !== 1 ? stateZoom : 0) |
                        (panning ? statePan : 0) |
                        (tweeningOffset ? stateAnimating : 0);

            redrawBG = (state & (stateZoom | statePan)) !== 0;
            interacting = redrawBG && (state & stateAnimating) === 0;

            /*
            if (offsetMaxX || offsetMaxY) {
                constrainOffset();
            } // if
            */


            if (renderer.prepare(layers, state, tickCount, hitData)) {
                var viewport = renderer.getViewport();

                for (var ii = layerCount; ii--; ) {
                    state = state | (layers[ii].animated ? stateAnimating : 0);

                    layers[ii].cycle(tickCount, viewport, state);
                } // for

                for (ii = layers.length; ii--; ) {
                    var drawLayer = layers[ii];

                    if (drawLayer.shouldDraw(state, viewport)) {
                        var previousStyle = drawLayer.style ?
                                renderer.applyStyle(drawLayer.style) :
                                null;

                        drawLayer.draw(
                            renderer,
                            state,
                            _self,
                            tickCount,
                            hitData);

                        if (previousStyle) {
                            renderer.applyStyle(previousStyle);
                        } // if
                    } // if
                } // for

                renderer.render();
            } // if

            /*
            drawView(
                state,
                cycleRect,
                clipping && clippable && (! redrawBG),
                tickCount);
            */

            if (hitData) {
                checkHits();
                hitData = null;
            } // if

            lastOffsetX = offsetX;
            lastOffsetY = offsetY;
            _self.redraw = false;
        } // if

        animFrame(cycle);
    } // cycle

    function initHitData(hitType, absXY, relXY) {
        hitData = Hits.init(hitType, absXY, relXY, getScaledOffset(relXY.x, relXY.y, true));

        for (var ii = layerCount; ii--; ) {
            hitFlagged = hitFlagged || (layers[ii].hitGuess ?
                layers[ii].hitGuess(hitData.x, hitData.y, state, _self) :
                false);
        } // for

        if (hitFlagged) {
            _self.redraw = true;
        } // if
    } // initHitData

    /* exports */

    /**
    ### detach
    If you plan on reusing a single canvas element to display different views then you
    will definitely want to call the detach method between usages.
    */
    function detach() {
        if (eventMonitor) {
            eventMonitor.unbind();
        } // if
    } // detach

    /**
    ### eachLayer(callback)
    Iterate through each of the ViewLayers and pass each to the callback function
    supplied.
    */
    function eachLayer(callback) {
        for (var ii = layerCount; ii--; ) {
            callback(layers[ii]);
        } // for
    } // eachLayer

    /**
    ### getLayer(id: String): T5.ViewLayer
    Get the ViewLayer with the specified id, return null if not found
    */
    function getLayer(id) {
        for (var ii = 0; ii < layerCount; ii++) {
            if (layers[ii].id === id) {
                return layers[ii];
            } // if
        } // for

        return null;
    } // getLayer

    /**
    ### getOffset(): T5.XY
    Return a T5.XY containing the current view offset
    */
    function getOffset() {
        return XY.init(offsetX, offsetY);
    } // getOffset

    /**
    ### getRenderer(): T5.Renderer
    */
    function getRenderer() {
        return renderer;
    } // getRenderer

    /**
    ### getScaleFactor(): float
    Return the current scaling factor
    */
    function getScaleFactor() {
        return scaleFactor;
    } // getScaleFactor

    /**
    ### getZoomLevel(): int
    Return the current zoom level of the view, for views that do not support
    zooming, this will always return a value of 1
    */
    function getZoomLevel() {
        return zoomLevel;
    }

    function invalidate() {
        _self.redraw = true;
    }

    /**
    ### setMaxOffset(maxX: int, maxY: int, wrapX: bool, wrapY: bool)
    Set the bounds of the display to the specified area, if wrapX or wrapY parameters
    are set, then the bounds will be wrapped automatically.
    */
    function setMaxOffset(maxX, maxY, wrapX, wrapY) {
        offsetMaxX = maxX;
        offsetMaxY = maxY;

        offsetWrapX = wrapX;
        offsetWrapY = wrapY;
    } // setMaxOffset

    /**
    ### getViewport(): T5.XYRect
    Return a T5.XYRect for the last drawn view rect
    */
    function getViewport() {
        var viewport, dimensions;

        if (renderer) {
            viewport = renderer.getViewport();

            if (! viewport) {
                dimensions = renderer.getDimensions();
                viewport = XYRect.init(
                    offsetX,
                    offsetY,
                    offsetX + dimensions.width,
                    offsetY + dimensions.height
                );
            }
        } // if

        return viewport;
    } // getViewport

    /**
    ### pan(x: int, y: int, tweenFn: EasingFn, tweenDuration: int, callback: fn)

    Used to pan the view by the specified x and y.  This is simply a wrapper to the
    updateOffset function that adds the specified x and y to the current view offset.
    Tweening effects can be applied by specifying values for the optional `tweenFn` and
    `tweenDuration` arguments, and if a notification is required once the pan has completed
    then a callback can be supplied as the final argument.
    */
    function pan(x, y, tweenFn, tweenDuration, callback) {
        updateOffset(offsetX + x, offsetY + y, tweenFn, tweenDuration, callback);
    } // pan

    /**
    ### setLayer(id: String, value: T5.ViewLayer)
    Either add or update the specified view layer
    */
    function setLayer(id, value) {
        for (var ii = 0; ii < layerCount; ii++) {
            if (layers[ii].id === id) {
                layers.splice(ii, 1);
                break;
            } // if
        } // for

        if (value) {
            addLayer(id, value);
            value.trigger('refresh', _self, getViewport());
        } // if

        _self.redraw = true;

        return value;
    } // setLayer

    /**
    ### refresh()
    Manually trigger a refresh on the view.  Child view layers will likely be listening for `refresh`
    events and will do some of their recalculations when this is called.
    */
    function refresh() {
        var viewport = renderer ? renderer.getViewport() : null;

        if (viewport) {
            if (offsetMaxX || offsetMaxY) {
                constrainOffset(viewport);
            } // if

            lastRefresh = new Date().getTime();
            triggerAll('refresh', _self, viewport);

            _self.redraw = true;
        } // if
    } // refresh

    /**
    ### removeLayer(id: String)
    Remove the T5.ViewLayer specified by the id
    */
    function removeLayer(id) {
        var layerIndex = getLayerIndex(id);
        if ((layerIndex >= 0) && (layerIndex < layerCount)) {
            _self.trigger('layerRemoved', layers[layerIndex]);

            layers.splice(layerIndex, 1);
            _self.redraw = true;
        } // if

        layerCount = layers.length;
    } // removeLayer

    function resetScale() {
        scaleFactor = 1;
    } // resetScale

    /**
    ### scale(targetScaling: float, targetXY: T5.XY, tweenFn: EasingFn, callback: fn)
    Scale the view to the specified `targetScaling` (1 = normal, 2 = double-size and 0.5 = half-size).
    */
    function scale(targetScaling, targetXY, tweenFn, callback, duration) {
        if (tweenFn) {
            COG.tweenValue(scaleFactor, targetScaling, tweenFn, duration, function(val, completed) {
                scaleFactor = val;

                if (completed) {
                    var scaleFactorExp = round(log(scaleFactor) / Math.LN2);

                    scaleFactor = pow(2, scaleFactorExp);

                    if (callback) {
                        callback();
                    } // if
                } // if

                setZoomCenter(targetXY);
                scaleView();
            });
        }
        else {
            scaleFactor = targetScaling;

            setZoomCenter(targetXY);
            scaleView();
        }  // if..else

        return _self;
    } // scale

    /**
    ### setZoomLevel(value: int, zoomXY: T5.XY): boolean
    This function is used to update the zoom level of the view.  The zoom level
    is checked to ensure that it falls within the `minZoom` and `maxZoom` values.  Then
    if the requested zoom level is different from the current the zoom level is updated
    and a `zoomLevelChange` event is triggered
    */
    function setZoomLevel(value, zoomX, zoomY) {
        value = max(params.minZoom, min(params.maxZoom, value));
        if (value !== zoomLevel) {
            var scaling = pow(2, value - zoomLevel),
                halfWidth = _self.width >> 1,
                halfHeight = _self.height >> 1,
                scaledHalfWidth = halfWidth / scaling | 0,
                scaledHalfHeight = halfHeight / scaling | 0;

            zoomLevel = value;

            updateOffset(
                ((zoomX ? zoomX : offsetX + halfWidth) - scaledHalfWidth) * scaling,
                ((zoomY ? zoomY : offsetY + halfHeight) - scaledHalfHeight) * scaling
            );

            lastOffsetX = offsetX;
            lastOffsetY = offsetY;

            triggerAll('zoomLevelChange', value);

            scaleFactor = 1;

            renderer.reset();

            refresh();
            _self.redraw = true;
        } // if
    } // setZoomLevel

    /**
    ### syncXY(points, reverse)
    This function is used to keep a T5.XY derivative x and y position in sync
    with it's real world location (if it has one).  T5.GeoXY are a good example
    of this.

    If the `reverse` argument is specified and true, then the virtual world
    coordinate will be updated to match the current x and y offsets.
    */
    function syncXY(points, reverse) {
    } // syncXY

    /**
    ### triggerAll(eventName: string, args*)
    Trigger an event on the view and all layers currently contained in the view
    */
    function triggerAll() {
        var cancel = _self.trigger.apply(null, arguments).cancel;
        for (var ii = layers.length; ii--; ) {
            cancel = layers[ii].trigger.apply(null, arguments).cancel || cancel;
        } // for

        return (! cancel);
    } // triggerAll


    /**
    ### updateOffset(x: int, y: int, tweenFn: EasingFn, tweenDuration: int, callback: fn)

    This function allows you to specified the absolute x and y offset that should
    become the top-left corner of the view.  As per the `pan` function documentation, tween and
    callback arguments can be supplied to animate the transition.
    */
    function updateOffset(x, y, tweenFn, tweenDuration, callback) {

        var tweensComplete = 0;

        function endTween() {
            tweensComplete += 1;

            if (tweensComplete >= 2) {
                tweeningOffset = false;

                if (callback) {
                    callback();
                } // if
            } // if
        } // endOffsetUpdate

        if (tweenFn) {
            if ((state & statePan) !== 0) {
                return;
            } // if

            COG.tweenValue(offsetX, x, tweenFn, tweenDuration, function(val, complete){
                offsetX = val | 0;

                (complete ? endTween : invalidate)();
                return !interacting;
            });

            COG.tweenValue(offsetY, y, tweenFn, tweenDuration, function(val, complete) {
                offsetY = val | 0;

                (complete ? endTween : invalidate)();
                return !interacting;
            });

            tweeningOffset = true;
        }
        else {
            offsetX = x | 0;
            offsetY = y | 0;

            _self.redraw = true;

            if (callback) {
                callback();
            } // if
        } // if..else
    } // updateOffset

    function triggerAllUntilCancelled() {
        var cancel = _self.trigger.apply(null, arguments).cancel;
        for (var ii = layers.length; ii--; ) {
            cancel = layers[ii].trigger.apply(null, arguments).cancel || cancel;
        } // for

        return (! cancel);
    } // triggerAllUntilCancelled

    /* object definition */

    var _self = {
        id: params.id,

        detach: detach,
        eachLayer: eachLayer,
        getLayer: getLayer,
        getZoomLevel: getZoomLevel,
        setLayer: setLayer,
        invalidate: invalidate,
        refresh: refresh,
        resetScale: resetScale,
        scale: scale,
        setZoomLevel: setZoomLevel,
        syncXY: syncXY,
        triggerAll: triggerAll,
        removeLayer: removeLayer,

        /* offset methods */

        getOffset: getOffset,
        getRenderer: getRenderer,
        getScaleFactor: getScaleFactor,
        setMaxOffset: setMaxOffset,
        getViewport: getViewport,
        updateOffset: updateOffset,
        pan: pan
    };

    COG.observable(_self);

    _self.bind('resync', handleResync);

    COG.configurable(
        _self, [
            'container',
            'captureHover',
            'captureDrag',
            'scalable',
            'pannable',
            'inertia',
            'minZoom',
            'maxZoom',
            'zoom'
        ],
        COG.paramTweaker(params, null, {
            'container': handleContainerUpdate,
            'inertia': captureInteractionEvents,
            'captureHover': captureInteractionEvents,
            'scalable': captureInteractionEvents,
            'pannable': captureInteractionEvents
        }),
        true);

    CANI.init(function(testResults) {
        _self.markers = addLayer('markers', new ShapeLayer({
            zindex: 20
        }));

        caps = testResults;
        createRenderer();

        /*
        canvasCaps = testResults.canvas;

        attachToCanvas();
        */

        if (isIE) {
            window.attachEvent('onresize', handleResize);
        }
        else {
            window.addEventListener('resize', handleResize, false);
        }
    });

    animFrame(cycle);

    return _self;
}; // T5.View


/**
# T5.Drawable
The T5.Shape class is simply a template class that provides placeholder methods
that need to be implemented for shapes that can be drawn in a T5.ShapeLayer.

## Constructor
`new T5.Drawable(params);`


#### Initialization Parameters

-
*/
var Drawable = function(params) {
    params = COG.extend({
        style: null,
        xy: null,
        size: null,
        fill: false,
        stroke: true,
        draggable: false,
        observable: true, // TODO: should this be true or false by default
        properties: {},
        type: 'shape'
    }, params);

    COG.extend(this, params);

    this.id = COG.objId(this.type);
    this.bounds = null;
    this.view = null;

    this.animations = 0;
    this.rotation = 0;
    this.scaling = 1;
    this.translateX = 0;
    this.translateY = 0;

    if (this.observable) {
        COG.observable(this);
    } // if
};

Drawable.prototype = {
    constructor: Drawable,

    /**
    ### animate(fn, argsStart, argsEnd, opts)
    */
    animate: function(fn, argsStart, argsEnd, opts) {
        animateDrawable(this, fn, argsStart, argsEnd, opts);
    },


    /**
    ### drag(dragData, dragX, dragY, drop)
    */
    drag: null,

    /**
    ### prep(renderer, offsetX, offsetY, state)
    Prepping the path for a shape is the main
    */
    prep: function(renderer, offsetX, offsetY, state) {
    },

    /**
    ### resync(view)
    */
    resync: function(view) {
        if (this.xy) {
            view.syncXY([this.xy]);

            if (this.size) {
                this.updateBounds(XYRect.fromCenter(
                    this.xy.x, this.xy.y, this.size, this.size));
            } // if
        } // if
    },

    /**
    ### rotate(value)
    */
    rotate: function(value) {
        this.rotation = value;
    },

    /**
    ### scale(value)
    */
    scale: function(value) {
        this.scaling = value;
    },

    /**
    ### translate(x, y)
    */
    translate: function(x, y) {
        this.translateX = x;
        this.translateY = y;
    },


    /**
    ### updateBounds(bounds: XYRect, updateXY: boolean)
    */
    updateBounds: function(bounds, updateXY) {
        this.bounds = bounds;

        if (updateXY) {
            this.xy = XYRect.center(this.bounds);
        } // if
    }
};
var ANI_WAIT = 1000 / 60 | 0,
    animateCallbacks = [],
    lastAniTicks = 0;

function runAnimationCallbacks(tickCount) {
    tickCount = tickCount ? tickCount : new Date().getTime();

    if (tickCount - lastAniTicks > ANI_WAIT) {
        var callbacks = animateCallbacks.splice(0);

        for (var ii = callbacks.length; ii--; ) {
            callbacks[ii](tickCount);
        } // for

        lastAniTicks = tickCount;
    } // if

    if (animateCallbacks.length) {
        animFrame(runAnimationCallbacks);
    } // if
} // runAnimationCallback

function registerAnimationCallback(fn) {
    var scheduleCallbacks = animateCallbacks.length == 0;

    animateCallbacks[animateCallbacks.length] = fn;

    if (scheduleCallbacks) {
        animFrame(runAnimationCallbacks);
    } // if
} // registerAnimationCallback

function animateDrawable(target, fn, argsStart, argsEnd, opts) {
    opts = COG.extend({
        easing: 'sine.out',
        duration: 1000,
        progress: null,
        complete: null,
        autoInvalidate: true
    }, opts);

    var startTicks = new Date().getTime(),
        lastTicks = 0,
        targetFn = target[fn],
        floorValue = fn == 'translate',
        argsComplete = 0,
        autoInvalidate = opts.autoInvalidate,
        animateValid = argsStart.length && argsEnd.length &&
            argsStart.length == argsEnd.length,
        argsCount = animateValid ? argsStart.length : 0,
        argsChange = new Array(argsCount),
        argsCurrent = new Array(argsCount),
        easingFn = COG.easing(opts.easing),
        duration = opts.duration,
        callback = opts.progress,
        ii,

        runTween = function(tickCount) {
            var elapsed = tickCount - startTicks,
                complete = startTicks + duration <= tickCount,
                view = target.layer ? target.layer.view : null,
                easedValue;

            for (var ii = argsCount; ii--; ) {
                easedValue = easingFn(
                    elapsed,
                    argsStart[ii],
                    argsChange[ii],
                    duration);

                argsCurrent[ii] = floorValue ? easedValue | 0 : easedValue;
            } // for

            targetFn.apply(target, argsCurrent);

            if (autoInvalidate && view) {
                view.redraw = true;
            } // if

            if (callback) {
                var cbArgs = [].concat(complete ? argsEnd : argsCurrent);

                cbArgs.unshift(complete);

                callback.apply(target, cbArgs);
            } // if

            if (! complete) {
                registerAnimationCallback(runTween);
            }
            else {
                target.animations--;
                targetFn.apply(target, argsEnd);

                if (opts.complete) {
                    opts.complete.apply(target, argsEnd);
                } // if
            } // if..else
        };

    if (targetFn && targetFn.apply && argsCount > 0) {
        duration = duration ? duration : DEFAULT_DURATION;

        for (ii = argsCount; ii--; ) {
            argsChange[ii] = argsEnd[ii] - argsStart[ii];
        } // for

        target.animations++;

        registerAnimationCallback(runTween);
    } // if
} // animate
function checkOffsetAndBounds(drawable, image) {
    var x, y;

    if (image && image.width > 0) {
        if (! drawable.imageOffset) {
            drawable.imageOffset = XY.init(
                -image.width >> 1,
                -image.height >> 1
            );
        } // if

        if (! drawable.bounds) {
            x = drawable.xy.x + drawable.imageOffset.x;
            y = drawable.xy.y + drawable.imageOffset.y;

            drawable.bounds = XYRect.init(x, y, x + image.width, y + image.height);
        } // if
    } // if
} // checkOffsetAndBounds
/**
### T5.Marker(params)
*/
function Marker(params) {
    Drawable.call(this, params);
};

Marker.prototype = COG.extend(Drawable.prototype, {
    constructor: Marker,

    prep: function(renderer, offsetX, offsetY, state) {
        return renderer.arc(this.xy.x, this.xy.y, this.size >> 1, 0, Math.PI * 2);
    } // prep
});
/**
# T5.Poly
__extends__: T5.Shape

## Constructor

`new T5.Poly(points, params)`

The constructor requires an array of vectors that represent the poly and
also accepts optional initialization parameters (see below).


#### Initialization Parameters

- `fill` (default = true) - whether or not the poly should be filled.
- `style` (default = null) - the style override for this poly.  If none
is specified then the style of the T5.PolyLayer is used.


## Methods
*/
function Poly(points, params) {
    params = COG.extend({
        simplify: false
    }, params);

    var haveData = false,
        simplify = params.simplify,
        stateZoom = viewState('ZOOM'),
        fill = params.fill,
        drawPoints = [];

    params.type = fill ? 'polygon' : 'line';

    /* exported functions */

    /**
    ### animatePath(easing, duration, drawFn, callback)
    */
    function animatePath(easing, duration, drawFn, callback) {

    } // animatePath

    /**
    ### prep(context, offsetX, offsetY, width, height, state, hitData)
    Prepare the path that will draw the polygon to the canvas
    */
    function prep(renderer, offsetX, offsetY, state) {
        return haveData ? renderer.path(drawPoints) : null;
    } // prep

    /**
    ### resync(view)
    Used to synchronize the points of the poly to the grid.
    */
    function resync(view) {
        var x, y, maxX, maxY, minX, minY;

        view.syncXY(points);

        drawPoints = XY.floor(simplify ? XY.simplify(points) : points);

        for (var ii = drawPoints.length; ii--; ) {
            x = drawPoints[ii].x;
            y = drawPoints[ii].y;

            minX = isType(minX, typeUndefined) || x < minX ? x : minX;
            minY = isType(minY, typeUndefined) || y < minY ? y : minY;
            maxX = isType(maxX, typeUndefined) || x > maxX ? x : maxX;
            maxY = isType(maxY, typeUndefined) || y > maxY ? y : maxY;
        } // for

        this.updateBounds(XYRect.init(minX, minY, maxX, maxY), true);
    } // resync

    Drawable.call(this, params);

    COG.extend(this, {
        animatePath: animatePath,
        prep: prep,
        resync: resync
    });

    haveData = points && (points.length >= 2);
};

Poly.prototype = COG.extend({}, Drawable.prototype, {
    constructor: Poly
});
/**
### T5.Line(points, params)
*/
function Line(points, params) {
    params.fill = false;

    Poly.call(this, points, params);
};

Line.prototype = COG.extend({}, Poly.prototype);
/**
# T5.ImageDrawable
_extends:_ T5.Drawable


An image annotation is simply a T5.Annotation that has been extended to
display an image rather than a simple circle.  Probably the most common type
of annotation used.  Supports using either the `image` or `imageUrl` parameters
to use preloaded or an imageurl for displaying the annotation.

## TODO

- currently hits on animated markers not working as well as they should, need to
tweak touch handling to get this better...


## Constructor
`new T5.Image(params);`

### Initialization Parameters

- `image` (HTMLImage, default = null) - one of either this or the `imageUrl` parameter
is required and the specified image is used to display the annotation.

- `imageUrl` (String, default = null) - one of either this of the `image` parameter is
required.  If specified, the image is obtained using T5.Images module and then drawn
to the canvas.

- `imageAnchor` (T5.Vector, default = null) - a T5.Vector that optionally specifies the
anchor position for an annotation.  Consider that your annotation is "pin-like" then you
would want to provide an anchor vector that specified the pixel position in the image
around the center and base of the image.  If not `imageAnchor` parameter is provided, then
the center of the image is assumed for the anchor position.

- `rotation` (float, default = 0) - the value of the rotation for the image marker
(in radians).  Be aware that applying rotation to a marker does add an extra processing
overhead as the canvas context needs to be saved and restored as part of the operation.

- `scale` (float, default = 1)

- `opacity` (float, default = 1)


## Methods
*/
function ImageDrawable(params) {
    params = COG.extend({
        image: null,
        imageUrl: null,
        imageOffset: null
    }, params);

    var dragOffset = null,
        drawableUpdateBounds = Drawable.prototype.updateBounds,
        drawX,
        drawY,
        image = params.image;

    /* exports */

    function changeImage(imageUrl) {
        this.imageUrl = imageUrl;

        if (this.imageUrl) {
            getImage(this.imageUrl, function(retrievedImage, loaded) {
                image = retrievedImage;

                if (loaded) {
                    var view = _self.layer ? _self.layer.view : null;

                    if (view) {
                        view.redraw = true;
                    } // if
                } // if
            });
        } // if
    } // changeImage

    /**
    ### drag(dragData, dragX, dragY, drop)
    */
    function drag(dragData, dragX, dragY, drop) {
        if (! dragOffset) {
            dragOffset = XY.init(
                dragData.startX - this.xy.x,
                dragData.startY - this.xy.y
            );

        }

        this.xy.x = dragX - dragOffset.x;
        this.xy.y = dragY - dragOffset.y;

        if (drop) {
            dragOffset = null;


            if (this.layer) {
                var view = this.layer.view;
                if (view) {
                    view.syncXY([this.xy], true);
                } // if
            } // if

            this.trigger('dragDrop');
        } // if

        return true;
    } // drag

    /**
    ### prep(context, offsetX, offsetY, width, height, state, hitData)
    Prepare the path that will draw the polygon to the canvas
    */
    function prep(renderer, offsetX, offsetY, width, height, state) {
        var draw = image && image.width > 0;

        if (draw) {
            checkOffsetAndBounds(this, image);

            drawX = this.xy.x + this.imageOffset.x;
            drawY = this.xy.y + this.imageOffset.y;

            return renderer.image(
                image,
                drawX,
                drawY,
                image.width,
                image.height);
        } // if
    } // prep

    /**
    ### updateBounds(bounds: XYRect, updateXY: boolean)
    */
    function updateBounds(bounds, updateXY) {
        drawableUpdateBounds.call(this, bounds, updateXY);

        checkOffsetAndBounds(this, image);
    } // setOrigin

    Drawable.call(this, params);

    var _self = COG.extend(this, {
        changeImage: changeImage,
        drag: drag,
        prep: prep,
        updateBounds: updateBounds
    });

    if (! image) {
        changeImage(this.imageUrl);
    } // if
};

ImageDrawable.prototype = COG.extend({}, Drawable.prototype, {
    constructor: ImageDrawable
});
/**
### T5.ImageMarker(params)
*/
function ImageMarker(params) {
    params = COG.extend({
        imageAnchor: null
    }, params);

    if (params.imageAnchor) {
        params.imageOffset = XY.invert(params.imageAnchor);
    } // if

    ImageDrawable.call(this, params);
};

ImageMarker.prototype = COG.extend({}, ImageDrawable.prototype, {
    constructor: ImageMarker
});

/**
# T5.ImageGenerator

## Events

### update
*/
var ImageGenerator = function(params) {
    params = COG.extend({
        relative: false,
        padding: 2
    }, params);

    /**
    ### run(viewRect, view, callback)
    */
    function run(view, viewRect, callback) {
        COG.warn('running base generator - this should be overriden');
    } // run

    var _self = {
        run: run
    };

    COG.observable(_self);
    return _self;
};
/**
# T5.ViewLayer

In and of it_self, a View does nothing.  Not without a
ViewLayer at least.  A view is made up of one or more of these
layers and they are drawn in order of *zindex*.

## Constructor
`T5.ViewLayer(params)`

### Initialization Parameters

- `id` - the id that has been assigned to the layer, this value
can be used when later accessing the layer from a View.

- `zindex` (default: 0) - a zindex in Tile5 means the same thing it does in CSS

- `validStates` - the a bitmask of DisplayState that the layer will be drawn for


## Events

### changed
This event is fired in response to the `changed` method being called.  This method is
called primarily when you have made modifications to the layer in code and need to
flag to the containing T5.View that an redraw is required.  Any objects that need to
perform updates in response to this layer changing (including overriden implementations)
can do this by binding to the change method

~ layer.bind('change', function(evt, layer) {
~   // do your updates here...
~ });

### parentChange
This event is fired with the parent of the layer has been changed

<pre>
layer.bind('parentChange', function(evt, parent) {
);
</pre>

## Methods

*/
function ViewLayer(params) {
    params = COG.extend({
        id: COG.objId('layer'),
        zindex: 0,
        animated: false,
        validStates: viewState('ACTIVE', 'ANIMATING', 'PAN', 'ZOOM'),
        style: null,
        minXY: null,
        maxXY: null
    }, params);

    this.view = null;

    COG.observable(COG.extend(this, params));
}; // ViewLayer constructor

ViewLayer.prototype = {
    constructor: ViewLayer,

    /**
    ### shouldDraw(displayState)

    Called by a View that contains the layer to determine
    whether or not the layer should be drawn for the current display state.
    The default implementation does a bitmask operation against the validStates
    property to see if the current display state is acceptable.
    */
    shouldDraw: function(displayState, viewRect) {
        return (displayState & this.validStates) !== 0;
    },

    /**
    ### clip(context, offset, dimensions, state)
    */
    clip: null,

    /**
    ### cycle(tickCount, offset, state)

    Called in the View method of the same name, each layer has an opportunity
    to update it_self in the current animation cycle before it is drawn.
    */
    cycle: function(tickCount, offset, state) {
    },

    /**
    ### draw(context, offset, dimensions, state, view)

    The business end of layer drawing.  This method is called when a layer needs to be
    drawn and the following parameters are passed to the method:

        - renderer - the renderer that will be drawing the viewlayer
        - state - the current DisplayState of the view
        - view - a reference to the View
        - tickCount - the current tick count
        - hitData - an object that contains information regarding the current hit data
    */
    draw: function(renderer, state, view, tickCount, hitData) {
    },

    /**
    ### hitGuess(hitX, hitY, state, view)
    The hitGuess function is used to determine if a layer would return elements for
    a more granular hitTest.  Essentially, hitGuess calls are used when events such
    as hover and tap events occur on a view and then if a positive result is detected
    the canvas is invalidated and checked in detail during the view layer `draw` operation.
    By doing this we can just do simple geometry operations in the hitGuess function
    and then make use of canvas functions such as `isPointInPath` to do most of the heavy
    lifting for us
    */
    hitGuess: null
}; // ViewLayer.prototype
/**
# T5.ImageLayer
*/
var ImageLayer = function(genId, params) {
    params = COG.extend({
        imageLoadArgs: {}
    }, params);

    var genFn = genId ? Generator.init(genId, params).run : null,
        lastViewRect = null,
        loadArgs = params.imageLoadArgs,
        regenTimeout = 0,
        regenViewRect = null,
        tiles = [];

    /* private internal functions */

    function regenerate(view, viewRect) {
        var xyDiff = lastViewRect ?
                Math.abs(lastViewRect.x1 - viewRect.x1) + Math.abs(lastViewRect.y1 - viewRect.y1) :
                0;

        if (genFn && ((! lastViewRect) || (xyDiff > 256))) {
            genFn(view, viewRect, function(newTiles) {
                lastViewRect = XYRect.copy(viewRect);

                tiles = [].concat(newTiles);
            });
        } // if
    } // regenerate

    /* event handlers */

    function handleRefresh(evt, view, viewRect) {
        regenerate(view, viewRect);
    } // handleViewIdle

    /* exports */

    /**
    ### draw(renderer)
    */
    function draw(renderer) {
        renderer.drawTiles(tiles);
    } // draw

    /* definition */

    var _self = COG.extend(new ViewLayer(params), {
        draw: draw
    });

    _self.bind('refresh', handleRefresh);

    return _self;
};
/**
# T5.DrawLayer
_extends:_ T5.ViewLayer


The DrawLayer is a generic layer that handles drawing, hit testing and syncing a list
of drawables.  A T5.DrawLayer itself is never meant to be implemented as it has no
internal `T5.Drawable` storage, but rather relies on descendants to implement storage and
provide the drawables by the `loadDrawables` method.

## Methods
*/
var DrawLayer = function(params) {
    params = COG.extend({
        zindex: 10
    }, params);

    var drawables = [],
        pipTransformed = CANI.canvas.pipTransformed;

    /* private functions */

    function quickHitCheck(drawable, hitX, hitY) {
        var bounds = drawable.bounds;

        return (bounds &&
            hitX >= bounds.x1 && hitX <= bounds.x2 &&
            hitY >= bounds.y1 && hitY <= bounds.y2);
    } // quickHitCheck

    /* event handlers */

    function handleRefresh(evt, view, viewRect) {
        drawables = _self.getDrawables(view, viewRect);
    } // handleViewIdle

    /* exports */

    function draw(renderer, state, view, tickCount, hitData) {
        var viewport = renderer.getViewport(),
            viewX = viewport.x1,
            viewY = viewport.y1,
            hitX = hitData ? (pipTransformed ? hitData.x - viewX : hitData.relXY.x) : 0,
            hitY = hitData ? (pipTransformed ? hitData.y - viewY : hitData.relXY.y) : 0;

        for (var ii = drawables.length; ii--; ) {
            var drawable = drawables[ii],
                dx = drawable.xy.x,
                dy = drawable.xy.y,
                overrideStyle = drawable.style || _self.style,
                styleType,
                previousStyle,
                prepped,
                isHit = false,
                transform = renderer.applyTransform(drawable, viewX, viewY);

            drawData = drawable.prep(renderer,
                transform ? transform.x : viewX,
                transform ? transform.y : viewY,
                state);

            if (drawData) {
                if (hitData && renderer.hitTest(drawData, hitX, hitY)) {
                    hitData.elements.push(Hits.initHit(
                        drawable.type,
                        drawable,
                        drawable.draggable ? drawable.drag : null)
                    );

                    styleType = hitData.type + 'Style';

                    overrideStyle = drawable[styleType] || _self[styleType] || overrideStyle;
                } // if

                previousStyle = overrideStyle ? renderer.applyStyle(overrideStyle) : null;

                if (drawData.draw) {
                    drawData.draw.call(drawable, viewX, viewY, state);
                } // if

                if (previousStyle) {
                    renderer.applyStyle(previousStyle);
                } // if
            } // if

            if (transform && transform.undo) {
                transform.undo();
            } // if
        } // for
    } // draw

    /**
    ### getDrawables(view, viewRect)
    */
    function getDrawables(view, viewRect) {
        return [];
    } // getDrawables

    /**
    ### hitGuess(hitX, hitY, state, view)
    Return true if any of the markers are hit, additionally, store the hit elements
    so we don't have to do the work again when drawing
    */
    function hitGuess(hitX, hitY, state, view) {
        var hit = false;

        for (var ii = drawables.length; (! hit) && ii--; ) {
            var drawable = drawables[ii],
                bounds = drawable.bounds;

            hit = hit || quickHitCheck(drawable, hitX, hitY);
        } // for

        return hit;
    } // hitGuess

    /* initialise _self */

    var _self = COG.extend(new ViewLayer(params), {
        draw: draw,
        getDrawables: getDrawables,
        hitGuess: hitGuess
    });

    _self.bind('refresh', handleRefresh);

    return _self;
};
/**
# T5.ShapeLayer
_extends:_ T5.DrawLayer


The ShapeLayer is designed to facilitate the storage and display of multiple
geometric shapes.  This is particularly useful for displaying [GeoJSON](http://geojson.org)
data and the like.

## Methods
*/
var ShapeLayer = function(params) {
    params = COG.extend({
        zindex: 10
    }, params);

    var shapes = [];

    /* private functions */

    function performSync(view) {
        for (var ii = shapes.length; ii--; ) {
            shapes[ii].resync(view);
        } // for

        shapes.sort(function(shapeA, shapeB) {
            var diff = shapeB.xy.y - shapeA.xy.y;
            return diff != 0 ? diff : shapeB.xy.x - shapeA.xy.y;
        });

        view.redraw = true;
    } // performSync

    /* event handlers */

    function handleResync(evt, parent) {
        performSync(parent);
    } // handleParentChange

    /* exports */

    /**
    ### find(selector: String)
    The find method will eventually support retrieving all the shapes from the shape
    layer that match the selector expression.  For now though, it just returns all shapes
    */
    function find(selector) {
        return [].concat(shapes);
    } // find

    /* initialise _self */

    var _self = COG.extend(new DrawLayer(params), {
        /**
        ### add(poly)
        Used to add a T5.Poly to the layer
        */
        add: function(shape, prepend) {
            if (shape) {
                shape.layer = _self;

                var view = _self.view;
                if (view) {
                    shape.resync(view);
                    view.redraw = true;
                } // if

                if (prepend) {
                    shapes.unshift(shape);
                }
                else {
                    shapes[shapes.length] = shape;
                } // if..else
            } // if
        },

        clear: function() {
            shapes = [];
        },

        find: find,

        getDrawables: function(view, viewRect) {
            return shapes;
        }
    });

    _self.bind('parentChange', handleResync);
    _self.bind('resync', handleResync);

    return _self;
};

    COG.extend(exports, {
        ex: COG.extend,
        is: isType,
        ticks: ticks,
        userMessage: userMessage,

        XY: XY,
        XYRect: XYRect,
        Dimensions: Dimensions,
        Vector: Vector,
        Hits: Hits,

        Generator: Generator,

        tween: COG.tween,
        tweenValue: COG.tweenValue,
        easing: COG.easing,
        Tween: COG.Tween,

        viewState: viewState,
        View: View,
        ViewLayer: ViewLayer,
        ImageLayer: ImageLayer,
        ImageGenerator: ImageGenerator,

        Drawable: Drawable,
        Marker: Marker,
        Poly: Poly,
        Line: Line,
        ImageDrawable: ImageDrawable,
        ImageMarker: ImageMarker,

        DrawLayer: DrawLayer,
        ShapeLayer: ShapeLayer
    });

    COG.observable(exports);

})(T5);
