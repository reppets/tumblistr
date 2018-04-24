<script>
import ContentPane from "./ContentPane.vue";
import {Action} from "./store";
import {last} from "./utils";

export default {
	extends: ContentPane,
  methods: {
		load: function() {
			this.$store.dispatch(Action.LOAD_DASHBOARD, this.tab);
		}
  }
}
</script>
