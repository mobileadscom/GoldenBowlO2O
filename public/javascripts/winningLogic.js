var winningLogic = {
  random: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  },
	process: function(considerGroup) {
    var actualResult = 'lose';
    if (this.random(1, 100) >= 50) {
      actualResult = 'win';
    }
    else {
      actualResult = 'lose';
    }
    
    return {
      actualResult: actualResult,
      group: 'A'
    }
	}
}

export default winningLogic;