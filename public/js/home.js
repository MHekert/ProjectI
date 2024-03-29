var urlArr = window.location.href.split("/"); 
socket = io.connect(urlArr[0]+'//'+urlArr[2]);


socket.emit('allGames', {});

socket.on('new', function (data) {
	var valid = true;

	var gameName = $( 'select.game' ).val();
	if(gameName) gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
	var modeName = $( 'select.modeName' ).val();
	var modePlayers = $( 'select.modePlayers' ).val();
	var qdPlayers = $( 'select.yourGroup' ).val();
	var rankS = $( 'select.rank' ).val();
	if(rankS) rankS = rankS.replace(/([A-Z])/g, ' $1').trim();
	var platform = $( 'select.platform' ).val();
	var region = $( 'select.region' ).val();
	if (data.game != gameName && gameName !== null) valid = false;
	if (data.modeName != modeName && modeName !== null) valid = false;
	if (data.modePlayers != modePlayers && modePlayers !== null) valid = false;
	if (data.rankS != rankS && rankS !== null) valid = false;
	if (data.platform != platform && platform !== null) valid = false;
	if (data.region != region && region !== null) valid = false;
	if (modePlayers !== null && qdPlayers !== null) {
		if (data.qdPlayers > parseInt(modePlayers) - parseInt(qdPlayers)) valid = false;
	}
	if(valid) {
		prependUserAd(data);
		RefreshSomeEventListener();
		$('button.new-ads').show();
	}
});
socket.on('delete', function (data) {
	for (var i = 0; i < data.id.length; i++) {
		$('#'+data.id[i]).toggleClass('grayscale',true);
		$('#'+data.id[i]+'.picked-user').toggleClass('grayscale',true);
	}
});
socket.on('match', function (data) {
	generateAlert('alert-info','<a href=\"/profile\">Match was found!</a>');
});
socket.on('notactive', function (data) {
	generateAlert('alert-danger','At least one ad is no longer active.');
});




