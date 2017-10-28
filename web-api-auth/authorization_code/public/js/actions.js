'use strict'
// search for the artist
const ACCESS_TOKEN = 'BQAP0lGEgX61Dhrd4GM6eppKdAkPFi5ckDlOS3riW_cwv5j_kKnbr4q8IgePk24KHoOgudUGV3wou9bHRI7tCGJA4DW0U-Wp33Rplsa1iBbOrJ18MbTwhFY5mNMG7JoYaecmqAKQ4CuIBLKxzMOj7SBzxuUnLYhIxZs3MQ&refresh_token=AQCtR_s_egwYn_RLLPjBpRsrmjoySmprk25G3Oikf_DC0Z83O_9_yrbh2LmQpWMOF6VpKiOOO1EbIbZ-_5Uf-GuXUidk7jRIh__sQkrXqvCSitxUh14CXkkezD25dRNBaK8'
const searchArtist = searchValue => {
  // $('.artistMainPic').remove() //for future searches
  // $('.tracksContainer').css("visibility", "hidden") //hides bottom container
  const searchPromise = Promise.resolve($.ajax({
    url: 'https://api.spotify.com/v1/search',
    headers: {
      'Authorization': 'Bearer ' + ACCESS_TOKEN
    },
    data: {
      q: searchValue,
      type: 'artist',
      limit: 20
    }
  }))
  searchPromise.then(searchResults => {
    for (let index in searchResults.artists.items)
      $('.resultColumns').append('<li><div class="resultsListBar">' + searchResults.artists.items[index].name + '</div></li>')
  }, err => {
    console.log(err)
  })

  $('li').on('click', e => {
    e.preventDefault()
    console.log('h')

    console.log($(this).index())
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