<script>
import ContentPane from "./ContentPane.vue";
import {Context} from "./context";
import {last} from "./utils";

export default {
	extends: ContentPane,
  methods: {
		load: function() {
			if (this.offset <= 200) {
				Context.client.getUserDashboard({
					offset: this.offset,
					type: this.args.filter,
					tag: this.args.tag,
					reblog_info: false, 
					notes_info: false,
					onload: (response) => {
						let olderPosts = response.response.response.posts;
						console.log(olderPosts);
						let postsToAdd = olderPosts.filter(p => this.posts.length === 0 || p.id < last(this.posts).id);
						postsToAdd.forEach(p => this.posts.push(p));
						this.offset+=(olderPosts.length-postsToAdd.length)+olderPosts.length;
						this.noOlderPost = olderPosts.length === 0;
						this.loading = false;
						this.$nextTick(()=> this.triggerLoad());
					}
				});
			} else {
				this.loadWithSinceId();
			}
		},
		loadWithSinceId: function(sinceId, posts) {
			if (!sinceId) {
				sinceId = last(this.posts).id - Math.round((last(this.posts,101).id - last(this.posts).id) / 5);
			}
			Context.client.getUserDashboard({
				since_id: sinceId,
				type: this.args.filter,
				tag: this.args.tag,
				reblog_info: false,
				notes_info: false,
				onload: (response) => {
					let olderPosts = response.response.response.posts;
					if (last(olderPosts).id >= last(this.posts).id) { // all posts are duplicated.
						if (posts) {
							posts.forEach(e => this.posts.push(e));
							this.loading = false;
							this.$nextTick(()=> this.triggerLoad());
						} else {
							sinceId = last(this.posts).id - (last(this.posts).id - sinceId) * 2;
							this.loadWithSinceId(sinceId);
						}
					} else if (olderPosts[0].id < last(this.posts).id) { // no duplication.
						this.loadWithSinceId(olderPosts[0].id, posts ? olderPosts.concat(posts): olderPosts);
					} else {	// some posts are duplicated
						olderPosts.filter(e => e.id < last(this.posts).id).forEach(e => this.posts.push(e));
						if (posts) {
							posts.forEach(e => this.posts.push(e));
						}
						this.loading = false;
						this.$nextTick(()=> this.triggerLoad());
					}
				}
			});
		}
  }
}
</script>