$(document).ready(function() {
	$("[name='auto']").bootstrapSwitch();
	generateUserAds(true);
	$('select').change(function() {
		$(this).toggleClass('red-border', false);
	});
	$('select.modePlayers').change(function() {
		var maxPlayers = $('select.modePlayers').val();
		var group = $('select.yourGroup').val();
	   
			$('select.yourGroup').empty();
			$('select.yourGroup').append( '<option value="" disabled selected hidden>Your group size</option>');

			for (var i = 1; i < maxPlayers; i++) {
				$('select.yourGroup').append( '<option value='+i+'>'+i+'</option>');
			}

		if (sessionStorage.getItem('init')) $('select.yourGroup').val(sessionStorage.getItem('yourGroup')).change();
		generateUserAds(true);
	});

	$('select.modeName').change(function() {

		var gameName = $( 'select.game' ).val();
		var modeName = $( 'select.modeName' ).val();
		gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
		$.ajax({
		type: 'GET',
		url: '/queue/'+gameName+'/'+modeName,
		success:  function(json) {
			json.modePlayers = json.modePlayers.sort(sortNumber);
			$('select.modePlayers').empty();
			$('select.modePlayers').append( '<option value="" disabled selected hidden>Mode players</option>');
				for (var i = 0; i < json.modePlayers.length; i++) {
					$('select.modePlayers').append( '<option value='+json.modePlayers[i]+'>'+json.modePlayers[i]+'</option>');
				}
			$('select.yourGroup').empty();
			$('select.yourGroup').append( '<option value="" disabled selected hidden>Your group size</option>');
			var maxPlayers = json.modePlayers.sort(sortNumber).reverse()[0];
			for (var i = 1; i < maxPlayers; i++) {
				$('select.yourGroup').append( '<option value='+i+'>'+i+'</option>');
			}


			if (sessionStorage.getItem('init') && sessionStorage.getItem('modePlayers') != null) $('select.modePlayers').val(sessionStorage.getItem('modePlayers')).change();
			if (sessionStorage.getItem('init')) sessionStorage.removeItem('init')
			generateUserAds(true);
		}});
	});



	$('select.rank, select.platform, select.region').change(function() {
		generateUserAds(true);
	});

	$('select.yourGroup').change(function() {
		sessionStorage.setItem('yourGroup',$('select.yourGroup').val());
		generateUserAds(true);
	});

	$('select.game').change(function() {
		var gameName = $( 'select.game' ).val();
		var modeName = $( 'select.modeName' ).val();
		socket.emit('room', gameName);
		if(gameName != null) gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
		
		$('select').toggleClass('hidden',false);
		
		var elem = $(this);
		$.ajax({
		type: 'GET',
		url: '/game/'+gameName,
		success:  function(json) { 

			$('select.modeName').empty();
			$('select.modeName').append( '<option value="" disabled selected hidden>Mode name</option>');
			for (var i = 0; i < json.mode.length; i++) {
					$('select.modeName').append( '<option value='+json.mode[i].modeName+'>'+json.mode[i].modeName+'</option>');
			}

			$('select.modePlayers').empty();
			$('select.modePlayers').append( '<option value="" disabled selected hidden>Mode players</option>');
			var players = [];
			for (var i = 0; i < json.mode.length; i++) {
				for (var j = 0; j < json.mode[i].modePlayers.length; j++) {
					players.push(json.mode[i].modePlayers[j]);
				}
			}
			players =_.uniq(players);
			for (var i = 0; i < players.length; i++) {
				$('select.modePlayers').append( '<option value='+players[i]+'>'+players[i]+'</option>');
			}

			$('select.yourGroup').empty();
			$('select.yourGroup').append( '<option value="" disabled selected hidden>Your group size</option>');
			players = [];
			for (var j = 0; j < json.mode.length; j++) {
				players.push(json.mode[j].modePlayers);
			}
			for (var i = players.sort(sortNumber).reverse()[0]-1; i >0 ; i--) {
				$('select.yourGroup').append( '<option value='+i+'>'+i+'</option>');
			}

			$('select.rank').empty();
			$('select.rank').append( '<option value="" disabled selected hidden>Rank</option>');
			for (var i = 0; i < json.rank.length; i++) {
				$('select.rank').append( '<option value='+json.rank[i].replace(/\s/g, '')+'>'+json.rank[i]+'</option>');
			}

			$('select.platform').empty();
			$('select.platform').append( '<option value="" disabled selected hidden>Platform</option>');
			for (var i = 0; i < json.platform.length; i++) {
				$('select.platform').append( '<option value='+json.platform[i]+'>'+json.platform[i]+'</option>');
			}

			$('select.region').empty();
			$('select.region').append( '<option value="" disabled selected hidden>Region</option>');
			for (var i = 0; i < json.region.length; i++) {
				$('select.region').append( '<option value='+json.region[i]+'>'+json.region[i]+'</option>');
			}  
			if (sessionStorage.getItem('init') && sessionStorage.getItem('modeName') != null) $('select.modeName').val(sessionStorage.getItem('modeName')).change();
			if (sessionStorage.getItem('init') && sessionStorage.getItem('rank') != null) $('select.rank').val(sessionStorage.getItem('rank')).change();
			if (sessionStorage.getItem('init') && sessionStorage.getItem('platform') != null) $('select.platform').val(sessionStorage.getItem('platform')).change();
			if (sessionStorage.getItem('init') && sessionStorage.getItem('region') != null) $('select.region').val(sessionStorage.getItem('region')).change();
			generateUserAds(true);

		}
		});

	});

	

	$('button.select.reverse').click(function() {
		var gameName = $( 'select.game' ).val();
		socket.emit('room', gameName);
		if(!(sessionStorage.getItem('init') != null)) updatePicks(true); 
	});
	$('button.select.reset').click(function() {
		socket.emit('allGames', {});
		sessionStorage.clear();
		location.reload();
	});

	$('.pick > button').click(function() {
		var group;
		var yourGroup;
		var modePlayers;
		var valid = true;
		if ($('.picked-user').length > 0) {
			if (sessionStorage.getItem('group') != null) {
				group = parseInt(sessionStorage.getItem('group'));
			} else {
				valid = false;
			}
			if (sessionStorage.getItem('yourGroup') != null) {
				yourGroup = parseInt(sessionStorage.getItem('yourGroup'));
			} else {
				yourGroup = 1;
			}
			if (sessionStorage.getItem('modePlayers') != null) {
				modePlayers = parseInt(sessionStorage.getItem('modePlayers'));
			} else {
				valid = false;
			}
			if(valid) {
				if((yourGroup+group) == modePlayers) {
					var id = JSON.parse(sessionStorage.getItem('id'));
					$.ajax({
					type: 'POST',
					data: {id: id},
					url: '/match',
					success:  function(json) {
						$('div.alert.alert-info').show();
						generateAlert('alert-info','Your request was registered.');
					},
					statusCode: {
						404: function() {
							generateAlert('alert-danger','At least one ad is no longer active.');
						},
						401: function() {
							generateAlert('alert-danger','You need to login to preform this activity.');
						},
						406: function() {
							generateAlert('alert-danger','You can\'t add another ad.');
						}
					}
					});
				} else {
					generateAlert('alert-danger','Wrong sizes of groups.')
				}
			}
			
		} 

	});

});




