<template>
	<v-layout column style="height: 100%">
		<v-card flat tile class="detail-content">
			<div class="main-content">
				<template v-if="post">
					<div v-if="post.type==='text'" class="text-content">
						<h1 v-if="post.title != null" v-text="post.title" />
						<div v-html="post.body" />
					</div>
					<img v-if="post.type==='photo'" v-show-on-load="post.photos[post.selectedPhotoIndex].original_size.url">
					<div v-if="post.type==='quote'" class="text-content">
						<blockquote v-html="post.text"></blockquote>
						<div class="source" v-html="post.source"></div>
					</div>
					<div v-if="post.type==='link'" class="text-content">
						<a :href="post.url" target="_blank">
							<v-card hover>
								<v-card-title>{{post.title}}</v-card-title>
								<v-card-media v-if="post.photos" :src="post.photos[0].original_size.url" height="200"/>
								<v-card-text>
									<div>{{post.excerpt}}</div>
									<div>{{post.link_author}} / {{post.publisher}}</div>
								</v-card-text>
							</v-card>
						</a>
						<div v-if="post.description != null && post.description !== ''" v-html="post.description">
						</div>
					</div>
					<div v-else-if="post.type==='chat'" class="text-content">
						<h1 v-if="post.title != null && post.title !== ''" v-text="post.title" />
						<p v-for="(dialog,index) in post.dialogue" :key="index"><span class="chat-name" v-text="dialog.label" />{{dialog.phrase}}</p>
					</div>
					<div v-else-if="post.type==='audio'" class="audio-content">
						<div class="album-art">
							<img v-show-on-load="post.album_art">
						</div>
						<div class="player">
							<audio controls :src="post.audio_url"/><!-- error(404 etc) handling -->
						</div>
					</div>
					<template v-else-if="post.type==='video'">
						<video v-if="post.video_type==='tumblr'" :src="post.video_url" controls muted />
						<div class="embed" v-if="post.video_type==='youtube'" v-html="post.player[post.player.length-1].embed_code" />
						<div class="embed" v-if="post.video_type==='vimeo'" v-html="post.player[post.player.length-1].embed_code" />
						<div class="embed" v-if="post.video_type==='dailymotion'" v-html="post.player[post.player.length-1].embed_code" />
						<div class="flickr--embed" v-if="post.video_type==='flickr'" v-html="post.player[post.player.length-1].embed_code" />
						<div class="flickr--embed" v-if="post.video_type==='instagram' && instagram()" v-html="post.player[post.player.length-1].embed_code" />
						<div class="embed" v-if="post.video_type==='vine'" v-html="post.player[post.player.length-1].embed_code" />
						<!-- flickr, instagram, vine -->
					</template>
					<div v-else-if="post.type==='answer'" class="text-content">
						<a v-if="post.asking_url" :href="post.asking_url"><p v-text="post.asking_name"/></a>
						<p v-else v-html="post.asking_name" />
						<blockquote v-html="post.question" />
						<blockquote v-html="post.answer" />							
					</div>

				</template>
			</div>
			<div class="sub-content" v-if="post && post.type==='photo' && post.photos.length > 1" @wheel="subcontentScroll">
				<img v-for="(photo, index) in post.photos" :key="index + photo.original_size.url" v-show-on-load="photo.alt_sizes[photo.alt_sizes.length-2].url" @click="selectPhoto({tab:tab, postIndex:postIndex, photoIndex: index})" :class="{selected: post.selectedPhotoIndex===index}">
			</div>
			<div class="detail-content-overlay">
				<v-icon v-show="post && post.reblogging" class="c-reblog animation-rotate">repeat</v-icon>
				<v-icon v-show="post && post.liking" class="c-like animation-pulse">favorite</v-icon>
			</div>
		</v-card>
		<div class="detail-metadata">
			<v-expansion-panel v-if="post">
				<v-expansion-panel-content>
					<div slot="header" style="position: relative; margin-right: 0.5em;" @click.stop>
						<img :src="avatarUrl({blogID:post.blog_name, size:16})" class="inline-icon">
						{{post.blog_name}}
						<v-tooltip top>
							<v-btn slot="activator" small icon style="margin: 0;" @click="openBlog(post.blog_name)"><v-icon small color="primary">tab</v-icon></v-btn>
							<span>open this blog in a tab</span>
						</v-tooltip>
						<span style="font-size: smaller;">({{post.date}})</span>
						<v-tooltip top>
							<v-btn slot="activator" small icon style="margin: 0;" target="_blank" :href="post.post_url"><v-icon small color="primary">open_in_new</v-icon></v-btn>
							<span>open this post in browser</span>
						</v-tooltip>
						<span style="position: absolute; right: 0;">
							<v-tooltip top>
								<v-btn slot="activator" small icon style="margin: 0;" @click="reblog(post)"><v-icon small :class="{'c-reblog':post.reblogged, bold: true}">repeat</v-icon></v-btn>
								<span>click to reblog</span>
							</v-tooltip>
							<v-tooltip top>
								<v-btn slot="activator" small icon style="margin: 0;" @click="like(post)"><v-icon small  :class="{'c-like':post.liked}">favorite</v-icon></v-btn>
								<span>click to {{post.liked ? 'un': ''}}like</span>
							</v-tooltip>
						</span>
					</div>
					<div class="metadata-body">
						<span class="matadata-label"><v-icon>label</v-icon></span>
						<span v-show="post.tags.length === 0">no tag.</span>
						<span><v-chip small v-for="tag in post.tags" :key="tag" @click.stop="openBlog(post.blog_name,tag)">{{tag}}</v-chip></span>
					</div>
					<div class="metadata-body" v-if="post.caption != null && post.caption !== ''">
						<span class="matadata-label"><v-icon>subject</v-icon></span>
						<span v-html="post.caption"></span>
					</div>
					<div class="metadata-body" v-if="post.source_url != null">
						<span class="matadata-label"><v-icon>public</v-icon></span>
						<a :href="post.source_url" target="_blank">{{post.source_title}}</a>
					</div>
				</v-expansion-panel-content>
			</v-expansion-panel>
		</div>
	</v-layout>
