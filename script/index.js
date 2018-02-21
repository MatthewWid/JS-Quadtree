var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.translate(0.5, 0.5);

var config = {
	cSize: 700, // Size of the canvas
	jitter: true, // Have random jittering of each square?
	squares: 1500, // How many random squares to add,
	standardDim: 5, // Size of each square (W x H)
	animate: "60", // Animation type/speed. "60" = 60 FPS, "slow" = 10 FPS, "none" = No animation at all
	colType: "qtree", // Type of collision detection, "qtree" = utilising QuadTree, "all" = No QuadTree, check all against all, "none" = no collision detection
	drawTree: true, // If the QuadTree should be drawn
	idText: false // Draw the square's ID on its respective square
};
c.width = c.height = config.cSize;

var quadTree = new QuadTree({
	x: 0,
	y: 0,
	w: c.width,
	h: c.height
});
var tempTrees = [];

// Array of keys pressed
var keys = [];

// Array of all squares
var squares = [];

// Add squares in random positions
for (var i = 0; i < config.squares; i++) {
	squares.push({
		x: Math.floor(Math.random() * c.width),
		y: Math.floor(Math.random() * c.height),
		w: config.standardDim,
		h: config.standardDim,
		colour: "transparent",
		isColliding: false
	});
}

// Give each square an ID
for (var i = 0; i < squares.length; i++) {
	squares[i].id = i;
}

// Detection collisions between two objects using the Bounding Box Collision Detection method
function dectCol_bbox(obj1, obj2) {
	return (obj1.id != obj2.id && // Obj1 is not Obj2 - Objects cannot collide with themselves
			obj1.x < obj2.x + obj2.w && // Obj1 left side is to the left of the right side of Obj2
			obj1.x + obj1.w > obj2.x && // Obj1 right side is to the right of the left side of Obj2
			obj1.y < obj2.y + obj2.h && // Obj1 top side is above the bottom side of Obj2
			obj1.y + obj1.h > obj2.y    // Obj1 bottom side is below top side of Obj2
	);
}

// Detect collisions between *all* objects (Laggy)
function detectCollisions_all() {
	var objects = [];

	for (var i = 0; i < squares.length; i++) {
		for (var l = 0; l < squares.length; l++) {
			if (i != l) {
				if (dectCol_bbox(squares[i], squares[l])) {
					squares[i].isColliding = true;
					break;
				} else {
					squares[i].isColliding = false;
				}
			}
		}
	}
}

// Detect collisions utilising the QuadTree
function detectCollisions_qtree() {
	var objects = [];
	quadTree.getAllObjects(objects);

	for (var i = 0, len = objects.length; i < len; i++) {
		quadTree.findObjects(obj = [], objects[i]);

		for (var l = 0, lent = obj.length; l < lent; l++) {
			if (dectCol_bbox(objects[i], obj[l])) {
				objects[i].isColliding = true;
				break;
			} else {
				objects[i].isColliding = false;
			}
		}
	}
}

// Draw all QuadTrees
function drawQuadTreeBounds(trees) {
	ctx.strokeStyle = "rgb(180, 180, 180)";
	for (var i = 0; i < trees.length; i++) {
		ctx.beginPath();
		ctx.rect(trees[i].x, trees[i].y, trees[i].w, trees[i].h);
		ctx.stroke();
		ctx.closePath();
	}
}

function update() {
	ctx.clearRect(0, 0, c.width, c.height);

	// Move the second square when pressing arrow keys
	if (keys[39]) {
		squares[1].x++;
	}
	if (keys[37]) {
		squares[1].x--;
	}
	if (keys[38]) {
		squares[1].y--;
	}
	if (keys[40]) {
		squares[1].y++;
	}

	// Random jitter for each square
	if (config.jitter) {
		for (var i = 0; i < squares.length; i++) {
			squares[i].x += Math.random() < 0.5 ? -1 : 1;
			squares[i].y += Math.random() < 0.5 ? -1 : 1;
		}
	}

	// Clear the entire QuadTree and re-add all objects
	quadTree.clear();
	quadTree.insert(squares);
	if (config.colType == "qtree") {
		detectCollisions_qtree();
	} else if (config.colType == "all") {
		detectCollisions_all();
	}

	render();
	if (config.animate != "none") {
		if (config.animate == "60") {
			requestAnimationFrame(update);
		} else if (config.animate == "slow") {
			setTimeout(update, 100);
		}
	}
}


ctx.font = Math.floor(config.standardDim * 0.8) + "px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

function render() {
	ctx.strokeStyle = "rgb(0, 0, 0)";
	for (var i = 0; i < squares.length; i++) {
		// Square colour
		ctx.fillStyle = squares[i].colour;
		if (squares[i].isColliding) {
			ctx.fillStyle = "red";
		}

		// Draw square
		ctx.beginPath();
		ctx.rect(squares[i].x, squares[i].y, squares[i].w, squares[i].h);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();

		if (config.idText) {
			// Text of square ID inside square
			ctx.fillStyle = "rgb(0, 0, 0)";
			ctx.fillText(squares[i].id, squares[i].x + squares[i].w / 2, squares[i].y + squares[i].h / 2);
		}
	}

	if (config.colType == "qtree" && config.drawTree) {
		// Get all QuadTrees and draw them
		tempTrees = [];
		quadTree.getAllTrees(tempTrees);
		drawQuadTreeBounds(tempTrees);
	}
}

// Add a square where the user clicks
c.addEventListener("click", function(evt) {
	var e = {
		x: evt.pageX - c.getBoundingClientRect().left,
		y: evt.pageY - c.getBoundingClientRect().top
	};
	squares.push({
		x: e.x - config.standardDim / 2,
		y: e.y - config.standardDim / 2,
		w: config.standardDim,
		h: config.standardDim,
		colour: "transparent",
		isColliding: false,
		id: squares[squares.length - 1].id + 1
	});
});
document.addEventListener("keydown", function(evt) {
	keys[evt.keyCode] = true;
});
document.addEventListener("keyup", function(evt) {
	keys[evt.keyCode] = false;
});

update();