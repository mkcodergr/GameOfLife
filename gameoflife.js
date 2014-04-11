"use strict";
var interval, GOL;
window.onload = function() {
	GOL = {

		fieldSize: 10,
		board: [],
		mouseX: 0,
		mouseY: 0,
		mDown: false,

		makeBoard: function(id, sizex, sizey) {
			var self = this;
			var table = document.getElementById(id);
			if(!table) throw "Table "+id+" not found!";
			for(var y=0; y < sizey; ++y) {
				var tr = document.createElement('tr');
				tr.id = y;
				this.board[y] = [];
				for(var x=0; x < sizex; ++x) {
					var td = document.createElement('td');
					td.id = x + 'x' + y;
					td.onclick = function() { 
						var coord = this.id.split('x');
						self.displayTooltip(parseInt(coord[0]), parseInt(coord[1])); 
					};
					tr.appendChild(td);
					this.board[y][x] = false;
				}
				table.appendChild(tr);
			}
		},

		getAction: function(x, y) {
			var countCells = this.countNeighbors(x, y);
			var alive = this.isAlive(x, y);
			if(!alive && countCells == 3) return 1; // Rebirth
			if(alive && countCells < 2) return 2; // Die of lonelyness
			if(alive && countCells < 4 && countCells > 1) return 0; // Do nothing
			if(alive && countCells > 3) return 2; // Die of overcrowding 
			return 0; // Nothing. i.e.: dead cell, != 3 neighbors

		},

		countNeighbors: function(cx, cy) {
			var countCells = 0;
			for(var x=-1; x <= 1; ++x) {
				for(var y=-1; y <= 1; ++y) {
					if(this.isAlive(cx + x, cy + y) && (x!=0 || y!=0)) { // Do not count yourself
						countCells++;
					}
				}
			}
			return countCells;
		},

		isAlive: function(x, y) {
			try {
			if(x < 0 || y < 0) return false;
			if(y >= this.board.length || x >= this.board[y].length) return false;
			return this.board[y][x];
			} catch(e) {
				console.log(x);
				console.log(new Error().stack);
			}
		},

		populateBoard: function() {
			for(var y=0; y < this.board.length; ++y) {
				for(var x=0; x < this.board[y].length; ++x) {
					var td = document.getElementById(x + 'x' + y);
					td.style.backgroundColor = (this.board[y][x]) ? '#00ff00' : '#ddd';
				}
			}
		},

		getActions: function() {
			var actions = [];
			for(var y=0; y < this.board.length; ++y) {
				for(var x=0; x < this.board[y].length; ++x) {
					var action = this.getAction(x, y);
					if(action != 0)
						actions.push({
							x: x,
							y: y,
							action: action
						});
				}
			}
			return actions;
		},

		performActions: function(actions) {
			for(var i=0; i < actions.length; ++i) {
				if(actions[i].action == 1) { // Rebirth
					this.board[actions[i].y][actions[i].x] = true;
					document.getElementById(actions[i].x + 'x' + actions[i].y).style.backgroundColor = '#00ff00';
				} else { // Die
					this.board[actions[i].y][actions[i].x] = false;
					document.getElementById(actions[i].x + 'x' + actions[i].y).style.backgroundColor = '#ddd';
				}
			}
		},

		step: function() {
			this.performActions(this.getActions());
		},

		clear: function() {
			for(var y=0; y < this.board.length; ++y) 
				for(var x=0; x < this.board[y].length; ++x) 
					this.board[y][x] = false;
			this.populateBoard();
		},

		displayTooltip: function(x, y) {
			var neighbors = this.countNeighbors(x, y);
			var action = this.getAction(x, y);
			var div = document.getElementById('tooltip');
			div.style.display = "block";
			div.style.left = this.mouseX + 'px';
			div.style.top = this.mouseY + 'px';
			document.getElementById('neighbors').innerHTML = neighbors;
			document.getElementById('action').innerHTML = (action == 2) ? 'kill' : (action==1) ? 'Rebirth' : 'Nothing';
			document.getElementById('x').innerHTML = x;
			document.getElementById('y').innerHTML = y;
		},

		hideTooltip: function() {
			document.getElementById('tooltip').style.display = "none";
		},

		mouseMove: function(e) {
			GOL.mouseX = e.pageX;
			GOL.mouseY = e.pageY;

			if(GOL.mDown) {
				var x = parseInt(GOL.mouseX / (GOL.fieldSize+2)); // 7px td + 2px tableborder
				var y = parseInt(GOL.mouseY / (GOL.fieldSize+2));
				GOL.board[y][x] = true;
			}
		},

		mouseDown: function() {GOL.mDown = true;},
		mouseUp: function() {GOL.mDown = false;GOL.populateBoard();}
	};

	document.onmousemove = GOL.mouseMove;
	document.onmousedown = GOL.mouseDown;
	document.onmouseup = GOL.mouseUp;

	GOL.makeBoard('board', 150, 100);
};

function toggle() {
	if(document.getElementById('startbutton').value == 'Stop') {
		clearInterval(interval);
		document.getElementById('startbutton').value = 'Start';
	} else {
		interval = setInterval(function(){GOL.step()}, 300);
		document.getElementById('startbutton').value = 'Stop';
	}
}

function hideTooltip() {
	document.getElementById('tooltip').style.display = 'none';
}