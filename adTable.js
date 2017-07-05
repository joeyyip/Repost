/**
 * Data table for interacting with ads
 */
class AdTable {

    /**
     * Construct a data table
     * @param {jQuery} target - Append data table to target
     * @param {Array.<AdTableAction>} actions - Action buttons for the data
     *      table
     */
    constructor(target, actions) {
        var self = this;

        var container = $('<div class=""></div>').appendTo(target);

        var actionGroup = $('<div class="action-group"></div>')
                                .appendTo(container);

        var table = $('<table id="adGrid" ' +
                        'class="table table-striped table-bordered">' +
                        '</table>')
                        .appendTo(container);

        for (var idx = 0; idx < actions.length; idx++) {
            var def = actions[idx];
            var control = $('<button>' + def.label + '</button>');
            control.appendTo(actionGroup);
            control.on('click', function(event) {
                def.action(self, event)
            });
        }

        this.dtbl = table.DataTable({
            data: [],
            columns: [{
                    // TODO: Show viewCount, postedDate
                    title: 'ad title',
                    data: 'title'
                }],
            // Enable scrolling and height of datatable
            scrollY: '400px',
            paging: false,
            // Hide info text "showing 1 of 21 entries"
            info: false
        });

        table.children('tbody').on('click', 'tr', function() {
            $(this).toggleClass('selected');
        });
    }

    /**
     * Set the data provider for the data table
     * @param {Array.<Object>} data - The data provider
     */
    setData(data) {
        this.dtbl.clear();
        this.dtbl.rows.add(data);
        this.dtbl.draw();
    }

    /**
     * Get the underlying data object from the selected rows
     * @return {Array.<Object>} The data provider for the data table
     */
    getSelectedRows() {
        return this.dtbl.rows('.selected').data();
    }

    /**
     * Get the ID of the selected rows
     * @return {array.<string>} The IDs of the selected rows
     */
    getSelectedIds() {
        var selectedItems = this.getSelectedRows();
        var adIds = [];
        for (var idx = 0; idx < selectedItems.length; idx++) {
            adIds.push(selectedItems[idx].id);
        }
        return adIds;
    }
}
