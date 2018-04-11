import {Context} from "./context";

const NEXT_POST = 'right';
const PREV_POST = 'left';


export default function bindKeys() {
	let keyListener = new window.keypress.Listener();

	keyListener.register_combo({
		keys: NEXT_POST,
		on_keydown: function() {
			console.log('key next');
			Context.eventBus.$emit('select-next');
		}
	});
	keyListener.register_combo({
		keys: PREV_POST,
		on_keydown: function() {
			Context.eventBus.$emit('select-prev');
		}
	})
};