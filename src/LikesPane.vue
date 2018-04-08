<script>
import ContentPane from "./ContentPane.vue";
import {Context} from "./context";
import {last} from "./utils";

export default {
	extends: ContentPane,
  methods: {
		load: function() {
			Context.client.getUserLikes({offset: this.offset, reblog_info: false, notes_info: false},{onload: (response) => {
				let posts = response.response.response.liked_posts;
				posts.forEach(p => this.posts.push(p));
				this.offset+=posts.length;
				this.noOlderPost = olderPosts.length === 0;
				this.loading = false;
				this.$nextTick(()=> this.triggerLoad());
			}});
		}
  }
}
</script>
