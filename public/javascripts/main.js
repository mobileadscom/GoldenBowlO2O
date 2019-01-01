import miniPages from './miniPages';
import axios from 'axios';

import '../stylesheets/pageLayout.css';
import '../stylesheets/theme.css';
import '../stylesheets/couponPage.css';

var user = {
	get: function(userId) {
	    return axios.get(domain + '/api/coupon/softbank/user_info', {
	      params: {
	        id: userId
	      }
	    });
	},
}

var app = {
	pages: null, // array of pages
	sections: null,
	init: function() {
		this.pages = new miniPages({
		  	pageWrapperClass: document.getElementById('page-wrapper'),
		  	pageClass: 'page',
		  	initialPage: document.getElementById('loadingPage'),
		  	pageButtonClass: 'pageBtn'
		});

		//get data
		//user.get....
		setTimeout(() => {
			this.pages.toPage('instructionPage')
		}, 1000)

	}
}

document.addEventListener('DOMContentLoaded', function() {
  app.init();
  window.app = app;
});