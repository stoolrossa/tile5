registerRenderer('canvas', function(view, container, params, baseRenderer) {
    params = COG.extend({
    }, params);
    
    /* internals */
    
    var vpWidth,
        vpHeight,
        canvas,
        context,
        drawOffsetX = 0,
        drawOffsetY = 0,
        transform = null,
        pipTransformed = CANI.canvas.pipTransformed,
        previousStyles = {},
        
        defaultDrawFn = function(drawData) {
            if (this.fill) {
                 context.fill();
            } // if
            
            if (this.stroke) {
                context.stroke();
            } // if
        };
        
    // TODO (0.9.7): remove the canvas detection and assume that we have been passed a div
    function createCanvas() {
        if (container) {
            var isCanvas = container.tagName == 'CANVAS',
                sizeTarget = isCanvas ? container.parentNode : container;
            
            // initialise the viewport height and width
            vpWidth = view.width = sizeTarget.offsetWidth;
            vpHeight = view.height = sizeTarget.offsetHeight;
            
            if (! isCanvas) {
                // create the canvas
                canvas = newCanvas(vpWidth, vpHeight);
                canvas.style.cssText = 'position: absolute; z-index: 1;';

                // add the canvas to the container
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
    
    function initDrawData(viewport, hitData, state, drawFn) {
        var isHit = false;
        
        // check for a hit
        if (hitData) {
            var hitX = pipTransformed ? hitData.x - drawOffsetX : hitData.relXY.x,
                hitY = pipTransformed ? hitData.y - drawOffsetY : hitData.relXY.y;
                
            isHit = context.isPointInPath(hitX, hitY);
        } // if
        
        return {
            // initialise core draw data properties
            draw: drawFn || defaultDrawFn,
            viewport: viewport,
            state: state,
            hit: isHit,
            vpX: drawOffsetX,
            vpY: drawOffsetY,
            
            // and the extras given we have a canvas implementation
            context: context
        };
    } // initDrawData
    
    /* exports */
    
    function applyStyle(styleId) {
        var nextStyle = getStyle(styleId),
            previousStyle = nextStyle && context && context.canvas ? 
                previousStyles[context.canvas.id] : 
                null;

        if (nextStyle) {
            // if we have a style change then make the change
            previousStyles[context.canvas.id] = styleId;

            // apply the style
            nextStyle.applyToContext(context);

            // return the previously selected style
            return previousStyle;        
        } // if
    } // applyStyle
    
    function applyTransform(drawable) {
        var translated = drawable.translateX !== 0 || drawable.translateY !== 0,
            transformed = translated || drawable.scaling !== 1 || drawable.rotation !== 0;
            
        if (transformed) {
            context.save();
            
            // initialise the transform
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
    
    function drawTiles(viewport, tiles) {
        var tile,
            inViewport,
            minX = drawOffsetX - 256,
            minY = drawOffsetY - 256,
            maxX = viewport.x2,
            maxY = viewport.y2;
            
        for (var ii = tiles.length; ii--; ) {
            tile = tiles[ii];
            
            // check whether the image is in the viewport or not
            inViewport = tile.x >= minX && tile.x <= maxX && 
                tile.y >= minY && tile.y <= maxY;
                
            // show or hide the image depending on whether it is in the viewport
            if (inViewport) {
                if (! tile.loaded) {
                    tile.load(view.invalidate);
                }
                else {
                    context.drawImage(
                        tile.image, 
                        tile.x - drawOffsetX, 
                        tile.y - drawOffsetY);
                } // if..else
            } // if
        } // for
    } // drawTiles
    
    /**
    ### hitTest(drawData, hitX, hitY): boolean
    */
    function hitTest(drawData, hitX, hitY) {
        return context.isPointInPath(hitX, hitY);
    } // hitTest
    
    function prepare(layers, viewport, state, tickCount, hitData) {
        var ii,
            canClip = false,
            targetVP = viewport.scaled || viewport,
            scaleFactor = viewport.scaleFactor;
            
        // if we already have a context, then restore
        if (context) {
            context.restore();
        }
        else {
            // get the context
            context = canvas.getContext('2d');
        } // if..else
        
        // check to see if we can clip
        for (ii = layers.length; ii--; ) {
            canClip = canClip || layers[ii].clip;
        } // for
        
        // update the offset x and y
        drawOffsetX = targetVP.x;
        drawOffsetY = targetVP.y;
        
        if (context) {
            // if we can't clip then clear the context
            if (! canClip) {
                context.clearRect(0, 0, vpWidth, vpHeight);
            } // if

            // save the context
            context.save();
            
            // scale the context
            context.scale(scaleFactor, scaleFactor);
        } // if
        
        // initialise the composite operation
        context.globalCompositeOperation = 'source-over';

        return context;
    } // prepare
    
    /**
    ### prepArc(drawable, viewport, hitData, state, opts)
    */
    function prepArc(drawable, viewport, hitData, state, opts) {
        context.beginPath();
        context.arc(
            drawable.xy.x - (transform ? transform.x : drawOffsetX),
            drawable.xy.y - (transform ? transform.y : drawOffsetY),
            drawable.size >> 1,
            drawable.startAngle,
            drawable.endAngle,
            false
        );
        
        return initDrawData(viewport, hitData, state);
    } // prepArc
    
    /**
    ### prepImage(drawable, viewport, hitData, state, opts)
    */
    function prepImage(drawable, viewport, hitData, state, opts) {
        var realX = (opts.x || drawable.xy.x) - (transform ? transform.x : drawOffsetX),
            realY = (opts.y || drawable.xy.y) - (transform ? transform.y : drawOffsetY),
            image = opts.image || drawable.image;
        
        if (image) {
            // open the path for hit tests
            context.beginPath();
            context.rect(
                realX, 
                realY, 
                opts.width || image.width, 
                opts.height || image.height
            );

            return initDrawData(viewport, hitData, state, function(drawData) {
                context.drawImage(
                    image, 
                    realX, 
                    realY,
                    opts.width || image.width,
                    opts.height || image.height
                );
            });
        }
    } // prepImage
    
    /**
    ### prepPoly(drawable, viewport, hitData, state, opts)
    */
    function prepPoly(drawable, viewport, hitData, state, opts) {
        var first = true,
            points = opts.points || drawable.points,
            offsetX = transform ? transform.x : drawOffsetX,
            offsetY = transform ? transform.y : drawOffsetY;

        context.beginPath();
        
        // now draw the lines
        // COG.info('drawing poly: have ' + drawVectors.length + ' vectors');
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
        
        return initDrawData(viewport, hitData, state);
    } // prepPoly    
    
    /* initialization */
    
    // initialise the container
    createCanvas();

    var _this = COG.extend(baseRenderer, {
        interactTarget: canvas,
        
        applyStyle: applyStyle,
        applyTransform: applyTransform,
        drawTiles: drawTiles,
        
        hitTest: hitTest,
        prepare: prepare,

        prepArc: prepArc,
        prepImage: prepImage,
        prepPoly: prepPoly,
        
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
            return new XY(drawOffsetX, drawOffsetY);
        }
        
        /*
        render: function(viewport) {
            context.strokeStyle = '#F00';
            context.moveTo(0, viewport.h >> 1);
            context.lineTo(viewport.w, viewport.h >> 1);
            context.moveTo(viewport.w >> 1, 0);
            context.lineTo(viewport.w >> 1, viewport.h);
            context.stroke();
        }
        */
    });
    
    return _this;
});