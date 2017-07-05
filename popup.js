document.addEventListener('DOMContentLoaded', function() {

    // TODO: Only load content when on the kijiji site. Display
    // messaging stating this requirement.

    $('<button>run</button>')
        .appendTo($('body'))
        .on('click', function() {
            // Populate active table with ads posted on the site
            new KijijiApi().getAds(function(serverEntries) {
                var ads = [];
                for (var idx = 0; idx < serverEntries.length; idx++) {
                    ads.push(new AdData(serverEntries[idx]));
                }
                
                activeTable.setData(ads);
            });

            // Populate archive table with ads from storage
            storage.getAds(null, function(items) {
                var ads = [];
                for (var adId in items) {
                    ads.push(new AdData(items[adId]));
                }

                archiveTable.setData(ads);
            });
        });
    
    var repostAction = new AdTableAction('Re-post', function(table, event) {
        chrome.runtime.sendMessage({
            type: 'REPOST_AD',
            adIds: table.getSelectedIds()
        });
    });

    var postAction = new AdTableAction('Post', function(table, event) {
        chrome.runtime.sendMessage({
            type: 'POST_AD',
            adIds: table.getSelectedIds()
        });
    });

    var activeTable = new AdTable($('body'), [ repostAction ]);
    var archiveTable = new AdTable($('body'), [ postAction ]);

});

