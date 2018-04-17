import Layout from './Layout.vue';
import { isValidCallback, setTokenToOpener, tokenObserver } from './token.js';
import { splitParameter } from './utils.js';
import { Context } from './context.js';
import { Stored } from './stored.js';
import bindKeys from './keybind';

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

	// Global Event Listeners ----------------------------------------------------------------------------
	Context.eventBus = new Vue();

	Context.eventBus.$on('forget-account', function () {
		Stored.userToken = null;
		data.props.userData = null;
		data.props.authStage = 'user-token-unset';
	});

	Context.eventBus.$on('reset-store', function() {
		Stored.clear();
	});

	Vue.directive('handled-element',{
		bind: function(el, binding, vnode) {
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

	bindKeys();
	
	let vm = new Vue({
		el: '#root',
		template: '<Layout v-bind="props"/>',
		components: { Layout },
		data: {
			props: {
				consumerToken: null,
				accounts: [],
				currentAccount: null,
				authorizing: false,
				addNewAccount: false
			}
		},
		methods: {
			authorize: function() {
				this.props.authorizing = true;
				Context.client.getRequestToken({
					oauth_callback: CALLBACK_URL,
					onload: (response) => {
						if (response.status === 200) {
							// after obtaining the request token, set the observer and open the authorization page.
							let params = splitParameter(response.responseText);
							new MutationObserver(tokenObserver(params.oauth_token, params.oauth_token_secret, Context.client, this.newAccessToken))
								.observe(document.querySelector(TOKEN_OBSERVER_ID),{ childList: true });
							window.open(Context.client.getAuthorizeURL(params.oauth_token), '_blank');
						} else if (response.status === 401) {
							Stored.consumerToken = null;
							// TODO show error message.
						}
					}
				});
			},
			newAccessToken: function(key, secret) {
				console.log('newAccessToken');
				let token = {key: key, secret: secret};
				Context.client.getUserInfo({
					token: token,
					onload: (response) => {
						console.log('userinfo', response);
						if (response.status === 200) {
							let userInfo = response.response.response.user;
							let existing = this.props.accounts.find(e=>e.userInfo.name === userInfo.name);
							if (existing) {
								existing.token = token;
								existing.userInfo = userInfo;
								if (userInfo.blogs.find(e=>e.name === existing.reblogTarget) == null) {
									existing.reblogTarget = userInfo.blogs.find(e=>e.primary);
								}
							} else {
								console.log('expected');
								let current = this.props.accounts.find(e=>e.current);
								if (current) current.current = false;
								this.props.currentAccount = {
									token: token,
									userInfo: userInfo,
									reblogTarget: userInfo.blogs.find(e=>e.primary),
									current: true
								};
								this.props.accounts.push(this.props.currentAccount);
							}
						} // TODO error handling
						this.props.authorizing = false;
						this.props.addNewAccount = false;
					}
				})
			}
		},
		watch: {
			'props.consumerToken': function(newToken, oldToken) {
				console.log('consumerToken changed', newToken, oldToken);
				Stored.consumerToken = newToken;
				if (newToken==null) {
					// when deleting token
					Context.client = null;
				} else {
					Context.client = new Tumblr(newToken);
				}
				// TODO reset everything
			},
			'props.currentAccount': function(newAccount) {
				console.log('currentAccount changed');
				Context.client.setToken(newAccount.token);
			},
			'props.accounts': {
				handler: function(newAccounts) {
					console.log('accounts changed');
					Stored.accounts = newAccounts;
				},
				deep: true
			}
		},
		beforeCreate: function() {
			let consumerToken = Stored.consumerToken;
			if (consumerToken) {
				Context.client = new Tumblr(consumerToken);
			}
		},
		created: function() {
			console.log('vm created');
			this.props.consumerToken = Stored.consumerToken;
			if (this.props.consumerToken) {
				this.props.accounts = Stored.accounts;
				if (this.props.accounts.length > 0) {
					this.props.currentAccount = this.props.accounts.find(e=>e.current);
				}
			}
		}
	});

	Context.eventBus.$on('set-consumer-token', function (token) {
		vm.$data.props.consumerToken = token;	
	});
	Context.eventBus.$on('authorize', function () {
		vm.authorize();
	});
	Context.eventBus.$on('set-reblog-target', function (blog) {
		vm.$data.props.currentAccount.reblogTarget = blog;
	});
	Context.eventBus.$on('add-new-account', function() {
		vm.$data.props.addNewAccount = true;
	});
	Context.eventBus.$on('select-account', function(account) {
		vm.$data.props.accounts.find(e=>e.current).current = false;
		account.current = true;
		vm.$data.props.currentAccount = account;
	});

}) ();