import miniPages from './miniPages'
import config from './config'
import location from './location'
import axios from 'axios'

import '../stylesheets/pageLayout.css'
import '../stylesheets/theme.css'
import '../stylesheets/couponPage.css'
import '../stylesheets/sharer.css'

var user = {
	info: {
		id: '',
		state: '-'
	},
	get(userId) {
	    return axios.get(`${config.userAPIDomain}/coupons/goldenBowl/user_info?id=${userId}`);
	},
}

var coupon = {
	id: '',
	couponCode: '',
	claimed: false,
	claiming: false,
	claim(location) {
		return axios.post(`${config.userAPIDomain}/coupons/goldenBowl/coupon_claim?id=${user.info.id}&couponId=${this.id}&claimAt=${location}`)
	}
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
		if (location.selected && user.info.id && !coupon.claiming) {
			coupon.claiming = true
			location.disabled = true
			document.getElementById('redeemLoader').style.display = 'block'
			document.getElementById('confirmRedeem').style.display = 'none'
			//redeem coupon api...
			coupon.claim(location.selected).then((response) => {
				console.log(response)
				if (response.data.message == 'claimed.') {
					document.getElementById('redeemLoader').style.display = 'none'
					this.pages.toPage('donePage')
				}
				else {
					alert('Fail to claim coupon. Please refresh the page and try again.')
				}				
			}).catch((error) => {
				console.error(error)
				alert('Fail to claim coupon. Please refresh the page and try again.')
			})
		}
		else {
			alert('Fail to claim coupon. Please refresh the page and try again.')
		}
	},
	events: function() {
		document.getElementById('confirmRedeem').addEventListener('click', (e) => {
			if (!e.target.disabled && location.selected) {
				this.redeemCoupon();
			}
			else {
				alert('Please select store location.')
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

		var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if (!isMobile) {
			const mobileSharers = document.getElementsByClassName('mobile-sharer')
			for (let m = 0; m < mobileSharers.length; m++) {
				mobileSharers[m].style.display = 'none'
			}
		}

		//get data
		if (this.params.userId) {
			user.get(this.params.userId).then((response) => {
				console.log(response)
				if (response.data.status) {
					user.info.id = response.data.user.id
					user.info.state = response.data.user.state
					coupon.id = response.data.coupon._id
					coupon.couponCode = response.data.coupon.couponCode
					coupon.claimed = response.data.coupon.claimed
					if (coupon.couponCode && user.info.state == 'win') {
						document.getElementById('couponCode').innerHTML = response.data.coupon.couponCode
					}
					if (coupon.claimed) {
						this.pages.toPage('donePage')
					}
					else {
						this.pages.toPage('instructionPage')
						location.init();
						this.events();
					}
				}
				else {
					this.pages.toPage('instructionPage')
					location.init();
					this.events();
				}
			}).catch((error) => {
				console.error(error)
			})
		}
		else {
			this.pages.toPage('joinPage')
			document.getElementById('footer-banner').style.display = 'none'
		}
	}
}

document.addEventListener('DOMContentLoaded', function() {
  app.init();
  window.app = app;
  window.coupon = coupon
  window.user = user
});