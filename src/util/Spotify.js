let accessToken;
const clientID = "ac95adf7115b4030b32176dd1f24e887";
const redirectURL = "http://localhost:3000/";
const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }
    // Check for access token and expiration date
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      // This clears the parameters, allowing us to grab a new access token when it expires
      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
      return accessToken;
    } else {
      const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURL}`;
      window.location = accessURL;
    }
  },
  async search(term, playlistTracks) {
    const accessToken = Spotify.getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=50&q=${term}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const jsonResponse = await response.json();
    if (!jsonResponse.tracks) {
      return [];
    }
    let filteredJSONResponse = jsonResponse.tracks.items.filter((track) => {
      return playlistTracks.every((playlistTrack) => {
        return track.id !== playlistTrack.id;
      });
    });
    console.log(filteredJSONResponse);
    filteredJSONResponse = filteredJSONResponse.splice(0, 20);
    console.log(filteredJSONResponse);
    return filteredJSONResponse.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      uri: track.uri,
    }));
  },

  savePlaylist(name, trackURIs) {
    if (!name || !trackURIs.length) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    let userID;
    return fetch("https://api.spotify.com/v1/me", { headers: headers })
      .then((response) => response.json())
      .then((jsonResponse) => {
        userID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          headers: headers,
          method: "POST",
          body: JSON.stringify({ name: name }),
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            const playlistID = jsonResponse.id;
            return fetch(
              `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
              {
                headers: headers,
                method: "POST",
                body: JSON.stringify({ uris: trackURIs }),
              }
            );
          });
      });
  },
};

export default Spotify;
