/**
# LAYER: cluster (plugin)
*/
T5.Registry.register('layer', 'cluster', function(view, params) {
    params = T5.ex({
        dist: 32,
        source: null
    }, params);

    /* internals */

    var sourceLayer = view.layer(params.source),
        bucketSize = params.dist,
        clusterCheckTimeout = 0;

    function calcAverageXY(markers, syncer) {

        function avg() {
            var sum = 0;
            for (var ii = arguments.length; ii--; ) {
                sum += arguments[ii];
            } // for

            return sum / arguments.length | 0;
        } // avg

        var xValues = [],
            yValues = [];

        for (var ii = markers.length; ii--; ) {
            xValues[ii] = markers[ii].xy.x;
            yValues[ii] = markers[ii].xy.y;
        } // for

        return new T5.XY(avg.apply(null, xValues), avg.apply(null, yValues));
    } // calcAverageXY

    function findBroadClusters() {
        var testMarkers = [],
            drawables = sourceLayer.find({
                typeName: 'Marker'
            }),
            layerHash = {},
            ii;

        for (ii = drawables.length; ii--; ) {
            var xy = drawables[ii].xy,
                bucketX = xy.x / bucketSize | 0,
                bucketY = xy.y / bucketSize | 0,
                bucketId = bucketX + '_' + bucketY,
                bucket = layerHash[bucketId];

            if (! bucket) {
                bucket = layerHash[bucketId] = [];
            } // if

            bucket[bucket.length] = drawables[ii];
        } // for

        return layerHash;
    } // findClusters

    function findNearestCluster(targetX, targetY) {
        var clusters = _self.find(),
            nearestCluster = null,
            minDist = Infinity;

        for (var ii = clusters.length; ii--; ) {
            var testX = clusters[ii].xy.x,
                testY = clusters[ii].xy.y,
                xDiff = targetX - testX,
                yDiff = targetY - testY,
                dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

            if (dist < minDist) {
                nearestCluster = clusters[ii];
                minDist = dist;
            } // if
        } // for

        return minDist <= bucketSize ? nearestCluster : null;
    } // findNearestCluster

    function handleMarkerAdded(evt, marker) {
        clearTimeout(clusterCheckTimeout);
        clusterCheckTimeout = setTimeout(rebuild, 100);
    } // handlerMarkerAdded

    function handleMarkersCleared(evt) {
    } // handleMarkersCleared

    function rebuild() {
        T5.log('marker(s) added, need to check for cluster changes');
        var hash = findBroadClusters(),
            markers = sourceLayer.find({
                typeName: 'Marker'
            });

        for (var ii = markers.length; ii--; ) {
            if (! markers[ii].cluster) {
                var markerXY = markers[ii].xy,
                    cluster = findNearestCluster(markerXY.x, markerXY.y);

                if (! cluster) {
                    cluster = _self.create('marker', T5.ex({}, markers[ii], {
                        children: []
                    }));
                } // if

                cluster.children.push(markers[ii]);
                cluster.size += 1;

                markers[ii].cluster = cluster;
            } // if
        } // for
    } // rebuild

    function shouldCluster(hash) {
        var shouldCluster = false;

        for (var quad in hash) {
            shouldCluster = shouldCluster || hash[quad].length > 1;
        } // for

        return shouldCluster;
    } // processClusters

    /* exports */

    var _self = T5.Registry.create('layer', 'draw', view, params);

    if (sourceLayer) {
        sourceLayer.bind('markerAdded', handleMarkerAdded);
        sourceLayer.bind('cleared', handleMarkersCleared);

        sourceLayer.visible = false;
    }
    else {
        T5.log('No source matching source layer, won\'t be clustering much today folks...', 'warn');
    } // if..else

    return _self;
});