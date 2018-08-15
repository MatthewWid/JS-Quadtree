# A fully reusable QuadTree made with Javascript

Made for my own learning.

All code in `/script/quadTree.js` is fully commented so it can be easily read and understood for convenience.

# What is a Quadtree?

A Quadtree is a tree-like data structure commonly used for optimisation in video game collision detection.

It works by subdividing the available play space into nested trees that upon exceeding their limit of contained nodes will split into four sub-trees. Only nodes in the same tree are checked against eachother, reducing search times and the amount of processing required to check hundreds or thousands of nodes against each other.

To see the performance difference, toggle the `colType` configuration variable between "qtree" (to use the Quadtree) and "all" (to not use a Quadtree and check every node against one-another) and notice the significant performance improvement that the use of a Quadtree can introduce.

# Using the Quadtree Object

`/script/quadTree.js` is a reusable object that can be copied and used in other projects.

To instantiate the Quadtree object simply instatiate a new Quadtree object with optional parameters defining its `x` and `y` position as well as its `w`idth and `h`eight.

```javascript
var quadTree = new QuadTree({
	x: 0,
	y: 0,
	w: c.width,
	h: c.height
});
```

In your collision detection function you simply need to create an array of objects (`let objects = [];`) and use the Quadtree object method `.getAllObjects(objects);` to fill the array with all objects contained in the Quadtree.

**The QuadTree expects an array of squares with an `x` and `y` coordinate as well as a `w`idth and `h`eight dimension.**

Then you can loop through the found objects and use the Quadtree object method `.findObjects(obj = [], objects[i]` to get a list of all objects contained within the same Quadtree section as the provided node and run a collision detection algorithm between all those nodes.

Here is a sample collision detection function using a Bounding Box collision detection algorithm with the Quadtree:

```javascript
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
```

# Configuration

The demo is completely configurable via a configuration variable in `./script/index.js`.

Documentation of each configuration variable is listed below.

| Name | Description | Data Type | Default Value
|-|-|-|-|
| cSize | Size (WxH) of the canvas | Integer | 700
| jitter | Whether each square should randomly jittee each frame | Boolean | true
| squares | Amount of squares (Hitbox objects) to have | Integer | 1500
| standardDim | Size of each square (WxH) | Integer | 5
| animate | Animation type. Can either be "60", "10" or "none" for 60FPS, 10FPS or no animation loop, respectively. | String | "60"
| colType | Collision detection type. Can either be "qtree" for using the Quadtree, "all" for no Quadtree (Checking all nodes against each other), "none" for no collision detection | String | "qtree"
| drawTree | Whether to draw the bounding rectangles of each Quadtree | Boolean | true
| idText | Whether to draw each square's unique ID | Boolean | false
