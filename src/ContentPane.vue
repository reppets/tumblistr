<template>
	<div class="pane">
		<div class="v-scroll list-pane" v-handled-element:list @scroll="triggerLoad" v-resize="triggerLoad">
			  <div class="wrapper">
					<ul class="list">
						<li v-for="(post,index) in posts" :key="post.id"  @click="select(index)" :class="{'selected': index===selected}">
							<div :class="['cell', {'elevation-2': index!==selected, 'elevation-8': index===selected}]">
								<div v-if="post.type==='text'">{{post.summary}}</div>
								<img v-else-if="post.type==='photo'" :src="thumbnailUrl(post.photos[0])">
								<div v-else-if="post.type==='quote'">{{post.summary}}</div>
								<div v-else-if="post.type==='link'"><TypeIcon :type="post.type" />{{post.summary}}</div>
								<div v-else-if="post.type==='chat'"><TypeIcon :type="post.type" />{{post.summary}}</div>
								<div v-else-if="post.type==='audio'"><TypeIcon :type="post.type" />{{post.summary}}</div>
								<div v-else-if="post.type==='video'" class="thumbnail">
									<img :src="post.thumbnail_url" :class="{portrait: post.thumbnail_width < post.thumbnail_height, landscape:post.thumbnail_width >= post.thumbnail_height}">
								</div>
								<div v-else-if="post.type==='answer'"><TypeIcon :type="post.type" />{{post.summary}}</div>
								<div v-if="post.type==='video'" class="cell-overlay"><TypeIcon :type="post.type" /></div>
							</div>
						</li>
					</ul>
				</div>
		</div>
		<div class="splitter"></div>
		<div class="detail"><slot name="detail"></slot></div>
	</div>
</template>

<script>
import TypeIcon from "./TypeIcon.vue";
import {Context} from "./context";
import {last} from "./utils"

export default {
  components: {
    TypeIcon
  },
  props: {
    args: Object
  },
  data: function() {
    return {
      offset: null,
      posts: [],
			selected: null,
			loading: false,
			offset: 0,
			noOlderPost: false
    };
  },
  mounted: function() {
    this.triggerLoad();
  },
  methods: {
		triggerLoad: function() {
			let el = this.domElements.list;
			if (el.scrollTop + el.clientHeight + 40 < el.scrollHeight || this.loading) {
				return;
			}
			this.loading = true;
			this.load();
		},
    thumbnailUrl: function(photo) {
      return photo.alt_sizes[photo.alt_sizes.length-1].url;
    },
    select: function(index) {
      this.selected = index;
    }
  }
  
}
</script>


<style lang="scss" scoped>
.pane {
	display: flex;
	flex-direction: row;
	align-items: stretch;
	max-height: 100%;
	height: 100%;
}
.list-pane {
	flex: 1 1 auto;
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
	flex: 1 1 auto;
}

.wrapper {
  width: 100%;
  overflow-y: auto;
}
.list {
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

