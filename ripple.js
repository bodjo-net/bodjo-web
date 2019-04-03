var rippleElements = document.querySelectorAll('.ripple');
if (rippleElements != null) {
	for (var i = 0; i < rippleElements.length; ++i) {
		var rippleElement = rippleElements[i];

		rippleElement.addEventListener('mousedown', createRipple.bind(null, rippleElement));
		rippleElement.addEventListener('mouseup', removeRipples.bind(null, rippleElement));
		rippleElement.addEventListener('mouseleave', removeRipples.bind(null, rippleElement));
	}
}

function createRipple(element, event) {
	var rect = element.getBoundingClientRect();
	var R = Math.sqrt(rect.width*rect.width + rect.height*rect.height);
	var x = (event.clientX - rect.left), y = (event.clientY - rect.top);

	var newRipple = document.createElement('div');
	newRipple.className = 'rippleEffect';
	newRipple.style.opacity = '0';
	newRipple.style.top = y + "px";
	newRipple.style.left = x + "px";
	newRipple.style.width = newRipple.style.height = '0px';
	setTimeout(function () {
		newRipple.style.opacity = '1';
		newRipple.style.top = (y-R) + "px";
		newRipple.style.left = (x-R) + "px";
		newRipple.style.width = newRipple.style.height = R*2 + 'px';
	}, 10);

	element.append(newRipple);
}
function removeRipples(element) {
	var ripples = element.querySelectorAll('.rippleEffect');
	if (ripples == null)
		return;

	for (var i = 0; i < ripples.length; ++i) {
		var ripple = ripples[i];
		ripple.style.opacity = '0';
		setTimeout(ripple.remove.bind(ripple), 250);
	}
}