import miniPages from './miniPages';
import Eraser from './eraser.js';
import modal from './modal';
// import winningLogic from './winningLogic';
import user from './userCore';
import axios from 'axios'

import '../stylesheets/pageLayout.css';
import '../stylesheets/theme.css';
import '../stylesheets/campaignPage.css';
import '../stylesheets/eraser.css';
import '../stylesheets/modal.css';
import '../stylesheets/regForm.css';
import '../stylesheets/sharer.css';

var app = {
	storage: 'o2odemo_en',
	eraser: null,
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
				document.getElementById('couponLoader').style.display = 'none';
				document.getElementById('couponLink').href = couponLink;
				document.getElementById('couponLink').setAttribute('target', '_blank');
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
				if (user.info.id.indexOf('@') > -1) { // login via email
					user.sendCouponEmail(user.info.id, couponLink)
				}
				this.initResult('win', couponLink)
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
				// this.continue(response)
				if (response.message == 'registration success.') {
					this.formSections.toPage('doneSec')
					user.sendLoginEmail(email)
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
			user.registerFb()
		})
		/* ==== Event Listeners End ==== */
	},
	initEraser: function() {
		return new Promise((resolve, reject) => {
			axios.get(`https://api.mobileads.com/coupons/goldenBowl/coupon_draw?id=${user.info.id}`).then((response) => {
				console.log(response)
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
						document.getElementById('toResult').disabled = false;
					}
				})
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
			}
			/*else if (user.info.state == 'lose') {
				this.initResult('lose')
				this.pages.toPage('resultPage')
			}*/
			else {
				this.initEraser().then((r) => {
					this.pages.toPage('gamePage')
				}).catch((e) => {
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
				this.continue(response)
			}).catch((error) => {
				console.log(error)
				this.continue()
			})
		}
		else {
			if (this.params.userId) {
				let options = {
					userInfo: {
						userId: this.params.userId,
						source: user.info.source,
					}
				}

				if (this.params.displayName) { // temporary line login detection
					options.userInfo.type = 'line'
					options.autoRegister = true
				}
				else {
					options.autoRegister = false
				}

				user.init(options).then((response) => {
					this.continue(response)
				}).catch((error) => {
					console.log(error)
					this.continue()
				})
			}
			else {
				user.getLocalUser(user.info.source) // load localStorage user data
				if (user.info.id) {
					// check if db has cleared the user, if cleared, clear local storage also 
					user.get({
						userId: user.info.id,
						source: user.info.source
					}).then((res) => {
						console.log(res)
						if (res.data.status == false && res.data.message == 'not registered.') {
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

		if (this.params.source) {
			user.changeSource(source)
		}

		if (this.params.reset) {
		  	user.clearLocalSourceData()
		}

		user.getRedirectResult().then((res) => {
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
				this.initUser()
			}
		}).catch((err) => {
			console.error(err)
			this.initUser()
		})

	  var processed = false; // check if result has been processed to avoid double result processsing
	},
}

document.addEventListener('DOMContentLoaded', function() {
  app.init();
  modal.init();
  window.app = app
  window.params = app.params;
  window.user = user
});

export {
	user
}