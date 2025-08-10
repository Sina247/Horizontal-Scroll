document.addEventListener("DOMContentLoaded", () => {
	const pageContainer = document.querySelector(".page-container");
	const horizontalContainer = document.querySelector(".horizontal-container");
	const panelsContainer = document.querySelector(".panels-container");
	const panels = document.querySelectorAll(".panel");
	const progressFill = document.querySelector(".nav-progress-fill");
	const navText = document.querySelectorAll(".nav-text")[1];
	const parallaxElements = document.querySelectorAll(".parallax");
	const leftMenu = document.querySelector(".left-menu");
	const menuBtn = document.querySelector(".menu-btn");
	const sectionNavItems = document.querySelectorAll(".section-nav-item");
	const videoBackground = document.querySelector(".video-background");
	const copyEmailBtn = document.querySelector(".copy-email");
	const copyTooltip = document.querySelector(".copy-tooltip");
	const SMOOTH_FACTOR = 0.065;
	const WHEEL_SENSITIVITY = 1.0;
	const PANEL_COUNT = panels.length;
	const MENU_WIDTH = 250;
	const MENU_COLLAPSED_WIDTH = 60;
	const PARALLAX_INTENSITY = 0.5;

	let targetX = 0;
	let currentX = 0;
	let currentProgress = 0;
	let targetProgress = 0;
	let panelWidth = window.innerWidth;
	let maxScroll = (PANEL_COUNT - 1) * panelWidth;
	let isAnimating = false;
	let currentPanel = 0;
	let lastPanel = -1;
	let menuExpanded = false;
	let isDragging = false;
	let startX = 0;
	let startScrollX = 0;
	let velocityX = 0;
	let lastTouchX = 0;
	let lastTouchTime = 0;

	const lerp = (start, end, factor) => start + (end - start) * factor;
	const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

	if (copyEmailBtn) {
		copyEmailBtn.addEventListener("click", () => {
			const email = document.querySelector(".email").textContent;
			navigator.clipboard.writeText(email).then(() => {
				copyTooltip.classList.add("active");
				setTimeout(() => {
					copyTooltip.classList.remove("active");
				}, 2000);
			});
		});
	}

	const animateMenuItems = (show) => {
		sectionNavItems.forEach((item, index) => {
			if (show) {
				setTimeout(() => {
					item.classList.add("animate-in");
				}, 50 + index * 30);
			}

			else {
				item.classList.remove("animate-in");
			}
		});
	};

	menuBtn.addEventListener("click", () => {
		menuExpanded = !menuExpanded;

		leftMenu.classList.toggle("expanded");
		document.body.classList.toggle("menu-expanded");

		if (menuExpanded) {
			setTimeout(() => {
				animateMenuItems(true);
			}, 150);
		}

		else {
			animateMenuItems(false);
		}

		setTimeout(() => {
			updateDimensions(false);
		}, 400);
	});

	const updateParallax = () => {
		parallaxElements.forEach((element) => {
			if (!element) return;

			const speed = Number.parseFloat(element.dataset.speed) || 0.2;

			const PARALLAX_INTENSITY = 0.2;

			const moveX = -currentX * speed * PARALLAX_INTENSITY;

			element.style.transform = `translateX(${moveX}px)`;
		});
	};

	const updateDimensions = (animate = true) => {
		panelWidth = window.innerWidth;
		maxScroll = (PANEL_COUNT - 1) * panelWidth;

		targetX = currentPanel * panelWidth;
		currentX = targetX;

		panels.forEach((panel) => {
			panel.style.width = `${panelWidth}px`;
		});

		if (animate) {
			panelsContainer.classList.add("transitioning");
			setTimeout(() => {
				panelsContainer.classList.remove("transitioning");
			}, 400);
		}

		panelsContainer.style.transform = `translateX(-${currentX}px)`;

		updateParallax();
	};

	sectionNavItems.forEach((item) => {
		item.addEventListener("click", () => {
			const index = Number.parseInt(item.getAttribute("data-index"));

			targetX = index * panelWidth;

			sectionNavItems.forEach((navItem) => {
				navItem.classList.remove("active");
			});

			item.classList.add("active");

			startAnimation();

			if (window.innerWidth < 768 && menuExpanded) {
				menuExpanded = false;
				leftMenu.classList.remove("expanded");
				document.body.classList.remove("menu-expanded");
				animateMenuItems(false);

				setTimeout(() => {
					updateDimensions(false);
				}, 400);
			}
		});
	});

	const splitTexts = document.querySelectorAll(".split-text");
	splitTexts.forEach((text) => {
		const words = text.textContent.split(" ");
		text.innerHTML = words.map((word) => `<span class="word">${word}</span>`).join(" ");

		const wordElements = text.querySelectorAll(".word");
		wordElements.forEach((word, index) => {
			word.style.transitionDelay = `${index * 0.02}s`;
		});
	});

	const updatePageCount = () => {
		const currentPanelIndex = Math.round(currentX / panelWidth) + 1;
		const formattedIndex = currentPanelIndex.toString().padStart(2, "0");
		const totalPanels = PANEL_COUNT.toString().padStart(2, "0");
		navText.textContent = `${formattedIndex} / ${totalPanels}`;

		sectionNavItems.forEach((item, index) => {
			if (index === currentPanelIndex - 1) {
				item.classList.add("active");
			}

			else {
				item.classList.remove("active");
			}
		});
	};

	const updateProgress = () => {
		targetProgress = currentX / maxScroll;
		currentProgress = lerp(
			currentProgress,
			targetProgress,
			SMOOTH_FACTOR * 1.5
		);
		progressFill.style.transform = `scaleX(${currentProgress})`;
	};

	const updateActivePanel = () => {
		currentPanel = Math.round(currentX / panelWidth);
		if (currentPanel !== lastPanel) {
			panels.forEach((panel) => {
				panel.classList.remove("was-active");
			});

			if (lastPanel >= 0 && panels[lastPanel]) {
				panels[lastPanel].classList.remove("active");
			}

			if (panels[currentPanel]) {
				panels[currentPanel].classList.add("active");
			}

			for (let i = 0; i < panels.length; i++) {
				if (i < currentPanel) {
					panels[i].classList.add("visited");
				}

				else {
					panels[i].classList.remove("visited");
				}
			}

			lastPanel = currentPanel;
		}
	};

	const animate = () => {
		currentX = lerp(currentX, targetX, SMOOTH_FACTOR);
		panelsContainer.style.transform = `translateX(-${currentX}px)`;

		updateProgress();
		updatePageCount();
		updateActivePanel();
		updateParallax();

		if (Math.abs(targetX - currentX) > 0.1 || isAnimating) {
			requestAnimationFrame(animate);
		}

		else {
			isAnimating = false;
		}
	};

	const startAnimation = () => {
		if (!isAnimating) {
			isAnimating = true;
			requestAnimationFrame(animate);
		}
	};

	const handleWheel = (e) => {
		e.preventDefault();
		targetX = clamp(targetX + e.deltaY * WHEEL_SENSITIVITY, 0, maxScroll);
		startAnimation();
	};

	const handleMouseDown = (e) => {
		if (e.target.closest(".left-menu") || e.target.closest(".copy-email")) return;

		isDragging = true;
		startX = e.clientX;
		startScrollX = currentX;
		lastTouchX = e.clientX;
		lastTouchTime = Date.now();
		document.body.style.cursor = "grabbing";
		e.preventDefault();
	};

	const handleMouseMove = (e) => {
		if (!isDragging) return;

		const dx = e.clientX - startX;
		targetX = clamp(startScrollX - dx, 0, maxScroll);

		const currentTime = Date.now();
		const timeDelta = currentTime - lastTouchTime;

		if (timeDelta > 0) {
			const touchDelta = lastTouchX - e.clientX;
			velocityX = (touchDelta / timeDelta) * 15;
		}

		lastTouchX = e.clientX;
		lastTouchTime = currentTime;
		startAnimation();
	};

	const handleMouseUp = () => {
		if (!isDragging) return;
		isDragging = false;
		document.body.style.cursor = "grab";

		if (Math.abs(velocityX) > 0.5) {
			targetX = clamp(targetX + velocityX * 8, 0, maxScroll);
		}

		const nearestPanel = Math.round(targetX / panelWidth);
		targetX = nearestPanel * panelWidth;
		startAnimation();
	};

	const handleTouchStart = (e) => {
		if (e.target.closest(".left-menu") || e.target.closest(".copy-email")) return;

		isDragging = true;
		startX = e.touches[0].clientX;
		startScrollX = currentX;
		lastTouchX = e.touches[0].clientX;
		lastTouchTime = Date.now();
	};

	const handleTouchMove = (e) => {
		if (!isDragging) return;

		const dx = e.touches[0].clientX - startX;
		targetX = clamp(startScrollX - dx, 0, maxScroll);

		const currentTime = Date.now();

		const timeDelta = currentTime - lastTouchTime;
		if (timeDelta > 0) {
			const touchDelta = lastTouchX - e.touches[0].clientX;
			velocityX = (touchDelta / timeDelta) * 12;
		}

		lastTouchX = e.touches[0].clientX;
		lastTouchTime = currentTime;
		e.preventDefault();
		startAnimation();
	};

	const handleTouchEnd = () => {
		if (!isDragging) return;
		isDragging = false;

		if (Math.abs(velocityX) > 0.5) {
			targetX = clamp(targetX + velocityX * 6, 0, maxScroll);
		}

		const nearestPanel = Math.round(targetX / panelWidth);
		targetX = nearestPanel * panelWidth;
		startAnimation();
	};

	horizontalContainer.addEventListener("wheel", handleWheel, { passive: false });
	horizontalContainer.addEventListener("mousedown", handleMouseDown);
	window.addEventListener("mousemove", handleMouseMove);
	window.addEventListener("mouseup", handleMouseUp);
	horizontalContainer.addEventListener("touchstart", handleTouchStart, { passive: true });
	horizontalContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
	horizontalContainer.addEventListener("touchend", handleTouchEnd, { passive: true });

	window.addEventListener("resize", () => { updateDimensions(); });

	parallaxElements.forEach((img) => {
		if (img.tagName === "IMG") {
			if (img.complete) {
				img.classList.add("loaded");
			}

			else {
				img.addEventListener("load", () => {
					img.classList.add("loaded");
				});
			}
		}
	});

	if (videoBackground) {
		videoBackground.playbackRate = 0.6;
	}

	updateDimensions();
	updateActivePanel();
	updatePageCount();
	startAnimation();

	setTimeout(() => {
		panels[0].classList.add("active");
		sectionNavItems[0].classList.add("active");
	}, 100);

	setTimeout(() => {
		updateParallax();
	}, 200);
});
