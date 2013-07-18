var introTimer;
var introSoundPlayed;

function introPreload() {
    engineAddImage("leroy", "gfx/leroy.jpg");
    engineAddImage("maxplex", "gfx/RHD_maxplex.png");
    engineAddSound("intromusic", "sfx/rhd_kirbyintro2.ogg");
}

function introInit() {
    introTimer = 0;
    introSoundPlayed = false;
}

function introLogic(dt) {
    introTimer += dt;
    if (!introSoundPlayed && introTimer >= 1000) {
	enginePlaySound("intromusic",false);
	introSoundPlayed = true;
    }
}

function introDraw() {
    engineSetCanvasPos(0, 0);

    var img1 = engineGetImage("leroy");
    var img2 = engineGetImage("maxplex");

    var x = (cw-img2.width)/2;
    var y = (600-img2.height)/2;
    ctx.drawImage(img1, x+120, y+10);
    var a = lerp(1,0,introTimer-3000,1000);
    engineFillRectRGBA(x+120, y+10, img1.width, img1.height, 0, 0, 0, a);

    ctx.drawImage(img2, x, y);
    a = lerp(1, 0, introTimer, 1000);
    engineFillRectRGBA(x, y, img2.width, img2.height, 0, 0, 0, a);

    if (introTimer >= 8000) {
	engineFadeOut(0,0,0,introTimer-8000,2000);
    }

    // animate blur
    if (introTimer <= 1500) {
	document.getElementById("dummy").style.webkitFilter = "blur(50px)";
    }
    else if (introTimer <= 6000) {
	var scale = lerp(50,0,introTimer-1500,3000);
	var b = Math.abs(Math.round(Math.sin(introTimer*0.2*Math.PI/180.0)*scale));
	document.getElementById("dummy").style.webkitFilter = "blur("+b+"px)";
    }
    else if (introTimer >= 8000) {
	var b = Math.round(lerp(0,50,introTimer-8000,2000));
	document.getElementById("dummy").style.webkitFilter = "blur("+b+"px)";
    }


}

function introClick(x,y) {}
