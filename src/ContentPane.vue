<template>
	<div class="pane">
		<div class="detail">
			<div class="main-content">
				<template v-if="tab.selectedPost">
					<div v-if="tab.selectedPost.type==='text' && tab.selectedPost.format==='html'" class="elevation-2 text-content" v-html="tab.selectedPost.body"></div><!--TODO show title if present -->
					<img v-if="tab.selectedPost.type==='photo'" v-show-on-load="tab.selectedPost.photos[tab.selectedPost.selectedPhotoIndex].original_size.url">
					<div v-if="tab.selectedPost.type==='quote' && tab.selectedPost.format==='html'" class="elevation-2 text-content">
						<blockquote v-html="tab.selectedPost.text"></blockquote>
						<div class="source" v-html="tab.selectedPost.source"></div>
					</div>
					<div v-if="tab.selectedPost.type==='link' && tab.selectedPost.format==='html'" class="elevation-2 text-content">
						<a :href="tab.selectedPost.url" target="_blank">{{tab.selectedPost.title}}</a>
					</div>
					<div v-else-if="tab.selectedPost.type==='chat' && tab.selectedPost.format==='html'" class="elevation-2 text-content" v-html="tab.selectedPost.body"></div><!--TODO show title if present -->
					<div v-else-if="tab.selectedPost.type==='audio'" class="elevation-2" v-html="tab.selectedPost.embed"></div>
					<div v-else-if="tab.selectedPost.type==='video'" class="elevation-2" v-html="tab.selectedPost.player[tab.selectedPost.player.length-1].embed_code"></div>
				</template>
			</div>
			<div class="sub-content" v-if="tab.selectedPost && tab.selectedPost.type==='photo' && tab.selectedPost.photos.length > 1">
				<img v-for="(photo, index) in tab.selectedPost.photos" :key="index + photo.original_size.url" v-show-on-load="photo.alt_sizes[photo.alt_sizes.length-2].url" @click="selectPhoto({tab:tab, postIndex:tab.selectedIndex, photoIndex: index})" :class="{selected: tab.selectedPost.selectedPhotoIndex===index}">
			</div>
		</div>
		<div class="splitter"></div>
		<div class="v-scroll list-pane" v-handled-element:list @scroll="triggerLoad" v-resize="triggerLoad">
			  <div class="wrapper">
					<ul class="list-area">
						<PostCell v-for="(post,index) in tab.posts" :key="post.id" @select="select(post, index)" :post="post"></PostCell>
					</ul>
				</div>
		</div>
	</div>
</template>

<script>
import TypeIcon from "./TypeIcon.vue";
import PostCell from "./PostCell.vue";
import {last} from "./utils"
import {SELECT_POST, SELECT_PHOTO} from "./store.js";

export default {
  components: {
    TypeIcon, PostCell
  },
  props: {
		tab: Object,
	},
  mounted: function() {
    this.triggerLoad();
	},
	updated: function() {
		this.$nextTick(function() {
			this.triggerLoad();
		});
	},
  methods: Object.assign(
		{
			triggerLoad: function() {
				const el = this.domElements.list;
				if (el.scrollTop + el.clientHeight + 80 < el.scrollHeight || this.tab.loading || this.tab.noOlderPost) {
					return;
				}
				this.load();
			},
			thumbnailUrl: function(photo) {
				return photo.alt_sizes[photo.alt_sizes.length-1].url;
			},
			select: function(post, index) {
				console.log(post);
				this.$store.commit(SELECT_POST, {tab:this.tab, post: post, index: index})
			}
		},
		Vuex.mapMutations([
			SELECT_PHOTO
		])
	)
}

</script>


<style lang="scss">
.pane {
	display: flex;
	flex-direction: row;
	align-items: stretch;
	max-height: 100%;
	height: 100%;
	width: 100%;
}
.list-pane {
	flex: 1 0 auto;
	height: 100%;
	width: 50%;
	max-width: 50%;
	max-height: 100%;
	overflow-y: auto;
	padding: 0;
}

.splitter {
	flex: 0 0 auto;
}

.detail {
	display: flex;
	flex-direction: row;
	flex: 1 1 auto;
	height: 100%;
	.main-content {
		flex: 1 1 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 15px;
		> img {
			display: block;
			max-width: 100%;
			max-height: 100%;
			width: auto;
			object-fit: contain;
		}
		> .text-content {
			margin: 10px;
			overflow-y: auto;
			max-width: 100%;
			max-height: 100%;
			iframe {
				display: block;
			}
		}
	}
	.sub-content {
		flex: 0 1 auto;
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: flex-start;
		align-items: center;
		height: 100%;
		padding-top: 15px;
		padding-bottom: 15px;
		img {
			flex: 0 1 auto;
			object-fit: contain;
			min-width: 15px;
			min-height: 15px;
			max-width: 100px;
			margin: 3px 5px 3px 5px;
			filter: drop-shadow(1px 2px 1px rgba(0,0,0,0.16)) drop-shadow(3px 2px 3px rgba(0,0,0,0.1));
			&.selected {
				margin: 3px 20px 3px -10px;
			}
		}
	}
}

.wrapper {
  width: 100%;
  overflow-y: auto;
}
.list-area {
  width: 100%;
  max-width: 100%;
  line-height: 0;
  padding: 8px;
}
.cell {
  width: 75px;
  height: 75px;
  overflow: hidden;
  position: relative;
  div {
    line-height: 1;
    font-size: xx-small;
    word-break: break-all;
    i {
      vertical-align: bottom;
    }
  }
}

li {
  display: inline-block;
  margin: 0;
  padding: 5px;
  vertical-align: top;
  &.selected {
    padding-top: 0px;
    padding-left: 0px;
    padding-bottom: 10px;
    padding-right: 10px;
  }
}

.cell-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  background-color: rgba(255,255,255,0.6
  );
}
.thumbnail {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  height: 75px;
  width: 75px;
  img {
    flex: 0 0 auto;
  }
}
.portrait {
  width: 75px;
  height: auto;
}
.landscape {
  height: 75px;
  width: auto;
}
</style>

