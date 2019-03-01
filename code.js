if (!String.prototype.splice) {
  /**
   * {JSDoc}
   *
   * The splice() method changes the content of a string by removing a range of
   * characters and/or adding new characters.
   *
   * @this {String}
   * @param {number} start Index at which to start changing the string.
   * @param {number} delCount An integer indicating the number of old chars to remove.
   * @param {string} newSubStr The String that is spliced in.
   * @return {string} A new string with the spliced substring.
   */
  String.prototype.splice = function(start, delCount, newSubStr) {
      return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
  };
}

$(document).ready(function () {
  var page = 1;
  if (window.location.hash) {
    page = window.location.hash.substring(2);
  }

  $('.loader').show();
  liststamps(page);

  $(document).on('click', 'a.page', function (e) {
    e.preventDefault();

    var parent = $(this).parent();
    if (!parent.hasClass('disabled')) {
      $('.pagination .active').removeClass("active");
      $(this).parent().addClass("active");
      liststamps($(this).attr('id'));
    }
  });
  $(document).on('click', '.stamp-collapsable', function (e) {
    var $t = $(this);

    var collapsed = $(this).hasClass('collapsed');
    if (!collapsed) {
      var songid = $(this).find('.song-id').attr('id');
      var songtimestamp = $(this).find('.song-timestamp').attr('id');
      var src = '/Music/' + songid + '.mp3';

      if (songtimestamp > 0) {
        src += '#t=' + songtimestamp;
      }

      var html = '<audio controls style="width:100%;margin-bottom:-5px;"><source src="' + src + '" type="audio/mpeg"></audio>';
      $(this).find('#music-iframe-td').html(html);
    } else {
      setTimeout(function () {
        $t.find('#music-iframe-td').html('');
      }, 1000);
    }
  });
  $(document).on('click', '.musicbutton', function (e) {
    e.stopPropagation();
  });
  $(document).on('keypress', '.search-field', function (e) {
    if (e.which == 13) {
      search($('.search-field').val());
    }
  });
  $(document).on('click', '.search-icon', function (e) {
    search($('.search-field').val());
  });
  $(window).scroll(function () {
    if ($(this).scrollTop() > 50) {
      $('#jump-to-top').fadeIn(150);
    } else {
      $('#jump-to-top').fadeOut(150);
    }
    if ($(this).scrollTop() + $(this).height() < $(document).height() - 50) {
      $('#jump-to-bottom').fadeIn(150);
    } else {
      $('#jump-to-bottom').fadeOut(150);
    }
  });
  $('#jump-to-top').click(function () {
    $('#jump-to-top').tooltip();
    $('body,html').animate({ scrollTop: 0 }, 150);
    return false;
  });
  $('#jump-to-bottom').click(function () {
    $('#jump-to-bottom').tooltip();
    $('body,html').animate({ scrollTop: $(document).height() }, 150);
    return false;
  });

  $('#jump-to-top').tooltip();
  $('#jump-to-bottom').tooltip();
});
function resizeIframe(obj) {
  obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}
function search(query) {
  $('.search-message').text('Searching...');
  $('.search-message').fadeIn(500, function () {
    $.ajax({
      type: "GET",
      url: "../server/search.php?query=" + query,
      error: function () {
        $('.search-message').fadeOut(150, function () {
          displaySearchMessage('Something went wrong. Try again later.');
        });
      },
      success: function (data) {
        $('.search-message').fadeOut(150, function () {
          if (data['pages'] == null) {
            displaySearchMessage('Nothing found.');
            return;
          } else {
            setContentAndPages(data);
          }
        });
      }
    });
  });
}
function displaySearchMessage(message) {
  $('.search-message').text(message);
  $('.search-message').fadeIn(function () {
    setTimeout(function () {
      $('.search-message').fadeOut();
    }, 4000);
  });
}
function liststamps(page) {
  window.location.hash = "#/" + page;

  $.ajax({
    type: "GET",
    url: "../server/getstamps.php?page=" + page,
    error: function () {
      $('.content').html('<p class="text-center">Tracks could not be loaded. Try again later.</p>');
    },
    success: function (data) {
      setContentAndPages(data, page);
    }
  }).done(function () {
    $('.loader').hide();
  });
}

