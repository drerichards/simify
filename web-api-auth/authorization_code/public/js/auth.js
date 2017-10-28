{
    /**
     @return Object
     */
    const getHashParams = () => {
        let hashParams = {};
        let e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        window.history.pushState("Simify", "Title", "/")
        return hashParams;
    }
    
    const params = getHashParams();
    const access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {
            // render oauth info
                console.log({access_token: access_token,
                refresh_token: refresh_token
            });

            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: (response) => {
                    $('.loginModal').hide();
                    $('.bodyContainer').fadeIn();
                    $('#userID').html(response.id)
                }
            });
        } else {
            // render initial screen
            $('.loginModal').fadeIn();
            $('.bodyContainer').fadeOut();
        }

        // document.getElementById('obtain-new-token').addEventListener('click', function () {
        //     $.ajax({
        //         url: '/refresh_token',
        //         data: {
        //             'refresh_token': refresh_token
        //         }
        //     }).done(function (data) {
        //         access_token = data.access_token;
        //         console.log({
        //             access_token: access_token,
        //             refresh_token: refresh_token
        //         });
        //     });
        // }, false);
    }
}

