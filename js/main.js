/* MEMO
	BackGround(Event) Page = 後ろで動いているページ（権限強い、DOMアクセス不可）
	ContentScripts = 指定したドメインで読み込まれる追加JS（権限弱い、DOMアクセス可）
	BrowserAction = タスクバーから実行されるポップアップ（権限普通、DOMアクセス不可）
	http://www.apps-gcp.com/calendar-extension/
*/

$(document).ready(function()　{
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		// chrome.tabs.sendMessage(tabs[0].id, { method: "getHTML" }, function(response) {

		function getHTML() {
			return "<!DOCTYPE html><html>" + document.head.outerHTML + "</html>";
		}

		chrome.tabs.executeScript(tabs[0].id, {
			code: '(' + getHTML + ')();'
		}, (results) => {
			var $html = $(results[0]);

			if ( $html.filter("[data-adminbar]").length > 0 ) {
				response = $html.filter("[data-adminbar]").val();
			}
			if ( $html.filter("[name='mtea:params']").length > 0 ) {
				response = $html.filter("[name='mtea:params']").attr("content");
			}

			var json = response;
			var params;
			var page_tmpl;
			var url;

			//設定値を復元
			$("[data-js-urls]").each(function() {
				var urls = localStorage.getItem("urls");

				if ( urls ) {
					urls = JSON.parse(urls);
				}
				else {
					urls = [];
				}

				$(this).append("<option />");

				for ( var i=0; i<urls.length; i++ ) {
					var current = urls[i];
					var $option = $("<option />");

					$option.attr("value", current.admin_url);
					$option.text(current.label);
					$option.data("urllist", current.urllist);

					if ( tabs[0].url.indexOf(current.public_url) != -1 ) {
						$option.attr("selected","selected");
					}

					$option.appendTo($(this));
				}
			});

			if ( json != null ) {
				// JSONが暗号化済みかチェック
				var regex = /^\{.*/;
				if ( ! regex.test(json) ) {
					var data = json;
					var encoded = base64.decode(data);
					var decrypted = des.decrypt(base64.decode(data), "mt");

					json = decrypted.replace(/\\n/g, "\\n")
									.replace(/\\'/g, "\\'")
									.replace(/\\"/g, '\\"')
									.replace(/\\&/g, "\\&")
									.replace(/\\r/g, "\\r")
									.replace(/\\t/g, "\\t")
									.replace(/\\b/g, "\\b")
									.replace(/\\f/g, "\\f")
									.replace(/[\u0000-\u0019]+/g,"");
				}

				buildTmpl();
			}
			else {
				var urllist = $("[name='admin_url']").find("option:selected").data("urllist");

				$.ajax({
					type: "GET",
					url: urllist,
					cache : false,
					dataType: "json"
				}).done(function(data) {
					console.log(data);
					for ( var i=0; i<data.length; i++) {
						if ( data[i].url == tabs[0].url ) {
							json = JSON.stringify(data[i]);
							break;
						}
					}

					if ( json == null ) {
						for ( var i=0; i<data.length; i++) {
							if ( tabs[0].url.indexOf(data[i].url) != -1 ) {
								json = JSON.stringify(data[i]);
								console.log(json);
								break;
							}
						}
					}

					buildTmpl();
				});
			}

			function buildTmpl() {
				var params = JSON.parse(json);

				url = $("[name='admin_url']").val();

				if ( url == null ) {
					return;
				}

				params.url = url;

				var tmpl = $("[data-template]").html();

				if ( params.posttype == "page" ) {
					params.context_page = 1;
				}
				else if ( params.posttype == "entry" ) {
					params.context_entry = 1;
				}
				else if ( params.posttype == "content_data" ) {
					params.context_content_data = 1;
				}

				if ( params.blog_id ) {
					$("[data-js-view]").append( Mustache.render(tmpl, params) );
				}

				$("[data-js-urls]").change(function() {
					params.url = $("[name='admin_url']").val();

					$("[data-js-view]").empty();
					$("[data-js-view]").append( Mustache.render(tmpl, params) );
				});
			}
		});
	});
});