function setContentAndPages(data, currentPage) {
  setContent(data['episodes']);
  setPagination(data['pages'], currentPage);
}
function setPagination(pages, currentPage) {
  $('ul.pagination').html('');
  for (var p = 1; p <= pages; p++) {
    $('ul.pagination').append('<li' + (p == currentPage ? ' class="active"' : '') + '><a class="page" id="' + p + '" href="#/' + p + '">' + p + '</a></li>');
  }
}
function resizeIframe(obj) {
  obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}
function pretty(str) {
  var re = /"/g;
  var quotes = (str.match(re) || []);
  var i = 0;
  var match = null;
  for(var i = 0; (match = re.exec(str)) != null; i++) {
    if(i < quotes.length/2) {
      str = str.splice(match.index, 1, '“');
    } else {
      str = str.splice(match.index, 1, '”');
    }
  }
  return str.replace(/'/g, "’").replace(/ (-|–|—|―) /g, "—").replace(/\.{3}/g, "…");
}
function pretty_ja(str) {
  var re = /("|“|”)/g;
  var quotes = (str.match(re) || []);
  var i = 0;
  var match = null;
  for(var i = 0; (match = re.exec(str)) != null; i++) {
    if(i < quotes.length/2) {
      str = str.splice(match.index, 1, '「');
    } else {
      str = str.splice(match.index, 1, '」');
    }
  }
  return str.replace(/'/g, "’").replace(/ (-|–|—|―) /g, "—").replace(/\.{3}/g, "…");
}
function setContent(episodes) {
  var html = '';
  $.each(episodes, function (i, episode) {
    html += '<div class="page-header">';
    html += '<div class="episode-header">';
      html += '<div class="title">Episode ' + episode['episode'] + '</div>';
      html += '<div class="text-muted release">' + episode['release'] + '</div>';
    html += '</div>';
    html += '<span class="text-muted episode-title episode-title-ja">' + pretty_ja(episode['titles']['ja']) + '</span>';
    html += '<span class="text-muted episode-title episode-title-en">' + pretty(episode['titles']['en']) + '</span>';
    html += '</div>';
    html += '<ul class="list-group">';
    $.each(episode['stamps'], function (i, stamp) {
      if (!stamp['song']['titles']['en']) {
        html += '<li class="list-group-item stamp">';
        html += '<div class="stamp-text">' + stamp['time'] + ' - Unreleased</div>';
        html += '</li>';
        return true;
      }

      var datatarget = episode['episode'] + stamp['time'].replace(':', '');
      html += '<li class="list-group-item stamp-collapsable">';
      html += '<input class="song-id" type="hidden" id="' + stamp['song']['id'] + '" />';
      html += '<input class="song-timestamp" type="hidden" id="' + stamp['song']['time_seconds'] + '" />';

      html += '<table style="width: 100%;" data-toggle="collapse" data-target="#' + datatarget + '">';
      html += '<tr>';
      html += '<td><div class="stamp-text-collapsable" unselectable="on">';
      html += stamp['time'] + ' - ' + pretty(stamp['song']['titles']['en']) + (stamp['song']['time_seconds'] > 0 ? ' (' + stamp['song']['time'] + ')' : '') + '</div></td>';
      html += '</tr>';
      html += '</table>';
      html += '<div id="' + datatarget + '" class="collapse"><table class="table">';
      html += '<tr>';
      html += '<td style="padding:0px;" id="music-iframe-td" width="100%" colspan="3"></td>';
      html += '</tr>';
      html += '<tr>';
      html += '<th>Song</th>';
      html += '<td>' + pretty_ja(stamp['song']['titles']['ja']) + '</td>';
      html += '<td>' + pretty(stamp['song']['titles']['en']) + '</td>';
      html += '</tr>';
      html += '<tr>';
      html += '<th>Album</th>';
      html += '<td>' + pretty_ja(stamp['album']['titles']['ja']) + '</td>';
      html += '<td>' + pretty(stamp['album']['titles']['en']) + '</td>';
      html += '</tr>';
      html += '<tr>';
      html += '<th>Track</th>';
      html += '<td colspan="2">#' + stamp['song']['track'] + '</td>';
      html += '</tr>';
      html += '<tr>';
      html += '<th>Released</th>';
      html += '<td colspan="2">' + stamp['album']['release'] + '</td>';
      html += '</tr>';
      html += '</table></div>';
      html += '</li>';
    });

    html += '</ul>';
  });

  $('.content').html(html);
}
