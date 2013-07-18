var vanTimer;

var previewJopeX;
var previewJopeY;
var previewJopeDx;
var previewJopeDy;
var previewJopeAngle;

var VAN_DURATION_FADEIN = 2000;
var VAN_DURATION_ENTER = 3000;
var VAN_DURATION_WAIT = 4000;
var VAN_DURATION_EXIT = 3000;
var VAN_DURATION_SCROLLUP = 2000;
var VAN_DURATION_ROOFTOPJIG = 400000;

var vanState;
var VAN_STATE_FADEIN = 0;
var VAN_STATE_ENTER = 100;
var VAN_STATE_WAIT = 200;
var VAN_STATE_EXIT = 300;
var VAN_STATE_SCROLLUP = 400;
var VAN_STATE_ROOFTOPJIG = 500;

var drunkWinTimer;
var drunkWinIdx;
var DRUNK_WIN_TOTAL_DURATION = 4000;
var DRUNK_WIN_DRINK_DURATION = 1000;


var juiceStarted;

var writerFrame;
var writerTimer;
var WRITER_TIME_PER_FRAME = 5000;
var WRITER_CROSSFADE_TIME = 500;
var WRITER_LAST_FRAME = 7;

var vanScriptIdx;
var vanScript = [
    [VAN_STATE_FADEIN, VAN_DURATION_FADEIN],
    [VAN_STATE_ENTER, VAN_DURATION_ENTER],
    [VAN_STATE_WAIT, VAN_DURATION_WAIT],
    [VAN_STATE_EXIT, VAN_DURATION_EXIT],
    [VAN_STATE_SCROLLUP, VAN_DURATION_SCROLLUP],
    [VAN_STATE_ROOFTOPJIG, VAN_DURATION_ROOFTOPJIG],
];

//////////////////////////////////////////////////////////////////////
// cloud specific
//////////////////////////////////////////////////////////////////////
var clouds = new Array();
var NUM_CLOUDS = 10;
function Cloud() {
/*
    this.x = x;
    this.y = y;
    this.speed = speed;
*/
    this.img = engineGetImage("cloud");
    this.alpha = 0.5+frand(0.5);
    this.init();
}

Cloud.prototype.init = function() {
    this.x = frand(cw);
    this.y = frand(500);
    this.speed = 0.05+frand(0.15);
}

Cloud.prototype.move = function(dt) {
    this.x -= dt*this.speed;
    if (this.x < -this.img.width) {
	this.init();
	this.x = cw;
    }
}

Cloud.prototype.draw = function() {
    var a = ctx.globalAlpha;
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(this.img, this.x, this.y);
    ctx.globalAlpha = a;
}

//////////////////////////////////////////////////////////////////////
// jope specific
//////////////////////////////////////////////////////////////////////
var NUM_JOPES = 6;
var jopes = [];
var speechJope;
var speechBubbleTimer;
var SPEECH_BUBBLE_DURATION = 8000;
var JOPE_TIME_PER_FRAME = 500;
var JOPE_BASE_Y = 133;

function Jope(idx, numFrames) {
    this.idx = idx;
    this.img = new Array();
    for (var i = 1; i <= numFrames; i++)
	this.img[i-1] = engineGetImage("jope"+idx+"-"+i);

    this.init();
}

Jope.prototype.init = function() {
    this.x = frand(273);
    this.y = JOPE_BASE_Y; //65;
    this.dx = 0.06 + frand(0.04) * (frand(1) < 0.5 ? 1 : - 1);
    this.dy = 0;
    this.freefall = false;
    this.entering = false;
    this.angle = 0;
}

/**
 *
 */
Jope.prototype.move = function(dt) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;

    if (this.x <= 0 && !this.entering)
	this.dx = -this.dx;
    if (this.x >= 0 && this.entering)
	this.entering = false;
    if (this.x >= 273 && !this.freefall) {
	if (frand(1) > 0.75) {
	    this.freefall = true;
	    enginePlaySound("freefall", false);
	    this.dy = 0.1;
	}
	else 
	    this.dx = -this.dx;
    }

    if (this.freefall) {
	this.dy += dt*0.0003;
	this.angle += dt*0.0009;

	if (this.y > 600) {
	    this.init();
	    this.x = -this.img[0].width * 4;
	    this.dx = Math.abs(this.dx);
	    this.entering = true;
	}
    }
}

/**
 *
 */
Jope.prototype.draw = function() {
    var frame = 0;

    if (!this.freefall) {
	frame = Math.floor((engineTimer % (this.img.length*JOPE_TIME_PER_FRAME)) / JOPE_TIME_PER_FRAME);
    }

    var im = this.img[frame];

    if (this.freefall) {
	ctx.save();

	ctx.translate(this.x, this.y); //this.x+im.width/2, this.y+im.height);
	ctx.rotate(this.angle);
	ctx.drawImage(im, -im.width/2, -im.height);

	ctx.restore();
    }
    else {
	var yOfs = this.freefall ? 0 : Math.abs(Math.cos((engineTimer+this.idx*30)*(0.6+this.idx*0.02)*Math.PI/180.0)*3);
	ctx.drawImage(im, this.x-im.width/2, this.y-im.height-yOfs);
    }

}

