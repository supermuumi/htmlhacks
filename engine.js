var demoPreloads = [
    'introPreload()',
    'kollitPreload()', 
];

var demoInits = [
    'intro',
    'kollit',
];

var demoScript = [
    ['intro',	0,	10000],
    ['kollit',	10000,	10000000],
];

// timers
var ENGINE_TIMESTEP = 1.6;
var engineTimer;
var engineRunTime = 0;
var engineTimeAcc;
var fps;
var engineTickInterval = -1;

// canvas related
var canvas;
var ctx;
var cw;
var ch;

// audio related
var engineSounds;
var engineSoundLoadCounter;

// image related
var engineImages;
var engineImageLoadCounter;
//var engineImageCanvas;
//var engineImageContext;

function enginePreload() {    

    engineTickInterval = -1;
    canvas = document.getElementById("demo");

    canvas.addEventListener("click", engineHandleClick);

    ctx = canvas.getContext("2d");
    cw = canvas.width;
    ch = canvas.height;


    ctx.fillStyle = "#ffffff";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";    
    ctx.fillText("loading...", 0, 0);
    
/*
    engineImageCanvas = document.createElement("canvas");
    engineImageCanvas.width = engineImageCanvas.style.width = cw;
    engineImageCanvas.height = engineImageCanvas.style.height = ch;
    engineImageContext = engineImageCanvas.getContext("2d");
*/
    // init gfx preloading
    engineImages = new Array();
    engineImageLoadCounter = 0;
    engineSounds = new Array();
    engineSoundLoadCounter = 0;

    // start fx preloading
    for (var i = 0; i < demoPreloads.length; i++)
	eval(demoPreloads[i]);

    // init preload checker
    enginePreloadTimer = setInterval('enginePreloadCheck()', 50);
}

function enginePreloadCheck() {
    if (engineAllImagesLoaded && engineAllSoundsLoaded) { // /*&& engineMusicCanPlay*/)
	clearInterval(enginePreloadTimer);
	engineInit();
    }
}

function engineInit() {
    // initialize effects that require it
    for (var i = 0; i < demoInits.length; i++)
	eval(demoInits[i]+'Init()');

    engineStart();
}

function engineMusicLoaded() {
    engineMusicCanPlay = true;
}

function engineStart() {
    // just commented out for now
    //bgMusic.play();

    engineTimer = engineGetTime(); 
    engineRunTime = 0;
    engineTimeAcc = 0;
    
    engineFillScreen(0, 0, 0);

    engineTickInterval = setInterval('engineTick()', 4);
}

function engineTickDebug() {
    var newTime = engineGetTime();
    var frameTime = newTime - engineTimer;
    engineTimer = newTime;
    engineRunTime += frameTime;
    engineTimeAcc += frameTime;
}

function engineTick() {
    var newTime = engineGetTime();
    var frameTime = newTime - engineTimer;
    // TODO: cap frametime?
    engineTimer = newTime;
    engineRunTime += frameTime;
    engineTimeAcc += frameTime;

    while (engineTimeAcc >= ENGINE_TIMESTEP) {
	for (var ev = 0; ev < demoScript.length; ev++) {
	    var fx = demoScript[ev];
	    if (engineRunTime >= fx[1] && engineRunTime < fx[1]+fx[2]) {
		eval(fx[0]+'Logic('+ENGINE_TIMESTEP+')');
	    }
	}
	engineTimeAcc -= ENGINE_TIMESTEP;
    }

    var numActive = 0;
    // draw
    for (var ev = 0; ev < demoScript.length; ev++) {
	var fx = demoScript[ev];
	if (engineTimer >= fx[1] && engineTimer < fx[1]+fx[2]) {
	    eval(fx[0]+'Draw()');
	    numActive++;
	}
    }

/*
    ctx.fillStyle = "#00cc00";
    ctx.font = "10px futura";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(""+Math.floor(engineRunTime)+" "+Math.floor(vanTimer), cw-5, ch-5-300-document.getElementById("demo").style.marginTop);
  */  
    if (numActive == 0) {
	clearInterval(engineTickInterval);
	//setTimeout('location.reload()', 1000);
    }
}
/*
window.performance = window.performance || {};
performance.now = (function() {
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return new Date().getTime(); };
})();
*/
function engineGetTime() {    
    if (window.performance) {
	if (window.performance.now)
	    return window.performance.now();
	else
	    return window.performance.webkitNow();
    }
    else {
	return new Date().getTime();
    }
}

