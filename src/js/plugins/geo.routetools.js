/**
# T5.RouteTools
__PLUGIN__: `plugins/geo.routetools.js`


## Events

## Module Methods
*/
T5.RouteTools = (function() {
    
    /* internals */
    
    var customTurnTypeRules = undefined;
    
    // define the turn types
    var TurnType = {
        Unknown: "turn-unknown",
        
        // continue maneuver
        Start: "turn-none-start",
        Continue: "turn-none",
        Arrive: "turn-none-arrive",
        
        // turn left maneuvers
        TurnLeft: "turn-left",
        TurnLeftSlight: "turn-left-slight",
        TurnLeftSharp: "turn-left-sharp",
        
        // turn right maneuvers
        TurnRight: "turn-right",
        TurnRightSlight: "turn-right-slight",
        TurnRightSharp: "turn-right-sharp",
        
        // merge maneuvers
        Merge: "merge",
        
        // uturn
        UTurnLeft:  "uturn-left",
        UTurnRight: "uturn-right",
        
        // enter roundabout maneuver
        EnterRoundabout: "roundabout-enter",
        
        // ramp maneuvers
        Ramp: "ramp",
        RampExit: "ramp-exit"
    };
    
    // EN-* manuever text matching rules 
    var DefaultTurnTypeRules = (function() {
        var rules = [];

        rules.push({
            regex: /continue/i,
            turnType: TurnType.Continue
        });

        rules.push({
            regex: /(take|bear|turn)(.*?)left/i,
            customCheck: function(text, matches) {
                var isSlight = (/bear/i).test(matches[1]);

                return isSlight ? TurnType.TurnLeftSlight : TurnType.TurnLeft;
            }
        });

        rules.push({
            regex: /(take|bear|turn)(.*?)right/i,
            customCheck: function(text, matches) {
                var isSlight = (/bear/i).test(matches[1]);

                return isSlight ? TurnType.TurnRightSlight : TurnType.TurnRight;
            }
        });

        rules.push({
            regex: /enter\s(roundabout|rotaty)/i,
            turnType: TurnType.EnterRoundabout
        });

        rules.push({
            regex: /take.*?ramp/i,
            turnType: TurnType.Ramp
        });

        rules.push({
            regex: /take.*?exit/i,
            turnType: TurnType.RampExit
        });

        rules.push({
            regex: /make(.*?)u\-turn/i,
            customCheck: function(text, matches) {
                return (/right/i).test(matches[1]) ? TurnType.UTurnRight : TurnType.UTurnLeft;
            }
        });

        rules.push({
            regex: /proceed/i,
            turnType: TurnType.Start
        });

        rules.push({
            regex: /arrive/i,
            turnType: TurnType.Arrive
        });

        // "FELL THROUGH" - WTF!
        rules.push({
            regex: /fell\sthrough/i,
            turnType: TurnType.Merge
        });

        return rules;
    })();
    
    var RouteData = function(params) {
        params = COG.extend({
            geometry: [],
            instructions: [],
            boundingBox: null
        }, params);
        
        // update the bounding box
        if (! params.boundingBox) {
            params.boundingBox = T5.Geo.BoundingBox.forPositions(params.geometry);
        } // if
        
        var _self = COG.extend({
            getInstructionPositions: function() {
                var positions = [];
                    
                for (var ii = 0; ii < params.instructions.length; ii++) {
                    if (params.instructions[ii].position) {
                        positions.push(params.instructions[ii].position);
                    } // if
                } // for
                
                return positions;
            }
        }, params);
        
        return _self;
    }; // RouteData
    
    var Instruction = function(params) {
        params = COG.extend({
            position: null,
            description: "",
            distance: 0,
            distanceTotal: 0,
            time: 0,
            timeTotal: 0,
            turnType: null
        }, params);
        
        // parse the description
        params.description = markupInstruction(params.description);
        
        // if the manuever has not been defined, then attempt to parse the description
        if (! params.turnType) {
            params.turnType = parseTurnType(params.description);
        } // if
        
        return params;
    }; // instruction
    
    // include the turntype rules based on the locale (something TODO)
    // TODO: require "localization/turntype-rules.en"
    
    /* internal functions */
    
    /*
    This function is used to cleanup a turn instruction that has been passed
    back from a routing engine.  At present it has been optimized to work with
    decarta instructions but will be modified to work with others in time
    */
    function markupInstruction(text) {
        // firstly replace all non breaking descriptions with suitable spaces
        text = text.replace(/(\w)(\/)(\w)/g, '$1 $2 $3');
        
        return text;
    } // markupInstruction
    
    /* exports */

    /**
    ### calculate(args)
    To be completed
    */
    function calculate(args) {
        args = COG.extend({
            engineId: "",
            waypoints: [],
            map: null,
            error: null,
            autoFit: true,
            success: null,
            // TODO: reimplement generalization...
            generalize: false
        }, args);
        
        // find an available routing engine
        var service = T5.Service.find('routing');
        if (service) {
            service.calculate(args, function(routeData) {
                if (args.generalize) {
                    routeData.geometry = T5.Geo.Position.generalize(routeData.geometry, routeData.getInstructionPositions());
                } // if
                
                // firstly, if we have a map defined, then let's place the route on the map
                // you know, just because we are nice like that
                if (args.map) {
                    createMapOverlay(args.map, routeData);
                    
                    // if we are to auto fit the map to the bounds, then do that now
                    if (args.autoFit) {
                        // COG.info("AUTOFITTING MAP TO ROUTE: bounds = " + routeData.boundingBox);
                        args.map.gotoBounds(routeData.boundingBox);
                    } // if
                } // if
                
                // if we have a success handler, then call it
                if (args.success) {
                    args.success(routeData);
                } // if
            });
        } // if
    } // calculate
    
    /**
    ### createMapOverlay(map, routeData)
    To be completed
    */
    function createMapOverlay(map, routeData) {
        // create a new route overlay for the specified data
        var routeOverlay = new T5.ShapeLayer();
        
        /*
        TODO: put instruction markers back on the route - maybe markers
        if (routeData.instructions) {
            var instructions = routeData.instructions,
                positions = new Array(instructions.length);
            
            for (var ii = instructions.length; ii--; ) {
                positions[ii] = instructions[ii].position;
            } // for

            Position.vectorize(positions, {
                callback: function(coords) {
                    routeOverlay.add(new T5.Points(coords, {
                        zIndex: 1
                    }));
                }
            });
        } // if
        */
        
        if (routeData.geometry) {
            T5.Geo.Position.vectorize(routeData.geometry, {
                callback: function(coords) {
                    routeOverlay.add(new T5.Line(coords, {
                        style: 'waypoints',
                        simplify: true
                    }));
                    
                    // add the overlay to the map
                    map.setLayer("route", routeOverlay);
                }
            });
        } // if
    } // createMapOverlay
    
    /**
    ### parseTurnType(text)
    To be completed
    */
    function parseTurnType(text) {
        var turnType = TurnType.Unknown,
            rules = customTurnTypeRules || DefaultTurnTypeRules;
        
        // run the text through the manuever rules
        for (var ii = 0; ii < rules.length; ii++) {
            rules[ii].regex.lastIndex = -1;
            
            var matches = rules[ii].regex.exec(text);
            if (matches) {
                // if we have a custom check defined for the rule, then pass the text in 
                // for the manuever result
                if (rules[ii].customCheck) {
                    turnType = rules[ii].customCheck(text, matches);
                }
                // otherwise, take the manuever provided by the rule
                else {
                    turnType = rules[ii].turnType;
                } // if..else
                
                break;
            } // if
        } // for
        
        return turnType;
    } // parseTurnType    
    
    var module = {
        calculate: calculate,
        createMapOverlay: createMapOverlay,
        parseTurnType: parseTurnType,
        
        TurnType: TurnType,
        Instruction: Instruction,
        RouteData: RouteData
    };
    
    // make the module observable
    COG.observable(module);
    
    return module;
})();