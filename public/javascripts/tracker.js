let tracker = {
	config: {}, //set config in index.js
	generateTrackingURL() {
		this.trackingURL = this.config.tracking.generalURL.replace('{{rmaId}}', this.config.tracking.rmaId).replace('{{campaignId}}', this.config.tracking.campaignId).replace('{{adUserId}}', this.config.tracking.adUserId).replace('{{cb}}', window.pgId || Date.now().toString()).replace('{{source}}', this.config.tracking.utm_source)
	},
	track(type, val, uid, utype) {
		let value = val || '{{value}}'
		let userId = uid || '{{userId}}'
		let userType = utype || '{{userType}}'
		let src = this.trackingURL.replace('{{type}}', type).replace('{{value}}', value).replace('{{userId}}', userId).replace('{{userType}}', userType)
		if (this.config.isDemo || window.location.hostname.indexOf('localhost') > -1) {
			console.log(src)
		}
		else {
			var pixel = document.createElement('img');
			pixel.src = src;
			document.head.appendChild(pixel);
		}
	},
	setConfig(config) {
		this.config = config
	}
}

export default tracker