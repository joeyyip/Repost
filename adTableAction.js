/**
 * Definition for an action button
 */
class AdTableAction {

    /**
     * Construct a action button definition
     *
     * @param {string} label - Text on the button
     * @param {adTableActionCallback} action - Function to execute as the action
     */
    constructor(label, action) {
        this.label = label;
        this.action = action;
    }
}

/**
 * Execute an action related to a data table
 * @callback adTableActionCallback
 * @param {AdTable} table - Data table instance to perform action on
 * @param {jQuery.Event} event - 
 */