$(document).ready(function() {
	RefreshSomeEventListener();
	updatePicks(true);

	 $('button.new-ads').click(function() {
		$('button.new-ads').hide();
		$('div.user-ad-outer').toggleClass('hidden', false);
	});

	$('ul.mobile-nav > li').click(function() {
		$('ul.mobile-nav > li').toggleClass('active',false);
		$(this).toggleClass('active', true);

		$('.row').toggleClass('hidden-xs');
	});

	$('button.picked').click(function() { 

		$('div.pick.fixed').toggle('display');
		$('.pick-data').show();
	});

	$('.pick.fixed').bind('mousewheel touchmove', function(event) {
		if (event.originalEvent.wheelDelta >= 0) {
			$('.pick-data').show('slow');
		} else {
			$('.pick-data').hide('slow');
		}
	});

	$('.pick.fixed').bind('mousewheel touchmove DOMMouseScroll', function(e) {
		var scrollTo = null;

		if (e.type == 'mousewheel') {
			scrollTo = (e.originalEvent.wheelDelta * -1);
		}
		else if (e.type == 'DOMMouseScroll') {
			scrollTo = 40 * e.originalEvent.detail;
		}

		if (scrollTo) {
			e.preventDefault();
			$(this).scrollTop(scrollTo + $(this).scrollTop());
		}
	});

	var win = $(window);
	var nearToBottom = 200;
	win.scroll(function() {
		if ($(window).scrollTop() + $(window).height() + nearToBottom >= $('.content-area').offset().top + $('.content-area').height() ) { 
			if(!$('span.no-ads').is(':visible'))
			{
				generateUserAds(false); 
			}
		}
	});

	$('.create-new').click(function() {
		var gameName = $( 'select.game' ).val();
		if(gameName) gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
		var modeName = $( 'select.modeName' ).val();
		var modePlayers = $( 'select.modePlayers' ).val();
		var qdPlayers = $( 'select.yourGroup' ).val();
		var rankS = $( 'select.rank' ).val();
		var platform = $( 'select.platform' ).val();
		var region = $( 'select.region' ).val();
		var automatic;
		if ( $('input[type=checkbox][name=auto]').is(':checked') ) {
			automatic = true;
		} else {
			automatic = false;
		}
		var data = {};
		var valid = true;
		if(qdPlayers) data.qdPlayers = parseInt(qdPlayers); else valid = false;
		if(modePlayers) data.modePlayers = parseInt(modePlayers); else valid = false;
		if(gameName) data.game = gameName; else valid = false;
		if(modeName) data.modeName = modeName; else valid = false;
		if(rankS) data.rankS = rankS; else valid = false;
		if(platform) data.platform = platform; else valid = false;
		if(region) data.region = region; else valid = false;
		if (valid) {
			$.ajax({
			type: 'POST',
			data: {data: data, automatic: automatic},
			url: '/new-ad',
			success:  function(json) {
				generateAlert('alert-info','Your ad was added successfully.');
			},
			statusCode: {
				400: function() {
					generateAlert('alert-danger','<a href=\"/profile\">You need to add game info to Your profile!</a>');
				},
				401: function() {
					generateAlert('alert-danger','You need to login to preform this activity.');
				},
				406: function() {
					generateAlert('alert-danger','You can\'t add another ad.');
				}

			}
			});
		} else {
			$('select').each(function(index, obj) {
				if ($(this).val() == null) {
					$(this).toggleClass('red-border', true);
				}
			});
		}
	});
});


