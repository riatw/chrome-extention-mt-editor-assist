/* MEMO
	BackGround(Event) Page = 後ろで動いているページ（権限強い、DOMアクセス不可）
	ContentScripts = 指定したドメインで読み込まれる追加JS（権限弱い、DOMアクセス可）
	BrowserAction = タスクバーから実行されるポップアップ（権限普通、DOMアクセス不可）
	http://www.apps-gcp.com/calendar-extension/
*/

$(document).ready(function()　{
	var list = $("[data-list]");
	var listItem = list.children();
	var addBtn = $("[data-add]");
	var saveBtn = $("[data-save]");
	var removeBtn = $("[data-remove]");

	var urls = localStorage.getItem("urls");
	var tmpl = $("[data-tmpl").html();

	if ( urls ) {
		urls = JSON.parse(urls);
	}
	else {
		urls = [];
	}

	// recover
	for ( var i=0; i < urls.length; i++ ) {
		var current = urls[i];
		var $tmpl = $(tmpl);

		for(var key in current){
			var selector = "[data-name=" + key + "]";
			$tmpl.find(selector).attr("value",current[key]);
		}

		$tmpl.appendTo(list);
	}

	// add
	addBtn.click(function() {
		list.append(tmpl);
	});

	// save
	saveBtn.click(function(){
		urls = [];

		list.children().each( function() {
			var $this = $(this);
			var obj = {};

			$this.find("[data-name]").each(function() {
				var label = $(this).data("name");
				var attr = $(this).val();

				obj[label] = attr;
			});

			urls.push(obj);
		});

		localStorage.setItem("urls", JSON.stringify(urls));
	});

	// remove
	$(document).on("click", "[data-item-remove]", function() {
		$(this).parents("[data-list-item]").remove();
	});
});