import Layout from './Layout.vue';
import { isValidCallback, setTokenToOpener, tokenObserver } from './token.js';
import { splitParameter } from './utils.js';
import { Context } from './context.js';
import { Stored } from './stored.js';

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
		data.props.authorizing = true;
		Context.client.getRequestToken(CALLBACK_URL, {
			onload: function (response) {
				if (response.status === 200) {
					let params = splitParameter(response.responseText);
					new MutationObserver(tokenObserver(params.oauth_token, params.oauth_token_secret, Context.client, function (token, secret) {
						Stored.userToken = { token: token, secret: secret };
						Context.client.setToken(token, secret);
						data.props.authStage = 'user-token-set';
						data.props.authorizing = false;
						fetchUserData();
					})).observe(document.querySelector(TOKEN_OBSERVER_ID), { childList: true });
					window.open(Context.client.getAuthorizeURL(params.oauth_token), '_blank');
				} else if (response.status === 401) {
					Stored.consumerToken = null;
					data.props.authStage = 'consumer-token-unset';
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
			authStage: 'consumer-token-unset',
			authorizing: false,
			userData: null,
			tabs: []
		}
	}

	if (consumerToken) {
		if (userToken) {
			data.props.authStage = 'user-token-set';
			Context.client = new Tumblr(consumerToken.token, consumerToken.secret);
			Context.client.setToken(userToken.token, userToken.secret);
			fetchUserData();
		} else {
			data.props.authStage = 'user-token-unset';
			Context.client = new Tumblr(consumerToken.token, consumerToken.secret);
		}
	}

	// Global Event Listeners ----------------------------------------------------------------------------
	Context.eventBus = new Vue();
	let keyListener = new window.keypress.Listener();
	keyListener.register_combo({
		keys: 'o',
		on_keyup: function () {
			console.log('o pushed');
			Context.eventBus.$emit('show-tab-opener');
		}
	})

	Context.eventBus.$on('forget-account', function () {
		Stored.userToken = null;
		data.props.userData = null;
		data.props.authStage = 'user-token-unset';
	});

	Context.eventBus.$on('set-consumer-token', function (token) {
		Stored.consumerToken = { token: token.consumerToken, secret: token.consumerSecret };
		data.props.authStage = 'consumer-token-set';
		Context.client = new Tumblr(token.consumerToken, token.consumerSecret);
		this.authorize();
	});

	Context.eventBus.$on('authorize', function () {
		authorize();
	});

	Vue.directive('handled-element',{
		bind: function(el, binding, vnode) {
			console.log(binding.arg);
			console.log(vnode.context);
			if (!vnode.context.domElements) vnode.context.domElements = {};
			vnode.context.domElements[binding.arg] = el;
		}
	});

	Vue.directive('show-on-load', {
		bind: function(el, binding) {
				el.src = binding.value;
		},
		update: function(el, binding, vnode, oldVnode) {
				if (binding.value === binding.oldValue) {
						return;
				}
				let src = binding.value;
				el.style.display = 'none';
				el.onload = (ev) => {
						el.style.display="";
				}
				el.src = src;
			}
	});

let vm = new Vue({
	el: '#root',
	template: '<Layout v-bind="props" v-on:update="update"/>',
	components: { Layout },
	data: data,
	methods: {
		update: function (type, value) {
			if (type = "consumerTokenSet") {
				Stored.consumerToken = { token: value.consumerToken, secret: value.consumerSecret };
				this.props.authStage = 'consumer-token-set';
				Context.client = new Tumblr(value.consumerToken, value.consumerSecret);
				this.authorize();
			}
		},
		authorize: authorize
	}
});


}) ();