///////////////////////////////
// AUDIO
///////////////////////////////
function engineAddSound(id, src) {
    engineSounds[id] = new Audio();
    engineSounds[id].addEventListener('canplaythrough', engineHandleSoundLoaded, false);
    engineSounds[id].src = src;
}

function engineSetSoundVolume(id,vol) {
    engineSounds[id].volume = vol;
}

function engineGetSound(id) {
    return engineSounds[id];
}

function enginePlaySound(id,loopio) {
    var s = engineSounds[id];
    if (s) {
	s.loop = loopio;
	s.play();
    }
}

function engineHandleSoundLoaded() {
    engineSoundLoadCounter++;
}

function engineAllSoundsLoaded() {
    return engineSoundLoadCounter >= soundList.length;
}

/////
/////
function engineFillScreen(r,g,b) {
    ctx.fillStyle = "rgb("+r+","+g+","+b+")";
    ctx.fillRect(0, 0, cw, ch);
}

function engineFillRectRGB(x,y,w,h,r,g,b) {
    ctx.fillStyle = "rgb("+r+","+g+","+b+")";
    ctx.fillRect(x,y,w,h);
}
function engineFillRectRGBA(x,y,w,h,r,g,b,a) {
    ctx.fillStyle = "rgba("+r+","+g+","+b+","+a+")";
    ctx.fillRect(x,y,w,h);
}

function engineFillScreenAlpha(r,g,b,a) {
    ctx.fillStyle = "rgba("+r+","+g+","+b+","+a+")";
    ctx.fillRect(0, 0, cw, ch);
}

function engineFadeIn(r,g,b,t,t0) {
    if (t < t0) 
	engineFillScreenAlpha(0,0,0,1-t/t0);
}

function engineFadeOut(r,g,b,t,t0) {
    if (t < t0) 
	engineFillScreenAlpha(0,0,0,t/t0);
}

//////////////////////////////////////////////////////////////////////
// image helpers
//////////////////////////////////////////////////////////////////////

function engineAddImage(id, src) {
    engineImages[id] = new Image();
    engineImages[id].src = src;
    engineImages[id].onload = engineHandleImageLoaded;
}

function engineGetImage(id) {
    return engineImages[id];
}

function engineHandleImageLoaded() {
    engineImageLoadCounter++;
}

function engineAllImagesLoaded() {
    return engineImageLoadCounter >= engineImages.length;
}

var ALIGN_L = 1;
var ALIGN_R = 2;
var ALIGN_T = 4;
var ALIGN_B = 8;
var ALIGN_HC = 16;
var ALIGN_VC = 32;
var ALIGN_HCT = ALIGN_HC | ALIGN_T;
var ALIGN_HCB = ALIGN_HC | ALIGN_B;
var ALIGN_LT = ALIGN_L | ALIGN_T;
var ALIGN_RT = ALIGN_R | ALIGN_T;
var ALIGN_LB = ALIGN_L | ALIGN_B;
var ALIGN_RB = ALIGN_R | ALIGN_B;

function engineDrawImage(id, sx, sy, align) {
    var img = engineGetImage(id);
    if (!img) 
	return;

    var x = sx;
    var y = sy;
    if (align & ALIGN_R) x -= img.width;
    if (align & ALIGN_B) y -= img.height;
    if (align & ALIGN_HC) x -= img.width/2;
    if (align & ALIGN_VC) y -= img.height/2;

    ctx.drawImage(img, x, y);
}

function engineSetColor(r,g,b) {
    ctx.fillStyle = "rgb("+r+","+g+","+b+")";
    ctx.strokeStyle = "rgb("+r+","+g+","+b+")";
}

function engineDrawLine(x1,y1,x2,y2) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

function engineSetBlur(n) {
    n = Math.floor(n);
    if (n == 0)
	document.getElementById("dummy").style.webkitFilter = "none";
    else
	document.getElementById("dummy").style.webkitFilter = "blur("+n+"px)";
}

///////////
///////////
function engineSetCanvasPos(x,y) {
    var el = document.getElementById("demo");
    if (el) {
	el.style.marginLeft = x+"px";
	el.style.marginTop = y+"px";
    }
}

function engineHandleClick(event) {   
    var x = -1;
    var y = -1;

    var rect = canvas.getBoundingClientRect();
    x = event.clientX - rect.left - canvas.scrollLeft;
    y = event.clientY - rect.top - canvas.scrollTop;

    for (var ev = 0; ev < demoScript.length; ev++) {
	var fx = demoScript[ev];
	if (engineRunTime >= fx[1] && engineRunTime < fx[1]+fx[2]) {
	    eval(fx[0]+'Click('+x+','+y+')'); //event.offsetX+','+event.offsetY+')');
	}
    }
}

