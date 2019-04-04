var titleElement = document.querySelector('title');

var pages = {
	'#sign-in-btn': 'sign-in',
	'#sign-up-btn': 'sign-up',
	'.back-btn': 'root',
	'#minesweeper .btn.play': '>minesweeper',
	'#minesweeper .btn.spectate': '>minesweeper/spectate',
	'#tanks .btn.play': '>tanks',
	'#tanks .btn.spectate': '>tanks/spectate'
};
var activePage = getActivePage();
changeTitleActive(activePage=='root'?'':activePage);
Object.keys(pages).forEach(function (selector) {
	var elements = document.querySelectorAll(selector);
	if (elements == null)
		return;
	var name = pages[selector], sName = name;
	var page, link;
	if (name[0] == '>') {
		sName = name = link = name.substring(1);
	} else {
		page = document.querySelector('#'+name);
		link = name;
		if (name == 'root') {
			link = '/';
			sName = '';
		}
	}
	if (page && page.className.indexOf('page') >= 0) {
		page.className = 'page ' + (activePage == name ? 'active' : '');
		page.style.display = (activePage == name ? 'block' : 'none');
	}

	for (var i = 0; i < elements.length; ++i) {
		var element = elements[i];


		element.addEventListener('mouseenter', changeTitleHover.bind(null, sName));
		element.addEventListener('mouseleave', changeTitleHover.bind(null, null));

		if (page) {
			element.addEventListener('click', function () {
				if (activePage == name)
					return;

				var activePageElement = document.querySelector('#'+activePage);
				var currentPageElement = document.querySelector('#'+name);
				currentPageElement.style.display = 'block';
				currentPageElement.style.opacity = '0';
				setTimeout(function () {
					currentPageElement.style.opacity = '1';
				}, 5);
				activePageElement.style.opacity = '0';
				setTimeout(function () {
					activePageElement.style.display = 'none';
				}, 250);
				activePageElement.className = 'page';
				currentPageElement.className = 'page active';

				window.history.pushState({"pageTitle": titleElement.innerText}, "", link);

				activePage = name;
				changeTitleActive(sName, true);
			});
		} else {
			element.addEventListener('click', function () {
				window.location.href += link;
			});
		}
	}
});

function getActivePage() {
	var page = location.pathname.split('/')[1];
	if (page.length == 0)
		page = 'root';
	if (Array.from(Object.keys(pages), function(k){return pages[k]}).indexOf(page) < 0) {
		page = 'root';
		window.history.pushState({"pageTitle": titleElement.innerText}, "", '/');
	}
	return page;
}
function setActivePage(page) {
	var sName = page == 'root' ? '' : page;
	var link = '/' + sName;

	var activePageElement = document.querySelector('#'+activePage);
	var currentPageElement = document.querySelector('#'+page);
	currentPageElement.style.display = 'block';
	currentPageElement.style.opacity = '0';
	setTimeout(function () {
		currentPageElement.style.opacity = '1';
	}, 5);
	activePageElement.style.opacity = '0';
	setTimeout(function () {
		activePageElement.style.display = 'none';
	}, 250);
	activePageElement.className = 'page';
	currentPageElement.className = 'page active';

	window.history.pushState({"pageTitle": titleElement.innerText}, "", link);

	activePage = page;
	changeTitleActive(sName, true);
}