var canvas;
var pointsx = [0],  pointsy = [0],  pointsz = [0]; //stored points on the map
var CamX = 0, CamY = 0, CamZ = -45; //camera position
var CamRX = 45; CamRY = 255; //camera rotation
var PX = -9999,  PY = -9999; //projected vector positions
var LPXPY = ""; //optimization for distance calculation
var CamXX, CamXY, CamYX, CamYY, CamZXX, CamZXY, CamZYX, CamZYY, CamYOFS;
var dontrender; var blockDist; var BSetColor; var BSetH;
var frames = 0; MapSize = 20; WaterLevel = 0; WorldDensity = 3;
var VSpeed = 0;





document.addEventListener('keyup', (e) => {
    if (e.key === "w") CamX += 5; //turn left
    if (e.key === "s") CamX -= 5; //turn right
	if (e.key === "a") CamY += 5; //turn left
    if (e.key === "d") CamY -= 5; //turn right
    if (e.key === "e") CamZ -= 10; //Z up
    if (e.key === "q") if (CamZ < 0) CamZ += 10; //Z down
        
    render();
});


function gen() { //generates the 3D world

	ws = MapSize;
    for (var x = -ws/2; x < ws/2; x++) {
        for (var y = -ws/2; y < ws/2; y++) {
            var z = 1;
            pointsx.push(x * 5);
            pointsy.push(y * 5);
            pointsz.push((Math.sin((x+15)/6)+Math.sin((y+25)/6))*15);
        }
    }
}
function render() {
    {
		CamRX+=0.001;
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
        dist = [];
        var dontrender = false;
    }
	frames+=0.3;
	CamX += Math.sin(CamRX)*VSpeed;
    CamY += Math.cos(CamRX)*VSpeed;
	if (LPXPY != PX+" "+PY){
	sort();
	LPXPY = (PX+" "+PY);
	}
	if (!canvas){
    canvas = document.getElementById('canv');
	}
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 1150, 750);
        ctx.beginPath();
        range = 5;
        for (var i = 0; i < pointsx.length; i++) {
			BSetColor = false;
			BSetH = null;
			blockDist = getDist(pointsx[i], pointsy[i]);
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
function start(){
	gen();
	CamRX = 0;
	CamYOFS = 0;
	CamRY = 0;
	WSSlider = document.getElementById("WorldSize");
	WSSlider.oninput = function() {
	  MapSize = this.value;
	  pointsx = [0],  pointsy = [0],  pointsz = [0];
	  gen();
	}
	WLSlider = document.getElementById("WaterLevel");
	WLSlider.oninput = function() {
	  WaterLevel = (this.value-50)/3;
	}
	WDSlider = document.getElementById("WorldDensity");
	WDSlider.oninput = function() {
	  WorldDensity = ((this.value)/10);
	}
	render();
	setInterval(render, 3);
	
}
function getDist(worldX, worldY, y){
	d = 2000 / Math.sqrt(((worldX - CamX) * (worldX - CamX)) + ((worldY - CamY) * (worldY - CamY)));
	blockDist = d;
	return d;
}
function sort() {
    its = 0;
    dist = [];
    for (i = 0; i < pointsx.length; i++) {
        dist.push(Math.sqrt(((pointsx[i] - CamX) * (pointsx[i] - CamX)) + ((pointsy[i] - CamY) * (pointsy[i] - CamY))  + ((pointsz[i] - CamZ) * (pointsz[i] - CamZ))));
    }
    for (var i = 1; i < dist.length; i += 1) {

        if (dist[i - 1] < dist[i]) {
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
function renderPoint(worldX, worldY, worldZ, ctx, index) {
	worldZ = setZ(worldX, worldY, ctx);
    var perspective = 0.01245566;
    var v = 0.1234254;
    perspective = 100 / ((CamYX * (worldX - CamX)) + (CamYY * (worldY - CamY)));
    v = (((CamXX * (worldX - CamX)) + (CamXY * (worldY - CamY))) * perspective * 1.04) + perspective;
    PX = -9999;
    if (0 < 4 * perspective)
        PX = v * 4;
    perspective = 100 / ((CamYX * (worldX - CamX)) + (CamYY * (worldY - CamY)));
    PY =((perspective + ((worldZ - CamZ) * perspective)) * 2) -CamYOFS;
    if (PX < -1575 || PX > 1575) {
        dontrender = false;
        ctx.beginPath()
    } else {
        if (!dontrender)
            ctx.lineTo(575 + Math.floor(PX), 375 + Math.floor(PY));
    }
}
function setZ(worldX, worldY, ctx){
	d = blockDist;
	owX = worldX;
	owY = worldY;
	worldX*=WorldDensity;
	worldY*=WorldDensity;
	h=0;
	for (i = 0; i<4; i++){
	h = (-Math.sin((((worldX+15)/6)+Math.sin((worldY+25)/6)))*15);
	worldX/=2;
	worldY/=2;
	}
	worldX = owX;
	worldY = owY;
	ctx.fillStyle = ("rgb(0, " +  d + ", 0)").toString();
	if (h < WaterLevel){
		h = WaterLevel+Math.sin(frames/15+worldY+worldX)*5;
		ctx.fillStyle = ("rgb(0, 0, "+(100+((Math.sin(Math.sin(frames/80)*15+worldY+worldX)+1.5)*20))+")").toString();
	}
		canvas.getContext('2d').strokeStyle = ctx.fillStyle;
	
return -h;
}
function showCoords(event) {

    CamRX = event.clientX / 155;
	CamYOFS = 0;
	CamRY = (event.clientY-375)/-155;
	console.log(CamYOFS);

}