function generateUserPick(logId, userId,nick,group,active) {
	if (active) {
		$('.picked-users').append('<div id=\"'+logId+'\" class=\"col-sm-12 col-xs-12 picked-user\">'+
			'<div class=\"col-sm-5 col-xs-5\"><a href=\"/profile/'+userId+'\">'+nick+'</a></div>'+
			'<div class=\"col-sm-5 col-xs-5\">Group: '+group+'</div>'+
			'<button class=\"col-sm-1 col-xs-1 btn btn-warning btn-xs glyphicon glyphicon-remove\"></button>'+
		'</div>');
	} else {
		$('.picked-users').append('<div id=\"'+logId+'\" class=\"col-sm-12 col-xs-12 picked-user grayscale\">'+
			'<div class=\"col-sm-5 col-xs-5\"><a href=\"/profile/'+userId+'\">'+nick+'</a></div>'+
			'<div class=\"col-sm-5 col-xs-5\">Group: '+group+'</div>'+
			'<button class=\"col-sm-1 col-xs-1 btn btn-warning btn-xs glyphicon glyphicon-remove\"></button>'+
		'</div>');
		$('#'+logId).toggleClass('grayscale',true);
	}
}

function generateUserAds(init) {
	$('.loader').show();
	$('span.no-ads').hide();
	var data = {};
	
	var gameName = $( 'select.game' ).val();
	if(gameName) gameName = gameName.replace(/([A-Z])/g, ' $1').trim();
	var modeName = $( 'select.modeName' ).val();
	var modePlayers = $( 'select.modePlayers' ).val();
	var qdPlayers = $( 'select.yourGroup' ).val();
	var rankS = $( 'select.rank' ).val();
	var platform = $( 'select.platform' ).val();
	var region = $( 'select.region' ).val();
	var offset = 0;
	if(!init) offset = $('div.user-ad-outer').not('div.user-ad-outer.grayscale').length;
	var hidden = 0;
	if(!init) hidden = $('div.user-ad-outer.hidden').not('div.user-ad-outer.grayscale').length;
	var limit = 24 - ((offset-hidden) % 24);
	offest = offset - hidden;

	if(qdPlayers) qdPlayers = parseInt(qdPlayers);
	if(modePlayers) data.modePlayers = parseInt(modePlayers) ;
	if(gameName) data.game = gameName;
	if(modeName) data.modeName = modeName;
	
	if(rankS) data.rankS = rankS.replace(/([A-Z])/g, ' $1').trim();
	if(platform) data.platform = platform;
	if(region) data.region = region;
	$.ajax({
	type: 'POST',
	data: {data: data, limit: limit, offset: offset, qdPlayers: qdPlayers},
	url: '/logs',
	success:  function(json) {
		if(json.result) {
			if(init) $('div.content-area').empty();
			for (var i = 0; i < json.log.length; i++) {
				appendUserAd(json.log[i]);  
			}
			$('.loader').hide();
			RefreshSomeEventListener();
		} else {
			if(init) $('div.content-area').empty();
			$('.loader').hide();
			$('span.no-ads').show();
		}
		if (init) updatePicks(false);
	}
	});
}

function appendUserAd(ad) {
	$('div.content-area').append(
		'<div id=\"'+ad._id+'\"class=\"user-ad-outer col-md-3 col-sm-4 col-xs-12 \">'+
			'<div class="user-ad-inner panel panel-primary col-md-12 text-center\">'+
				'<a class="nick panel-heading\" href=\"/profile/'+ad.userId+'\">'+ad.userName+'</a>'+
				'<div class=\"user-info\">'+
					'<img src=\"/img/'+ad.game.replace(/\s/g, '')+'.png\" alt=\"'+ad.game+'\" class=\"img-circle game-logo\"><br>'+
					'<div class=\"user-data panel-body\">'+
						'<table width=\"100%\" class=\" table-striped\"><tbody>'+
							'<tr><td class=\"text-center\">Mode</td> <td class=\"text-center\"><kbd>'+ad.modeName+'</kbd></td></tr>'+
							'<tr><td>Maximum group</td> <td class=\"text-center\"><kbd>'+ad.modePlayers+'</kbd></td></tr>'+
							'<tr><td>Rank</td> <td class=\"text-center\"><kbd>'+ad.rankS.replace(/([A-Z])/g, ' $1').trim()+'</kbd></td></tr>'+
							'<tr><td>Size of group</td> <td class=\"text-center\"><kbd>'+ad.qdPlayers+'</kbd></td></tr>'+
							'<tr><td>Platform</td> <td class=\"text-center\"><kbd>'+ad.platform+'</kbd></td></tr>'+
							'<tr><td>Region</td> <td class=\"text-center\"><kbd>'+ad.region+'</kbd></td></tr>'+
						'</tbody></table>'+
					'</div>'+
				'</div>'+
			'</div>'+
			'<div class="add-ad">'+
				'<button class="add btn btn-primary btn-md">+</button>'+
			'</div>'+
		'</div>'
	);
}

