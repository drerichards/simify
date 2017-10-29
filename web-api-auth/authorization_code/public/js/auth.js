let accessToken, refreshToken
{
    /**
     @return Object
     */
    const getHashParams = () => {
        let hashParams = {}
        let e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1)
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2])
        }
        window.history.pushState("Simify", "Title", "/")
        return hashParams
    }

    const params = getHashParams()
    let access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error


    if (error) {
        alert('There was an error during the authentication')
    } else {
        if (access_token) {
            // render oauth info
            accessToken = access_token,
                refreshToken = refresh_token
            

            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: (response) => {
                    $('.loginModal').hide()
                    $('.bodyContainer').show()
                    $('#userID').html(response.id)
                }
            })
        } else {
            // render initial screen
            $('.loginModal').show()
            $('.bodyContainer').hide()
        }

        setInterval(() => {
            $.ajax({
                url: '/refresh_token',
                data: {
                    'refresh_token': refresh_token
                }
            }).done((data) => {
                access_token = data.access_token
                accessToken = access_token,
                    refreshToken = refresh_token
            })
        }, 60 * 60 * 1000)
    }
}

