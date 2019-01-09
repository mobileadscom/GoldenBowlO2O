let store = {
	selected: null,
	locs: [],
	disabled: false,
	callback: null,
	selectLoc: function(e) {
		if (!this.disabled) {
			this.selected = e.target.dataset.id
			for (let l = 0; l < this.locs.length; l++) {
				this.locs[l].classList.remove('selected')
			}
			e.target.classList.add('selected')
			if (this.selected) {
				if (this.callback) {
					this.callback()
				}
			}
		}
	},
	init: function(callback) {
		// console.log(this)
		this.locs  = document.getElementsByClassName('location')
		for (let l = 0; l < this.locs.length; l++) {
			this.locs[l].addEventListener('click', (e) => {
				this.selectLoc(e)
			})
		}
		if (callback) {
			this.callback = callback
		}
	}
}

export default store