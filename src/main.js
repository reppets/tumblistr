import Layout from './Layout.vue';
import { isValidCallback, setTokenToOpener, tokenObserver } from './token.js';
import { splitParameter } from './utils.js';
import { Saved } from './savedvalues.js';
import { store } from './store.js';
import bindKeys from './keybind';

const TOKEN_OBSERVER_ID = '#tokenObserver';

function appendStyleSheets() {
	return new Promise(function(resolve, reject) {
		let font = document.createElement('link');
		font.setAttribute('rel', 'stylesheet');
		font.setAttribute('href', 'https://fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons');
		document.head.appendChild(font);
		let style = document.createElement('link');
		style.setAttribute('rel', 'stylesheet');
		style.setAttribute('href', 'https://unpkg.com/vuetify/dist/vuetify.min.css');
		style.onload = function() {
			resolve();
		};
		style.onerror = function(e) {
			reject(e);
		}
		document.head.appendChild(style);

		let vine = document.createElement('script')
		vine.setAttribute('src', 'https://platform.vine.co/static/scripts/embed.js');
		document.head.appendChild(vine);
		let flickr = document.createElement('script')
		flickr.setAttribute('src', 'https://embedr.flickr.com/assets/client-code.js');
		document.head.appendChild(flickr);
		let instagram = document.createElement('script')
		instagram.setAttribute('src', 'https://www.instagram.com/embed.js');
		document.head.appendChild(instagram);

	});
}

appendStyleSheets().then(main, console.log); // TODO handle error

function main() {

	if (window.location.search.indexOf('callback') > 0) {
		if (isValidCallback()) {
			setTokenToOpener();
		}
		window.close();
		return;
	}

	// add function to window for callback.
	window.eval('window.oauthCallback=function(token,verifier){document.querySelector("' + TOKEN_OBSERVER_ID + '").insertAdjacentHTML("beforeend", "<input type=\\"hidden\\"name=\\""+token+"\\" value=\\""+verifier+"\\">")}');

	Vue.directive('handled-element',{
		// make the DOM element with this directive accessible in the vm instance with 'this.domElements[<arg>]'
		// (<arg> is a string appended after the directive and a colon).
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

}