function prependUserAd(ad) {
	$('div.content-area').prepend(
		'<div id=\"'+ad._id+'\"class=\"hidden user-ad-outer col-md-3 col-sm-4 col-xs-12 \">'+
			'<div class="user-ad-inner panel panel-primary col-md-12 text-center\">'+
				'<a class="nick panel-heading\" href=\"/profile/'+ad.userId+'\">'+ad.userName+'</a>'+
				'<div class=\"user-info\">'+
					'<img src=\"/img/'+ad.game.replace(/\s/g, '')+'.png\" alt=\"'+ad.game+'\" class=\"img-circle game-logo\"><br>'+
					'<div class=\"user-data panel-body\">'+
						'<table width=\"100%\" class=\" table-striped\"><tbody>'+
							'<tr><td>Mode</td> <td class=\"text-center\"><kbd>'+ad.modeName+'</kbd></td></tr>'+
							'<tr><td>Maximum group</td> <td class=\"text-center\"><kbd>'+ad.modePlayers+'</kbd></td></tr>'+
							'<tr><td>Rank</td> <td class=\"text-center\"><kbd>'+ad.rankS.replace(/([A-Z])/g, ' $1').trim()+'</kbd></td></tr>'+
							'<tr><td>Size of group</td> <td class=\"text-center\"><kbd>'+ad.qdPlayers+'</kbd></td></tr>'+
							'<tr><td>Platform</td> <td class=\"text-center\"><kbd>'+ad.platform+'</kbd></td></tr>'+
							'<tr><td>Region</td> <td class=\"text-center\"><kbd>'+ad.region+'</kbd></td></tr>'+
						'</tbody></table>'+
					'</div>'+
				'</div>'+
			'</div>'+
			'<div class="add-ad">'+
				'<button class="add btn btn-primary btn-md">+</button>'+
			'</div>'+
		'</div>'
	);
}


function sortNumber(a,b) {
	return a - b;
}


