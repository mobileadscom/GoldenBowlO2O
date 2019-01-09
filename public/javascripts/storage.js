let storage = {
	// make sure same as in index.html
	storageName: 'o2o_rma',
	storageKey: 'goldenBowl',
	saveUserData(obj) {
		const source = obj.source
		const storageName = this.storageName
		const storageKey = this.storageKey
		if (window.localStorage.getItem(storageName)) {
			try {
				let dataObj = JSON.parse(window.localStorage.getItem(storageName))
				if (dataObj[storageKey]) {
					dataObj[storageKey][source] = obj;
					window.localStorage.setItem(storageName, JSON.stringify(dataObj))
				}
				else {
					dataObj[storageKey] = {}
					dataObj[storageKey][source] = obj;
					window.localStorage.setItem(storageName, JSON.stringify(dataObj))
				}
			}
			catch(err) {
				console.log(err)
			}
		}
		else {
			let dataObj = {}
			dataObj[storageKey] = {}
			dataObj[storageKey][source] = obj;
			window.localStorage.setItem(storageName, JSON.stringify(dataObj));
		}
	},
	getUserData(source) {
		const storageName = this.storageName
		const storageKey = this.storageKey
		if (window.localStorage.getItem(storageName)) {
			try {
				let dataObj = JSON.parse(window.localStorage.getItem(storageName))
				if (dataObj[storageKey] && dataObj[storageKey][source]) {
					return dataObj[storageKey][source]
				}
				else {
					return {}
				}			
			}
			catch(err) {
				return {}
			}
		}
		else {
			return {}
		}
	},
	saveGameData(obj, source) {
		const storageName = this.storageName
		const storageKey = this.storageKey
		if (window.localStorage.getItem(storageName)) {
			try {
				let dataObj = JSON.parse(window.localStorage.getItem(storageName))
				if (dataObj[storageKey] && dataObj[storageKey][source]) {
					dataObj[storageKey][source].gameData = obj	
					window.localStorage.setItem(storageName, JSON.stringify(dataObj))
				}
			}
			catch(err) {
				console.log(err)
			}
		}
	},
	getGameData(source) {
		const storageName = this.storageName
		const storageKey = this.storageKey
		if (window.localStorage.getItem(storageName)) {
			try {
				let dataObj = JSON.parse(window.localStorage.getItem(storageName))
				if (dataObj[storageKey] && dataObj[storageKey][source]) {

					return dataObj[storageKey][source].gameData
				}
				else {
					return {}
				}			
			}
			catch(err) {
				return {}
			}
		}
		else {
			return {}
		}
	},
	clearSourceData(source) {
		this.saveUserData({
			couponCode: '',
			id: '',
			state: '-',
			source: source,
			gameData: {},
			trackedPages: []
		})
	},
	clearAllData() {
		const storageName = this.storageName
		const storageKey = this.storageKey
		if (window.localStorage.getItem(storageName)) {
			let dataObj = JSON.parse(window.localStorage.getItem(storageName))
			if (dataObj[storageKey]) {
				delete dataObj[storageKey]
				window.localStorage.setItem(storageName, JSON.stringify(dataObj))
			}
		}
	}
}

export default storage
