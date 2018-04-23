<script>
import ContentPane from "./ContentPane.vue";
import {last} from "./utils";
import { LOAD_BLOG } from './store';

export default {
	extends: ContentPane,
  methods: {
		load: function() {
			this.$store.dispatch(LOAD_BLOG, this.tab);
		}
  }
}
</script>
