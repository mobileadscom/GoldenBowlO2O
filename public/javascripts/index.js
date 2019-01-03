import miniPages from './miniPages';
import Eraser from './eraser.js';
import modal from './modal';
import winningLogic from './winningLogic';
// import user from './userDemo';
import user from './userCore';

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
	},
	processResult() {
		if (!user.isWanderer) {
			if (this.scratchResult == 'win') {
  			user.win(user.info.id, 'A', user.source).then((response) => {
					console.log(response);
					if (response.data.couponLink) {
						this.initResult('win', response.data.couponLink);
						var message = '綾鷹クーポンが当たりました！ ' + response.data.couponLink;
						

						if (user.info.id.indexOf('@') > -1) { // login via email
		        	var emailContent = '<head><meta charset="utf-8"></head><div style="text-align:center;font-weight:600;color:#FF4244;font-size:28px;">Congratulations. You are qualified for our offer.</div><br><br><div style="text-align:center;font-weight:600;">Please click the button below to get your coupon.</div><a href="' + response.data.couponLink + '" target="_blank" style="text-decoration:none;"><button style="display:block;margin:20px auto;margin-bottom:40px;border-radius:5px;background-color:#E54C3C;border:none;color:white;width:200px;height:50px;font-weight:600;">Coupon</button></a>';
	        	  user.sendEmail(user.info.id, 'MobileAds Coupon Link', emailContent);
						}
						else {
							// user.messageTwitter(message);
						}
					}
					else {
						this.initResult('lose');
					}
  			}).catch((error) => {
  				console.log(error);
	  			this.initResult('win');
  			});
  		}
  		else {
  			user.lose(user.info.id, user.source).then((response) => {
  				console.log(response);
  			}).catch((error) => {
  				console.log(error);
  			});
  			this.initResult('lose');
  		}
		}
		else {
			this.initResult(this.scratchResult);
		}	
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
				alert('registration error')
			})
		};

		/* Fb Login */
		document.getElementById('regFb').addEventListener('click', () => {
			user.registerFb()
		})
		/* ==== Event Listeners End ==== */
	},
	initEraser: function() {
		var result = winningLogic.process(true);
		this.scratchResult = result.actualResult;
		if (this.scratchResult == 'win') {
			document.getElementById('scratchLose').style.display = 'none'
		}
		else {
			document.getElementById('scratchWin').style.display = 'none'
		}
		this.eraser = new Eraser({
			ele: document.getElementById('scratchCover'),
			completeRatio: 0.6,
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
	},
	continue() {
		if (user.info.id) {
			if (user.info.state == 'win') {
				this.initResult('win', user.info.couponCode);
				this.pages.toPage('resultPage')
			}
			else if (user.info.state == 'lose') {
				this.initResult('lose')
				this.pages.toPage('resultPage')
			}
			else {
				this.pages.toPage('gamePage')
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

				if (this.params.displayName) { // line login
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
				console.log(user.info)
				this.continue()
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
		this.initEraser();
		this.events();

		if (this.params.source) {
			user.changeSource(source)
		}

		if (this.params.reset) {
		  	user.clearAllData();
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
  window.params = app.params;
  window.user = user
});

export {
	user
}