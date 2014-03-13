
/* NOTES TO REMEMBER
 * 1. A variable declared private (with the var syntax) cannot be referenced from a public function declared with the prototype syntax
 * 2. Drawing an image once does not keep it on the canvas (it disapears for some reason). REASON - the image is not loaded when the 
 *    call to draw it is called, so nothing is drawn.
 * 3. A vairable declared public (with the this syntax) must always be referenced with the this syntax when using it
 */
 
/* RESOURCES
 * 1. http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * 2. http://net.tutsplus.com/tutorials/javascript-ajax/prototypes-in-javascript-what-you-need-to-know/
 * 3. http://phrogz.net/js/classes/OOPinJS.html
 * 4. http://www.phpied.com/3-ways-to-define-a-javascript-class/
 */


/**
 * Initialize the Game and starts it.
 */
var game = new Game();

function init() {
	if(game.init()){
		game.start();
	}
}

String.prototype.format = function()
{
   var content = this;
   for (var i=0; i < arguments.length; i++)
   {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arguments[i]);  
   }
   return content;
};

getRandomInt = function(min, max) 
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Define an object to hold all our images for the game so images
 * are only ever created once. This type of object is known as a 
 * singleton.
 */
var imageRepository = new function() {
	// Define images
	this.background = new Image();
	this.ant = new Image();
	this.nest = new Image();

	var numImages = 3;
	var numLoaded = 0;

	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}
	

	this.background.onload = function(){
		imageLoaded();
	}

	this.ant.onload = function(){
		imageLoaded();
	}

	this.nest.onload = function(){
		imageLoaded();
	}
	// Set images src
	this.background.src = "imgs/bg.png";
	this.ant.src = "imgs/ant.png";
	this.nest.src = "imgs/nest.png";
}


/**
 * Creates the Drawable object which will be the base class for
 * all drawable objects in the game. Sets up defualt variables
 * that all child objects will inherit, as well as the defualt
 * functions. 
 */
function Drawable() {	
	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	this.canvasWidth = 0;
	this.canvasHeight = 0;
	
	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
}

/** Pool object. Holds all ant objects to be managed */
function Pool(maxAnts)
{

	var size = maxAnts;
	var pool = []; /* Pool array */

	this.init = function() {
		for (var i = 0; i < size; i++) {
			var ant = new Ant();
			ant.init(0,0, imageRepository.ant.width, imageRepository.ant.height)
			pool[i] = ant;
		}
	};

	this.get = function(x,y) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x,y);
			pool.unshift(pool.pop()); //push to front of array
		}
	};

	this.animate = function() {
		for (var i = 0; i < size; i++) {
			if (pool[i].alive) {
				if (pool[i].move()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
				if (pool[i].kill()) {
					game.nest.makeAnt();
				}
			}
			else

				break;
		}
	};
}

