import config from './config'

let tracking = {
	trackingURL: config.tracking.generalURL.replace('{{rmaId}}', config.tracking.rmaId).replace('{{campaignId}}', config.tracking.campaignId).replace('{{adUserId}}', config.tracking.adUserId).replace('{{cb}}', window.pgId || Date.now().toString())
}

export default tracking