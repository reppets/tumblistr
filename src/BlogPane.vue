<script>
import ContentPane from "./ContentPane.vue";
import {last} from "./utils";
import { Action } from './store';

export default {
	extends: ContentPane,
  methods: {
		load: function() {
			this.$store.dispatch(Action.LOAD_BLOG, this.tab);
		}
  }
}
</script>
