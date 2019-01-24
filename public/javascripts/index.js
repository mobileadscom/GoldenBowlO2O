import miniPages from './miniPages'
import Eraser from './eraser.js'
import modal from './modal'
import config from './config'
import user from './userCore'
import tracker from './tracker'
import axios from 'axios'

import * as firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from './firebaseConfig';
firebase.initializeApp(firebaseConfig);

import '../stylesheets/pageLayout.css'
import '../stylesheets/theme.css'
import '../stylesheets/campaignPage.css'
import '../stylesheets/eraser.css'
import '../stylesheets/modal.css'
import '../stylesheets/regForm.css'
import '../stylesheets/sharer.css'

var app = {
	eraser: null,
	campaignEnded: false,
	couponId: '',
	pages: null, // array of pages
	params: {}, // params in query string
	player: null, //youtube player
	scratchResult: null,
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
	initResult(state, couponLink) {
		if (state == 'win') {
			document.getElementById('resultTitle').innerHTML = "CONGRATULATIONS!";
			document.getElementById('resultDescription').innerHTML = "You won a cash voucher";
			if (user.isWanderer) {
				document.getElementById('couponLink').style.display = 'none';
				document.getElementById('resultInstruction').style.display = 'none;'
			}
			else {
				document.getElementById('resultInstruction').innerHTML = "Share this with your friends to access your cash voucher";
			}

			if (couponLink) {
				let sharers = document.getElementsByClassName('sharer')
				for (let s = 0; s < sharers.length; s++) {
					sharers[s].addEventListener('click', () => {
						setTimeout(() => {
							document.getElementById('couponLinkBtn').disabled = false
						}, 3000)
						document.getElementById('couponLink').href = couponLink;
						document.getElementById('couponLink').setAttribute('target', '_blank');
					})
				}
				document.getElementById('couponLoader').style.display = 'none';
			    document.getElementById('getCoupon').innerText = 'NEXT';
			    /*var x = window.matchMedia("(min-width: 992px)");
		    	if (x.matches) {
					document.getElementById('resultImage').style.display = 'none';
		    	}*/
			}
		}
		else {
			document.getElementById('resultTitle').innerHTML = "Unfortunately, you are not qualified. Thank you for your time. <br>You may exit by closing this page";
			// document.getElementById('resultImage').style.display = 'none';
			document.getElementById('couponLink').style.display = 'none';
		}

		var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if (!isMobile) {
			const mobileSharers = document.getElementsByClassName('mobile-sharer')
			for (let m = 0; m < mobileSharers.length; m++) {
				mobileSharers[m].style.display = 'none'
			}
		}
	},
	processResult() {
		user.mark(this.couponId).then((response) => {
			if (response.data.couponCode) {
				user.setUserInfo({
					state: 'win',
					couponCode: response.data.couponCode
				})
				const couponLink = user.generateCouponLink()
				if (user.info.type == 'email') { // login via email
					user.sendCouponEmail(user.info.id, couponLink)
				}
				this.trackEvent('win', response.data.couponCode)
				this.initResult('win', couponLink)
				document.getElementById('toResult').disabled = false
			}
		}).catch((error) => {
			console.error(error)
			alert('An error has occured. Please refresh the page and try again.')
		})
	},
	events: function() {
		/* ==== Event Listeners ==== */
		/* email registration */
		var form = document.getElementById('regForm');
		form.onsubmit = (event) => {
			var spinner = document.getElementById('formWorking');
			var regBtn = document.getElementById('submitBtn');
			var backBtn = document.getElementById('toRegSub1');
			regBtn.style.display = 'none';
			backBtn.style.display = 'none';
			spinner.style.display = 'block';
			event.preventDefault();
			var email = document.getElementById('emailInput').value;
			 const options = {
	        	userInfo: {
	        		userId: email,
	        		source: user.info.source,
	        		type: 'email'
	        	},
	        	autoRegister: true
	        }
	        user.init(options).then((response) => {
				if (response.message == 'registration success.') {
					this.formSections.toPage('doneSec')
					user.sendLoginEmail(email)
					this.trackEvent('register', '', {
						id: email,
						type: 'email'
					})
				}
				else if (response.user) {
					this.continue()
				}
			}).catch((error) => {
				console.log(error)
				regBtn.style.display = 'block';
				backBtn.style.display = 'block';
				spinner.style.display = 'none';
				alert('Registration error. Please refresh the page and try again.')
			})
		};

		/* Fb Login */
		document.getElementById('regFb').addEventListener('click', () => {
			window.redirectState.set()
			var provider = new firebase.auth.FacebookAuthProvider()
			firebase.auth().signInWithRedirect(provider);
		})

		/* track result page*/
		document.getElementById('toResult').addEventListener('click', () => {
			this.trackPage('result')
		})

		/* track buttons click */
		const tBtn = document.getElementsByClassName('track')
		for (let t = 0; t < tBtn.length; t++) {
			tBtn[t].addEventListener('click', (e) => {
				this.trackEvent(e.target.dataset.tracker, e.target.dataset.trackvalue || '')
			})
		}
		/* ==== Event Listeners End ==== */
	},
	initEraser: function() {
		return new Promise((resolve, reject) => {
			axios.get(`${config.userAPIDomain}/coupon_draw?id=${user.info.id}`).then((response) => {
				console.log(response)
				if (response.data._id) {
					this.couponId = response.data._id
					document.getElementById('scratchWin').src = `https://rmarepo.richmediaads.com/goldenBowl/coupons/${response.data.couponCode}.jpg`
					 
					this.eraser = new Eraser({
						ele: document.getElementById('scratchCover'),
						completeRatio: 0.8,
						width: 250,
						height: 236,
						completeFunction: function() {
							this.reveal();
							if (!app.processed) {
				            	app.processed = true;
				            	app.processResult();
							}
							document.getElementById('eraser').style.pointerEvents = 'none';
							
						},
						startFunction: function() {
							app.trackEvent('scratch')
						}
					})
				}
				else {
					this.campaignEnded = true
				}
				resolve(response)
			}).catch((error) => {
				console.error(error)
				reject(error)
			})
		})
	},
	continue() {
		if (user.info.id) {
			if (user.info.state == 'win') {
				this.initResult('win', user.generateCouponLink());
				this.pages.toPage('resultPage')
				this.trackPage('result')
			}
			/*else if (user.info.state == 'lose') {
				this.initResult('lose')
				this.pages.toPage('resultPage')
			}*/
			else {
				this.initEraser().then((r) => {
					if (!this.campaignEnded) {
						this.pages.toPage('gamePage')
						this.trackPage('game')
					}
					else {
						this.pages.toPage('closePage')
						this.trackPage('close')
					}
				}).catch((e) => {
					console.log(e)
					this.pages.toPage('regPage')
				})
				
			}
		}
		else {
			this.pages.toPage('regPage')
		}
	},
	initUser(options) {
		if (options) {
			user.init(options).then((response) => {
				console.log(response)
				if (response.message == 'registration success.') {
					this.trackEvent('register')
				}
				this.continue()
			}).catch((error) => {
				console.log(error)
				this.continue()
			})
		}
		else {
			user.getLocalUser(user.info.source)
			if (this.params.userId) {
				let options = {
					userInfo: {
						userId: this.params.userId,
						source: user.info.source,
					}
				}

				if (user.info.id != this.params.userId) {
					user.clearUserInfo()
				}

				user.init(options).then((response) => {
					this.continue()
				}).catch((error) => {
					console.log(error)
					this.continue()
				})
			}
			else {
				// user.getLocalUser(user.info.source) // load localStorage user data
				if (user.info.id) {
					// check if db has cleared the user, if cleared, clear local storage also
					user.init({
						userInfo: {
							userId: user.info.id,
							source: user.info.source
						},
						autoRegister: false
					}).then((res) => {
						if (res.status == false && res.message == 'not registered.') {
							user.clearUserInfo()
						}
						this.continue()
					}).catch((err) => {
						user.clearUserInfo()
						this.continue()
					})
				}
				else {
					this.continue()
				}
			}
		}
	},
	init: function() {
		/* init pagination */
		this.params = this.getParams();

		this.pages = new miniPages({
		  	pageWrapperClass: document.getElementById('page-wrapper'),
		  	pageClass: 'page',
		  	initialPage: document.getElementById('loadingPage'),
		  	pageButtonClass: 'pageBtn'
		});

		/* init registration pagination */
		this.regSections = new miniPages({
			pageWrapperClass: document.getElementById('regPage'),
			pageClass: 'reg-sub-page',
			initialPage: document.getElementById('regSub1'),
			pageButtonClass: 'email-btn'
		});

		document.getElementById('toRegSub1').addEventListener('click', () => {
			this.regSections.toPage('regSub1');
		});

		/* init registration form sections */
		this.formSections = new miniPages({
			pageWrapperClass: document.getElementById('formSecWrapper'),
			pageClass: 'sec',
			initialPage: document.getElementById('regSec')
		});
		
		this.events();

		if (this.params.utm_source) {
			config.tracking.utm_source = this.params.utm_source
		}
		tracker.generateTrackingURL()

		if (this.params.source) {
			user.changeSource(source)
		}

		if (this.params.reset) {
		  	user.clearLocalSourceData()
		}

		firebase.auth().getRedirectResult().then((res) => {
			console.log(res)
			if (res.credential) {
				user.oauth.token = res.credential.accessToken || ''
		        user.oauth.secret = res.credential.secret || ''
			    let id = ''
			    const type = res.credential.providerId.replace('.com', '')
		        if (type == 'twitter') {
					id = res.additionalUserInfo.profile.id_str
		        }
		        else {
					id = res.additionalUserInfo.profile.id
		        }

		        const options = {
		        	userInfo: {
		        		userId: id,
		        		source: user.info.source,
		        		type: type
		        	},
		        	autoRegister: true
		        }
		        this.initUser(options)
		      
			}
			else {
				if (this.params.displayName && this.params.userId) { // temporary line login detection
					this.initUser({
			        	userInfo: {
			        		userId: this.params.userId,
			        		source: user.info.source,
			        		type: 'line'
			        	},
			        	autoRegister: true
					})
				}
				else {
					this.initUser()
				}
			}
		}).catch((err) => {
			console.error(err)
			this.initUser()
		})
	},
}

document.addEventListener('DOMContentLoaded', function() {
	/* important! must set config for user and tracker first! */
	user.setConfig(config)
	tracker.setConfig(config)

	/* init after setting config */
	modal.init();
	app.init();

	window.app = app
	window.params = app.params
	window.user = user
	window.tracker = tracker
});

export {
	user
}