import Layout from './Layout.vue';
import { isValidCallback, setTokenToOpener, tokenObserver } from './token.js';
import { splitParameter } from './utils.js';
import { Context } from './context.js';
import {Stored} from './stored.js';

const TOKEN_OBSERVER_ID = '#tokenObserver';
const CALLBACK_URL = 'http://reppets.net/tumblistr/dev/tumblistr.html?callback=true';

(function main() {

    if (window.location.search.indexOf('callback') > 0) {
        if (isValidCallback()) {
            setTokenToOpener();
        }
        window.close();
        return;
    }

    // add function to window for callback.
    window.eval('window.oauthCallback=function(token,verifier){document.querySelector("' + TOKEN_OBSERVER_ID + '").insertAdjacentHTML("beforeend", "<input type=\\"hidden\\"name=\\""+token+"\\" value=\\""+verifier+"\\">")}');

    // append stylesheet element
    (function () {
        let font = document.createElement('link');
        font.setAttribute('rel', 'stylesheet');
        font.setAttribute('href', 'https://fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons');
        document.head.appendChild(font);
        let style = document.createElement('link');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('href', 'https://unpkg.com/vuetify/dist/vuetify.min.css');
        document.head.appendChild(style);
    })();

    function authorize() {
        Context.client.getRequestToken(CALLBACK_URL, {
            onload: function (response) {
                if (response.status === 200) {
                    let params = splitParameter(response.responseText);
                    new MutationObserver(tokenObserver(params.oauth_token, params.oauth_token_secret, Context.client, function (token, secret) {
                        Stored.userToken = { token: token, secret: secret };
                        Context.client.setToken(token, secret);
                        data.props.authStage = 2;
                        fetchUserData();
                    })).observe(document.querySelector(TOKEN_OBSERVER_ID), { childList: true });
                    window.open(Context.client.getAuthorizeURL(params.oauth_token), '_blank');
                }
            }
        })
    }

    function fetchUserData() {
        Context.client.getUserInfo({
            onload: function (response) {
                if (response.status === 200) {
                    data.props.userData = response.response.response.user;
                }
            }
        });
    }

    let consumerToken = Stored.consumerToken;
    let userToken = Stored.userToken;
    let data = {
        props: {
            authStage: 0,
            userData: null
        }
    }

    if (consumerToken) {
        if (userToken) {
            data.props.authStage = 2;
            Context.client = new Tumblr(consumerToken.token, consumerToken.secret);
            Context.client.setToken(userToken.token, userToken.secret);
            fetchUserData();
        } else {
            data.props.authStage = 1;
            Context.client = new Tumblr(consumerToken.token, consumerToken.secret);
            authorize();
        }
    }

    let vm = new Vue({
        el: '#root',
        template: '<Layout v-bind="props" v-on:update="update"/>',
        components: { Layout },
        data: data,
        methods: {
            update: function (type, value) {
                if (type = "consumerKeySet") {
                    Stored.consumerToken = { token: value.consumerToken, secret: value.consumerSecret };
                    this.props.authStage = 1;
                    this.authorize();
                }
            },
            authorize: authorize
        }
    });


})();