//////////////////////////////////////////////////////////////////////
// BLIND LEROY!!!
//////////////////////////////////////////////////////////////////////
var KIRBY_ENTER 
var kirbyActive = false;
var kirbyImg;
var kirbyBarbieImg;
var kirbyX;
var kirbyDx;
var barbieX;
var barbieY;
var barbieDx;
var barbieDy;

function kirbyUnleash() {
    kirbyImg = engineGetImage("kirby");
    kirbyBarbieImg = engineGetImage("grilli");
    kirbyX = -kirbyImg.width*2;
    kirbyDx = barbieDx = 0.1;
    barbieX = kirbyX-4;
    barbieY = JOPE_BASE_Y;
    barbieDy = 0;
    kirbyActive = true;
}

function kirbyMove(dt) {
    if (!kirbyActive) 
	return;
    kirbyX += kirbyDx*dt;
    barbieX += barbieDx*dt;
    // kirby at ledge?
    if (kirbyDx > 0 && kirbyX >= 255) {
	barbieDx *= 2.5; 
	barbieDy = -0.6;
	kirbyDx = -kirbyDx/2;
	kirbyX = 254.9;
    }
    else if (kirbyDx < 0 && kirbyX <= -kirbyImg.width) {
	kirbyActive = false;
    }
    // barbie falling
    if (kirbyDx < 0) { //barbieDy > 0) {
	barbieY += dt*barbieDy;
	barbieDy += dt * 0.0015;
    }

}

function kirbyDraw() {
    if (!kirbyActive) 
	return;
    ctx.drawImage(kirbyImg, kirbyX-kirbyImg.width/2, JOPE_BASE_Y-kirbyImg.height);
    ctx.drawImage(kirbyBarbieImg, barbieX-kirbyBarbieImg.width/2, barbieY-kirbyBarbieImg.height);
    ctx.drawImage(engineGetImage(kirbyDx > 0 ? "bubble3":"bubble1"), kirbyX, 135-kirbyImg.height-engineGetImage("bubble3").height-7);
}


//////////////////////////////////////////////////////////////////////
// stuff
//////////////////////////////////////////////////////////////////////

function kollitPreload() {

    engineAddSound("poing", "sfx/poing.ogg");
    engineAddSound("freefall", "sfx/freefall.ogg");

    engineAddImage('bg', 'gfx/bg.png');
    engineAddImage("door1", "gfx/doors_before.png");
    engineAddImage("door2", "gfx/doors_after.png");
    engineAddImage("van", "gfx/van.png");

    for (var i = 1; i <= 7; i++)
	engineAddImage("writer"+i, "gfx/writer"+i+".png");
    
    engineAddImage("cloud", "gfx/pilvi.png");

    engineAddImage("jope1-1", "gfx/jope1-1.png");
    engineAddImage("jope2-1", "gfx/jope2-1.png");
    engineAddImage("jope3-1", "gfx/jope3-1.png");
    engineAddImage("jope3-2", "gfx/jope3-2.png");
    engineAddImage("jope4-1", "gfx/jope4-1.png");
    engineAddImage("jope4-2", "gfx/jope4-2.png");
    engineAddImage("jope4-3", "gfx/jope4-3.png");
    engineAddImage("jope4-4", "gfx/jope4-4.png");
    engineAddImage("jope5-1", "gfx/jope5-1.png");
    engineAddImage("jope5-2", "gfx/jope5-2.png");
    engineAddImage("jope6-1", "gfx/jope6-1.png");
    engineAddImage("jope6-2", "gfx/jope6-2.png");
    engineAddImage("previewjope", "gfx/previewjope.png");

    engineAddImage("kirby", "gfx/kirby.png");
    engineAddImage("grilli", "gfx/kirby_grilli.png");

    for (var i = 1; i <= 6; i++)
	engineAddImage("bubble"+i, "gfx/puhekupla"+i+".png");

    for (var i = 1; i <= 8; i++) 
	engineAddImage("drunkwin"+i, "gfx/ikkuna"+i+".png");

}

