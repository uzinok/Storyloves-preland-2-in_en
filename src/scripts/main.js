const swiper = new Swiper('.swiper', {
	// Optional parameters
	loop: true,
	spaceBetween: 40,
	autoHeight: true,

	// If we need pagination
	pagination: {
		el: '.swiper-pagination',
		bulletElement: 'button',
		clickable: true
	},

	// Navigation arrows
	navigation: {
		nextEl: '.slider__button-prev',
		prevEl: '.slider__button-next',
	},

});
