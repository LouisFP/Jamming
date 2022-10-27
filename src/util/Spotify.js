let accessToken;
const clientID = ac95adf7115b4030b32176dd1f24e887;
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
    }
  },
  async search(term) {},
};

export default Spotify;
