(function() {

/**
 * A wrapper for Kijiji ad data
 */
class AdData {

    /**
     * Get the first value in the array
     * @param {array.<object>} arr - 
     * @return {any} The first value in the array
     */
    static getFirstValue(arr) {
        return arr && arr[0];
    }

    /**
     * Construct wrapper
     * @param {object} source - The original data object from Kijiji api
     */
    constructor(source) {
        var isFormData = (source[FORM_DATA_KEY.ID] != null);
        var isKijijiServerEntry = (source.id != null);

        if (isFormData) {
            this.source = source;
            this.id = AdData.getFirstValue(source[FORM_DATA_KEY.ID]);
            //this.date = source.date;
            this.title = AdData.getFirstValue(source[FORM_DATA_KEY.TITLE]);
            //this.url = source.url;
            //this.viewCounter = source.viewCounter;
        } else if (isKijijiServerEntry) {
            this.source = source;
            this.id = source.id;
            this.date = source.date;
            this.title = source.title;
            this.url = source.url;
            this.viewCounter = source.viewCounter;
        }
    }
}

window.AdData = AdData;

/* */
})();
