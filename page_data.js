function start(){
	

}
function setText(v){
	document.getElementById("mainText").innerText = v;
}
function PscrollTo(v){
	window.scrollTo(0, v)
}

function selectImage(k, i, l,t){
	document.getElementById("photo").src = "img/Screenshots/"+i;
	document.getElementById("desc").innerText = t;
	document.getElementById("title").innerText = k;
	document.getElementById("playLink").href = l;
	document.getElementById("gd").classList.remove('nullDesc');
	document.getElementById("gd").classList.add('gameDesc');
	window.scrollTo(0, 750);
}