'use strict'
// search for the artist
var searchResults = function(searchValue) {
  $('.artistMainPic img').remove(); //for future searches
  $('.tracksContainer').css("visibility", "hidden"); //hides bottom container
  var params = { //minimum params to get a list of results for a searched artist
    q: searchValue,
    type: 'artist',
    limit: 20
  };
  var url = 'https://api.spotify.com/v1/search';
  // show results related to the search value
  $.getJSON(url, params, function(data) {
    $('li').remove();
    // console.log(data);
    var artistObjects = data.artists.items;
    for (var i = 0; i < artistObjects.length; i++) { //list results from search
      var resultItems = artistObjects[i].name;
      $('.resultColumns').append('<li><div class="resultsListBar">' + resultItems + '</div></li>');
    }
    $('li').click(function(event) {
      event.preventDefault();
      var index = $(this).index();
      var artistID = artistObjects[index].id; //takes ID of selected artist to then display similar artists
      var artistName = artistObjects[index].name;
      var simiArtURL = 'https://api.spotify.com/v1/artists/' + artistID + '/related-artists';
      $('li').toggle(600);
      $('.artistMainPic').html('<img src="' + artistObjects[index].images[1].url + '" />');

      displayTrackPlayer(artistObjects, index, artistID); //function that displays the tracks of selected artist

      // get similar artists based on searched artist ID
      $.getJSON(simiArtURL, function(data) {
        // console.log(data);
        var simiArtData = data.artists;
        for (var i = 0; i < simiArtData.length; i++) {
          var simiArtPic = simiArtData[i].images[1].url;
          var simiArtName = simiArtData[i].name;
          $('.thumbnailsList').append('<li><div class="simiBar"><img src="' + simiArtPic + '" /><p>' + simiArtName + ' </p></div></li>');
        }
        $('.resultsTitle').html(simiArtData.length + ' similar artists found for <strong>' + artistName + '</strong>');

        $('.thumbnailsList li').click(function(event) {
          event.preventDefault();
          var index = $(this).index();
          var simiArtID = simiArtData[index].id;

          displayTrackPlayer(simiArtData, index, simiArtID);
        });
      });

      // function shows a list of top ten tracks for clicked artist
      function displayTrackPlayer(dataObjects, index, id) {
        var tracksTitle = $('.tracksTitle');
        //clean up for future search
        $('.tracksContainer').css("visibility", "visible");
        $('.trackList li').remove();
        $('.songPic img').remove();

        var topTracksURL = 'https://api.spotify.com/v1/artists/' + id + '/top-tracks?country=SE'

        // get top tracks of clicked artist
        $.getJSON(topTracksURL, function(data) {
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
          $('.songPic').html('<img src="' + topTrackData[0].album.images[0].url + '" />' + playBtn + pauseBtn);

          // audio controls function
          function playAudio(index) {
            var audio = new Audio(topTrackData[index].preview_url);
            audio.play();

            $('li, .pause').click(function(event) {
              event.preventDefault();
              audio.pause();
            });
            $('.play').click(function(event) {
              event.preventDefault();
              audio.play();
            });

            $('.searchButton, .thumbnailsList').click(function(event) {
              event.preventDefault();
              //stops audio. should not stop audio if search field is empty
              audio.pause();
              audio.currentTime = 0;
            });
          }

          $('.trackList li').click(function(event) {
            event.preventDefault();
            var index = $(this).index();
            $('.songPic img').remove();
            $('.songPic').html('<img src="' + topTrackData[index].album.images[0].url + '" />' + playBtn + pauseBtn);
            //plays audio of selected track
            playAudio(index); //<--important
          });
          //plays first track audio of searched artist
          playAudio(0);
        });
      }
    });
  });
};

$(document).ready(function() {
  $('.searchButton').on('click', function(event) {

    if ($('.artistName').val().length > 0) {
      event.preventDefault();
      var searchValue = $('.artistName').val();

      searchResults(searchValue);
      $('.artistName').val('');
    }
  });
});
