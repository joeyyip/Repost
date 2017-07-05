(function() {
/**
 * API for storage operations in chrome
 *
 */

/**
 * Archiving of ad posts
 */
class Storage {

    /**
     * Make a unique ID from the request ID. It will be unique for the life
     * of the browser session. It's possible the request ID will be re-used
     * between browser sessions.
     * @param {string} requestId - Request ID
     */
    //static tempAdId(requestId) {
    //    return 'tempAdId_' + requestId;
    //}

    /**
     * Get ads from storage
     * @param {string} adId - ID of ad. Used as key in storage
     * @param {getAdsCallback} callback - Called once ads are retrieved
     */
    getAds(adId, callback) {
        chrome.storage.sync.get(adId, function(items) {
            if (chrome.runtime.lastError) {
                log.error('Unable to retrieve stored data for adId: ' + adId);
                log.error('Encountered error: '
                            + chrome.runtime.lastError.message);
                return;
            }

            if (callback) callback(items);
        });
    }

    /**
     * Store ads
     * @param {setAdsCallback} callback - Called once ads are stored
     */
    setAds(items, callback) {
        chrome.storage.sync.set(items, function() {
            if (chrome.runtime.lastError) {
                log.error('Unable to store data');
                log.error('Encountered error: '
                            + chrome.runtime.lastError.message);
                return;
            }

            if (callback) callback();
        });
    }

    /**
     * Remove saved entry for the adId
     * @param adIds  {string|array.<string>} Ad IDs to remove from storage
     */
    removeAds(adIds) {
        chrome.storage.sync.remove(adId, function() {
            if (chrome.runtime.lastError) {
                log.error('Unable to remove data for adId: ' + adId);
                log.error('Encountered error: '
                            + chrome.runtime.lastError.message);
                return;
            }
        });
    }

    /**
     * Archive the formData where key is the adId.
     * @param {object} formData - Data sent in the requestBody
     *      of a submit ad POST request.
     */
    archive(adId, formData) {
        var self = this;
        if (formData == null) return;

        // Retrieve the list of formData with this adId and replace
        this.getAds(adId, function(items) {
            // Replace existing value
            items[adId] = formData;

            self.setAds(items, function() {
                log.debug('Successfully stored data for adId: ' + adId);
                log.debug(JSON.stringify(formData));
            });
        });
    }

    /**
     * Update the key value used in storage
     * @param {string} requestId - Request ID used to initially store data
     * @param {string} adId - Ad ID to use as replacement key
     * @return {boolean} True if replacement was successful. False otherwise
     */
    //updateKey(requestId, adId) {
    //    var self = this;
    //    var storageKey = Storage.tempAdId(requestId);

    //    this.getAds(storageKey, function(items) {
    //        var formData = items[storageKey];
    //        if (formData == null) {
    //            log.error('Form data does not exist for ID: ' + storageKey);
    //            return;
    //        }

    //        // Update the adId in formData
    //        formData[FORM_DATA_KEY.ID] = [ adId ];

    //        var saveObject = {};
    //        saveObject[adId] = formData;

    //        // Save new ID to storage
    //        self.setAds(saveObject, function() {

    //            log.debug('Storage key update from ' +
    //                        storageKey + ' to ' + adId);

    //            // Remove old ID from storage
    //            self.removeAds(storageKey);
    //        });
    //    });
    //}
}

window.storage = new Storage();

/**
 * Process the completion of ad retrieval
 * @callback getAdsCallback
 * @param {object.<string, object>} items - A map of stored ads. The key is the
 *      ad ID. The value is the data object stored
 */

/**
 * Process the completion of ad storage
 * @callback setAdsCallback
 */

/* */
})();
