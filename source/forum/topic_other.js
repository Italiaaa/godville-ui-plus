// topic other improvements
var pw, pw_pb_int;
var checkHash = function() {
	// scroll to a certain post #
	var guip_hash = location.hash.match(/#guip_(\d+)/);
	if (guip_hash) {
		var post = $C('spacer')[+guip_hash[1]];
		location.hash = post ? post.id : '';
	}
};
var setPageWrapperPaddingBottom = function(el) {
	var form = document.getElementById(el) || el,
		old_height = parseFloat(getComputedStyle(form).height) || 0,
		step = 0;
	worker.clearInterval(pw_pb_int);
	pw_pb_int = worker.setInterval(function() {
		if (step++ >= 100) {
			worker.clearInterval(pw_pb_int);
		} else {
			var diff = (parseFloat(getComputedStyle(form).height) || 0) - old_height;
			old_height += diff;
			pw.style.paddingBottom = ((parseFloat(pw.style.paddingBottom) || 0) + diff) + 'px';
			worker.scrollTo(0, worker.scrollY + diff);
		}
	}, 10);
};
var fixPageWrapperPadding = function() {
	pw = document.getElementById('page_wrapper');
	worker.Effect.old_toggle = worker.Effect.toggle;
	worker.Effect.toggle = function(a, b) { setPageWrapperPaddingBottom(a); worker.Effect.old_toggle(a, b); };
	worker.Effect.old_BlindDown = worker.Effect.BlindDown;
	worker.Effect.BlindDown = function(a, b) { setPageWrapperPaddingBottom(a); worker.Effect.old_BlindDown(a, b); };
	worker.EditForm.old_hide = worker.EditForm.hide;
	worker.EditForm.hide = function() { pw.style.paddingBottom = '0px'; worker.EditForm.old_hide(); };
	worker.EditForm.old_setReplyId = worker.EditForm.setReplyId;
	worker.EditForm.setReplyId = function(a) { if (document.getElementById('reply').style.display !== 'none') { pw.style.paddingBottom = '0px'; } worker.EditForm.old_setReplyId(a); };
	worker.ReplyForm.old_init = worker.ReplyForm.init;
	worker.ReplyForm.init = function() { worker.ReplyForm.old_init(); if (worker.getSelection().isCollapsed) { worker.setTimeout(function() { document.getElementById('post_body').focus(); }, 50); } };
};

var findPost = function(el) {
	do {
		el = el.parentNode;
	} while (!el.classList.contains('post'));
	return el;
};
var picturesAutoreplace = function() {
	if (!storage.get('Option:disableLinksAutoreplace')) {
		var links = document.querySelectorAll('.post .body a'),
			imgs = [],
			onerror = function(i) {
				links[i].removeChild(links[i].getElementsByTagName('img')[0]);
				imgs[i] = null;
			},
			onload = function(i) {
				var oldBottom, hash = location.hash.match(/\d+/),
					post = findPost(links[i]),
					linkBeforeCurrentPost = hash ? +post.id.match(/\d+/)[0] < +hash[0] : false;
				if (linkBeforeCurrentPost) {
					oldBottom = post.getBoundingClientRect().bottom;
				}
				links[i].removeChild(links[i].getElementsByTagName('img')[0]);
				var hint = links[i].innerHTML;
				links[i].outerHTML = '<div class="img_container"><a id="link' + i + '" href="' + links[i].href + '" target="_blank" alt="' + worker.GUIp_i18n.open_in_a_new_tab + '"></a><div class="hint">' + hint + '</div></div>';
				imgs[i].alt = hint;
				var new_link = document.getElementById('link' + i),
					width = Math.min(imgs[i].width, 456),
					height = imgs[i].height*(imgs[i].width <= 456 ? 1 : 456/imgs[i].width);
				if (height < 1500) {
					new_link.insertAdjacentHTML('beforeend', '<div style="width: ' + width + 'px; height: ' + height + 'px; background-image: url(' + imgs[i].src + '); background-size: ' + width + 'px;"></div>');
				} else {
					new_link.insertAdjacentHTML('beforeend', '<div style="width: ' + width + 'px; height: 750px; background-image: url(' + imgs[i].src + '); background-size: ' + width + 'px;"></div>' +
															 '<div style="width: ' + width + 'px; height: ' + (342*width/456) + 'px; background-image: url(' + worker.GUIp_getResource('images/crop.png') + '); background-size: ' + width + 'px; position: absolute; top: ' + (750 - 171*width/456) + 'px;"></div>' +
															 '<div style="width: ' + width + 'px; height: 750px; background-image: url(' + imgs[i].src + '); background-size: ' + width + 'px; background-position: 100% 100%;"></div>');
				}
				if (linkBeforeCurrentPost) {
					var diff = post.getBoundingClientRect().bottom - oldBottom;
					worker.console.log(hash, +post.id.match(/\d+/), linkBeforeCurrentPost, diff);
					worker.scrollTo(0, worker.scrollY + diff);
				}
			};
		for (i = 0, len = links.length; i < len; i++) {
			if (links[i].href.match(/jpe?g|png|gif/i)) {
				links[i].insertAdjacentHTML('beforeend', '<img class="img_spinner" src="http://godville.net/images/spinner.gif">');
				imgs[i] = document.createElement('img');
				imgs[i].onerror = onerror.bind(null, i);
				imgs[i].onload = onload.bind(null, i);
				imgs[i].src = links[i].href;
			}
		}
	}
};
var updatePostsNumber = function() {
	if (topics[topic]) {
		var page = location.search.match(/page=(\d+)/);
		page = page ? +page[1] - 1 : 0;
		var posts = page*25 + document.getElementsByClassName('post').length;
		if (topics[topic].posts < posts) {
			topics[topic].posts = posts;
			var dates = document.getElementsByTagName('abbr');
			topics[topic].date = dates[dates.length - 1].title;
			storage.set(forum_no, JSON.stringify(topics));
		}
	}
};
var improveTopic = function() {
	checkHash();
	fixPageWrapperPadding();
	picturesAutoreplace();
	updatePostsNumber();
};