function RefreshSomeEventListener() {
	$('button.add').off();
	$('.picked-user > button').off();
	$('div.user-info').off();

	$('button.add').on('click', function(){
		var selVal =[];
		$(this).parent().siblings('div.user-ad-inner').find('kbd').each(function(index, obj)
		{
			selVal.push($(this).text());
		});
		if (selVal[2] != null) selVal[2] = selVal[2].replace(/\s/g, '');
		var gameName = $(this).parent().siblings('div.user-ad-inner').find('img').attr('alt');
		gameName = gameName.replace(/\s/g, '');

		var nick = $(this).parent().siblings('div.user-ad-inner').find('a.nick').text();
		var userId = $(this).parent().siblings('div.user-ad-inner').find('a.nick').attr('href');
		userId = userId.split('/');
		userId = userId[userId.length-1];
		var actualGroup = selVal[3];

		var valid = true;
		
		var group = JSON.parse(sessionStorage.getItem('group'));
		if(group === null) {
			group = 0;
			if($('select.yourGroup').val() !== null) group = $('select.yourGroup').val();
		}

		var id = JSON.parse(sessionStorage.getItem('id'));
		if(id == null) id = [];
		
		if ( id.includes($(this).parents('.user-ad-outer').attr('id'))) valid = false;
		if (sessionStorage.getItem('gameName') != null && sessionStorage.getItem('gameName') != gameName) valid = false;
		if (sessionStorage.getItem('modeName') != null && sessionStorage.getItem('modeName') != selVal[0]) valid = false;
		if (sessionStorage.getItem('modePlayers') != null && sessionStorage.getItem('modePlayers') != selVal[1]) valid = false;
		if (sessionStorage.getItem('rank') != null && sessionStorage.getItem('rank') != selVal[2]) valid = false;
		if (sessionStorage.getItem('platform') != null && sessionStorage.getItem('platform') != selVal[4]) valid = false;
		if (sessionStorage.getItem('region') != null && sessionStorage.getItem('region') != selVal[5]) valid = false;
		
		if(id.length == 0) valid = true;
		if (valid) {
			id.push($(this).parents('.user-ad-outer').attr('id'));
			sessionStorage.setItem('id', JSON.stringify(id));
			group = parseInt(group) + parseInt(actualGroup);
			sessionStorage.setItem('group', JSON.stringify(group));
			
			sessionStorage.setItem('gameName',gameName);
			sessionStorage.setItem('modeName',selVal[0]);
			sessionStorage.setItem('modePlayers',selVal[1]);
			sessionStorage.setItem('rank',selVal[2]);
			sessionStorage.setItem('platform',selVal[4]);
			sessionStorage.setItem('region',selVal[5]);
			
			
			if ($('.picked-user').length == 0) { 
				updatePicks(true);  
			}
			updateGroup();
			generateUserPick(id,userId,nick,actualGroup,true);
			recreatePicks();
			RefreshSomeEventListener();
		}
	});

	$('.picked-user > button').on('click', function(){
		var actualId = $(this).parent().attr('id');
		var id = JSON.parse(sessionStorage.getItem('id'));
		var index = id.indexOf(actualId);
		id.splice(index,1);
		sessionStorage.setItem('id', JSON.stringify(id));
		var sub = parseInt($(this).prev().text().replace( /^\D+/g, ''));
		var group = JSON.parse(sessionStorage.getItem('group'));
		if (!$(this).parents('picked-user').hasClass('grayscale')) group = group - sub;
		sessionStorage.setItem('group',group);
		updateGroup();
		$(this).parent().remove();
		if ($('.picked-user').length == 0) { 
			clearPicksData();
			updatePicks(false);
		}
	});

	$('div.user-info, .add').on('mouseover', function() {
		var onAd = $(this).parents('.user-ad-outer');
		var id = JSON.parse(sessionStorage.getItem('id'));
		var valid = true;
		if(!(id == null || id.length == 0)) {
			var selVal =[];
			$(this).parents('div.user-ad-outer').find('kbd').each(function(index, obj) {
				selVal.push($(this).text());
			});
			if (selVal[2] != null) selVal[2] = selVal[2].replace(/\s/g, '');
			var gameName = $(this).parents('div.user-ad-outer').find('img').attr('alt');
			gameName = gameName.replace(/\s/g, '');
			if (sessionStorage.getItem('gameName') != null && sessionStorage.getItem('gameName') != gameName) valid = false;
			if (sessionStorage.getItem('modeName') != null && sessionStorage.getItem('modeName') != selVal[0]) valid = false;
			if (sessionStorage.getItem('modePlayers') != null && sessionStorage.getItem('modePlayers') != selVal[1]) valid = false;
			if (sessionStorage.getItem('rank') != null && sessionStorage.getItem('rank') != selVal[2]) valid = false;
			if (sessionStorage.getItem('platform') != null && sessionStorage.getItem('platform') != selVal[4]) valid = false;
			if (sessionStorage.getItem('region') != null && sessionStorage.getItem('region') != selVal[5]) valid = false;
			if (!valid) {
				onAd.children('.user-ad-inner').toggleClass('panel-danger', true);
				onAd.children('.user-ad-inner').toggleClass('panel-primary', false);

				onAd.find('div.add-ad > button.add.btn').toggleClass('btn-danger', true);
				onAd.find('div.add-ad > button.add.btn').toggleClass('btn-primary', false);
			}
		}
	});

	$('div.user-info, .add').on('mouseout', function() {;
		var onAd = $(this).parents('.user-ad-outer');
		onAd.children('.user-ad-inner').toggleClass('panel-danger', false);
		onAd.children('.user-ad-inner').toggleClass('panel-primary', true);
	});
}

