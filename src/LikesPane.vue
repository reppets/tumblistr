<script>
import ContentPane from "./ContentPane.vue";
import {last} from "./utils";
import { LOAD_LIKES } from './store';

export default {
	extends: ContentPane,
  methods: {
		load: function() {
			this.$store.dispatch(LOAD_LIKES, this.tab);
		}
  }
}
</script>
