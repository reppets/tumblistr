import Layout from './Layout.vue';
import { isValidCallback, setTokenToOpener, tokenObserver } from './token.js';
import { splitParameter } from './utils.js';
import { Saved } from './savedvalues.js';
import { store } from './store.js';
import bindKeys from './keybind';

const TOKEN_OBSERVER_ID = '#tokenObserver';

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

	Vue.directive('handled-element',{
		bind: function(el, binding, vnode) {
			if (!vnode.context.domElements) vnode.context.domElements = {};
			vnode.context.domElements[binding.arg] = el;
		}
	});

	Vue.directive('show-on-load', {
		// hides an element when the src value is changed until it completes loading.
		// intended to add to img elements.
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

	bindKeys(store);
	
	let vm = new Vue({
		el: '#root',
		store,
		template: '<Layout />',
		components: { Layout },
	});

}) ();