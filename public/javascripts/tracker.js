let tracker = {
	config: {}, //set config in index.js
	trackedTypes: [],
	hasTracked(type) {
		if (this.trackedTypes.indexOf(type) > -1) {
			return true
		}
		else {
			return false
		}
	},
	generateTrackingURL() {
		this.trackingURL = this.config.tracking.generalURL.replace('{{campaignId}}', this.config.tracking.campaignId).replace('{{adUserId}}', this.config.tracking.adUserId).replace('{{cb}}', window.pgId || Date.now().toString()).replace('{{source}}', this.config.tracking.utm_source)
	},
	track(type, val, uid, utype, customParams) {
		let value = val || '{{value}}'
		let userId = uid || '{{userId}}'
		let userType = utype || '{{userType}}'
		let src = this.trackingURL.replace('{{type}}', type).replace('{{value}}', value).replace('{{userId}}', userId).replace('{{userType}}', userType)
		if (type == 'win' || type == 'lose') {
			src = src.replace('&tc=o2o', '')
		}

		if (customParams) {
			let paramString = ''
			for (let c in customParams) {
				paramString += `&${c}=${customParams[c]}`
			}
			src += paramString
		}

		if (!this.hasTracked(type)) {
			if (this.config.isDemo || window.location.hostname.indexOf('localhost') > -1) {
				console.log(src)
			}
			else {
				var pixel = document.createElement('img');
				pixel.src = src;
				document.head.appendChild(pixel);
			}
			this.trackedTypes.push(type)
		}
	},
	setConfig(config) {
		this.config = config
	}
}

export default tracker