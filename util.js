(function() {

/**
 * Utility functions
 */
class Util {
    /**
     * Extract the query string parameters in to an object containing key-value
     * pairs
     * @param {string} url - The url string.
     * @return {object} Object of key-value pairs
     */
    extractQueryStringParams(url) {
        var keyValueObject = {};

        if (url == null) return keyValueObject;

        var urlComponents = url.split('?');
        if (urlComponents.length < 2) {
            log.error('query string not found on URL');
            return keyValueObject;
        }

        var queryStr = urlComponents[1];
        var params = queryStr.split('&');

        for (var idx = 0; idx < params.length; idx++) {

            var pair = params[idx].split('=');
            if (pair.length < 2) continue;

            var key = pair[0];
            var value = pair[1];

            keyValueObject[key] = value;
        }

        return keyValueObject;
    }
}

window.util = new Util();

/* */
})();
