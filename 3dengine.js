var canvas;
var pointsx = [0],
    pointsy = [0],
    pointsz = [0]; //stored points on the map
var CamX = 0,
    CamY = 0,
    CamZ = -45; //camera position
var CamRX = 45;
CamRY = 255; //camera rotation
var PX = -9999,
    PY = -9999; //projected vector positions
var LPXPY = ""; //optimization for distance calculation
var FOV = 90; //this isn't the actual field of vision, i'm too lazy to calculate that right now
var CamXX, CamXY, CamYX, CamYY, CamZXX, CamZXY, CamZYX, CamZYY, CamYOFS;
var dontrender;
var polyDist;
var BSetColor;
var BSetH;
var turnSpeed = 25;
var frames = 0;
MapSize = 30;
WaterLevel = 0;
WorldDensity = 3;
TimeScale = 25;




document.addEventListener('keyup', (e) => {
    if (e.key === "w") CamX += 5; //turn left
    if (e.key === "s") CamX -= 5; //turn right
    if (e.key === "a") CamY += 5; //turn left
    if (e.key === "d") CamY -= 5; //turn right
    if (e.key === "e") CamZ -= 10; //Z up
    if (e.key === "q")
        if (CamZ < -20) CamZ += 10; //Z down

    render();
});

/*
this generates the level, you might notice that there are 4 times as many points in render as there are here, that's because 1 point counts for 4 polys,
you may be wondering how they all have different z positions, that is changed when the distance and color are calculated, but the (stored) position is for
distance sorting.
*/
function gen() { //generates the 3D world
    for (var x = -MapSize / 2; x < MapSize / 2; x++) { //creating the level based on the map size
        for (var y = -MapSize / 2; y < MapSize / 2; y++) {
            var z = 1;
            pointsx.push(x * 5);
            pointsy.push(y * 5);
            pointsz.push((Math.sin((x + 15) / 6) + Math.sin((y + 25) / 6)) * 15); //map code
        }
    }
}

function render() {
    { //these are constants we will need for the render math, they stay the same the whole time as they are based on camera pos/rot instead of the positions of the world, so we should only calculate them once
        CamRX += 0.003 * turnSpeed / 25;
        PX = -9999;
        PY = -9999;
        CamXX = Math.cos(CamRX);
        CamXY = Math.sin(CamRX);
        CamYX = -CamXY;
        CamYY = CamXX;
        CamZXX = Math.cos(CamRY);
        CamZXY = Math.sin(CamRY);
        CamZYX = -CamZXY;
        CamZYY = CamZXX;
        var lastPX = 0;
        dist = []; //distance sorting array for later
        var dontrender = false;
    }
    frames += 0.3 * TimeScale / 25; //calculating time is too intensive, so instead i just calculate frames for the water script
    if (LPXPY != PX + " " + PY) { //this runs the sorting script whenever the player moves, because otherwise it wastes resources/time
        sort();
        LPXPY = (PX + " " + PY);
    }
    if (!canvas) {
        canvas = document.getElementById('canv');
    }
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 1150, 750);
        ctx.beginPath();
        range = 5; //in case i want to seperate the polygons
        for (var i = 0; i < pointsx.length; i++) {
            /*to make the game run faster, i have 1 point represent 4, the main issue here is that I have to have the maps be generated realtime with a
            simple algorithm if I want the points to be connected to eachother. I will probably fix this later.
            */
            BSetColor = false;
            BSetH = null;
            polyDist = getDist(pointsx[i], pointsy[i]);
            renderPoint(pointsx[i] + range, pointsy[i] + range, pointsz[i], ctx, i);
            renderPoint(pointsx[i] + range, pointsy[i] - range, pointsz[i], ctx, i);
            renderPoint(pointsx[i], pointsy[i] - range, pointsz[i], ctx, i);
            renderPoint(pointsx[i], pointsy[i] + range, pointsz[i], ctx, i);
            ctx.stroke();
            ctx.fill();
            ctx.beginPath()
            dontrender = false;
        }
    }

}

