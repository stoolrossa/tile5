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
        centerOffset: null,
        typeName: 'Image'
    }, params);
    
    var dragOffset = null,
        drawableResync = Drawable.prototype.resync,
        drawX,
        drawY,
        imgOffsetX = 0,
        imgOffsetY = 0,
        image = params.image;
        
    /* internal functions */
    
    function checkOffsetAndBounds() {
        if (image && image.width > 0) {
            if (! this.centerOffset) {
                this.centerOffset = new XY(
                    -image.width >> 1, 
                    -image.height >> 1
                );
            } // if

            this.updateBounds(new Rect(
                this.xy.x + this.centerOffset.x,
                this.xy.y + this.centerOffset.y,
                image.width, 
                image.height), 
            false);
        } // if
    } // checkOffsetAndBounds    
            
    /* exports */
    
    function changeImage(imageUrl) {
        // update the image url
        this.imageUrl = imageUrl;
        
        // load the new image
        if (this.imageUrl) {
            var marker = this;
            
            getImage(this.imageUrl, function(retrievedImage, loaded) {
                image = retrievedImage;
                
                if (loaded) {
                    var view = _self.layer ? _self.layer.view : null;

                    // invalidate the view
                    if (view) {
                        view.invalidate();
                    } // if
                } // if
                
                checkOffsetAndBounds.apply(marker);
            });
        } // if
    } // changeImage
    
    /**
    ### drag(dragData, dragX, dragY, drop)
    */
    function drag(dragData, dragX, dragY, drop) {
        // if the drag offset is unknown then calculate
        if (! dragOffset) {
            dragOffset = new XY(
                dragData.startX - this.xy.x, 
                dragData.startY - this.xy.y
            );

            // TODO: increase scale? to highlight dragging
        }

        // update the xy and accounting for a drag offset
        this.xy.x = dragX - dragOffset.x;
        this.xy.y = dragY - dragOffset.y;
        
        if (drop) {
            dragOffset = null;
            
            // TODO: reset scale
            
            if (this.layer) {
                var view = this.layer.view;
                if (view) {
                    view.syncXY([this.xy], true);
                    view.invalidate();
                } // if
            } // if
            
            this.trigger('dragDrop');
        } // if
        
        return true;
    } // drag
    
    /**
    ### getProps(renderer, state)
    Get the drawable item properties that will be passed to the renderer during
    the prepare and draw phase
    */
    function getProps(renderer, state) {
        // check the offset and bounds
        if (! this.bounds) {
            checkOffsetAndBounds(this, image);
        } // if

        return {
            image: image,
            x: this.xy.x + imgOffsetX,
            y: this.xy.y + imgOffsetY
        };
    } // getProps
    
    function resync(view) {
        // call the inherited resync
        drawableResync.call(this, view);
        
        // now check the offset and bounds
        checkOffsetAndBounds.call(this);
    } // resync
    
    // call the inherited constructor
    Drawable.call(this, params);
    
    var _self = COG.extend(this, {
        changeImage: changeImage,
        drag: drag,
        getProps: getProps,
        resync: resync
    });

    // load the appropriate image
    if (! image) { 
        changeImage.call(this, this.imageUrl);
    } // if
    
    // if we have an image offset, then update the offsetX and Y
    if (this.centerOffset) {
        imgOffsetX = this.centerOffset.x;
        imgOffsetY = this.centerOffset.y;
    } // if
};

ImageDrawable.prototype = COG.extend({}, Drawable.prototype, {
    constructor: ImageDrawable
});