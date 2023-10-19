document.querySelector('#prompter > .scrolling-content').innerHTML = marked.parse('Nonsense content.\n\nWow, this is nonsense.\n\nIt really is.\n\nDid you hear that?\n\nNo, I did not hear that.\n\nWhat was it?\n\nI do not know.\n\nWell, I do not know either.\n\nThat is quite unfortunate.\n\nIndeed it is.\n\nOh well.\n\nLooks like we will never know.');

const prompter = document.querySelector("#prompter");
const prompterContent = document.querySelector("#prompter > .scrolling-content");

let isPlaying = false;
function setIsPlaying(nowIsPlaying) {
	isPlaying = nowIsPlaying;

	document.querySelector("#play-pause > .icon").style = 
		isPlaying 
		? "--icon: url(/assets/icons/pause.svg)" 
		: "--icon: url(/assets/icons/arrow-right.svg)";
}

let isFullscreen = false;
function setIsFullscreen(nowIsFullscreen) {
	isFullscreen = nowIsFullscreen;

	document.querySelector("#fullscreen > .icon").style = 
		isFullscreen 
		? "--icon: url(/assets/icons/arrows-corners-in.svg)" 
		: "--icon: url(/assets/icons/arrows-corners-out.svg)";
}

document.querySelector("#play-pause").addEventListener("click", () => {
	setIsPlaying(!isPlaying);
});

document.querySelector("#fullscreen").addEventListener("click", () => {
	if(isFullscreen) {
		document.exitFullscreen();
	} else {
		document.body.requestFullscreen();
	}
});

setIsFullscreen(document.fullscreenElement != null);
document.addEventListener("fullscreenchange", () => {
	setIsFullscreen(document.fullscreenElement != null);
})