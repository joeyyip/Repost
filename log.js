(function() {
/**
 * Logging operations
 *
 */

/**
 * Logging
 */
class Log {

    /**
     * Init enabled channels
     */
    constructor() {
        this.enabledChannels = {};
        this.enabledChannels[LOG_DEBUG] = true;
        this.enabledChannels[LOG_ERROR] = true;
    }

    /**
     * Print a message to a logging channel
     * @param {number} channel - Category of log message
     * @param {string} msg - Log message
     */
    print(channel, msg) {
        if (this.enabledChannels[channel]) {
            console.log(channel + ': ' + msg);
        }
    }

    /**
     * Print debug message
     * @param {string} msg - Log message
     */
    debug(msg) {
        this.print(LOG_DEBUG, msg);
    }

    /**
     * Print error message
     * @param {string} msg - Log message
     */
    error(msg) {
        this.print(LOG_ERROR, msg);
    }
}

var LOG_DEBUG = 'DEBUG';
var LOG_ERROR = 'ERROR';

window.log = new Log();

/* */
})();
