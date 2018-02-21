function QuadTree(boundBox, lvl) {
	var maxObjects = 4;
	this.bounds = boundBox || {
		x: 0,
		y: 0,
		w: 0,
		h: 0
	};
	var objects = []; // Objects in THIS level of THIS QuadTree
	this.nodes = []; // Child QuadTrees (Lower levels of this QuadTree)
	var level = lvl || 0; // The level this QuadTree is
	var maxLevels = 5; // Limit to the lowest level the QuadTree can go to

	// Empty all objects in this QuadTree and its child QuadTrees
	this.clear = function() {
		objects = [];

		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].clear();
		}
		this.nodes = [];
	};

	// Recursively go through all children on all lowers levels and get children
	// Works by recursively going through every QuadTree, each one adding its object to the overall "returnedObjects" array
	// until there is a giant array of every object
	this.getAllObjects = function(returnedObjects) {
		// Have all children push their objects to the overall "returnedObjects" array
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].getAllObjects(returnedObjects);
		}

		// Push all objects in this QuadTree directly, into the "returnedObjects" array
		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}
		// Return the array
		return returnedObjects;
	};

	// Get all objects in the same QuadTree as the supplied one (Objects that the supplied object could potentially collide with)
	// Works by receiving an object, recursively going through first the parent QuadTree, adding the first QuadTrees objects to the "returnedObjects array"
	// and repeating until there is a full list of objects that the supplied object could potentially collide with
	this.findObjects = function(returnedObjects, obj) {
		if (typeof obj == "undefined") {
			console.warn("index.js - Undefined object.");
			return;
		}
		var index = this.getIndex(obj); // Check if the supplied object can go into any child nodes
		if (index != -1 && this.nodes.length) { // If it can fit into a child node, and this QuadTree has child nodes
			this.nodes[index].findObjects(returnedObjects, obj); // Call .findObjects() on the child node it can fit into
		}
		for (var i = 0, len = objects.length; i < len; i++) { // For every object in this QuadTree
			returnedObjects.push(objects[i]); // Add all the objects in this QuadTree to the "returnedObjects" array
		}
		return returnedObjects; // Return the array
	};

	this.getAllTrees = function(returnedTrees) {
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].getAllTrees(returnedTrees);
		}

		returnedTrees.push(this.bounds);

		return returnedTrees;
	};

	// Insert an object into the QuadTree
	this.insert = function(obj) {
		if (typeof obj == "undefined") { // If no object is provided
			return;
		}
		if (obj instanceof Array) { // If an array is supplied, insert everything in the array individually
			for (var i = 0, len = obj.length; i < len; i++) {
				this.insert(obj[i]);
			}
			return;
		}
		if (this.nodes.length) { // If this QuadTree already has children, check if the new object can fit in any children to put it in that instead
			var index = this.getIndex(obj);
			// Only add object to subnode if it can completely fit, otherwise it will go into the larger parent QuadTree
			if (index != -1) {
				this.nodes[index].insert(obj);
				return;
			}
		}
		objects.push(obj); // Push the new object into the QuadTree's object list
		if (objects.length > maxObjects && level < maxLevels) { // If the QuadTree exceeds its limit of objects AND it is still allowed to split into a lower level of QuadTrees
			if (this.nodes[0] == null) { // If there are no current child QuadTrees, split into four children
				this.split();
			}
			var i = 0;
			while (i < objects.length) { // Go through all the objects of this QuadTree and check if any of them can fit into the new children
				var index = this.getIndex(objects[i]);
				if (index != -1) { // If index is NOT -1 (It can fit) insert into child QuadTree it fits into
					this.nodes[index].insert((objects.splice(i, 1))[0]); // Split the object out of this QuadTree's object list and insert it into the child QuadTree's object list
				} else { // If it cannot fit into any children completely, leave it in this QuadTree's object list
					i++;
				}
			}
		}
	};

	// Get which potential child node the object can go in to.
	// -1 means object cannot completely fit into child node
	// Any other number represents the child node it can completely fit into
	// Eg, index = 1, refer to this.split(), would be the top left node
	this.getIndex = function(obj) {
		var index = -1;
		var verticalMidpoint = this.bounds.x + this.bounds.w / 2; // Get middle X coordinate of this QuadTree
		var horizontalMidpoint = this.bounds.y + this.bounds.h / 2; // Get midle Y coordinate of this QuadTree
		// If the object can fit completely within the top half of the current QuadTree
		var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.h < horizontalMidpoint);
		// If the object can fit completely with the bottom half of the current QuadTree
		var bottomQuadrant = (obj.y > horizontalMidpoint);

		if (obj.x < verticalMidpoint && obj.x + obj.w < verticalMidpoint) {
			if (topQuadrant) { // Top left
				index = 1;
			} else if (bottomQuadrant) { // Bottom left
				index = 2;
			}
		} else if (obj.x > verticalMidpoint) {
			if (topQuadrant) { // Top right
				index = 0;
			} else if (bottomQuadrant) { // Bottom right
				index = 3;
			}
		}
		return index;

		// // If the object can fit completely within the left half of the current QuadTree
		// var leftQuadrant = (obj.x < verticalMidpoint && obj.x + obj.w < verticalMidpoint);

		// if (leftQuadrant) {
		// 	if (topQuadrant) {
		// 		index = 1; // Top left
		// 	} else {
		// 		index = 2; // Bottom left
		// 	}
		// } else {
		// 	if (topQuadrant) {
		// 		index = 0; // Top right
		// 	} else {
		// 		index = 3; // Bottom right
		// 	}
		// }
		// return index;
	};

	// Split the current node into four subnodes
	this.split = function() {
		var subWidth = (this.bounds.w / 2) | 0;
		var subHeight = (this.bounds.h / 2) | 0;

		// Store a new QuadTree object in this QuadTree's node array
		this.nodes[0] = new QuadTree({ // Top right
			x: this.bounds.x + subWidth,
			y: this.bounds.y,
			w: subWidth,
			h: subHeight
		}, level + 1); // Set the level to plus on of this QuadTree's level
		this.nodes[1] = new QuadTree({ // Top left
			x: this.bounds.x,
			y: this.bounds.y,
			w: subWidth,
			h: subHeight
		}, level + 1);
		this.nodes[2] = new QuadTree({ // Bottom left
			x: this.bounds.x,
			y: this.bounds.y + subHeight,
			w: subWidth,
			h: subHeight
		}, level + 1);
		this.nodes[3] = new QuadTree({ // Bottom right
			x: this.bounds.x + subWidth,
			y: this.bounds.y + subHeight,
			w: subWidth,
			h: subHeight
		}, level + 1);
	};
}