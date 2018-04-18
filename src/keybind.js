import {Context} from "./context";

const NEXT_POST = 'right';
const PREV_POST = 'left';
const SHOW_OPENER = 'o';


export default function bindKeys() {
	let keyListener = new window.keypress.Listener();
	Context.keyListener = keyListener;

	keyListener.register_combo({
		keys: NEXT_POST,
		on_keydown: function() {
			Context.eventBus.$emit('select-next');
			return true;
		}
	});

	keyListener.register_combo({
		keys: PREV_POST,
		on_keydown: function() {
			Context.eventBus.$emit('select-prev');
			return true;
		}
	});
	
	keyListener.register_combo({
		keys: SHOW_OPENER,
		on_keyup: function () {
			Context.eventBus.$emit('show-tab-opener');
			return true;
		},
	})

};