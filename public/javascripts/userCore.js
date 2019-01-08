import storage from './storage'
import config from './config'
import axios from 'axios';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from './firebaseConfig';
firebase.initializeApp(firebaseConfig);

let user = {
	info: {
		couponCode: '',
		id: '',
		state: '-',
		source: '',
		gameData: {},
		trackedPages: []
	},
	oauth: {
		token: '',
		secret: ''
	},
	changeSource(source) {
		this.info.source = source
		config.source = source
	},
	setUserInfo(userInfo) {
		if (typeof userInfo == 'object') {
			for (let i in userInfo) {
				if (this.info.hasOwnProperty(i)) {
					this.info[i] = userInfo[i]
				}
			}
			if (!config.isDemo) {
				storage.saveUserData(this.info)
			}
		}
		else {
			console.error('user info must be an object.')
		}
	},
	clearUserInfo() {
		this.setUserInfo({
			couponCode: '',
			id: '',
			state: '-',
			source: this.info.source,
			gameData: {},
			trackedPages: []
		})
	},
	getLocalUser(source) {
		if (!config.isDemo) {
			const localUser = storage.getUserData(source)
			if (localUser.id) {
				this.setUserInfo(localUser)
			}
		}
	},
	saveGameData(obj) {
		if (!config.isDemo) {
			storage.saveGameData(obj, this.info.source)
		}
	},
	getGameData() {
		if (!config.isDemo) {
			return storage.getGameData(this.info.source)
		}
		else {
			return {}
		}
	},
	clearLocalSourceData() {
		storage.clearSourceData(this.info.source)
	},
	clearAllLocalData() {
		storage.clearAllData()
	},
	registerFb: function() {
		window.redirectState.set()
		var provider = new firebase.auth.FacebookAuthProvider()
		firebase.auth().signInWithRedirect(provider);
	},
	register(userInfo) {
		if (userInfo.userId && userInfo.source && userInfo.type) {
			return axios.post(`${config.userAPIDomain}/coupons/goldenBowl/user_register?id=${userInfo.userId}&source=${userInfo.source}&type=${userInfo.type}`)
		}
		else {
			console.error('userInfo error')
		}
	},
	get(userInfo) {
		if (userInfo.userId && userInfo.source) {
			return axios.get(`${config.userAPIDomain}/coupons/goldenBowl/user_info?id=${userInfo.userId}&source=${userInfo.source}`)
		}
		else {
			console.error('userInfo error')
		}
	},
	generateCouponLink() {
		return config.couponLink + `?userId=${user.info.id}`
	},
	mark(couponId) {
		if (!config.isDemo) {
			return axios.post(`${config.userAPIDomain}/coupons/goldenBowl/mark_user?id=${this.info.id}&source=${this.info.source}&couponId=${couponId}`)
		}
		else {
			return new Promise((resolve, reject) => {
				resolve({
					data: {
						message: 'marked.',
						state: 'win',
						status: true
					}
				})
			})
		}
	},
	sendLoginEmail(email) {
		let formData = new FormData()
	    formData.append('sender', config.emailSender)
	    formData.append('subject', config.loginEmail.subject)
	    formData.append('recipient', email)
	    let content = config.loginEmail.content.replace(/{{userId}}/g, email).replace(/{{campaignLink}}/g, config.campaignLink)
	    formData.append('content', content)
	    axios.post('https://www.mobileads.com/mail/send', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then((resp) => {
	      console.log(resp);
	    }).catch((error) => {
	      console.log(error);
	    });
	},
	sendCouponEmail(email, couponLink) {
		let formData = new FormData()
	    formData.append('sender', config.emailSender)
	    formData.append('subject', config.couponEmail.subject)
	    formData.append('recipient', email)
	    let content = config.couponEmail.content.replace(/{{couponLink}}/g, couponLink)
	    formData.append('content', content)
	    axios.post('https://www.mobileads.com/mail/send', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then((resp) => {
	      console.log(resp);
	    }).catch((error) => {
	      console.log(error);
	    });
	},
	sendEmail(options) {
		let formData = new FormData();
	    formData.append('sender', config.emailSender);
	    formData.append('subject', options.subjectTitle);
	    formData.append('recipient', options.email);
	    formData.append('content', options.content);
	    axios.post('https://www.mobileads.com/mail/send', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then((resp) => {
	      console.log(resp);
	    }).catch((error) => {
	      console.log(error);
	    });
	},
	getRedirectResult() {
		return new Promise(function(resolve, reject) {
			firebase.auth().getRedirectResult().then(function(result) {
			  resolve(result);
			}).catch(function(error) {
			  reject(error);
			});	
		});
	},
	init(options) {
		/* get user data from database, 
		   if autoRegister is set to true, the userId will be automatically registered if user has not registered yet */
		return new Promise((resolve, reject) => {
			this.get(options.userInfo).then((response) => {
				if (response.data.status == true) { // user found
					this.setUserInfo({
						id: response.data.user.id,
						source: this.info.source,
						state: response.data.user.state,
						couponCode: response.data.user.couponCode,
						// gameData: JSON.parse(response.data.user.game)
					})
					resolve({
						status: true,
						message: response.data.message,
						user: response.data.user
					})
				}
				else {  // user has not found
					if (options.autoRegister == true) { // register user if autoRegister is set to true
						this.register(options.userInfo).then((res) => {
							if (res.data.status == true) { // successfully registered
								this.setUserInfo({
									id: options.userInfo.userId,
									source: this.info.source,
								})
								resolve({
									status: true,
									message: res.data.message
								})
							}
							else {
								if (res.data.message == 'user exist.') { // user exists (Theoretically, this won't happen, because we checked user before registering)
									this.setUserInfo({
										id: res.data.user.id,
										source: this.info.source,
										state: res.data.user.state,
										couponCode: res.data.user.couponCode,
										// gameData: JSON.parse(response.data.user.game)
									})
								}
								resolve({
									status: false,
									user: res.data.user,
									message: res.data.message
								})
							}
						}).catch((err) => { // failed to register
							reject(err)
						})
					}
					else { // autoRegister is false, don't register user
						resolve({
							status: false,
							message: response.data.message
						})
					}
				}
			}).catch((error) => { // failed to get user
				reject(error)
			})
		})
	},
}

user.info.source = config.source

export default user;