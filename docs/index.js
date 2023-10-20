const prompter = document.querySelector("#prompter");
const prompterContent = document.querySelector("#prompter > .scrolling-content");

let isPlaying = false;
let lastAutoScroll = 0;
let autoScrollError = 0;
let lineHeightInPixels = 0;
let scrollLinesPerSecond = 1 / 1.75;

function updateLineHeight() {
	const fontSize = Number.parseFloat(window.getComputedStyle(prompter).getPropertyValue('--prompter-font-size'));
	const lineHeight = Number.parseFloat(window.getComputedStyle(prompter).getPropertyValue('--prompter-line-height'));
	const vhSize = Math.round(window.innerHeight / 100);
	lineHeightInPixels = vhSize * fontSize * lineHeight;
}

function continueAutoScroll(timestamp) {
	if(!isPlaying) {
		return;
	}
	const elapsed = timestamp - lastAutoScroll;
	lastAutoScroll = timestamp;

	// We keep track of how much scrolling actually happened, because browsers
	// may truncate the fractional part of our scrolling, which would make small
	// enough scroll increments ineffective.
	const scrollBy = (elapsed / 1000) * scrollLinesPerSecond * lineHeightInPixels;
	const oldScrollTop = prompterContent.scrollTop;
	const targetScrollTop = oldScrollTop + scrollBy + autoScrollError;
	prompterContent.scrollTop = targetScrollTop;
	
	const actualScrollTop = prompterContent.scrollTop;
	const error = targetScrollTop - actualScrollTop;
	autoScrollError = error;

	// When reaching the end of the scroll area, the auto scroller will
	// accumulate error greater than the error caused by snapping to pixels.
	// This indicates the scrollTop is being clamped and we have reached the end
	// of the document.
	if(autoScrollError > 10) {
		setIsPlaying(false);
	}

	window.requestAnimationFrame(continueAutoScroll);
}

function beginAutoScroll(timestamp) {
	lastAutoScroll = timestamp;
	autoScrollError = 0;
	updateLineHeight();
	window.requestAnimationFrame(continueAutoScroll);
}

function setIsPlaying(nowIsPlaying) {
	isPlaying = nowIsPlaying;
	
	if(isPlaying) {
		document.body.dataset.isPlaying = 1;
	} else {
		document.body.dataset.isPlaying = 0;
	}

	document.querySelector("#play-pause > .icon").style = 
		isPlaying 
		? "--icon: url(/assets/icons/pause.svg)" 
		: "--icon: url(/assets/icons/arrow-right.svg)";

	if(isPlaying) {
		window.requestAnimationFrame(beginAutoScroll);
	}
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

let idleTimer = null;
function wakeFromIdle() {
	if(idleTimer != null) {
		clearTimeout(idleTimer);
	}
	document.body.dataset.isIdle = 0;
	idleTimer = setTimeout(() => {
		idleTimer = null;
		document.body.dataset.isIdle = 1;
	}, 3000);
}
function idleNow() {
	if(idleTimer != null) {
		clearTimeout(idleTimer);
	}
	idleTimer = null;
	document.body.dataset.isIdle = 1;
}

document.body.addEventListener("mousemove", wakeFromIdle);
document.body.addEventListener("mousedown", wakeFromIdle);
document.body.addEventListener("mouseenter", wakeFromIdle);
document.body.addEventListener("mouseleave", idleNow);

function showOnPrompter(content) {
	prompterContent.innerHTML = DOMPurify.sanitize(marked.parse(content));
	
}

function onDragEnter(event) {
	const isFile = event.dataTransfer.types.includes("Files");
	const isText = event.dataTransfer.types.includes("text/plain");
	if(isFile || isText) {
		event.preventDefault();
		document.body.classList.add("dropping-file");
	}
}

function onDragLeave() {
	document.body.classList.remove("dropping-file");
}

function onDrop(event) {
	const isFile = event.dataTransfer.types.includes("Files");
	const isText = event.dataTransfer.types.includes("text/plain");
	if(isFile) {
		event.preventDefault();
		const reader = new FileReader();
		reader.onload = (event) => {
			document.body.classList.remove("dropping-file");
			showOnPrompter(event.target.result);
		}
		reader.readAsText(event.dataTransfer.files[0]);
	} else if(isText) {
		event.preventDefault();
		document.body.classList.remove("dropping-file");
		showOnPrompter(event.dataTransfer.getData("text/plain"));
	}
}

document.body.addEventListener("dragenter", onDragEnter);
document.body.addEventListener("dragover", onDragEnter);
document.body.addEventListener("dragleave", onDragLeave);
document.body.addEventListener("drop", onDrop);

let lastHighlighted = null;
function updateHighlighted() {
	const prompterBounds = prompter.getBoundingClientRect();
	const prompterCentre = (prompterBounds.top + prompterBounds.bottom) / 2;

	let bestChild = null;
	for(const child of prompterContent.children) {
		const childBounds = child.getBoundingClientRect();
		if(childBounds.top <= prompterCentre && childBounds.bottom >= prompterCentre) {
			bestChild = child;
			break;
		}
	}

	if(lastHighlighted != null) {
		lastHighlighted.classList.remove("highlighted");
	}
	if(bestChild != null) {
		bestChild.classList.add("highlighted");
	}
	lastHighlighted = bestChild;
}
setInterval(updateHighlighted, 200);

document.addEventListener("keydown", (event) => {
	if(event.key == " ") {
		setIsPlaying(!isPlaying);
	} else if(event.key == "ArrowLeft") {
		// TODO
	} else if(event.key == "ArrowRight") {
		// TODO
	} else if(event.key == "f" || event.key == "F") {
		setIsFullscreen(document.fullscreenElement != null);
	}
})