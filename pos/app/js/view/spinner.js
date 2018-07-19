define([
  'js/libs/spin.min.js'
],function(){
	
	var opts = {
		lines: 9, // The number of lines to draw
	  	length: 3, // The length of each line
		width: 2, // The line thickness
		radius: 3, // The radius of the inner circle
		rotate: 12, // The rotation offset
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto', // Left position relative to parent in px
	}
	
	var initialize = function() {
		return new Spinner(opts);
	}
	
	var _spinner = new Spinner(opts);
	_spinner.__proto__.newInstance = function(){
		return new Spinner(opts);
	}

	return _spinner;
	
});