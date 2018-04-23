<script>
import ContentPane from "./ContentPane.vue";
import {LOAD_DASHBOARD} from "./store";
import {last} from "./utils";

export default {
	extends: ContentPane,
  methods: {
		load: function() {
			this.$store.dispatch(LOAD_DASHBOARD, this.tab);
		}
  }
}
</script>
