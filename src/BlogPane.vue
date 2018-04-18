<script>
import ContentPane from "./ContentPane.vue";
import {Context} from "./context";
import {last} from "./utils";

export default {
	extends: ContentPane,
  methods: {
		load: function() {
			if (this.noOlderPost) {
				return;
			}
			Context.client.getPosts({
				blogID: this.args.blogName,
				type: this.args.filter,
				offset: this.offset,
				tag: this.args.tag,
				reblog_info: false,
				notes_info: false,
				onload: (response) => {
					let olderPosts = response.response.response.posts;
					let postsToAdd = olderPosts.filter(p => this.posts.length > 0 ? p.id < last(this.posts).id : true);
					postsToAdd.forEach(p => this.posts.push(p));
					this.offset+=(olderPosts.length-postsToAdd.length)+olderPosts.length;
					this.noOlderPost = postsToAdd.length === 0;
					this.loading = false;
					if (!this.noOlderPost) {
						this.$nextTick(()=> this.triggerLoad());
					}
				}
			});
		}
  }
}
</script>
