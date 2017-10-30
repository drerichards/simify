'use strict'
// search for the artist
const searchArtist = searchValue => {
  // $('.tracksContainer').css("visibility", "hidden") //hides bottom container
  const searchPromise = Promise.resolve($.ajax({
    url: 'https://api.spotify.com/v1/search',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    data: {
      q: searchValue,
      type: 'artist',
      limit: 20
    }
  }))
  searchPromise.then(searchResults => {
    $('.resultColumns li').remove()
    let artistObject = searchResults.artists.items
    $('.resultList').show()
    for (let i = 0; i < artistObject.length; i++) {
      $('.resultColumns').append(`<li id="${i}"><div class="resultsListBar">${artistObject[i].name}</div></li>`)
    }

    $('.resultColumns li').on('click', e => {
      e.preventDefault()
      let index = e.currentTarget.id,
        artistID = artistObject[index].id,
        artistName = artistObject[index].name
      $('.resultList').css('display', 'none')
      $('.artistMainPic').html(`<div class="picFormat" style="background-image: url(${artistObject[index].images[1].url})"></div>`)
      endpointPromises(artistID)
    })
  }, err => {
    console.log(err)
  })
}

{
  $('.searchButton').on('click', e => {
    if ($('.artistName').val().length > 0) {
      e.preventDefault()
      const searchValue = $('.artistName').val()
      searchArtist(searchValue)
      $('.artistName').val('')
    }
  })
}

const endpointPromises = (id) => {
  const similarArtistPromise = Promise.resolve($.ajax({
    url: `https://api.spotify.com/v1/artists/${id}/related-artists`,
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    data: {
      id: id
    }
  }))
  similarArtistPromise.then(artistResults => {
    showSimilarArtists(artistResults.artists)
  }, err => {
    console.log(err)
  })
  const topTracksPromise = Promise.resolve($.ajax({
    url: `https://api.spotify.com/v1/artists/${id}/top-tracks?country=SE`,
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    data: {
      id: id
    }
  }))
  topTracksPromise.then(tracksResults => {
    // console.log(tracksResults)
  }, err => {
    console.log(err)
  })
}

const showSimilarArtists = results => {
  $('.thumbnailsList li').remove()
  let id, name, image
  for (let i = 0; i < results.length; i++) {
    if (results[i].images.length > 0) {
      id = results[i].id
      name = results[i].name
      image = results[i].images[1].url
      $('.thumbnailsList').append(`<li id="${id}"><div class="artistBox picFormat" style="background-image: url('${image}');"><p class="nameBox">${name}</p></div></li>`)
    }
  }
  $('.thumbnailsList li').on('click', e => {
    e.preventDefault()
    let id = e.currentTarget.id, index = $(e.currentTarget).index()
    endpointPromises(id)
    $('.artistMainPic').html(`<div class="picFormat" style="background-image: url(${results[index].images[1].url})"></div>`)
  })
}

function displayTrackPlayer(dataObjects, index, id) {
  var tracksTitle = $('.tracksTitle');
  //clean up for future search
  $('.tracksContainer').css("visibility", "visible");
  $('.trackList li').remove();
  $('.songPic img').remove();

  var topTracksURL = 'https://api.spotify.com/v1/artists/' + id + '/top-tracks?country=SE'

  // get top tracks of clicked artist
  $.getJSON(topTracksURL, function (data) {
    // console.log(data);
    var topTrackData = data.tracks;
    tracksTitle.val('');
    tracksTitle.html('Top ' + topTrackData.length + ' Tracks for: <font color="#54F01D">' + dataObjects[index].name + '</font>');

    // lists tracks
    for (var i = 0; i < topTrackData.length; i++) {
      var track = topTrackData[i].name;
      $('.trackList').append('<li><div class="songBar">' + track + '</div></li>');
    }
    // adds audio controls to the track's picture
    var playBtn = ('<input class="play" type="image" src="images/play.png" />');
    var pauseBtn = ('<input class="pause" type="image" src="images/pause.png" />');
    $('.songPic').html('<div class="picFormat" style="background-image: url(' + topTrackData[0].album.images[0].url + ');">' + playBtn + pauseBtn + '</div>');

    // audio controls function
    function playAudio(index) {
      var audio = new Audio(topTrackData[index].preview_url);
      audio.play();

      $('li, .pause').click(function (event) {
        event.preventDefault();
        audio.pause();
      });
      $('.play').click(function (event) {
        event.preventDefault();
        audio.play();
      });

      $('.searchButton, .thumbnailsList').click(function (event) {
        event.preventDefault();
        //stops audio. should not stop audio if search field is empty
        audio.pause();
        audio.currentTime = 0;
      });
    }

    $('.trackList li').click(function (event) {
      event.preventDefault();
      var index = $(this).index();
      $('.songPic img').remove();
      $('.songPic').html('<div class="picFormat" style="background-image: url(' + topTrackData[index].album.images[0].url + ');">' + playBtn + pauseBtn + '</div>');
      //plays audio of selected track
      playAudio(index); //<--important
    });
    //plays first track audio of searched artist
    playAudio(0);
  });
}