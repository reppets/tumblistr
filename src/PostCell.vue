<template>
	<li :class="itemClass" @click="select">
		<div :class="cellClass" v-scroll-to-me="post.selected">
			<template v-once>
				<div v-if="post.type==='text'"><TypeIcon :type="post.type" />{{post.summary}}</div>
				<img v-else-if="post.type==='photo'" :src="thumbnailUrl">
				<div v-else-if="post.type==='quote'"><TypeIcon :type="post.type" />{{post.summary}}</div>
				<div v-else-if="post.type==='link'"><TypeIcon :type="post.type" />{{post.summary}}</div>
				<div v-else-if="post.type==='chat'"><TypeIcon :type="post.type" />{{post.summary}}</div>
				<div v-else-if="post.type==='audio'"><TypeIcon :type="post.type" />{{post.summary}}</div>
				<div v-else-if="post.type==='video'" class="thumbnail">
					<img :src="post.thumbnail_url" :class="thumbnailClass">
				</div>
				<div v-else-if="post.type==='answer'"><TypeIcon :type="post.type" />{{post.summary}}</div>
				<div v-if="post.type==='video'" class="cell-overlay type"><TypeIcon :type="post.type" />{{post.video_type}}</div>
				<div v-if="post.type==='photo' && post.photos.length > 1" class="cell-overlay type"><v-icon small>collections</v-icon></div>
			</template>
			<div v-if="post.reblogging" class="cell-overlay loading"><v-icon x-large class="c-reblog animation-rotate">repeat</v-icon></div>
			<div v-if="post.liking" class="cell-overlay loading"><v-icon x-large class="c-like animation-pulse">favorite</v-icon></div>
			<div v-if="post.reblogged || post.liked" class="cell-overlay state">
				<v-icon v-if="post.reblogged" small class="c-reblog inline-icon">repeat</v-icon>
				<v-icon v-if="post.liked" small class="c-like inline-icon">favorite</v-icon>
			</div>
		</div>
	</li>
</template>
<script>
import TypeIcon from "./TypeIcon.vue";

export default {
	props: {
		post: Object
	},
	components: {
		TypeIcon
	},
	directives: {
		'scroll-to-me': {
			componentUpdated: function(el, binding) {
				if (!binding.oldValue && binding.value) {
					el.parentNode.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
				}
			}
		}
	},
	computed: {
		thumbnailUrl: function() {
			let photo =this.post.photos[0];
			return photo.alt_sizes[photo.alt_sizes.length-1].url;
		},
		thumbnailClass: function() {
			return this.post.thumbnail_width < this.post.thumbnail_height ? 'portrait' : 'landscape';
		},
		cellClass: function() {
			return ['cell', this.post.selected ? 'elevation-8': 'elevation-2'];
		},
		itemClass: function() {
			return this.post.selected ? 'selected': null;
		}
	},
	methods: {
		select: function(ev) {
			this.$emit('select');
		}
	}
}
</script>
