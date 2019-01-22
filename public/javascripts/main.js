import miniPages from './miniPages'
import config from './config'
import user from './userCore'
import tracker from './tracker'
import store from './store'
import axios from 'axios'

import '../stylesheets/pageLayout.css'
import '../stylesheets/theme.css'
import '../stylesheets/couponPage.css'
import '../stylesheets/sharer.css'

var coupon = {
	id: '',
	couponCode: '',
	claimed: false,
	claiming: false,
	couponEffect: {
		'GBP-5P': '5% Discount',
		'GBP-10P': '10% Discount',
		'GBP-15P': '15% Discount',
		'GBP-RM5': 'RM5 Discount',
		'GBP-RM10': 'RM10 Discount',
		'GBP-RM15': 'RM15 Discount'
	},
	claim(store) {
		return axios.post(`${config.userAPIDomain}/coupons/goldenBowl/coupon_claim?id=${user.info.id}&couponId=${this.id}&claimAt=${store}`)
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
	trackPage(page) {
		if (user.trackPage(page)) {
			tracker.track(`imp_${page}`, '', user.info.id, user.info.type)
		}
	},
	trackEvent(type, value, userInfo, customParams) {
		if (user.trackEvent(type)) {
			if (userInfo) {
				tracker.track(type, value, userInfo.id, userInfo.type, customParams)
			}
			else {
				tracker.track(type, value, user.info.id, user.info.type, customParams)
			}
		}
	},
	redeemCoupon: function() {
		if (store.selected && user.info.id && !coupon.claiming) {
			coupon.claiming = true
			store.disabled = true
			document.getElementById('redeemLoader').style.display = 'block'
			document.getElementById('confirmRedeem').style.display = 'none'
			//redeem coupon api...
			coupon.claim(store.selected).then((response) => {
				console.log(response)
				if (response.data.message == 'claimed.') {
					document.getElementById('redeemLoader').style.display = 'none'
					this.trackEvent('redeem', store.selected, '', {couponCode: coupon.couponCode})
					this.pages.toPage('donePage')
					this.trackPage('coupon_redeemed')
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
	storeCallback() {
		document.getElementById('confirmRedeem').disabled = false
		if (document.getElementById('couponSection').style.display == 'none') {
			document.getElementById('couponSection').style.display = 'block'
		}
	},
	events: function() {
		document.getElementById('confirmRedeem').addEventListener('click', (e) => {
			if (!e.target.disabled && store.selected) {
				this.redeemCoupon();
			}
			else {
				alert('Please select store location.')
			}
		})

		document.getElementById('toRedeemPage').addEventListener('click', () => {
			this.trackPage('coupon_redemption')
		})

		/* track buttons click */
		const tBtn = document.getElementsByClassName('track')
		for (let t = 0; t < tBtn.length; t++) {
			tBtn[t].addEventListener('click', (e) => {
				this.trackEvent(e.target.dataset.tracker, e.target.dataset.trackvalue || '')
			})
		}
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

		if (this.params.utm_source) {
			config.tracking.utm_source = this.params.utm_source
		}
		tracker.generateTrackingURL()

		//get data
		if (this.params.userId) {
			user.getLocalUser(user.info.source)
			user.get({
				userId: this.params.userId,
				source: user.info.source
			}).then((response) => {
				console.log(response)
				if (response.data.status && response.data.coupon._id) {
					user.setUserInfo({
						id: response.data.user.id,
						state: response.data.user.state,
						couponCode: response.data.user.couponCode,
						type: response.data.user.type
					})
					coupon.id = response.data.coupon._id
					coupon.couponCode = response.data.coupon.couponCode
					coupon.claimed = response.data.coupon.claimed
					
					if (coupon.claimed) {
						this.pages.toPage('donePage')
						this.trackPage('coupon_redeemed')
					}
					else {
						if (coupon.couponCode && user.info.state == 'win') {
							document.getElementById('couponCode').innerHTML = response.data.coupon.couponCode
							if (coupon.couponEffect[response.data.coupon.couponCode]) {
								document.getElementById('couponEffect').innerHTML = coupon.couponEffect[response.data.coupon.couponCode]
							}
							else {
								document.getElementById('couponEffect').style.display = 'none'
							}
							this.pages.toPage('instructionPage')
							store.init(() => {
								app.storeCallback()
							});
						}
						else {
							this.pages.toPage('joinPage')
							document.getElementById('footer-banner').style.display = 'none'
						}
					}
				}
				else {
					this.pages.toPage('joinPage')
					document.getElementById('footer-banner').style.display = 'none'

				}
			}).catch((error) => {
				alert('Fail to get user\'s info. Please check internet connection.')
				console.error(error)
			})

			if (window.firedImp) {
				let tp = user.info.trackedPages
				tp.push('coupon')
				user.setUserInfo({
					trackedPages: tp
				})
			}
		}
		else {
			this.pages.toPage('joinPage')
			document.getElementById('footer-banner').style.display = 'none'
		}
		this.events();
	}
}

document.addEventListener('DOMContentLoaded', function() {
	user.setConfig(config)
	tracker.setConfig(config)
	app.init();
	window.app = app;
	window.coupon = coupon
	window.user = user
});