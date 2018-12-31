import miniPages from './miniPages';
import Eraser from './eraser.js';
import miniSelect from './miniSelect';
import modal from './modal';
import winningLogic from './winningLogic';
import user from './userDemo';
import '../stylesheets/pageLayout.css';
import '../stylesheets/eraser.css';
import '../stylesheets/miniSelect.css';
import '../stylesheets/style.css';
import '../stylesheets/miniCheckbox.css';
import '../stylesheets/modal.css';
import '../stylesheets/regForm.css';

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
	continue: function() {
		// this.changeHeaderImage();


		

		/*apply answer to answered question */


		if (user.info.state == 'win') {
			this.initResult('win', user.info.couponLink);
			this.pages.toPage('resultPage');
		}
		else if (user.info.state == 'lose') {
			this.initResult('lose');
			this.pages.toPage('resultPage');
		}
		else {
			this.pages.toPage('gamePage');
		}
	},
	events: function() {
		/* ==== Event Listeners ==== */
	  /* enabled terms agree checkbox when scrolled tnc to bottom */
	 /* var enableAgreeCheckbox = false;
	  document.getElementById('tnc').addEventListener('scroll', function(event) {
	  	if (!enableAgreeCheckbox) {
	  		var element = event.target;
		    if (element.scrollHeight - element.scrollTop < element.clientHeight + 50) {
		    	document.getElementById('startSurvey').disabled = false;*/
		      /*document.getElementById('agreeCheck').disabled = false;
		      enableAgreeCheckbox = true;*/
		 //    }
	  // 	}
	  // });
	  
	  /* enable start survey button when terms agree checkbox is checked */
	  document.getElementById('agreeCheck').onchange = function() {
	    if (this.checked) {
				document.getElementById('startSurvey').disabled = false;
	    }
	    else {
	    	document.getElementById('startSurvey').disabled = true;
	    }
	  }
	  
	  /* Finished Answering Questions, process result */
	  /*var processed = false;
	  document.getElementById('toResult').addEventListener('click', () => {
	  	if (!processed) {
	  		processed = true;
	  		this.processResult();
	  	}
	  });*/

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
				user.register(email).then((response) => {
					console.log(response);
					spinner.style.display = 'none';
				// if (response.data.status == true) {
						this.formSections.toPage('doneSec');
						var emailContent = '<head><meta charset="utf-8"></head>Thank you for registering. Please click the link below to complete your registration and join the campaign.<br><br><a href="https://demo.o2oplatform.com/scratch/?userId=' + email + '" target="_blank">https://demo.o2oplatform.com/scratch/?userId=' + email + '</a>';
						user.sendEmail(email, 'MobileAds O2O Demo Link', emailContent);
						// user.trackRegister();
				//  }
				//   else if (response.data.message == 'user exist.') {
					//   user.info = response.data.user;
				//    	 this.continue();
						// modal.closeAll();
				//  }
				}).catch((error) => {
					console.log(error);
					regBtn.style.display = 'block';
					backBtn.style.display = 'block';
					spinner.style.display = 'none';
				});
			};

    /* twitter registration / login */
    var twitReg = document.getElementById('regTwitter');
    twitReg.onclick = () => {
      var regLoader = document.getElementById('regWorking');
      var regButtons = document.getElementById('regButtons');
      regLoader.style.display = 'block';
      regButtons.style.display = 'none';
			user.registerTwitter().then((result) => {
        // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
        // You can use these server side with your app's credentials to access the Twitter API.
        user.twitter.token = result.credential.accessToken;
        user.twitter.secret = result.credential.secret;
        var twitterId = result.additionalUserInfo.profile.id_str;
        this.initUser(twitterId, true, true);
      }).catch((error) => {
      	regLoader.style.display = 'none';
        regButtons.style.display = 'block';
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        alert(errorMessage);
        // ..
      });
    };

    var followBtn = document.getElementById('followBtn');
    followBtn.onclick = () => {
    	followBtn.style.display = 'none';
    	user.followTwitter().then((response) => {
				console.log(response);
	        if (response.data == 'followed!') {
	          var sMsg = document.getElementById('successFollow');
	          sMsg.style.display = 'block';
	          setTimeout(() => {
	            this.continue();
	          }, 2000);
	        }
    	}).catch((error) => {
				console.log(error);
				followBtn.style.display = 'block';
    	});
    }

    document.getElementById('toVideo').addEventListener('click', () => {
			setTimeout(() => {
				this.player.playVideo();
			}, 300);
    });
	  /* ==== Event Listeners End ==== */
	},
	checkTwitter: function() { // Check if user is following official page
		user.isFollowingTwitter().then((resp) => {
      console.log(resp);
      if (resp.data == 'following') {
				this.continue();
      }
      else {
		     this.pages.toPage('followPage');
		     // this.changeHeaderImage();
      }
    // this.continue();
    }).catch((error) => {
      console.log(error);
      document.getElementById('regWorking').style.display = 'none';
      document.getElementById('regButtons').style.display = 'block';
    });
	},
	initUser: function(userId, autoRegister, isTwitter) {
		/* check if user is registered, if no, then register user, if yes, continue on where the user left off */
		user.get(userId).then((response) => {
			console.log(response);
    	if (response.data.status == false) { // user is not registered
	    	if (autoRegister) {
	    		user.register(userId).then((res) => { // auto register user
						console.log(res);
						user.isWanderer = false;
						user.info.id = userId;
						user.source = this.params.source;
						if (isTwitter) {
							this.checkTwitter();
						}
						else {
							this.continue();
						}
					  // user.trackRegister();
	    		}).catch((err) => {
	    			user.isWanderer = true;
	    			console.log(err);
	    			// this.pages.toPage('page1')
	    			this.pages.toPage('regPage');
	    		});
	    	}
	    	else {
	    		this.pages.toPage('regPage');
	    		// this.pages.toPage('page1')
	    	}
    	}
    	else { // user is registered
    		user.isWanderer = false;
				user.info = response.data.user;
				user.source = this.params.source;
				
				if (isTwitter) {
					this.checkTwitter();
				}
				else {
					this.continue();
				}
    	}
    }).catch((error) => {
    	user.isWanderer = true;
			console.log(error);
			this.pages.toPage('regPage');
			// this.pages.toPage('page1')
    });
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
	},
	init: function() {
		var vidWidth = document.getElementById('vid').clientWidth;
	    var vidHeight = document.getElementById('vid').clientHeight;

		/* init pagination */
		this.params = this.getParams();
		if (this.params.displayName) {
			this.params.signInMethod = 'line';
		}
		this.params.source = 'source1'; // dummy source
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
    /* apply mini select to <select> */
	  miniSelect.init('miniSelect');

	  /* User Info */
	  if (!this.params.userId || !this.params.source) {
		  user.isWanderer = true;
	    setTimeout(() => {
		    this.pages.toPage('regPage');
		    // this.pages.toPage('page1')
		  }, 1000);
	  }
	  else {
	  	if (this.params.signInMethod == 'line') {
			this.initUser(this.params.userId, true);
	  	}
	  	else {
	  		this.initUser(this.params.userId, false);
	  	}
	}
	  
	  var processed = false; // check if result has been processed to avoid double result processsing

		//youtube api
    var ytScript = document.createElement('script');
    ytScript.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(ytScript, firstScriptTag);
    
    window.onYouTubeIframeAPIReady = () => {
      this.player = new YT.Player('vid', {
        height: vidHeight.toString(),
        width: vidWidth.toString(),
        playerVars: {'rel': 0,'showinfo': 0, 'controls': 0, 'playsinline': 1},
        videoId: '6kpZW8oQ9tw',
        events: {
          'onStateChange': (event) => {
            if (event.data == YT.PlayerState.ENDED) {
            	/*if (!processed) {
	            	processed = true;
	            	this.processResult();
								this.pages.toPage('resultPage');
							}*/
				this.pages.toPage('page2');
            }
            else if (event.data == YT.PlayerState.PLAYING) {
            	var playtimer = setInterval(() => {
	        		if (this.player.getPlayerState() != 1) {
	        			console.log('videoEnded!');
	        			clearInterval(playtimer);
	        		}
	        		else {
	        			var percentage = (this.player.getCurrentTime() / this.player.getDuration() * 100).toFixed(0)
		            	document.getElementById('vidProgress').style.width = percentage + '%'
	        		}
	        	}, 500);
            	
				
            }
          }
        }
      });
    }
	},
	/*changeHeaderImage() {
    	document.getElementById('mainBanner').style.display = 'none';
    	var x = window.matchMedia("(min-width: 992px)");
    	if (!x.matches) {
			document.getElementById('banner').style.display = 'block';
    	}
	}*/
}

document.addEventListener('DOMContentLoaded', function() {
  app.init();
  modal.init();
  window.params = app.params;
});

export {
	user
}