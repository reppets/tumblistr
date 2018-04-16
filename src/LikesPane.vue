<script>
import ContentPane from "./ContentPane.vue";
import {Context} from "./context";
import {last} from "./utils";

export default {
	extends: ContentPane,
  methods: {
		load: function() {
			Context.client.getUserLikes({
				before: this.posts.length>0 ? last(this.posts).liked_timestamp : null,
				onload: (response) => {
					let posts = response.response.response.liked_posts;
					posts.forEach(p => this.posts.push(p));
					this.noOlderPost = posts.length === 0;
					this.loading = false;
					this.$nextTick(()=> this.triggerLoad());
				}
			});
		}
  }
}
</script>
