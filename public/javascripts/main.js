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
	    return axios.get(`https://api.mobileads.com/coupons/goldenBowl/user_info?id=${userId}`);
	},
}

var app = {
	params: {},
	pages: null,
	getParams: function() {
		  var query_string = {};
		  var query = window.location.search.substring(1);
		  var vars = query.split("&");
		  for (var i=0;i<vars.length;i++) {
		      var pair = vars[i].split("=");
		      // If first entry with this name
		      if (typeof query_string[pair[0]] === "undefined") {
		          query_string[pair[0]] = pair[1];
		      // If second entry with this name
		      } else if (typeof query_string[pair[0]] === "string") {
		          var arr = [ query_string[pair[0]], pair[1] ];
		          query_string[pair[0]] = arr;
		      // If third or later entry with this name
		      } else {
		          query_string[pair[0]].push(pair[1]);
		      }
		  } 
		  return query_string;
	},
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
		this.params = this.getParams()
		this.pages = new miniPages({
		  	pageWrapperClass: document.getElementById('page-wrapper'),
		  	pageClass: 'page',
		  	initialPage: document.getElementById('loadingPage'),
		  	pageButtonClass: 'pageBtn'
		});

		//get data
		//user.get....
		if (this.params.userId) {
			user.get(this.params.userId).then((response) => {
				console.log(response)
				if (response.data.coupon) {
					document.getElementById('couponCode').innerHTML = response.data.coupon.couponCode
				}
			}).catch((error) => {
				console.error(error)
			})
		}
		
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