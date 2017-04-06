$(document).ready(function(){
	chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
		if ( request.method == "getHTML" ) {
			if ( $("[data-adminbar]").length > 0 ) {
				sendResponse($("[data-adminbar]").val());
			}
			if ( $("[name='mtea:params']").length > 0 ) {
				sendResponse($("[name='mtea:params']").attr("content"));
			}
		}
	});
});