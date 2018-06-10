<template>
	<div class="v-scroll-force list-pane" v-handled-element:list @scroll="triggerLoad" v-resize="triggerLoad">
		<div class="wrapper">
			<ul class="list-area">
				<PostCell v-for="(post,index) in tab.posts" :key="post.id" @select="select(post, index)" :post="post"></PostCell>
				<li class="loading" v-if="tab.loading">
					<div>
						<v-progress-circular :size="60" :width="5" indeterminate color="grey"/>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import PostCell from "./PostCell.vue";
import {Mutation} from "./store.js";

export default {
  props: {
		tab: Object,
	},
	components: {
		PostCell
	},
  mounted: function() {
    this.triggerLoad();
	},
	updated: function() {
		this.$nextTick(function() {
			this.triggerLoad();
		});
	},
	watch: {
		'tab.selected': function(newValue) {
			if (newValue) {
				this.triggerLoad();
			}
		}
	},
	methods: {
		select: function(post, index) {
			this.$store.commit(Mutation.SELECT_POST, {tab:this.tab, post: post, index: index})
		},
		triggerLoad: function() {
			const el = this.domElements.list;
			if (!this.tab.selected || el.scrollTop + el.clientHeight * 2 < el.scrollHeight || this.tab.loading || this.tab.noOlderPost) {
				return;
			}
			this.$emit('load-request');
		},
	}

}
</script>

<style lang="scss">
	.list-area .loading > div {
		width:  75px;
		height: 75px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
