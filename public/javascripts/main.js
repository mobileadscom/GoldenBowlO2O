import miniPages from './miniPages';
import location from './location';
import axios from 'axios';

import '../stylesheets/pageLayout.css';
import '../stylesheets/theme.css';
import '../stylesheets/couponPage.css';
import '../stylesheets/sharer.css';

var user = {
	info: {
		id: '11',
		state: '-'
	},
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
	redeemCoupon: function() {
		if (location.selected && user.info.id) {
			document.getElementById('redeemLoader').style.display = 'block'
			document.getElementById('confirmRedeem').style.display = 'none'
			//redeem coupon api...
			setTimeout(() => {
				document.getElementById('redeemLoader').style.display = 'none'
				// document.getElementById('confirmRedeem').style.display = 'inline-block'
				this.pages.toPage('donePage')
			}, 1000)
		}
		else {
			alert('error')
		}
	},
	events: function() {
		document.getElementById('confirmRedeem').addEventListener('click', (e) => {
			if (!e.target.disabled && location.selected) {
				this.redeemCoupon();
			}
			else {
				alert('Please select store location')
			}
		})
	},
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
			location.init();
			this.events();
		}, 1000)



	}
}

document.addEventListener('DOMContentLoaded', function() {
  app.init();
  window.app = app;
});