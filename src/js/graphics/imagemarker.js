/**
# T5.ImageMarker
_extends:_ T5.Marker


An image annotation is simply a T5.Annotation that has been extended to 
display an image rather than a simple circle.  Probably the most common type
of annotation used.  Supports using either the `image` or `imageUrl` parameters
to use preloaded or an imageurl for displaying the annotation.

## TODO

- currently hits on animated markers not working as well as they should, need to 
tweak touch handling to get this better...


## Constructor
`new T5.ImageMarker(params);`

### Initialization Parameters

- `image` (HTMLImage, default = null) - one of either this or the `imageUrl` parameter
is required and the specified image is used to display the annotation.

- `imageUrl` (String, default = null) - one of either this of the `image` parameter is
required.  If specified, the image is obtained using T5.Images module and then drawn
to the canvas.

- `animatingImage` (HTMLImage, default = null) - an optional image that can be supplied, 
and if so, the specified image will be used when the annotation is animating rather than
the standard `image`.  If no `animatingImage` (or `animatingImageUrl`) is specified then
the standard image is used as a fallback when the marker is animating.

- `animatingImageUrl` (String, default = null) - as per the `animatingImage` but a url 
for an image that will be loaded via T5.Images

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
var ImageMarker = function(params) {
    params = COG.extend({
        image: null,
        imageUrl: null,
        animatingImage: null,
        animatingImageUrl: null,
        imageAnchor: null,
        rotation: 0,
        scale: 1,
        opacity: 1
    }, params);
    
    var dragOffset = null,
        imageOffset = params.imageAnchor ?
            T5.XY.invert(params.imageAnchor) : 
            null;
    
    function getImageUrl() {
        if (params.animatingImageUrl && self.isAnimating()) {
            // we want a smooth transition, so make 
            // sure the end image is loaded
            T5.Images.load(params.imageUrl);
            
            // return the animating image url
            return params.animatingImageUrl;
        }
        else {
            return params.imageUrl;
        } // if..else
    } // getImageUrl
    
    /* exports */
    
    function changeImage(imageUrl) {
        self.image = Images.get(imageUrl, function(loadedImage) {
            self.image = loadedImage;
        });
    } // changeImage
    
    /**
    ### drag(dragData, dragX, dragY, drop)
    */
    function drag(dragData, dragX, dragY, drop) {
        // if the drag offset is unknown then calculate
        if (! dragOffset) {
            dragOffset = XY.init(
                dragData.startX - self.xy.x, 
                dragData.startY - self.xy.y
            );

            // TODO: increase scale? to highlight dragging
        }

        // update the xy and accounting for a drag offset
        self.xy.x = dragX - dragOffset.x;
        self.xy.y = dragY - dragOffset.y;
        
        if (drop) {
            var view = self.parent ? self.parent.getParent() : null;
            
            dragOffset = null;
            
            // TODO: reset scale
            if (view) {
                view.syncXY([self.xy], true);
            } // if
            
            self.trigger('dragDrop');
        } // if
        
        return true;
    } // drag    
    
    /**
    ### drawMarker(context, offset, xy, state, overlay, view)
    An overriden implementation of the T5.Annotation.drawMarker which 
    draws an image to the canvas.
    */
    function drawMarker(context, viewRect, x, y, state, overlay, view) {
        // get the image
        var image = self.isAnimating() && self.animatingImage ? 
                self.animatingImage : self.image;
                
        if (image && (image.width > 0)) {
            if (! imageOffset) {
                imageOffset = XY.init(
                    -image.width >> 1, 
                    -image.height >> 1
                );
            } // if
            
            var currentScale = self.scale,
                drawX = x + ~~(imageOffset.x * currentScale),
                drawY = y + ~~(imageOffset.y * currentScale),
                drawWidth = ~~(image.width * currentScale),
                drawHeight = ~~(image.height * currentScale);
                
            // context.fillStyle = "#F00";
            // context.fillRect(drawX, drawY, drawWidth, drawHeight);

            // update the bounds
            self.updateBounds(drawX, drawY, drawWidth, drawWidth);
            
            // COG.info('drawing image @ x: ' + x + ', y: ' + y);
            if (self.rotation || (self.opacity !== 1)) {
                context.save();
                try {
                    context.globalAlpha = self.opacity;
                    context.translate(x, y);
                    context.rotate(self.rotation);
                
                    // draw the image
                    context.drawImage(
                        image,
                        imageOffset.x * currentScale,
                        imageOffset.y * currentScale,
                        drawWidth,
                        drawHeight);
                }
                finally {
                    context.restore();
                } // try..finally
            }
            else {
                // draw the image
                context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
            } // if..else
        } // if
    } // drawImage
    
    var self = COG.extend(new Marker(params), {
        changeImage: changeImage,
        drag: drag,
        drawMarker: drawMarker
    });
    
    if (! self.image) {
        self.image = Images.get(params.imageUrl, function(loadedImage) {
            self.image = loadedImage;
        });
    } // if
    
    if (! self.animatingImage) {
        self.animatingImage = Images.get(params.animatingImageUrl, function(loadedImage) {
            self.animatingImage = loadedImage;
        });
    } // if    
    
    return self;
};
