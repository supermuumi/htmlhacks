function rand(n) {
    return Math.floor(Math.random()*n);
}

function frand(n) {
    return Math.random()*n;
}

function lerp(a, b, t, t0) {
    if (t < 0) return a;
    if (t > t0) return b;
    return a + t*(b-a)/t0;
}

// lerp with ease in
function easeIn(a, b, t, t0) {
    if (t < 0) return a;
    if (t > t0) return b;

    var timeI = t/t0;
    timeI = timeI*timeI;
    return a + (b-a)*timeI;
}

// lerp with ease out
function easeOut(a, b, t, t0) {
    if (t < 0) return a;
    if (t > t0) return b;

    var timeI = t/t0;
    timeI = (1.0 - timeI) * (1.0 - timeI);
    return a + (b-a)*timeI;
}

// lerp with ease in & ease out
function ease(a, b, t, t0) {
    if (t < 0) return a;
    if (t > t0) return b;

    var timeI = t/t0;   
    var tt = timeI*timeI;
    timeI = (3.0 * tt) - (2.0 * timeI * tt);
    return a + (b-a)*timeI;    
}
