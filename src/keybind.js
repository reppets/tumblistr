import {SET_VUETIFY_TAB_INDEX, SELECT_NEXT_POST, SELECT_PREVIOUS_POST, Mode} from './store';

const NEXT_POST = 'right';
const PREV_POST = 'left';
const SHOW_OPENER = 'o';


export default function bindKeys(store) {
	let keyListener = new window.keypress.Listener();

	keyListener.register_combo({
		keys: NEXT_POST,
		on_keydown: function() {
			if (store.state.mode === Mode.INPUT) {
				return true;
			} else {
				store.commit(SELECT_NEXT_POST);
			}
		}
	});

	keyListener.register_combo({
		keys: PREV_POST,
		on_keydown: function() {
			if (store.state.mode === Mode.INPUT) {
				return true;
			} else {
				store.commit(SELECT_PREVIOUS_POST);
			}
		}
	});
	
	keyListener.register_combo({
		keys: SHOW_OPENER,
		on_keyup: function () {
			store.commit(SET_VUETIFY_TAB_INDEX, "0");
			return true;
		},
	})

};