function start() {
    gen(); //generates the world for the first time
    CamRX = 0; //camera X rotation
    CamYOFS = 0; //for future reference, this is the camera Y offset / tilt, it's not rotating up and down, it's just moving the image
    CamRY = 0; //this is the real camera Y rotation, it is not used

    //these are all the slider updaters
    WSSlider = document.getElementById("WorldSize");
    WSSlider.oninput = function() {
        MapSize = this.value;
        pointsx = [0], pointsy = [0], pointsz = [0];
        gen();
    }
    WLSlider = document.getElementById("WaterLevel");
    WLSlider.oninput = function() {
        WaterLevel = (this.value - 50) / 3;
    }
    WDSlider = document.getElementById("WorldDensity");
    WDSlider.oninput = function() {
        WorldDensity = ((this.value) / 10);
    }
    WDSlider = document.getElementById("FOV");
    WDSlider.oninput = function() {
        FOV = ((this.value) * 2.5) + 30;
    }
    WDSlider = document.getElementById("TurnSpeed");
    WDSlider.oninput = function() {
        turnSpeed = ((this.value - 50));
    }
    WDSlider = document.getElementById("YTilt");
    WDSlider.oninput = function() {
        CamYOFS = ((this.value) - 50) * 5;
    }
    render();
    setInterval(render, 3);

}

function getDist(worldX, worldY, y) { //returns distance and sets PolyDist for future reference
    d = 2000 / Math.sqrt(((worldX - CamX) * (worldX - CamX)) + ((worldY - CamY) * (worldY - CamY)));
    polyDist = d;
    return d;
}

function sort() { //if i am typing and see the keyboard on top of my hand, i would get freaked out, so we have to sort which objects are drawn based on distance to the player, since position matters and direction doesn't, we can just run it whenever the player moves
    dist = [];
    //i want to use bubble sort or merge sort later, but for now we have to deal with this
    for (i = 0; i < pointsx.length; i++) {
        dist.push(Math.sqrt(((pointsx[i] - CamX) * (pointsx[i] - CamX)) + ((pointsy[i] - CamY) * (pointsy[i] - CamY)) + ((pointsz[i] - CamZ) * (pointsz[i] - CamZ))));
    }
    for (var i = 1; i < dist.length; i += 1) {

        if (dist[i - 1] < dist[i]) {
            //replacing the two values
            var tempx = pointsx[i];
            var tempy = pointsy[i];
            var tempz = pointsz[i];
            var tempd = dist[i];


            pointsx[i] = pointsx[i - 1];
            pointsy[i] = pointsy[i - 1];
            pointsz[i] = pointsz[i - 1];
            dist[i] = dist[i - 1];

            pointsx[i - 1] = tempx;
            pointsy[i - 1] = tempy;
            pointsz[i - 1] = tempz;
            dist[i - 1] = tempd;
            i = 1

        }
    }
}

function renderPoint(worldX, worldY, worldZ, ctx, index) { //self explanatory, this is where it renders a point
    worldZ = setZ(worldX, worldY, ctx);
    var perspective;
    var v;
    perspective = 100 / ((CamYX * (worldX - CamX)) + (CamYY * (worldY - CamY)));
    v = (((CamXX * (worldX - CamX)) + (CamXY * (worldY - CamY))) * perspective * 1.04) + perspective;
    //there is a strange effect where the points are mirrored, this is just a check for that
    PX = -9999;
    if (0 < 4 * perspective)
        PX = v * 4;
    //this establishes the point x (above) and point y (below)
    perspective = 100 / ((CamYX * (worldX - CamX)) + (CamYY * (worldY - CamY)));
    PY = ((perspective + ((worldZ - CamZ) * perspective)) * 2) - CamYOFS;
    //adjusting for FOV
    PY /= (FOV / 90);
    PX /= (FOV / 90);
    //culls out objects to the side
    if (PX < -1575 || PX > 1575) {
        dontrender = false;
        ctx.beginPath()
    } else {
        if (!dontrender)
            ctx.lineTo(575 + Math.floor(PX), 375 + Math.floor(PY));
    }
}

function setZ(worldX, worldY, ctx) {
    //this is the "shaders" i was talking about, it sets color and height based on input
    d = polyDist; //told you we needed polydist
    owX = worldX;
    owY = worldY;
    worldX *= WorldDensity;
    worldY *= WorldDensity;
    h = 0;
    for (i = 0; i < 4; i++) { //this is how we get the height and try to make it look somewhat natural
        h = (-Math.sin((((worldX + 15) / 6) + Math.sin((worldY + 25) / 6))) * 15);
        worldX /= 2;
        worldY /= 2;
    }
    worldX = owX;
    worldY = owY;
    ctx.fillStyle = ("rgb(0, " + d + ", 0)").toString(); //this sets the color based on the distance
    if (h < WaterLevel) { //the below part is about how water is rendered
        h = WaterLevel + Math.sin(frames / 15 + worldY + worldX) * 5;
        ctx.fillStyle = ("rgb(0, 0, " + (100 + ((Math.sin(Math.sin(frames / 80) * 15 + worldY + worldX) + 1.5) * 20)) + ")").toString();
    }
    canvas.getContext('2d').strokeStyle = ctx.fillStyle;

    return -h;
}