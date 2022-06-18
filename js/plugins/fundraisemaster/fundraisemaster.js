(function($){
	"use strict";

	// Detect Mobile Device
	var frmaster_mobile = false;
	if( navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/BlackBerry/i) ||
		navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/Windows Phone/i) ){ 
		frmaster_mobile = true; 
	}else{ 
		frmaster_mobile = false; 
	}

	// Detect Screen
	var frmaster_display = 'desktop';
	if( typeof(window.matchMedia) == 'function' ){
		$(window).on('resize frmaster-set-display', function(){
			if( window.matchMedia('(max-width: 419px)').matches ){
				frmaster_display = 'mobile-portrait';
			}else if( window.matchMedia('(max-width: 767px)').matches ){
				frmaster_display = 'mobile-landscape'
			}else if( window.matchMedia('(max-width: 999px)').matches ){
				frmaster_display = 'tablet'
			}else{
				frmaster_display = 'desktop';
			}
		});
		$(window).trigger('frmaster-set-display');
	}else{
		$(window).on('resize frmaster-set-display', function(){
			if( $(window).innerWidth() <= 419 ){
				frmaster_display = 'mobile-portrait';
			}else if( $(window).innerWidth() <= 767 ){
				frmaster_display = 'mobile-landscape'
			}else if( $(window).innerWidth() <= 999 ){
				frmaster_display = 'tablet'
			}else{
				frmaster_display = 'desktop';
			}
		});
		$(window).trigger('frmaster-set-display');
	}	

	// ref : http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	// ensure 1 is fired
	var frmaster_debounce = function(func, threshold, execAsap){
		
		var timeout;

		return function debounced(){
			
			var obj = this, args = arguments;
			
			function delayed(){
				if( !execAsap ){
					func.apply(obj, args);
				}
				timeout = null;
			};

			if( timeout ){
				clearTimeout(timeout);
			}else if( execAsap ){
				func.apply(obj, args);
			}
			timeout = setTimeout(delayed, threshold);
		};
	}	

	// frmaster
	function frmaster_get_form_input( form ){
		var ret = {};

		form.find('input[name], select[name], textarea[name]').each(function(){
			var key = $(this).attr('name');
			if( (key.lastIndexOf('[]') == (key.length - 2)) ){
				key = key.substr(0, key.length - 2);
				if( typeof(ret[key]) != 'object' ){
					ret[key] = []
				}

				if( $(this).is('input[type="checkbox"]') ){
					ret[key].push($(this).is(':checked'));
				}else{
					ret[key].push($(this).val());
				}
			}else{	
				if( $(this).is('input[type="checkbox"]') ){
					ret[key] = $(this).is(':checked');
				}else{
					ret[key] = $(this).val();
				}
			}
		});

		return ret;
	}
	
	// reduce the event occurance
	var frmaster_throttling = function(func, threshold){
		
		var timeout;

		return function throttled(){
			var obj = this, args = arguments;
			
			function delayed(){
				func.apply(obj, args);
				timeout = null;
			};

			if( !timeout ){
				timeout = setTimeout(delayed, threshold);
			}
		};
	}	

	// scroll action
	var frmaster_scroll_to = function(element, percent = 20, include_element_height = false, duration = 600){

		var scroll_position = element.offset().top;
		if( percent > 0 ){
			scroll_position -= $(window).height() * percent / 100;
			if( include_element_height ){
				scroll_position -= element.outerHeight();
			}
			if( scroll_position < 0 ){
				scroll_position = 0;
			}
		}  

		$('html, body').animate({ scrollTop: scroll_position }, { duration: 600, easing: 'easeOutQuart', queue: false });

	}

	// create the conformation message
	window.frmaster_front_confirm_box = function(options){

        var settings = $.extend({
			head: '',
			text: '',
			sub: '',
			yes: '',
			no: '',
			success:  function(){}
        }, options);
		
		var confirm_overlay = $('<div class="frmaster-conform-box-overlay"></div>').appendTo($('body'));
		var confirm_button = $('<span class="frmaster-confirm-box-button frmaster-yes">' + settings.yes + '</span>');
		var decline_button = $('<span class="frmaster-confirm-box-button frmaster-no">' + settings.no + '</span>');
		
		var confirm_box = $('<div class="frmaster-confirm-box-wrapper">\
				<div class="frmaster-confirm-box-head">' + settings.head + '</div>\
				<div class="frmaster-confirm-box-content-wrapper" >\
					<div class="frmaster-confirm-box-text">' + settings.text + '</div>\
					<div class="frmaster-confirm-box-sub">' + settings.sub + '</div>\
				</div>\
			</div>').insertAfter(confirm_overlay);
	
	
		$('<div class="frmaster-confirm-box-button-wrapper"></div>')
			.append(decline_button).append(confirm_button)
			.appendTo(confirm_box);
		
		// center the alert box position
		confirm_box.css({
			'margin-left': -(confirm_box.outerWidth() / 2),
			'margin-top': -(confirm_box.outerHeight() / 2)
		});
				
		// animate the alert box
		confirm_overlay.css({opacity: 0}).animate({opacity:0.6}, 200);
		confirm_box.css({opacity: 0}).animate({opacity:1}, 200);
		
		confirm_button.click(function(){
			if(typeof(settings.success) == 'function'){ 
				settings.success();
			}
			confirm_overlay.fadeOut(200, function(){
				$(this).remove();
			});
			confirm_box.fadeOut(200, function(){
				$(this).remove();
			});
		});
		decline_button.click(function(){
			confirm_overlay.fadeOut(200, function(){
				$(this).remove();
			});
			confirm_box.fadeOut(200, function(){
				$(this).remove();
			});
		});
		
	} // frmaster_front_confirm_box

	// set cookie
	function frmaster_set_cookie( cname, cvalue, expires ){
		if( typeof(expires) != 'undefined' ){
			if( expires == 0 ){
				expires = 86400;
			}

			var now = new Date();
			var new_time  = now.getTime() + (parseInt(expires) * 1000);
			now.setTime(new_time);

			expires = now.toGMTString();
		}

	    document.cookie = cname + "=" + encodeURIComponent(cvalue) + "; expires=" + expires + "; path=/";
	}

	// responsive video
	$.fn.gdlr_core_fluid_video = function( filter_elem ){
		
		if( typeof(filter_elem) == 'undefined' ){
			var elem = $(this).find('iframe[src*="youtube"], iframe[src*="vimeo"]');
		}else{
			var elem = filter_elem.filter('iframe[src*="youtube"], iframe[src*="vimeo"]');
		}
		
		elem.each(function(){

			// ignore if inside slider
			if( $(this).closest('.ls-container, .master-slider').length <= 0 ){ 
				if( ($(this).is('embed') && $(this).parent('object').length) || $(this).parent('.gdlr-core-fluid-video-wrapper').length ){ return; } 
				if( !$(this).attr('id') ){ $(this).attr('id', 'gdlr-video-' + Math.floor(Math.random()*999999)); }			
			
				var ratio = $(this).height() / $(this).width();
				$(this).removeAttr('height').removeAttr('width');
				
				try{
					$(this).wrap('<div class="gdlr-core-fluid-video-wrapper"></div>').parent().css('padding-top', (ratio * 100)+"%");
					$(this).attr('src', $(this).attr('src'));
				}catch(e){}
			}
		});	

		return $(this);
	}

	// lightbox image / video
	$.fn.frmaster_lightgallery = function(){
		
		// ilightbox
		var lightgallery = $(this);
		var lightbox_groups = [];

		lightgallery.each(function(){
			if( $(this).attr('data-lightbox-group') ){
				if( lightbox_groups.indexOf($(this).attr('data-lightbox-group')) == -1 ){
					lightbox_groups.push($(this).attr('data-lightbox-group'));
				}
			}else{
				$(this).lightGallery({ selector: 'this' });
			}
		});

		for( var key in lightbox_groups ){
			var group_selector = '.frmaster-lightgallery[data-lightbox-group="' + lightbox_groups[key] + '"]';
			
			lightgallery.filter(group_selector).first().lightGallery({ 
				selector: group_selector, 
				selectWithin: 'body',
				thumbnail: false
			});
		}

		// lightbox gallery
		if( typeof(filter_elem) == 'undefined' ){
			var gallery_lb = $(this).find('[data-gallery-lb]');
		}else{
			var gallery_lb = filter_elem.filter('[data-gallery-lb]');
		}

		gallery_lb.click(function(){
			$(this).lightGallery({ 
				dynamic: true,
				dynamicEl: $(this).data('gallery-lb'),
				thumbnail: false
			});

			return false;
		});

		return $(this);
	}

	// frmaster lightbox
	function frmaster_lightbox( content ){

		var lightbox_wrap = $('<div class="frmaster-lightbox-wrapper" ></div>').hide();
		var lightbox_content_wrap = $('<div class="frmaster-lightbox-content-cell" ></div>');
		lightbox_wrap.append(lightbox_content_wrap);
		lightbox_content_wrap.wrap($('<div class="frmaster-lightbox-content-row" ></div>'));

		lightbox_content_wrap.append(content);

		var scrollPos = $(window).scrollTop();
		$('html').addClass('frmaster-lightbox-on');
		$('body').append(lightbox_wrap);
		lightbox_wrap.fadeIn(300);

		// bind lightbox form script
		frmaster_form_script(lightbox_wrap);

		// do a lightbox action
		lightbox_wrap.on('click', '.frmaster-lightbox-close', function(){
			$('html').removeClass('frmaster-lightbox-on');
			$(window).scrollTop(scrollPos);
			lightbox_wrap.fadeOut(300, function(){
				$(this).remove();
			});
		});

		// verify 
		lightbox_content_wrap.find('form').not('.frmaster-register-form').each(function(){

			// required field
			$(this).submit(function(){
				var validate = true;
				var error_box = $(this).find('.frmaster-lb-submit-error');
				error_box.slideUp(200);

				$(this).find('input[data-required], select[data-required], textarea[data-required]').each(function(){
					if( !$(this).val() ){
						validate = false;
					}
				});

				if( !validate ){
					error_box.slideDown(200);
				}

				return validate;
			});

		});

	} // frmaster_lightbox

	// form script
	function frmaster_form_script( container ){
		
		if( typeof(container) == 'undefined' ){
			var input_file = $('.frmaster-file-label');
		}else{
			var input_file = container.find('.frmaster-file-label');
		}

		// input file 
		input_file.on('change', 'input[type="file"]', function(){
			var label_text = $(this).siblings('.frmaster-file-label-text');

			if( $(this).val() ){
				label_text.html($(this).val().split('\\').pop());
			}else{
				label_text.html(label_text.attr('data-default'));
			}
		});

	}

	// payment template 
	function frmaster_payment_template_script( body ){

		// donate anonymously button
		body.on('change', 'input[name="donate-anonymously"]', function(){
			var register_form = $(this).parent('label').siblings('form.frmaster-register-form');

			if( $(this).is(':checked') ){
				register_form.slideUp(200);
			}else{
				register_form.slideDown(200);
			}
		});
		body.on('change', 'input[name="create-account"]', function(){
			var password_fields = $(this).closest('.frmaster-create-account-wrap').siblings('.frmaster-register-form-fields-password');

			if( $(this).is(':checked') ){
				password_fields.slideDown(200);
			}else{
				password_fields.slideUp(200);
			}
		});

		// set donation amount
		body.on('click', '.frmaster-donation-amount-button', function(){
			$(this).addClass('frmaster-active').siblings().removeClass('frmaster-active');
			$(this).siblings('.frmaster-custom-donation-amount').val('');

			var input = $(this).siblings('[name="donation-amount"]');
			input.val($(this).attr('data-value'));
		});
		body.on('change', '.frmaster-custom-donation-amount', function(){
			$(this).siblings().removeClass('frmaster-active');

			var input = $(this).siblings('[name="donation-amount"]');
			input.val($(this).val());
		});

		// set donation method
		body.on('click', '.frmaster-donation-method-button', function(){
			$(this).addClass('frmaster-active').siblings().removeClass('frmaster-active');

			var input = $(this).siblings('[name="donation-method"]');
			input.val($(this).attr('data-value'));

			var active_tab = $(this).parent('.frmaster-donation-method').siblings('.frmaster-donation-tab[data-method="' + $(this).attr('data-value') + '"]');
			active_tab.siblings('.frmaster-donation-tab').css('display', 'none');
			active_tab.fadeIn(200);
		});

		// online payment method
		body.on('click', '.frmaster-online-payment-method', function(){
			$(this).addClass('frmaster-active').siblings().removeClass('frmaster-active');

			var input = $(this).siblings('[name="online-payment-method"]');
			input.val($(this).attr('data-value'));

			var recurring = $(this).closest('.frmaster-payment-gateway').siblings('.frmaster-payment-recurring-option');
			if( $(this).attr('data-value') == 'paypal' ){
				recurring.slideDown(150);
			}else{
				recurring.slideUp(150);
			}
		});

		// donate now button
		body.on('click', '.frmaster-donation-submit', function(){
			var t = $(this);

			var page_content = $('#frmaster-page-wrapper');
			page_content.addClass('frmaster-now-loading');

			var ajax_url = t.attr('data-ajax-url');
			var ajax_data = {};
			ajax_data['action'] = t.attr('data-action');

			page_content.find('form[data-slug]').each(function(){
				ajax_data[$(this).attr('data-slug')] = frmaster_get_form_input($(this));
			});
			page_content.find('input[name="donate-anonymously"]').each(function(){
				ajax_data['donate-anonymously'] = $(this).is(':checked');
			});

			$.ajax({
				type: 'POST',
				url: ajax_url,
				data: ajax_data,
				dataType: 'json',
				error: function( jqXHR, textStatus, errorThrown ){

					// print error message for debug purpose
					console.log(jqXHR, textStatus, errorThrown);
				},
				beforeSend: function(){
					t.prev('.frmaster-notification-box').slideUp(150, function(){ $(this).remove(); });
					page_content.find('.frmaster-register-form .frmaster-notification-box').slideUp(150, function(){ $(this).remove(); });
				},
				success: function( data ){
					page_content.removeClass('frmaster-now-loading');

					if( data.status == 'failed' ){

						var error_message = $('<div class="frmaster-notification-box frmaster-failure" ></div>');
						error_message.html(data.error);
						if( typeof(data.error_target) != 'undefined' && data.error_target == 'register-form' ){
							page_content.find('.frmaster-register-form').append(error_message);
							error_message.slideDown(150);
							frmaster_scroll_to(error_message, 80, true);
						}else{
							error_message.insertBefore(t);
							error_message.slideDown(150);
							frmaster_scroll_to(error_message, 35);
						}

					}else if( typeof(data.content) != 'undefined' ){
						page_content.html(data.content);

						frmaster_scroll_to(page_content, 15);
					}

				}
			});
		});
	}

	// on document ready
	$(document).ready(function(){

		var body = $('body');

		body.gdlr_core_fluid_video();

		// lightbox image
		$('.frmaster-lightgallery').frmaster_lightgallery();

		// lightbox popup
		$('[data-frmlb]').on('click', function(){
			var content = $(this).siblings('[data-frmlb-id="' + $(this).attr('data-frmlb') + '"]');

			// check for social login plugin
			if( content.find('.nsl-container-block').length > 0 ){
				var lb_content = content.clone();
				lb_content.find('.nsl-container-block').replaceWith(content.find('.nsl-container-block').clone(true));
			}else if( $(this).attr('data-frmlb') == 'signup' ){
				var lb_content = content.clone(true);
			}else{
				var lb_content = content.clone();
			}
			
			frmaster_lightbox(lb_content);
		});

		// confirm button
		$('[data-confirm]').click(function(){
			var confirm_button = $(this);

			frmaster_front_confirm_box({
				head: confirm_button.attr('data-confirm'),
				text: confirm_button.attr('data-confirm-text'),
				sub: confirm_button.attr('data-confirm-sub'),
				yes: confirm_button.attr('data-confirm-yes'),
				no: confirm_button.attr('data-confirm-no'), 
				success: function(){
					window.location.href = confirm_button.attr('href');
				}
			});

			return false;
		});

		// top bar script
		$('.frmaster-user-top-bar').each(function(){	
			
			// if login 
			if( $(this).hasClass('frmaster-user') ){
				var top_bar_nav = $(this).children('.frmaster-user-top-bar-nav').children('.frmaster-user-top-bar-nav-inner');

				$(this).hover(function(){
					top_bar_nav.fadeIn(200);
				}, function(){
					top_bar_nav.fadeOut(200);
				})
			}
		});

		// content navigation
		var content_nav = $('#frmaster-content-navigation-item-outer');

		if( !body.is('.wp-admin') && content_nav.length ){
			window.chariti_anchor_offset = content_nav.height();

			var content_nav_container = content_nav.parent();
			var offset = parseInt($('html').css('margin-top'));

			// slidebar
			var slidebar = content_nav.find('.frmaster-content-navigation-slider');
			content_nav.find('.frmaster-active').each(function(){
				slidebar.css({width: $(this).outerWidth(), left: $(this).position().left});
			});
			content_nav.on('frmaster-change', function(){
				var active_slidebar = $(this).find('.frmaster-active');
				slidebar.animate({width: active_slidebar.outerWidth(), left: active_slidebar.position().left}, { queue: false, duration: 200 });
			});
			content_nav.each(function(){
				var t = $(this);

				t.find('.frmaster-content-navigation-tab').hover(function(){
					slidebar.animate({ width: $(this).outerWidth(), left: $(this).position().left }, { queue: false, duration: 150 });
				}, function(){
					var active_slidebar = $(this).parent().children('.frmaster-active');
					if( active_slidebar.length ){
						slidebar.animate({ width: active_slidebar.outerWidth(), left: active_slidebar.position().left }, { queue: false, duration: 150 });
					}
				});
				t.find('.frmaster-content-navigation-tab').on('click', function(){
					$(this).addClass('frmaster-active').siblings().removeClass('frmaster-active');
					t.trigger('frmaster-change');
				});
			});
			
			$(window).resize(function(){ content_nav.trigger('frmaster-change'); });

			// sticky scroll
			$(window).scroll(function(){
				if( frmaster_display == 'mobile-landscape' || frmaster_display == 'mobile-portrait' || frmaster_display == 'tablet' ) return;

				if( $(this).scrollTop() + offset > content_nav_container.offset().top ){
					if( !content_nav.hasClass('frmaster-fixed') ){
						content_nav.parent().css('height', content_nav.parent().height());
						content_nav.addClass('frmaster-fixed');

						window.traveltour_anchor_offset	= content_nav.height();
					}
				}else{
					if( content_nav.hasClass('frmaster-fixed') ){
						content_nav.parent().css('height', 'auto');
						content_nav.removeClass('frmaster-fixed');
					}

				}
			});
		}

		// save wishlist
		body.find('.frmaster-follow').click(function(){
			if( $(this).hasClass('frmaster-active') ) return;
			$(this).addClass('frmaster-active');
			
			$.ajax({
				type: 'POST',
				url: $(this).attr('data-ajax-url'),
				data: { action: 'frmaster_follow', 'cause-id': $(this).attr('data-cause-id') },
				dataType: 'json',
				success: function(){ console.log('followed'); }
			});	

			return false;
		});

		// cause donation item
		body.on('click', '.frmaster-cause-donation-form-button', function(){
			$(this).addClass('frmaster-active').siblings().removeClass('frmaster-active');
			$(this).siblings('.frmaster-cause-donation-form-custom').val('');

			var input = $(this).siblings('[name="donation-amount"]');
			input.val($(this).attr('data-value'));
		});
		body.on('change', '.frmaster-cause-donation-form-custom', function(){
			$(this).siblings().removeClass('frmaster-active');

			var input = $(this).siblings('[name="donation-amount"]');
			input.val($(this).val());
		});

		// on user template
		if( body.is('.frmaster-template-user') ){

			// upload preview
			$('input[name="profile-image"]').on('change', function(e){
				var temp_image = $(this).closest('label').siblings('img');

				if( e.target.files && e.target.files[0] ){
					var reader = new FileReader();
					reader.onload = function(e_reader){
						temp_image.attr('src', e_reader.target.result);
						temp_image.attr('srcset', '');
					}
					reader.readAsDataURL(e.target.files[0]);
				}
			});

			// print html script
			$('.frmaster-print').click(function(){
				var printed_id = $(this).attr('data-id');
				if( printed_id ){
					var printed_content = $($('#' + printed_id).html());
					$('body').children().css('display', 'none');
					$('body').append(printed_content);
					window.print();
					printed_content.remove();	
					$('body').children().css('display', '');	
				}
			});

		// payment template
		}else if( body.is('.frmaster-template-payment') ){

			frmaster_payment_template_script(body);

		}

	});

})(jQuery);