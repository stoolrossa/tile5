T5.Registry.register('generator', 'osm.cloudmade', function(view, params) {
    params = T5.ex({
        apikey: null,
        styleid: 1
    }, params);
    
    var urlFormatter = T5.formatter('http://{3}.tile.cloudmade.com/{0}/{1}/{2}/');
    view.addCopy('This product uses the <a href="http://cloudmade.com/" target="_blank">CloudMade</a> APIs, but is not endorsed or certified by CloudMade.');
    
    return T5.ex(T5.Registry.create('generator', 'osm', view, params), {
        getServerDetails: function() {
            return {
                baseUrl: urlFormatter(params.apikey, params.styleid, 256, '{0}'),
                subDomains: ['a', 'b', 'c']
            };
        }
    });
});