</template>

<script>
import TypeIcon from "./TypeIcon.vue";
import {last, Intermitter} from "./utils";
import {Mutation, Action} from "./store.js";

export default {
	components: {
		TypeIcon
	},
	props: {
		post: Object,
		postIndex: Number
	},
	computed: Object.assign(
		{},
		Vuex.mapGetters([
			'avatarUrl'
		])
	),
  methods: Object.assign(
		{
			thumbnailUrl: function(photo) {
				return photo.alt_sizes[photo.alt_sizes.length-1].url;
			},
			openBlog: function(blogName, tag) {
				this.$store.commit(Mutation.OPEN_DIALOG, {name: 'blog', blogName: blogName, tag: tag});
			},
			reblog: function(post) {
				this.$store.dispatch(Action.REBLOG, {blogID: this.$store.state.currentAccount.reblogTarget.name, post: post});
			},
			like: function(post) {
				this.$store.dispatch(Action.LIKE, {post: post});
			},
			subcontentScroll: function(event) {
				if (event.deltaY > 2) {
					this.subcontentNextIntermitter.trigger();
				} else if (event.deltaY < -2) {
					this.subcontentPrevIntermitter.trigger();
				}
			},
			instagram: function() {
				this.$nextTick(function() {
					window.eval('instgrm.Embeds.process()');
				});
				return true;
			}
		},
		Vuex.mapMutations([
			Mutation.SELECT_PHOTO
		])
	),
	created: function() {
		this.subcontentNextIntermitter = new Intermitter(() => {
			this.$store.commit(Mutation.SELECT_NEXT_PHOTO);
		}, 100);
		this.subcontentPrevIntermitter = new Intermitter(() => {
			this.$store.commit(Mutation.SELECT_PREVIOUS_PHOTO);
		}, 100);
	}
}
</script>

