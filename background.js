
// TODO: Test extension with multiple Kijiji user accounts
// TODO: Support file upload. Should be the same as photo upload


/**
 * Filters for web request listeners
 */
var fraudTokenWebRequestFilter = {   
    urls: [
        '*://*.kijiji.ca/*',
        '*://*.kijiji.com/*'
    ]
};
var adPostWebRequestFilter = {
    urls: [
        '*://*.kijiji.ca/*p-submit-ad.html*',
        '*://*.kijiji.com/*p-submit-ad.html*'
    ]
};

/**
 * Stores session information.
 */
var session = (function() {

    /**
     * Maintain session info
     */
    class Session {
        constructor() {
            this._xsrfToken = null;
            this._inProgressRequestId = null;
            this._inProgressFormData = null;
        }
    }

    Object.defineProperties(Session.prototype, {
        /**
         * An xsrfToken is needed as a parameter in the formData of an ad
         * submission POST request. Otherwise, Kijiji's web server will
         * not accept the ad submission.
         */
        xsrfToken: {
            get: function() {
                return this._xsrfToken = null;
            },
            set: function(val) {
                this._xsrfToken = val;
                //log.debug('Set token: ' + this._xsrfToken);
            }
        },
        
        /**
         * An ad submission web request needs to be processed at different
         * stages of its lifecycle. Track request IDs currently in progress.
         */
        inProgressRequestId: {
            get: function() {
                return this._inProgressRequestId;
            },
            set: function(val) {
                this._inProgressRequestId = val;
                //log.debug('Set inProgressRequestId: ' +
                //            this._inProgressRequestId);
            }
        },

        /**
         * Form data for the inProgressRequestId.
         */
        inProgressFormData: {
            get: function() {
                return this._inProgressFormData;
            },
            set: function(val) {
                this._inProgressFormData = val;
            }
        }
    });

    return new Session();
})();

/**
 * Upon submitting a new ad, the request will be redirected to view the newly
 * posted ad. From this redirect, we are able to extract the ad ID assigned
 * to the latest ad post.
 * @param {string} details - response details from chrome.webRequest
 */
function processUrlRedirect(details) {
    if (!session.inProgressRequestId
            || (session.inProgressRequestId != details.requestId)) {
        return;
    }
    log.debug('Processing response');

    session.inProgressRequestId = null;

    var redirectUrl = details.redirectUrl || details.url;
    if (redirectUrl == null) {
        log.error('Redirect URL not found');
        log.error(JSON.stringify(details));
        return;
    }

    var queryStringParams = util.extractQueryStringParams(redirectUrl);
    var adId = queryStringParams[FORM_DATA_KEY.ID];
    if (adId == null) {
        log.error('Ad ID not found in redirect response. Redirect URL: ' +
                    redirectUrl);
        return;
    }
    log.debug('AdId from redirect: ' + adId);

    // TODO: Do not archive a repost
    storage.archive(adId, session.inProgressFormData);
}

// Add listener for messages from popup.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.type) {
        case 'REPOST_AD':
            var kijiji = new KijijiApi(session.xsrfToken);

            for (var idx = 0; idx < message.adIds.length; idx++) {
                kijiji.repostAd(message.adIds[idx]);
            }
            break;

        case 'POST_AD':
            var kijiji = new KijijiApi(session.xsrfToken);

            for (var idx = 0; idx < message.adIds.length; idx++) {
                kijiji.postAd(message.adIds[idx]);
            }
            break;
    }
});

// Add listener for fraud token
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (details.method !== 'POST') return;

        var formData = details.requestBody && details.requestBody.formData;
        if (formData == null) return;

        // Saving fraud token value for this session
        var token = formData[FORM_DATA_KEY.XSRF_TOKEN]
                        && formData[FORM_DATA_KEY.XSRF_TOKEN][0];
        if (token) {
            session.xsrfToken = token;
        }
    }, 
    fraudTokenWebRequestFilter,
    [ 'requestBody' ]);

// Listen to the beginning of ad submission. Hold onto the form data used in
// the ad submission. Once we extract the ad ID from the redirect response, we
// can archive the form data.
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (details.method !== 'POST') return;

        log.debug('Process ad POST request');

        var formData = details.requestBody && details.requestBody.formData;
        if (formData == null) return;

        var adId = KijijiApi.getAdIdFromFormData(formData);
        if (adId != null) {
            // This is an edit to an existing ad post
            storage.archive(adId, formData);
            return;
        }

        session.inProgressRequestId = details.requestId;
        session.inProgressFormData = formData;
    },
    adPostWebRequestFilter,
    [ 'requestBody' ]);

// Add listeners to process the response of ad submissions
chrome.webRequest.onBeforeRedirect.addListener(processUrlRedirect,
                                               adPostWebRequestFilter);
chrome.webRequest.onResponseStarted.addListener(processUrlRedirect,
                                                adPostWebRequestFilter);

// TODO: Listen to ad deletion





/*
function uploadPhoto(fileText, fileName) {
    console.log('UPLOADING image');

    var blob = new Blob([ fileText ]);
    var file = new File([ blob ], fileName);
    var button = document.createElement('button');
    button.setAttribute('Id', 'pluploadFileInput');
    document.body.appendChild(button);

    var uploader = new plupload.Uploader({
        'url': 'https://www.kijiji.ca/p-upload-image.html', 
        'browse_button': button.getAttribute('Id')
    });
    uploader.bind('FilesAdded', function(e, args) {
        console.log('FilesAdded');
    });
    uploader.bind('UploadComplete', function(e, args) {
        console.log('UploadComplete');
    });
    uploader.bind('FileUploaded', function(e, args, response) {
        console.log('FileUploaded');
        console.log(response.response);
    });
    uploader.bind('Error', function(e, args) {
        console.log('Error');
    });
    uploader.bind('PostInit', function(up) {
        up.addFile(file);
        up.start();
    });

    uploader.init();
}

*/