function kollitInit() {    

    engineSetSoundVolume("freefall", 0.4);

    for (var i = 0; i < NUM_CLOUDS; i++)
	clouds[i] = new Cloud();    

    previewJopeX = 254;
    previewJopeY = 65;
    previewJopeDx = 0.06;
    previewJopeDy = 0;
    previewJopeAngle = 0;

    jopes[0] = new Jope(1, 1);
    jopes[1] = new Jope(2, 1);
    jopes[2] = new Jope(3, 2);
    jopes[3] = new Jope(4, 4);
    jopes[4] = new Jope(5, 2);
    jopes[5] = new Jope(6, 2);

    speechBubbleTimer = 0;
    speechJope = rand(NUM_JOPES);

    vanScriptIdx = 0;    
    juiceStarted = false;
    
    drunkWinTimer = 0;
    drunkWinIdx = rand(9);

    writerFrame = 1;
    writerTimer = 0;

    vanChangeState(VAN_STATE_FADEIN); 

}

function kollitLogic(dt) {
    vanTimer += dt;

    if (!juiceStarted) {
	engineSetBlur(0); //document.getElementById("dummy").style.webkitFilter = "none"; //blur("+b+"px)";
	enginePlaySound("poing", true);
	juiceStarted = true;
    }

    // check state changes
    if (vanTimer >= vanScript[vanScriptIdx][1] && vanScriptIdx < vanScript.length-1) {
	vanScriptIdx++;
	if (vanScriptIdx >= vanScript.length) 
	    vanScriptIdx = 0;
	vanChangeState(vanScript[vanScriptIdx][0]);
    }

    // randomize drunk at the window
    drunkWinTimer += dt;
    if (drunkWinTimer >= DRUNK_WIN_TOTAL_DURATION) {
	drunkWinTimer = 0;
	drunkWinIdx = rand(9);
    }

    // preview jope
    if (vanState >= VAN_STATE_ENTER && vanState <= VAN_STATE_SCROLLUP) {
	previewJopeX += previewJopeDx*dt;
	previewJopeY += previewJopeDy*dt;
	previewJopeDy += dt*0.00005;
	previewJopeAngle += dt*0.0009;
    }

    // offset canvas
    if (vanState < VAN_STATE_SCROLLUP) {
	engineSetCanvasPos(0, -600);
    }
    else if (vanState == VAN_STATE_SCROLLUP) {
	engineSetCanvasPos(0, Math.round(ease(-600, 0, vanTimer, VAN_DURATION_SCROLLUP)));
    }

    // rooftop logic
    if (vanState == VAN_STATE_ROOFTOPJIG) {

	speechBubbleTimer += dt;
	if (speechBubbleTimer >= SPEECH_BUBBLE_DURATION) {
	    speechBubbleTimer = 0;
	    speechJope = rand(NUM_JOPES);
	}
	
	for (var i = 0; i < NUM_JOPES; i++) {
	    jopes[i].move(dt);
	}

	writerTimer += dt;
	if (writerTimer >= WRITER_TIME_PER_FRAME) {
	    writerTimer -= WRITER_TIME_PER_FRAME;
	    writerFrame++;
	    if (writerFrame > WRITER_LAST_FRAME)
		writerFrame = 1;
	}

	kirbyMove(dt);
    }

    // move clouds
    for (var i = 0; i < NUM_CLOUDS; i++) 
	clouds[i].move(dt);
}

function vanChangeState(s) {
    vanState = s;
    vanTimer = 0;

    if (s == VAN_STATE_ROOFTOPJIG) {
	speechBubbleTimer = 0;
    }
}

function kollitDrawDrunkWindow() {
    var winFrames = [8,7,6,5,4,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,6,7,8,0,0,0,0];

    var idx = drunkWinIdx;
    if (vanState < VAN_STATE_SCROLLUP) 
	idx += 9;

    var x = 12 + (idx % 3) * 74;
    var y = 234 + Math.floor(idx / 3) * 136;
    
    var frame = winFrames[Math.floor(drunkWinTimer*winFrames.length/DRUNK_WIN_TOTAL_DURATION)];
    if (frame != 0)
	engineDrawImage("drunkwin"+frame, x, y, ALIGN_LT);
/*
    var frame = 1;
    if (drunkWinTimer >= DRUNK_WIN_TOTAL_DURATION-DRUNK_WIN_DRINK_DURATION)
	frame = 8-Math.floor((DRUNK_WIN_TOTAL_DURATION-drunkWinTimer) * 8 / DRUNK_WIN_DRINK_DURATION);

    engineDrawImage("drunkwin"+frame, x, y, ALIGN_LT);
*/
}

function kollitDrawJopes() {
    if (vanState >= VAN_STATE_SCROLLUP) {
	for (var i = 0; i <  NUM_JOPES; i++) {
	    jopes[i].draw();

	    // speech bubble
	    if (i == 0 && speechBubbleTimer >= SPEECH_BUBBLE_DURATION/2) {
		var bub = engineGetImage("bubble"+(speechJope+1));
		ctx.drawImage(bub, jopes[speechJope].x+10, jopes[speechJope].y-jopes[speechJope].img[0].height-bub.height-7);
	    }
	}
    }
}