/**
 * Creates the Background object which will become a child of
 * the Drawable object. The background is drawn on the "background"
 * canvas and creates the illusion of moving by panning the image.
 */
 function Patch(x,y)
{
	this.trailPheromone = 0;
	this.foodPheromone = 0;
	this.foodPieces = 0;
	this.x = x;
	this.y = y;

}

 function World() {
 	
 	this.gridX = Math.floor(this.canvasWidth/game.gridSize);
 	this.gridY = Math.floor(this.canvasHeight/game.gridSize);
 	var trailVapRate = .01;
 	var foodVapRate = .005;


 	this.init = function() 
 	{
	 	this.patches = new Array(this.gridX)
	 	for (var i = 0; i < this.gridX; i++)
	 	{
	 		this.patches[i] = new Array(this.gridY);
	 		for ( var j = 0; j < this.gridY; j++)
	 		{
	 			this.patches[i][j] = new Patch(i,j);
	 		}
	 	}
 	};

 	this.draw  = function(){
 		//this.context.putImageData(this.canvasData,0,0)
 	};

 	this.drawPatch = function(x, y, r, g, b, a)
 	{
    	var index = (x + y * this.gridX * 4);

    	this.canvasData.data[index + 0] = r;
    	this.canvasData.data[index + 1] = g;
    	this.canvasData.data[index + 2] = b;
    	this.canvasData.data[index + 3] = a;
	};

	this.dropFood = function(x,y){
 		for(var i = x; i < (x + 10); i++){
 			for(var j = y; j < (y + 10); j++){
 				game.world.patches[i][j].foodPieces = 10;
 			}
 		}
 	};



 	this.update = function()
 	{
 		var can3 = document.getElementById('trails_T');
 		var can4 = document.getElementById('trails_F');
 		//this.canvasData = this.context.getImageData(0,0, this.gridX, this.gridY);
 		//Evaporate the pheromones by respective rate, and then set drawing information.
 		//Use canvasdata rather than repeated rectangle calls.
 		this.context.clearRect(0,0, this.gridX,this.gridY);
 		//this.canvasData = this.context.getImageData(0,0, this.canvasWidth, this.canvasHeight);

		/*var trailCtx = can2.getContext('2d');
		trailCtx.fillStyle = "rgba(0,0,255,0.01)";
		trailCtx.beginPath();*/

		//var can4 = document.getElementById('trails_T');
		var trailCtx = can3.getContext('2d');
		var foodCtx = can4.getContext('2d');
		trailCtx.clearRect(0,0, this.gridX,this.gridY);
		foodCtx.clearRect(0,0, this.gridX,this.gridY);
		//trailCtx.fillStyle = "rgba(0,0,255,0.01)";
		//var can4 = document.createElement('canvas2');
		//can4.width = this.canvasWidth;
		//can4.height = this.canvasHeight;
		//var foodCtx = can4.getContext('2d');
		trailCtx.beginPath();
		foodCtx.beginPath();
		this.context.beginPath();

	 	for (var i = 0; i < this.gridX; i++)
	 	{
	 		for ( var j = 0; j < this.gridY; j++)
	 		{
	 			//evaporate and/or saturate the ground, then represent with rectangles.
	 			this.patches[i][j].foodPheromone *= (1-foodVapRate);
	 			this.patches[i][j].trailPheromone *= (1-trailVapRate);

	 		if(!(this.patches[i][j].foodPheromone <= 1))
	 			{

	 				if(this.patches[i][j].foodPheromone > 1000)
	 					this.patches[i][j].foodPheromone  = 1000;

	 				foodCtx.rect(i,j,1,1);
	 			}
	 			else if( !(this.patches[i][j].trailPheromone <= 0.1))
	 			{
	 				if(this.patches[i][j].trailPheromone > 1000)
	 					this.patches[i][j].trailPheromone  = 1000;

	 				trailCtx.rect(i,j,1,1);
	 			}
	 			else if (!(this.patches[i][j].foodPieces <= 0))
	 			{
	 				this.context.rect(i,j,1,1);
	 			}

	 		}
	 	}
		//this.context.stroke();
		trailCtx.fillStyle = "rgba(0,0,255,0.1)";
		trailCtx.fill();
		foodCtx.fillStyle = "rgba(255,0,0,0.1)";
		foodCtx.fill();
		this.context.fillStyle = "rgba(0,255,0,1)";
		this.context.fill();

		this.context.drawImage(can4, 0, 0);
		this.context.drawImage(can3, 0, 0);


 	};
 }

 function Nest() {

 	this.init = function(x,y){
 		this.x = x;
 		this.y = y;
 		this.alive = true;
 		this.hasFood = false;
	 	this.colony = new Pool(30);
	 	this.colony.init();
	 	this.stockpile = 0;
	 };

	 this.draw = function() {
		this.context.drawImage(imageRepository.nest, this.x, this.y);
	};

	this.makeAnt = function(){
		this.colony.get(this.x, this.y);
	};

 }

 function Ant() {

 	this.alive = false; //only true when ant has spanwed
 	this.maxDistance = Math.pow(game.nest.x, 2) + Math.pow(game.nest.y, 2);

 	this.euclidean = function(x1,x2,y1,y2){
 		return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
 	}

 	this.spawn = function(x,y) {
 		this.x = x;
 		this.y = y;
 		this.alive = true;
 		this.hasFood = false;
 		//this.courage = getRandomInt(1,5);
 		this.steps = 0;
 		this.stride = 10; //how many pixels does it move

 	};

 	/* Use a dirty rectangle to erase the bullet and move it */
 	this.draw = function() {
 		this.context.drawImage(imageRepository.ant, this.x, this.y); //center
 	};

 	this.kill = function() {
 		if(this.steps > this.canvasHeight*this.canvasWidth){
 			this.alive = false;
 			return true;
 		}
 		else
 			return false;

 	}


 	this.sense = function(action,x,y) {

 		//sense area given by x,y, return score (weighed by distance of ant to hive, average pheromone level, food presence, food posession, and other ants)
 		var score = 1;

 		var foodPresent = 0;
 		var fPheromoneLevel = 0;
 		var tPheromoneLevel = 0;
 		var fPheromone = 0;
 		var tPheromone = 0;
 		var distanceToNest  = 0;

		for(var i = x; i < (x + 10); i++){
 			for(var j = y; j < (y+10); j++){
 				tPheromone += game.world.patches[i][j].trailPheromone;
 				fPheromone += game.world.patches[i][j].foodPheromone;
 				foodPresent += game.world.patches[i][j].foodPieces;
 			}
 		}		

 		tPheromoneLevel = tPheromone/100;
 		fPheromoneLevel = fPheromone/100;
 		foodPresent		= foodPresent;

 		//1000*Math.pow(Math.E,-distanceToNest/10000)
 		if (this.hasFood)
 		{
 			score +=  tPheromoneLevel * getRandomInt(1,10);
 		}
		else
		{
 			 score += fPheromoneLevel * getRandomInt(1,10) - tPheromoneLevel;

 			if(foodPresent > 1)
 			{
 				this.hasFood = true;
 				this.steps = 0;
 				score *= 2; //penalize pickup if there's no food
 				this.pickupFood(x,y);
 			}
 		}

 		return score;

 	};
 	this.actions = {"up": [0, -1], "down": [0, 1], "left":[-1,0], "right":[1,0]}

 	this.plan = function() {

 		bestScore = Number.NEGATIVE_INFINITY; bestMove = "idle";

 		var scores = [];
 		var maxScore = 0;
 		//generate best course of action from action list
 		for( var action in this.actions ){

 			if (this.outOfBounds(this.x + this.actions[action][0]*this.stride*2, this.y + this.actions[action][1]*this.stride*2)){
 				continue;
 			}
 			var score = this.sense(action, this.x + this.actions[action][0]*this.stride, this.y + this.actions[action][1]*this.stride);
 			//check if it goes out of boundaries
 			scores[action] = score;
 			maxScore += score;
 		}
 		var score = 0;

 		for(var move in scores)
 		{
 			var probability = scores[move]/Math.abs(maxScore);

 			score = probability*getRandomInt(1,10);

 			 if(score > bestScore){
 				bestScore = score;
 				bestMove = move;
 			}

 		}
 		//console.log(allscores);
 		return bestMove;
 	};

 	this.outOfBounds = function(x, y)
 	{
 		if(x > this.canvasWidth || x < 0 || y < 0 || y > this.canvasHeight){
 			return true;
 		}
 		else
 			return false;
 	};

 	this.move = function() {
 		var bestMove = this.plan();
 		this.context.clearRect(this.x, this.y, this.width, this.height);

		var move = this.actions[bestMove];
	 		this.x += this.stride * move[0];
	 		this.y += this.stride * move[1];
	 		this.steps++;

 		if(this.hasFood){
 			this.placeFoodPheromone(this.x, this.y);
 			var distanceToNest  = this.euclidean(this.x,game.nest.x, this.y, game.nest.y);
 			if(distanceToNest < 100)
 			{
	 			this.hasFood = false;
	 			game.nest.stockpile++;
	 			this.steps = 0;
 			}
 		}
 		else{

 			this.placeTrailPheromone(this.x, this.y);
 		}

 		this.draw();
 	};

 	this.placeTrailPheromone = function(x,y)
 	{	
 		var Q = 1000*(Math.pow(Math.E, -this.steps/15));
 		for(var i = x; i < x + this.stride; i++){
 			for(var j = y; j < y + this.stride; j++){
 				game.world.patches[i][j].trailPheromone += Q/(Math.pow(1,((x-5)*(y-5))));
 			}
 		}
 	};

 	this.placeFoodPheromone = function(x,y)
 	{	
 		var Q = 1000*(Math.pow(Math.E, -this.steps/15));
 		for(var i = x; i < x + this.stride; i++){
 			for(var j = y; j < y + this.stride; j++){
 				game.world.patches[i][j].foodPheromone += Q/(Math.pow(1,((x-5)*(y-5))));;
 			}
 		}
 	};

 	this.pickupFood = function(x,y){
 		for(var i = x; i < x + this.stride; i++){
 			for(var j = y; j < y + this.stride; j++){
 				if(game.world.patches[x][y].foodPieces > 0){
 					game.world.patches[x][y].foodPieces -= 1;
 				}
 			}
 		}
 	};

 }

