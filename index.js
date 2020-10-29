$(function () {
    var spotifyCredentials = {
        clientId: "54c64d3722554f518b2894016a8d4ea0",
        clientSecret: "03dc1abbe91a4f8394a4502cf0db1733"
    };
    var danyloUserId = "6lgf6m86c9c7voicbgc9pocc7";
    var playlistId = "5Nif3Ijj8h8NOzYRDYxFHA";
    var destinationPlaylistName = "Sevil VK Music Migration Result Playlist 1";
    var accessToken = null;
    var userId = null;

    main();

    function main() {
        var tracks = getTracks();   

        loginToSpotify().then(response => {
            accessToken = response.access_token;
            userId = response.currentUserId;
            
            return searchForTracks(tracks);
        }).then((response) => {
            var spotifyUris = [];
            for (let index = 0; index < response.length; index++) {
                const element = response[index];

                if (element.searchResult && element.searchResult.tracks.items && element.searchResult.tracks.items.length > 0) {
                    spotifyUris.push(element.searchResult.tracks.items[0].uri);
                } else {
                    console.log(element);
                    debugger;
                }
            }

            return spotifyUris;
        }).then((spotifyUris) => {
            debugger;
            addTracksToPlaylist(spotifyUris);
        });
    }

    function getTracks() {
        var musicRows = $('.audio_row__inner');

        var result = [];
    
        for (let i = 0; i < musicRows.length; i++) {
            const element = $(musicRows[i]); 

            var artists = element.find(".audio_row__performers");
            var fullName = element.find(".audio_row__title_inner").text();
            var mainArtist = artists.find(".artist_link:first").text();

            var mainName = null;
            var bracketsFromIndex = fullName.indexOf("(");
            if (bracketsFromIndex > -1) {
                mainName = fullName.slice(0, bracketsFromIndex).trim();
            }

            result.push({
                fullArtist: artists.text(),
                mainArtist: mainArtist,//fullName === mainArtist ? null : mainArtist,
                fullName: fullName,
                mainName: mainName,
                duration: element.find(".audio_row__duration").text()
            });
        }
        console.log(result);
        return result;
    }

    function loginToSpotify() {
        return new Promise((resolve, reject) => {
            var queryParamsString = $.param({
                client_id: spotifyCredentials.clientId,
                response_type: "code",
                redirect_uri: "http://localhost:1234/login-callback.html",
                state: "wjekfo92",
                scope: "playlist-modify-public"
            });

            window.open(`https://accounts.spotify.com/authorize?${queryParamsString}`);
            window.addEventListener("message", function(event) {
                alert();
                debugger;
                var hash = JSON.parse(event.data);
                if (hash.type == 'access_token_spotify') {
                    $.ajax({
                        url: "https://accounts.spotify.com/api/token",
                        type: "POST",
                        headers: {
                            Authorization: `Basic ${btoa(`${spotifyCredentials.clientId}:${spotifyCredentials.clientSecret}`)}`
                        },
                        data: {
                            grant_type: "authorization_code",
                            code: hash.code,
                            redirect_uri: "http://localhost:1234/login-callback.html"
                        },
                        success: (response) => {              
                            resolve(response);
                        },
                        error: (error) => {
                            console.log("Spotify login error");
                            console.log(error);
                            reject(Error("It broke"));
                        }
                    });
                }
            }, false);
        }).then(response => {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: `https://api.spotify.com/v1/me`,
                    type: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    data: {
                        uris: trackUris
                    },
                    success: (user) => {
                        resolve({
                            access_token: response.access_token,
                            currentUserId: user.id
                        });
                    },
                    error: (error) => {
                        debugger;
                        reject(error);
                    }
                })
            });
        });
    }

    function searchForTracks(tracks) {
        var promises = [];
        var waitForNext = 0;
        var index = 0;
        for (var i = 0; i < tracks.length; i++) {
            if (i > 0 && i % 20 === 0) {
                waitForNext += 3000;
            }

            promises.push(new Promise((resolve, reject) => {
                setTimeout(() => {
                    var currentTrack = tracks[index];
                    var queryParamsString = $.param({
                        q: `${currentTrack.mainArtist} ${currentTrack.mainName || currentTrack.fullName}`,
                        type: "track",
                        limit: 1
                    });
        
                    var query = queryParamsString;
                        $.ajax({
                            url: `https://api.spotify.com/v1/search?${query}`,
                            type: "GET",
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            },
                            success: (response) => {
                                resolve({
                                    searchedTrack: currentTrack,
                                    searchResult: response
                                });
                            },
                            error: (error) => {
                                console.log("Spotify search error");
                                console.log(error);
                                resolve(error);
                            }
                        });
                    index++;
                }, waitForNext);
            }));
        }

        return Promise.all(promises);
    }

    function createPlaylist() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                type: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                data: {
                    uris: trackUris
                },
                success: (response) => {
                    debugger;
                    resolve(response);
                },
                error: (error) => {
                    debugger;
                    reject(error);
                }
            })
        });
    }

    function addTracksToPlaylist(trackUris) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                type: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                data: {
                    uris: trackUris
                },
                success: (response) => {
                    debugger;
                    resolve(response);
                },
                error: (error) => {
                    debugger;
                    reject(error);
                }
            })
        });
    }
});

