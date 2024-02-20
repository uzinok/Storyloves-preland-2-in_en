$(function() {
	$(".only_number").on("keydown", function(event) {
		if (
			event.keyCode == 46 ||
			event.keyCode == 8 ||
			event.keyCode == 9 ||
			event.keyCode == 27 ||
			event.keyCode == 187 ||
			(event.keyCode == 65 && event.ctrlKey === true) ||
			(event.keyCode >= 35 && event.keyCode <= 39)
		) {
			return;
		} else {
			if (
				(event.keyCode < 48 || event.keyCode > 57) &&
				(event.keyCode < 96 || event.keyCode > 105)
			) {
				event.preventDefault();
			}
		}
	});

	var steps = $(".form-step-item");
	var EV = null;

	var V = slv({
		fieldsWrapper: steps,
		hintsFrom: $("#errors li"),
		errorContainerSelector: ".error-message",
		form: $(".form-step-wrapper"),
		afterValidation: function(nextIndex) {
			/*
				Code for step-by-step filling
			*/
			steps.eq(nextIndex - 1).removeClass("active");
			$("body").attr("data-current-step", nextIndex + 1);
			steps.eq(nextIndex).addClass("active");

			// code used when all steps visible
			// V.check();
		},
		data: {
			ccode: typeof ccode !== 'undefined' ? ccode : $('[name="ccode"]').val()
		},
		whenDone: function(resp) {

			if (typeof move_next !== ' undefined') move_next(EV, {
				key: resp.key,
				login: resp.login
			}, true)
		},
		onGoTo: function(targetIndex) {
			steps.removeClass("active");
			$("body").attr("data-current-step", targetIndex + 1);
			steps.eq(targetIndex).addClass("active");
		}
	});

	V.init();

	$(".lt_button_next").on("click", function(event) {
		event.preventDefault();
		EV = event;
		V.check();
	});

	$(".pagination-item").on("click", function(event) {
		event.preventDefault();
		V.goTo($(this).index());
	});

	var fieldSettings = {
		fieldContainer: ".form-item",
		activeClass: "is-active",
		focusClass: "is-focused",
		select: {
			container: ".form-select",
			selectedValue: ".select-value",
			dropdown: ".select-dropdown",
			dropdownItem: "select-item"
		}
	};

	function addFocus(el) {
		$(el)
			.closest(fieldSettings.fieldContainer)
			.addClass(fieldSettings.focusClass);
	}

	function removeFocus(el) {
		$(el)
			.closest(fieldSettings.fieldContainer)
			.removeClass(fieldSettings.focusClass);
	}

	var selectClone = "";
	$(fieldSettings.select.container)
		.find("select")
		.each(function() {
			$(this)
				.find("option")
				.each(function() {
					if ($(this).is("[selected]")) {
						$(this)
							.closest(fieldSettings.select.container)
							.find(fieldSettings.select.selectedValue)
							.html($(this).html());
						addFocus(this);
					}
					selectClone +=
						'<div class="' +
						fieldSettings.select.dropdownItem +
						'" value="' +
						$(this).val() +
						'">' +
						$(this).html() +
						"</div>";
				})
				.closest(fieldSettings.select.container)
				.find(fieldSettings.select.dropdown)
				.append($(selectClone));
		});
	$(document).on("click", fieldSettings.select.container, function(e) {
		var $this = $(this);
		var $selectItem = $(e.target).closest(
			"." + fieldSettings.select.dropdownItem
		);
		if ($selectItem.length) {
			$this.removeClass(fieldSettings.activeClass);
			addFocus(this);
			$this.find(fieldSettings.select.selectedValue).html($selectItem.html());
			$this
				.find("select")
				.val($selectItem.attr("value"))
				.change();
			return;
		}
		$this.toggleClass(fieldSettings.activeClass);
	});
	$(document).on("click", function(e) {
		var $target = $(e.target),
			$select = $(fieldSettings.select.container);
		if (!$target.closest(fieldSettings.select.container).length) {
			$select.removeClass(fieldSettings.activeClass);
		} else {
			$select
				.not($target.closest(fieldSettings.select.container))
				.removeClass(fieldSettings.activeClass);
		}
	});
});