function Background() {
	
	// Implement abstract function
	this.draw = function() {
		// Pan background
		this.context.drawImage(imageRepository.background, this.x, this.y);
	};
}
// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();
Ant.prototype = new Drawable();
Nest.prototype = new Drawable();
World.prototype = new Drawable();


/**
 * Creates the Game object which will hold all objects and data for
 * the game.
 */
function Game() {
	/*
	 * Gets canvas information and context and sets up all game
	 * objects. 
	 * Returns true if the canvas is supported and false if it
	 * is not. This is to stop the animation script from constantly
	 * running on older browsers.
	 */
	 this.gridSize = 1;
	 this.numOfAnts = 30;
	 this.numOfFood = 5;

	this.init = function() {
		// Get the canvas element


		this.bgCanvas = document.getElementById('background');
		this.worldCanvas = document.getElementById('world');
		this.antCanvas = document.getElementById('ants');
		// Test to see if canvas is supported, check one canvas
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.worldContext = this.worldCanvas.getContext('2d');
			this.antContext = this.antCanvas.getContext('2d');



			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			World.prototype.context = this.worldContext;
			World.prototype.canvasWidth = this.worldCanvas.width;
			World.prototype.canvasHeight = this.worldCanvas.height;

			Nest.prototype.context = this.antContext;
			Nest.prototype.canvasWidth = this.antCanvas.width;
			Nest.prototype.canvasHeight = this.antCanvas.height;

			Ant.prototype.context = this.antContext;
			Ant.prototype.canvasWidth = this.antCanvas.width;
			Ant.prototype.canvasHeight = this.antCanvas.height;


			
			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0
			this.world = new World();
			this.world.init();


			this.nest = new Nest();
			this.nest.init(this.antCanvas.width/2, this.antCanvas.height/2 )

			return true;
		} else {
			return false;
		}
	};
	
	// Start the animation loop
	this.start = function() {
		this.nest.draw();
		for (var i = 0; i < this.numOfAnts; i++)
		{
			this.nest.makeAnt();
		}
		this.world.draw();
		for (var i = 0; i< this.numOfFood; i++)
		{
			this.world.dropFood(getRandomInt(1,this.worldCanvas.width), getRandomInt(1,this.worldCanvas.height));
		}
		animate();
	};
}


/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
	requestAnimFrame( animate );
	//game.background.draw();
	game.nest.draw();
	game.nest.colony.animate();
	game.world.update();
	console.log(game.nest.stockpile)
}


/**	
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop, 
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();