function kollitDrawVan() {
    // draw van
    if (vanState >= VAN_STATE_ENTER && vanState <= VAN_STATE_EXIT) {
	var yOfs = frand(vanState == VAN_STATE_WAIT ? 20 : 6);
	var vanX = 20;
	if (vanState == VAN_STATE_ENTER) { // || vanState == VAN_STATE_WAIT) {
            vanX = easeOut(20, cw, vanTimer, VAN_DURATION_ENTER);
	}
	else if (vanState == VAN_STATE_EXIT) {
            vanX = lerp(20, -200, vanTimer, VAN_DURATION_EXIT);
	}

	engineDrawImage("van", vanX, 1102-yOfs, ALIGN_LT);
    }
}

function kollitDrawWriter() {
    var img = engineGetImage("writer"+writerFrame);
    var nextFrame = writerFrame+1;
    if (nextFrame > WRITER_LAST_FRAME)
	nextFrame = 1;
    var img2 = engineGetImage("writer"+nextFrame);

    var t = writerTimer-(WRITER_TIME_PER_FRAME-WRITER_CROSSFADE_TIME);
    var a1 = lerp(1, 0, t, WRITER_CROSSFADE_TIME);
    var a2 = lerp(0, 1, t, WRITER_CROSSFADE_TIME);
    var yofs1 = lerp(0, 100, t, WRITER_CROSSFADE_TIME);
    var yofs2 = lerp(-100, 0, t, WRITER_CROSSFADE_TIME);

    ctx.globalAlpha = a1;
    ctx.drawImage(img, 306, 314+yofs1-img.height/2+Math.cos(engineTimer*0.005)*50);

    ctx.globalAlpha = a2;
    ctx.drawImage(img2, 306, 314-img2.height/2+Math.cos(engineTimer*0.005)*50);

    ctx.globalAlpha = 1;
}

function kollitDrawClouds() {
    for (var i = 0; i < NUM_CLOUDS; i++) {
	clouds[i].draw();
    }
}

function kollitDrawStar(sx,sy,radius,r,g,b) {
    engineSetColor(r,g,b);
    ctx.beginPath();
    var ang = engineTimer * 0.05;
    for (var i = 0; i < 11; i++, ang += 36) {
	var rr = (i & 1) == 1 ? radius*2 : radius;
	var x = sx + Math.cos(ang*Math.PI/180)*rr;
	var y = sy + Math.sin(ang*Math.PI/180)*rr;
	if (i == 0) ctx.moveTo(x, y);
	else ctx.lineTo(x, y);
    }
    ctx.fill();
}

function kollitDrawJallu(x, y) {
    ctx.save();
    var im = engineGetImage("jallu");
    ctx.translate(x, y);
    ctx.rotate(engineTimer*0.0005);
    ctx.drawImage(im, -im.width/2, -im.height/2);
    ctx.restore();
}



function kollitDrawPreviewJope() {
    ctx.save();
    var im = engineGetImage("previewjope");
    ctx.translate(previewJopeX+im.width/2, previewJopeY+im.height);
    ctx.rotate(previewJopeAngle);
    ctx.drawImage(im, -im.width/2, -im.height);
    ctx.restore();
}


function kollitDraw() {    
    // sky & clouds
    engineFillRectRGB(0, 0, cw, 900, 0, 54, 99); // 900px abt sky height

/*    
    kollitDrawStar(550, 300, 80+Math.cos(engineTimer*0.005)*20, 255, 255, 255);
    kollitDrawStar(550, 300, 70+Math.cos(engineTimer*0.005)*20, 204, 0, 0);
    kollitDrawJallu(550,300);
*/
    kollitDrawClouds();


    // preview jope
    kollitDrawPreviewJope();
    // hotel
    engineDrawImage("bg", 0, 0, ALIGN_LT);
    engineDrawImage(vanState >= VAN_STATE_EXIT ? "door2" : "door1", 18, 1020, ALIGN_LT);
    kollitDrawDrunkWindow();
    kollitDrawVan();



    // jopes
    kollitDrawJopes();
    kirbyDraw();

    // writer
    kollitDrawWriter();
    
    // transitions
    if (vanState == VAN_STATE_FADEIN)
	engineFadeIn(0, 0, 0, vanTimer, VAN_DURATION_FADEIN);
}

function kollitClick(x,y) {

    var idx = drunkWinIdx;
    if (vanState < VAN_STATE_SCROLLUP) 
	idx += 9;

    var winX = 12 + (idx % 3) * 74;
    var winY = 234 + Math.floor(idx / 3) * 136;

    if (x >= winX && x < winX+74 && y >= winY && y < winY+136 && vanState == VAN_STATE_ROOFTOPJIG && !kirbyActive) {
	kirbyUnleash();
    }
}
