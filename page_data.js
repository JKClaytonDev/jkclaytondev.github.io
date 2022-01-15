function start(){
	
selectImage2('HYPERJUSTICE','justice.jpg', 'https://store.steampowered.com/app/1831780/HYPERJUSTICE/?beta=1','HyperJustice is a fast-paced third-person shooter inspired by 1980’s cop movies and television. Sprint through neon-stained Miami as you battle the mob and try to prevent the distribution of a world-ending drug.', '12k1RdPJgk4');

}
function setText(v){
	document.getElementById("mainText").innerText = v;
}
function PscrollTo(v){
	window.scrollTo(0, v)
}
function selectImage2(k, i, l,t,y){
	document.getElementById("photo").src = "img/Screenshots/"+i;
	document.getElementById("desc").innerText = t;
	document.getElementById("title").innerText = k;
	document.getElementById("playLink").href = l;
	document.getElementById("gd").classList.remove('nullDesc');
	document.getElementById("gd").classList.add('gameDesc');
}
function selectImage(k, i, l,t,y){
	document.getElementById("photo").src = "img/Screenshots/"+i;
	document.getElementById("desc").innerText = t;
	document.getElementById("title").innerText = k;
	document.getElementById("playLink").href = l;
	document.getElementById("gd").classList.remove('nullDesc');
	document.getElementById("gd").classList.add('gameDesc');
	window.scrollTo(0, 750);
}