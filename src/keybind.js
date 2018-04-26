import {Mutation, Action, Mode} from './store';

const NEXT_POST = 'right';
const PREV_POST = 'left';
const NEXT_PHOTO = 'shift down';
const PREV_PHOTO = 'shift up';
const QUICK_REBLOG = 'shift r';
const SHOW_OPENER = 'o';


export default function bindKeys(store) {
	let keyListener = new window.keypress.Listener();

	function doIf(modes, func) {
		return function() {
			if (modes.find(e => e === store.state.mode) != null) {
				return func();
			} else {
				return true;
			}
		}
	}

	keyListener.register_combo({
		keys: NEXT_POST,
		on_keydown: doIf([Mode.VIEW], function() {
			store.commit(Mutation.SELECT_NEXT_POST);
		})
	});

	keyListener.register_combo({
		keys: PREV_POST,
		on_keydown: doIf([Mode.VIEW], function() {
			store.commit(Mutation.SELECT_PREVIOUS_POST);
		})
	});

	keyListener.register_combo({
		keys: NEXT_PHOTO,
		on_keydown: doIf([Mode.VIEW], function() {
			store.commit(Mutation.SELECT_NEXT_PHOTO);
		})
	});

	keyListener.register_combo({
		keys: PREV_PHOTO,
		on_keydown: doIf([Mode.VIEW], function() {
			store.commit(Mutation.SELECT_PREVIOUS_PHOTO);
		})
	});

	keyListener.register_combo({
		keys: QUICK_REBLOG,
		on_keydown: doIf([Mode.VIEW], function() {
			const post = store.getters.selectedPost;
			if (post == null) {
				return;
			}
			store.dispatch(Action.REBLOG, {
				blogID: store.state.currentAccount.reblogTarget.name,
				post: post,
			});
		})
	});
	
	keyListener.register_combo({
		keys: SHOW_OPENER,
		on_keyup: doIf([Mode.VIEW], function () {
				store.commit(Mutation.SET_VUETIFY_TAB_INDEX, "0");
		})
	})

};