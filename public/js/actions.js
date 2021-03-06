'use strict'
const searchArtist = searchValue => {
  $('.searchSpan').css('visibility', 'hidden')
  $('.tracksContainer').css('visibility', 'hidden')
  $('.songTitle').html('')
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
    $('.resultList').show()
    let artistObject = searchResults.artists.items
    for (let i = 0; i < artistObject.length; i++) {
      $('.resultColumns').append(`<li id="${i}"><div class="resultsListBar">${artistObject[i].name}</div></li>`)
    }

    $('.resultColumns li').on('click', e => {
      e.preventDefault()
      let index = e.currentTarget.id,
        artistID = artistObject[index].id,
        artistName = artistObject[index].name
      $('.resultList').css('display', 'none')
      $('.searchSpan').css('visibility', 'visible')
      $('.tracksContainer').css('visibility', 'visible')
      $('.artistMainPic').html(`<div class="picFormat" style="background-image: url(${artistObject[index].images[1].url})"></div>`)
      endpointPromises(artistID, artistName)
    })
  }, err => {
    console.log(err)
  })
}

const endpointPromises = (id, name) => {
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
    showSimilarArtists(artistResults.artists, name)
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
    showTopTracks(tracksResults.tracks, name)
  }, err => {
    console.log(err)
  })
}

const showSimilarArtists = (results, artistName) => {
  $('.thumbnailsList li').remove()
  let id, name, image
  for (let i = 0; i < results.length; i++) {
    if (results[i].images.length > 0) {
      id = results[i].id
      name = results[i].name
      image = results[i].images[1].url
      $('.thumbnailsList').append(`<li id="${id}" class="${name}"><div class="artistBox picFormat" style="background-image: url('${image}');"><p class="nameBox">${name}</p></div></li>`)
    }
    $('.resultsTitle').html(`${results.length} similar artists found for <strong>${artistName}</strong>`)
  }
  $('.thumbnailsList li').on('click', e => {
    e.preventDefault()
    let id = e.currentTarget.id, index = $(e.currentTarget).index(), name = $(e.currentTarget).attr('class')
    endpointPromises(id, name)
    $('.artistMainPic').html(`<div class="picFormat" style="background-image: url(${results[index].images[1].url})"></div>`)
    $('.songTitle').html('')
  })
}

const showTopTracks = (results, artistName) => {
  $('.tracksContainer').css('visibility', 'visible')
  $('.tracksTitle').html(`Top ${results.length} Tracks for: ${artistName}`)
  $('.trackList li').remove()
  for (let i = 0; i < results.length; i++) {
    $('.trackList').append(`<li><div class="songBar">${results[i].name}</div></li>`)
  }
  showTrackPlayer(results)
}

const showTrackPlayer = tracks => {
  const playBtn = ('<input class="play" type="image" src="images/play.png" />')
  const pauseBtn = ('<input class="pause" type="image" src="images/pause.png" />')
  $('.songPic').html(`<div class="picFormat" style="background-image: url('${tracks[0].album.images[0].url}')">${playBtn} ${pauseBtn}</div>`)
  $('.trackList li').on('click', e => {
    e.preventDefault()
    let index = $(e.currentTarget).index(),
      songTitle = $(e.target).text()
    $('.songPic').html(`<div class="picFormat" style="background-image: url('${tracks[index].album.images[0].url}')">${playBtn} ${pauseBtn}</div>`)
    playAudio(tracks, index, songTitle)
  })
}

const playAudio = (tracks, index, songTitle) => {
  let audio = new Audio(tracks[index].preview_url)
  try {
    if (tracks[index].preview_url == null) throw 'Track Not Available'
    audio.play()
    $('.songTitle').html(`Now Playing: ${songTitle}`)
  } catch (err) {
    $('.bodyContainer').append(`<div id="snackbar">${err}</div>`)
    const snackbar = document.getElementById('snackbar')
    snackbar.className = "show"
    setTimeout(() => {
      snackbar.className = snackbar.className.replace('show', "")
      snackbar.remove()
    }, 3000)
  }

  $('li, .pause').click(e => {
    e.preventDefault()
    audio.pause()
  })
  $('.play').click(e => {
    console.log('play')
    e.preventDefault()
    audio.play()
  })

  $('.searchButton, .thumbnailsList').click(e => {
    e.preventDefault()
    audio.pause()
    audio.currentTime = 0
  })
}

const eventDelActions = () => {
  $('.bodyContainer').on('click', '.dropDown', '.trackList', () => {
    $('.dropDown').toggleClass('open')
    $('.arrowImg').toggleClass('rotate')
    $('.songPic').toggleClass('opacity')
    $('.trackDisplay').animate({
      height: 'toggle'
    })
  })

  $('.bodyContainer').on('click', '.trackList', () => {
    $('.arrowImg').toggleClass('rotate')
    $('.songPic').toggleClass('opacity')
    $('.trackDisplay').animate({
      height: 'toggle'
    })
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
  eventDelActions()
}