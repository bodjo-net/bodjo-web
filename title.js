var title = document.querySelector('#title');

var activeSubdir = title.querySelector('.subdir.active');
function changeTitleHover(text) {

	if (text == null) {
		activeSubdir.className = 'active subdir new';
		setTimeout(function () {
			activeSubdir.className = 'active subdir';
		}, 10);

		var subdirs = title.querySelectorAll('.subdir');
		if (subdirs != null) {
			for (var i = 0; i < subdirs.length; ++i) {
				var subdir = subdirs[i];
				if (subdir.className.indexOf('active') < 0) {
					subdir.className = 'subdir hide';
					setTimeout(subdir.remove.bind(subdir), 250);
				}
			}
		}
	} else {
		if (text == activeSubdir.innerText)
			return;
		activeSubdir.className = 'subdir hide';
		
		var hoverSubdir = document.createElement('h1');
		hoverSubdir.innerText = text;
		hoverSubdir.className = 'subdir new';
		title.append(hoverSubdir)
		setTimeout(function () {
			hoverSubdir.className = 'subdir';
		}, 10);
	}
}
function changeTitleActive(text) {
	if (activeSubdir.innerText == text)
		return;	

	activeSubdir.className = 'subdir hide';
	setTimeout(activeSubdir.remove.bind(activeSubdir), 250);

	var subdirs = Array.prototype.slice.apply(title.querySelectorAll('.subdir'));
	for (var i = 0; i < subdirs.length; ++i) {
		var subdir = subdirs[i];
		if (subdir.innerText == text && subdir.className.indexOf('active') < 0) {
			subdir.className = 'active subdir';
			activeSubdir = subdir;
			return;
		}
	}

	var newActiveSubdir = document.createElement('h1');
	newActiveSubdir.innerText = text;
	newActiveSubdir.className = 'active subdir new';
	title.append(newActiveSubdir);
	setTimeout(function () {
		newActiveSubdir.className = 'active subdir';
		activeSubdir = newActiveSubdir;
	}, 10);
}