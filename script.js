$(function(){
	
	var url = window.location.href;
	var bodyWidth = $('body').width();
	$('.thumb-wrapper').width(bodyWidth+'px');
	$('.slides li').width(bodyWidth+'px');
		
	var sizes = ['L', 'XXS'];
	var count = ['2', '101'];
	var directions = ['.slides', '.thumb'];
	
	init(url);
	
	function init (url){
		var b=url.indexOf("#")+1;
		
		$('.slides').html('');
		
		if (b>0){
			data = url.substr(b);	
			var firstGet = $.getJSON(getapiurl('rupdated', data, '15'));
			var secondGet = $.getJSON(getapiurl('updated', data, '15'));
							
			$.when(firstGet, secondGet)
				.then(
					function (data1, data2) { 
						//$('.preloader').hide();
						getImagess(data1[0], directions, sizes, count, 'prev', 1, 'start');
						getImagess(data2[0], directions, sizes, count, 'next', 0, 'start');	
						if($('.slides li:first-child').hasClass('active')){
							$('.thumb li:first-child').addClass('first');
							$('.slides li:first-child').addClass('first');
							$('.slides').css('left', 0);
							disableButtons('prev');
						}
						if($('.slides li:last-child').hasClass('active')){
							$('.thumb li:last-child').addClass('last');
							$('.slides li:last-child').addClass('last');
							disableButtons('next');	
						}
					},
					function () { alert('fail'); }
				); 
		}else{
			
			var firstGet = $.getJSON(getapiurl(null, null, '30'));
			 $.when(firstGet)
				.then(
					function (data) { 
						getImagess(data, directions, sizes, count, 'next', 0, null);
						$('.slides li:first-child').addClass('active first');
						$('.thumb li:first-child').addClass('active first');
							disableButtons('prev');					
					},
					function () { alert('fail'); }
				);   
		}
	}		
		
	$(document)
		.on("click", "a.thumbnails", function(event){
			$('.thumb li').removeClass('active');
			addClassActive($(this).parent());
			var href = $(this).attr("href");
			init(href);
		});
		
	
	function addClassActive(object){
		object.addClass('active');
		
		var elWidth = parseInt(object.css('margin-right'))+parseInt(object.css('margin-left'))+object.width();
		var num = object.index()+1;
		
		var left = (bodyWidth + elWidth)/2 - num*elWidth;

		var shift = left - parseInt($('.thumb').css('left'));
		$('.thumb').animate({left: '+=' +shift + 'px'}, 400);
	}
	
	function disableButtons(direction) { $('.slideshow-control-button-'+direction+' a').addClass('inactive');}
	function enableButtons(direction) {$('.slideshow-control-button-'+direction+' a').removeClass('inactive');}
	 
	function getapiurl(order, data, limit){
	    var url = 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/';
		if (order) url += order+';';
		if (data) url+= data+'/';
		if (limit) url += '/?limit='+limit+'&format=json&callback=?';
		else url += '/?format=json&callback=?';
		return url;
	}
	 
 	$(".slideshow-control-button-prev a").on("click", function(event){	
	    enableButtons('next');
		disableButtons('prev');		
		var href = $(this).attr('href').substr(1);
		$('.slides').animate({left: '+=' + bodyWidth + 'px'}, 200, function(){
				
			var cur = $('.slides .active');
			addControl('next', cur.children().attr('alt'));
			$('.slides li').removeClass('active');
			cur.prev().addClass('active');
			
			var firstChild = $('.slides li:first-child');
			if (firstChild.hasClass('active')){
				if (firstChild.hasClass('first')){
					disableButtons('prev');	
					return;
				}else{
					var firstGet = $.getJSON(getapiurl('rupdated', href, '15'));
					$.when(firstGet)
					.then(
						function (data) { 
							getImagess(data, directions, sizes, count, 'prev', 1);	
							$('.slides').css('left', - bodyWidth+'px');
						},
						function () { alert('fail'); }
					);
				}
			}
		});		
		
		enableButtons('prev');
	});	 
	
	$(".slideshow-control-button-next a").on("click", function(event){	
	 
		enableButtons('prev');
		disableButtons('next');	
		
		var href = $(this).attr('href').substr(1);
		$('.slides').animate({left: '-=' + bodyWidth + 'px'}, 200, function(){
				
			var cur = $('.slides .active');
			addControl('prev', cur.children().attr('alt'));
			$('.slides li').removeClass('active');
			cur.next().addClass('active');
			
			if ($('.slides li:last-child').hasClass('active')){
				var firstGet = $.getJSON(getapiurl('updated', href, '15'));
				$.when(firstGet)
				.then(
					function (data) { 
						getImagess(data, directions, sizes, count, 'next', 1);	
					},
					function () { alert('fail'); }
				);
			}
		});	
		enableButtons('next');
	});	 

		
	$(".thumb").on("mousewheel", function (event, delta) {
		event.preventDefault();
		if($.data(this, 'processing')) return; 
		var thumb = $(".thumb");
		var elWidth = thumb.width();

		$.data(this, 'processing', true);
		var speed = 40;
		var sizes = ['XXS'];
		var count = ['15'];
		var directions = ['.thumb'];
	
			if (delta > 0 && !$('.thumb li').hasClass('first')){
				var href = $('.thumb li:first-child').children().attr("href").substr(1);
				var firstGet = $.getJSON(getapiurl('rupdated', href, '15'));
		
				$.when(firstGet)
					.then(
						function (data) { 
							getImagess(data, directions, sizes, count, 'prev', 1);	
						},
						function () { alert('fail'); }
					); 
			}		
			
			if (delta < 0 && !$('.thumb li').hasClass('last')){
				var href = $('.thumb li:last-child').children().attr("href").substr(1);
				var firstGet = $.getJSON(getapiurl('updated', href, '15'));
		
				$.when(firstGet)
					.then(
						function (data) { 
							getImagess(data, directions, sizes, count, 'next', 1);	
						},
						function () { alert('fail'); }
					); 
			}			
				
				
				
			if ((delta > 0 && parseFloat(thumb.css('left')) < 0) || (delta < 0)) {

				$('.thumb').animate({left: '+=' + delta*speed + 'px'}, 50);
			}
			
			$.data(this, 'processing', false);
		});
		
			
	function getImagess(json, directions, sizes, counts, order, shift, start){

		if (json.entries) {
		 //   var sizes = ['XL', 'L', 'M', 'S', 'XS', 'XXS', 'XXXS'];
			var d = document;
				
			for (j=0; j<directions.length; j++){
				
				var jlen = json.entries.length;
			
				if (counts[j] < jlen){
					len = counts[j];
				}else{
					len = jlen;
				}
				
				var to = directions[j];
				var size = sizes[j];
				
				if (((order == 'prev') && $(to+' li').hasClass('first')) || ((order == 'next') && $(to+' li').hasClass('last'))){
	
					continue;
				}
				
			   var thumbWidth = $(to).width();
			   
				for (var i=shift; i<len; i++) {
					
					var photo = json.entries[i];
					var id = photo.id.split(':').pop();
					var uid = photo.updated+','+id;
					
					if ($(to+' li').hasClass(uid)) {
				//alert('finish');
						continue;
					}
					
					if (photo.img[size]) {
						var image = [];
						
						
						image = d.createElement('img');
						image.style.display = 'inline';
						image.style.borderWidth = '0';					
						image.alt = uid;
						image.title = photo.title;
						image.src = photo.img[size].href;
						
						
						if (sizes[j] == 'XXS'){
							var a = d.createElement("a");
							a.href = '#'+uid;
							a.className = 'thumbnails';
							//a.onclick=function(){ klik("ppp");};
							a.appendChild(image);
							 
							var li = d.createElement("li");
							li.className = uid;
							li.appendChild(a);
							
						}else{ 
							image.style.marginTop = -(photo.img[size].height)/2 + 'px';
							var li = d.createElement("li");
							li.className = uid;
							li.appendChild(image);
							
							if (i+1 == len){
								addControl(order, uid);
							}
						}
						
						$(image).error(function(){
							$(this).parents('li').remove();
							
						});

						if (order == 'prev'){
							$(to).prepend(li);
							
						}else{
							if ((i==shift) && (start == 'start')){
								li.className += ' active';
							}
							$(to).append(li);
						}
						
						if(jlen < 10){
							if((order == 'prev') && (i==jlen-1)) li.className += ' first';
							if((order == 'next') && (i==jlen-1)) li.className += ' last';
						}
					}
											
				}
				var el = $(to+' li');
			
				if (sizes[j] == 'XXS'){
					var elWidth = parseInt(el.css('margin-right'))+parseInt(el.css('margin-left'))+el.width();
				}else{
					var elWidth = $('body').width();
					el.width(elWidth+'px');
					if (start == 'start'){
						$(to).css('left', - elWidth+'px');
					}
				}
			  
				var newWidth = thumbWidth+elWidth*(len-shift);
				$(to).width(newWidth+'px');
				
			} 
		
		}
	}

	function addControl(order, uid){
		$('.slideshow-control-button-'+order+' a').attr("href", '#'+uid);
	}
 	 
});
