(function(){
/**
 * API for interacting with Kijiji
 *
 *
 */


/**
 * Keys in form data
 */
window.FORM_DATA_KEY = {
    // Ad ID
    ID: 'adId',
    // Title
    TITLE: 'postAdForm.title',
    // Fraud token
    XSRF_TOKEN: 'ca.kijiji.xsrf.token'
};


/**
 * Check the response from site and verify a success
 * @return {boolean} TRUE if response was successful. FALSE otherwise
 */
function isResponseSuccess(xhr) {
    return (xhr.status === 200);
}

/**
 * Send a post request to Kijiji
 * @param {string} url - URL to send POST request
 * @param {object} formData - Form data to use in POST request
 * @callback {postRequestCallback} callback - Called on completion of POST
 *      request
 */
function sendPostRequest(url, formData, callback) {
    if (this.fraudToken) {
        log.error('Unable to send POST request without a fraud token');
        return;
    }
    formData.set(FORM_DATA_KEY.XSRF_TOKEN, this.fraudToken);

    log.debug('Sending post request: ' + JSON.stringify(formData));

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            log.debug('Response text saved to window.responseText');
            window.responseText = xhr.responseText;
                
            if (callback) callback(xhr);
        }
    };
    xhr.send(formData);
}

/**
 * API to Kijiji
 */
class KijijiApi {

    /**
     *
     */
    constructor(fraudToken) {
        // TODO: How to get userId?
        this.userId = '1009373192';
        this.fraudToken = fraudToken;
    }

    /**
     * Get the ad ID from the form data used in a POST request
     * @param {object} formData - 
     * @return {string} ID of ad. A null an adId has not been assigned yet
     */
    static getAdIdFromFormData(formData) {
        var adId = formData[FORM_DATA_KEY.ID] && formData[FORM_DATA_KEY.ID][0];
        if (adId && adId.trim()) {
            return adId;
        } else {
            return null;
        }
    }

    /**
     * Parse the ad ID from the redirect URL that is given upon a successful
     * ad submission.
     * @param {string} url - Redirect URL after an ad submission
     * @return {string} Ad ID
     */
    static getAdIdFromUrl(url) {
        var queryStringParams = util.extractQueryStringParams(url);
        var adId = queryStringParams[FORM_DATA_KEY.ID];
        return adId;
    }

    /**
     * Retrieve ads from Kijiji
     * @param {processKijijiAds} callback - Called on completion of ad retrieval
     */
    getAds(callback) {
        log.debug('Getting ads from Kijiji');

        var formData = new FormData();
        formData.append('user', this.userId);
        formData.append('show', 'ACTIVE');
        //formData.append('isPromoting', 'false');
        //formData.append('currentOffset', '0');

        var xhr = new XMLHttpRequest();
        xhr.open('get', 'https://www.kijiji.ca/j-get-my-ads.json');
        xhr.responseType = 'json';
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (!isResponseSuccess(xhr)) {
                    xhr = null;
                    return;
                }

                var serverEntries = xhr.response && xhr.response.myAdEntries;
                serverEntries = serverEntries || [];

                if (callback) callback(serverEntries);

                xhr = null;
            }
        };
        xhr.send(formData);
    }

    /**
     * Submit ad from storage
     * @param {string} adId - ID of ad
     */
    postAd(adId) {

        log.debug('Posting ad with ad ID: ' + adId);

        // Retrieve saved form data
        // TODO: Remove this dependency on storage
        storage.getAds(adId, function(items) {

            var postData = items[adId];

            // Create FormData object
            var formData = new FormData();
            for (var key in postData) {
                var values = postData[key];
                for (var idx = 0; idx < values.length; idx++) {
                    formData.append(key, values[idx]);
                }
            }

            // Clear the ad ID. This will post a new ad.
            formData.delete(FORM_DATA_KEY.ID);

            // TODO: domain needs to match the current address
            // Send post request
            sendPostRequest('https://www.kijiji.ca/p-submit-ad.html', formData,
                function(xhr) {
                    var newAdId = KijijiApi.getAdIdFromUrl(xhr.responseURL);

                    if (!isResponseSuccess(xhr) || (newAdId == null)) {
                        log.error('Ad post failed');
                        return;
                    }

                    log.debug('Ad post successfull');
                });
        });
    }

    /**
     * Perform an ad resubmission.
     * @param {string} adId - The ID of ad to re-post
     */
    repostAd(adId) {
        var self = this;
        log.debug('Reposting ad for ad ID: ' + adId);

        // First remove the ad from site
        this.removeAd(adId, function(isSuccess) {
            if (isSuccess) {
                // Then post it again
                self.postAd(adId);
            }
        });
    }

    /**
     * Remove ad on Kijiji. The form data remains in storage.
     * @param {string} adId - ID of ad
     * @callback {removeAdCallback} callback - Called on completion on ad
     *      removal
     */
    removeAd(adId, callback) {
        log.debug('Removing ad (' + adId + ') from Kijiji');

        var deleteData = {
            reason: 'PREFER_NOT_TO_SAY',
            otherReason: ''
        };
        deleteData[FORM_DATA_KEY.ID] = adId;

        var formData = new FormData();
        formData.set('Action', 'DELETE_ADS');
        formData.set('Mode', 'ACTIVE');
        formData.set('ads', JSON.stringify([ deleteData ]));
        formData.set('needsRedirect', 'false');

        sendPostRequest('https://www.kijiji.ca/j-delete-ad.json', formData, 
            function(xhr) {
                var isSuccess = isResponseSuccess(xhr);
                if (isSuccess) {
                    log.debug('Ad successfully removed');
                } else {
                    log.error('Failed to remove ad with ad ID: ' + adId);
                }

                if (callback) callback(isSuccess);
            });
    }
}

window.KijijiApi = KijijiApi;
//window.kijiji = new KijijiApi();

/**
 * Process the completion of post request
 * @callback postRequestCallback
 * @param {object} xhr - HTTP request
 */

/**
 * Process the completion of ad retrieval
 * @callback processKijijiAds
 * @param {array.<object>} entries - Active ads return from site
 */

/* */
})();
