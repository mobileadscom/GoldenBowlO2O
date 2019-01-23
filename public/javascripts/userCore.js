import storage from './storage'
import axios from 'axios';

let user = {
	info: {
		couponCode: '',
		id: '',
		state: '-',
		source: '',
		gameData: {},
		type: '',
		trackedPages: [],
		trackedEvents: []
	},
	oauth: {
		token: '',
		secret: ''
	},
	config: {}, // put in config from index.js
	changeSource(source) {
		this.info.source = source
		this.config.source = source
	},
	setUserInfo(userInfo) {
		if (typeof userInfo == 'object') {
			for (let i in userInfo) {
				if (this.info.hasOwnProperty(i)) {
					this.info[i] = userInfo[i]
				}
			}
			if (!this.config.isDemo) {
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
			type: '',
			trackedPages: [],
			trackedEvents: []
		})
	},
	getLocalUser(source) {
		if (!this.config.isDemo) {
			const localUser = storage.getUserData(source)
			if (localUser.id) {
				this.setUserInfo(localUser)
			}
		}
	},
	saveGameData(obj) {
		if (!this.config.isDemo) {
			storage.saveGameData(obj, this.info.source)
		}
	},
	getGameData() {
		if (!this.config.isDemo) {
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
	trackPage(page) {
		let tp = this.info.trackedPages
		if (tp.indexOf(page) > -1) {
			return false
		}
		else {
			tp.push(page)
			this.setUserInfo({
				trackedPages: tp
			})
			return true
		}
	},
	trackEvent(event) {
		let te = this.info.trackedEvents
		if (te.indexOf(event) > -1) {
			return false
		}
		else {
			te.push(event)
			this.setUserInfo({
				trackedEvents: te
			})
			return true
		}
	},
	register(userInfo) {
		if (userInfo.userId && userInfo.source && userInfo.type) {
			return axios.post(`${this.config.userAPIDomain}/user_register?id=${userInfo.userId}&source=${userInfo.source}&type=${userInfo.type}`)
		}
		else {
			console.error('userInfo error')
		}
	},
	get(userInfo) {
		if (userInfo.userId && userInfo.source) {
			return axios.get(`${this.config.userAPIDomain}/user_info?id=${userInfo.userId}&source=${userInfo.source}`)
		}
		else {
			console.error('userInfo error')
		}
	},
	generateCouponLink() {
		return this.config.couponLink + `?userId=${user.info.id}`
	},
	mark(couponId) {
		if (!this.config.isDemo) {
			return axios.post(`${this.config.userAPIDomain}/mark_user?id=${this.info.id}&source=${this.info.source}&couponId=${couponId}`)
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
	    formData.append('sender', this.config.emailSender)
	    formData.append('subject', this.config.loginEmail.subject)
	    formData.append('recipient', email)
	    let content = this.config.loginEmail.content.replace(/{{userId}}/g, email).replace(/{{campaignLink}}/g, this.config.campaignLink)
	    formData.append('content', content)
	    axios.post('https://www.mobileads.com/mail/send', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then((resp) => {
	      console.log(resp);
	    }).catch((error) => {
	      console.log(error);
	    });
	},
	sendCouponEmail(email, couponLink) {
		let formData = new FormData()
	    formData.append('sender', this.config.emailSender)
	    formData.append('subject', this.config.couponEmail.subject)
	    formData.append('recipient', email)
	    let content = this.config.couponEmail.content.replace(/{{couponLink}}/g, couponLink)
	    formData.append('content', content)
	    axios.post('https://www.mobileads.com/mail/send', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then((resp) => {
	      console.log(resp);
	    }).catch((error) => {
	      console.log(error);
	    });
	},
	sendEmail(options) {
		let formData = new FormData();
	    formData.append('sender', this.config.emailSender);
	    formData.append('subject', options.subjectTitle);
	    formData.append('recipient', options.email);
	    formData.append('content', options.content);
	    axios.post('https://www.mobileads.com/mail/send', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then((resp) => {
	      console.log(resp);
	    }).catch((error) => {
	      console.log(error);
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
						type: response.data.user.type
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
								if (options.userInfo.type != 'email') {
									this.setUserInfo({
										id: options.userInfo.userId,
										source: this.info.source,
										type: options.userInfo.type
									})
								}
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
										type: res.data.user.type
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
	setConfig(config) {
		this.config = config
		this.info.source = config.source
	}
}

// user.info.source = config.source

export default user;