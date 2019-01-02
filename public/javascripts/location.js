let location = {
	selected: null,
	locs: [],
	selectLoc: function(e) {
		this.selected = e.target.dataset.id
		for (let l = 0; l < this.locs.length; l++) {
			this.locs[l].classList.remove('selected')
		}
		e.target.classList.add('selected')
		if (this.selected) {
			document.getElementById('confirmRedeem').disabled = false
		}
	},
	init: function() {
		// console.log(this)
		this.locs  = document.getElementsByClassName('location')
		for (let l = 0; l < this.locs.length; l++) {
			this.locs[l].addEventListener('click', (e) => {
				this.selectLoc(e)
			})
		}
	}
}

export default location