import '../stylesheets/style.css';
import miniPages from './miniPages';

var app = {
	pages: null, // array of pages
	sections: null,
	init: function() {
		this.pages = new miniPages({
		  	pageWrapperClass: document.getElementById('page-wrapper'),
		  	pageClass: 'page',
		  	initialPage: document.getElementById('instructionPage'),
		  	pageButtonClass: 'pageBtn'
		});
		this.sections = new miniPages({
		  	pageWrapperClass: document.getElementById('couponSection'),
		  	pageClass: 'section-page',
		  	initialPage: document.getElementById('barcodeSection'),
		  	pageButtonClass: 'sectionBtn'
		});
	}
}

document.addEventListener('DOMContentLoaded', function() {
  app.init();
  window.app = app;
});