function clearPicksData() {
	sessionStorage.removeItem('gameName');
	sessionStorage.removeItem('modeName');
	sessionStorage.removeItem('modePlayers');
	sessionStorage.removeItem('rank');
	sessionStorage.removeItem('platform');
	sessionStorage.removeItem('region');
	sessionStorage.setItem('init',true);
}

function updatePicks(init) {
	var gameName = sessionStorage.getItem('gameName');
	var modeName = sessionStorage.getItem('modeName');
	var modePlayers = sessionStorage.getItem('modePlayers');
	var qdPlayers = $( 'select.yourGroup' ).val();
	var rank = sessionStorage.getItem('rank');
	var platform = sessionStorage.getItem('platform');
	var region = sessionStorage.getItem('region');
	if(gameName != null) $('th.gameName').text(gameName.replace(/([A-Z])/g, ' $1').trim());
	$('th.modeName').text(modeName);
	$('th.modePlayers').text(modePlayers);
	if(rank !=null) $('th.rank').text(rank.replace(/([A-Z])/g, ' $1').trim());
	$('th.platform').text(platform);
	$('th.region').text(region);

	var yourGroup = sessionStorage.getItem('yourGroup');
	if (yourGroup == null) {
		$('select.yourGroup').val(1);
		yourGroup = 1;
	} else {
		yourGroup = parseInt(yourGroup);
	}
	sessionStorage.setItem('yourGroup',yourGroup);
	
	if (init) {
		sessionStorage.setItem('init',true);

		if(JSON.parse(sessionStorage.getItem('id')) == null) sessionStorage.setItem('id',JSON.stringify([]));
		if(sessionStorage.getItem('gameName')!= null) $('select.game').val(sessionStorage.getItem('gameName')).change();
	}

	updateGroup();
	if(init) {
		recreatePicks();
	}

	
}

function recreatePicks() {
	var id = JSON.parse(sessionStorage.getItem('id'));
	if (id != null) {
		$.ajax({
		type: 'POST',
		url: '/picks',
		data: {id: id},
		success:  function(json) { 
			$('.picked-users').empty();
			var sumPlayers = 0;
			for (var i = 0; i < json.length; i++) {
				generateUserPick(json[i]._id, json[i].userId,json[i].userName,json[i].qdPlayers, json[i].active);
				sumPlayers += json[i].qdPlayers;
			}
			sessionStorage.setItem('group', sumPlayers);
			RefreshSomeEventListener();
		}});      
	}
}

function updateGroup() {
	var group = JSON.parse(sessionStorage.getItem('group'));
	var yourGroup = parseInt(sessionStorage.getItem('yourGroup'));
	var temp_group;
	var modePlayers;
	var modeName = sessionStorage.getItem('modeName');
	if (group != null) {
		if (yourGroup != null) {
			temp_group = group+yourGroup; 
		} else {
			temp_group = group;
		}
	} else {
		if (yourGroup != null) {
			temp_group = yourGroup; 
		} else {
			temp_group = '?';
		}
	}

	if (sessionStorage.getItem('modePlayers') != null) {
	   modePlayers = parseInt(sessionStorage.getItem('modePlayers'));
	} else {
		modePlayers = '?';
	}
	
	$('span.group').text(temp_group+'/'+modePlayers);
	
}

function refreshSession() {
	var id = JSON.parse(sessionStorage.getItem('id'));
	if(id.length == 0  ) {
		if($('select.game').val() != null) sessionStorage.setItem('gameName',$('select.game').val());
		if($('select.modeName').val() != null) sessionStorage.setItem('modeName',$('select.modeName').val());
		if($('select.modePlayers').val() != null) sessionStorage.setItem('modePlayers',$('select.modePlayers').val());
		if($('select.rank').val() != null) sessionStorage.setItem('rank',$('select.rank').val());
		if($('select.platform').val() != null) sessionStorage.setItem('platform',$('select.platform').val());
		if($('select.region').val() != null) sessionStorage.setItem('region',$('select.region').val());
	}
}


function generateAlert(alertType, message) {
	$('.alert').remove();
	$('.container').prepend('<div class=\"alert '+alertType+' col-md-6 col-md-offset-3 text-center\">'+message+
		'<span class="close glyphicon glyphicon-remove"></span></div>');
	$('span.close').off();
	$('span.close').on('click', function(){
		$(this).parent().remove();
	});
}