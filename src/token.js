import {splitParameter} from './utils.js';
import {Context} from './context.js';

function isValidCallback() {
    return window.location.search.indexOf('oauth_token') > 0 && window.location.search.indexOf('oauth_verifier') > 0 && window.opener;
}

function setTokenToOpener() {
    let search = splitParameter(window.location.search);
    let validPattern = /^\w+$/
    if (!validPattern.test(search.oauth_token)) throw 'invalid oauth_token';
    if (!validPattern.test(search.oauth_verifier)) throw 'invalid oauth_verifier';
    window.eval("window.opener.oauthCallback('" + search.oauth_token + "','" + search.oauth_verifier + "');");
}

function tokenObserver(oauthToken, oauthTokenSecret, client, tokenSetter) {
    return (mut, self) => {
        mut.forEach((mr) => {
            for (var node of mr.addedNodes) {
                if (node.attributes.getNamedItem('name').value === oauthToken) {
                    var oauthVerifier = node.attributes.getNamedItem('value').value;
                    client.getAccessToken({
                        token: {key:oauthToken, secret:oauthTokenSecret},
                        oauth_verifier: oauthVerifier,
                        onload: function (response) {
                            var params = splitParameter(response.responseText);
                            tokenSetter(params.oauth_token, params.oauth_token_secret);
                        }
                    });
                    self.disconnect();
                }
            }
        });
    };
}

export {isValidCallback, setTokenToOpener, tokenObserver};