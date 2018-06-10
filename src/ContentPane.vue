<template>
	<div class="pane">
		<PostDetail :post="tab.selectedPost" :postIndex="tab.selectedIndex" />
		<div class="splitter"></div>
		<PostList :tab="tab" @load-request="load"/>
	</div>
</template>

<script>
import PostList from "./PostList.vue";
import PostDetail from "./PostDetail.vue";

export default {
  components: {
		PostList,PostDetail
  },
  props: {
		tab: Object,
	}
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
	padding: 0;
}

.splitter {
	flex: 0 0 1px;
	background-color: #CCCCCC;
}

.detail-content {
	display: flex;
	flex-direction: row;
	flex: 1 1 0;
	height: 100%;
	.main-content {
		flex: 1 1 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		p {
			margin: 0;
		}
		> img,video {
			padding: 15px;
			display: block;
			max-width: 100%;
			max-height: 100%;
			width: auto;
			object-fit: contain;
		}
		.embed {
			width: 100%;
			height: 100%;
			overflow: hidden;
			padding: 15px;
			> iframe {
				margin: auto;
				display: block;
				max-width: 100%;
				max-height: 100%;
				width: 100%;
				height: 100%;
				object-fit: contain;
			}
		}
		.flickr--embed {
			max-width: 100%;
			max-height: 100%;
			width: 100%;
			height: 100%;
			overflow: auto;
		}
		> .text-content {
			align-self: flex-start;
			margin: 0;
			overflow-y: auto;
			max-width: 100%;
			width: 100%;
			max-height: 100%;
			padding: 25px;
			blockquote {
				padding-left: 20px;
			}
			iframe {
				display: block;
			}
			img {
				max-width: 100%;
				height: auto;
			}
			.chat-name {
				font-weight: bold;
				margin-right: 1em;
			}
			&.center {
				justify-content: center;
			}
		}
		> .audio-content {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			max-width: 70%;
			max-height: 90%;
			overflow: hidden;
			img {
				display: block;
			}
			.album-art {
				flex: 0 0 auto;
			}
			.player {
				flex: 0 0 auto;
				audio {
					width: 100%;
				}
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
		width: 110px;
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
	.detail-content-overlay {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: none;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0,0,0,0);
		> * {
			margin: auto;
		}
		.icon {
			font-size: 80px;
		}
	}
}

.detail-metadata {
	flex: 0 0 auto;
	border-top: 1px solid #cccccc;
	max-height: 50%;
	p {
		margin: 0;
	}
	.expansion-panel__header {
		padding: 6px 12px;
	}
	.metadata-body {
		border-top: 1px solid #cccccc;
		padding: 6px 12px;
		display: flex;
		align-items: center;
	}
	.matadata-label {
		padding-right: 6px;
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
	user-select: none;
  div {
    line-height: 1;
    font-size: xx-small;
    word-break: break-all;
    i {
      vertical-align: bottom;
    }
  }
}

.list-area li {
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
	pointer-events: none;
	&.type {
		top: 0;
		left: 0;
		padding: 0 2px;
		border-bottom-right-radius: 4px;
		background-color: rgba(255,255,255,0.55);
	}
	&.state {
		bottom: 0;
		right: 0;
		padding: 0 2px;
		border-top-left-radius: 4px;
		background-color: rgba(255,255,255,0.55);
	}
	&.loading {
		top: 0;
		left: 0;
		background-color: transparent;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
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
.inline-icon {
	display: inline-block;
	vertical-align: middle;
}

.bold {
	font-weight: bold;
}

.animation-rotate {
	animation: rotate 0.8s ease-in-out infinite;
}

.animation-pulse {
	animation: pulse 0.8s ease-in-out infinite;
}

@keyframes rotate {
	0% {
		transform: rotate(0);
	}
	100% {
		transform: rotate(360deg);
	}
}

@keyframes pulse {
	0% {
		transform:scale(1.0);
	}
	20% {
		transform:scale(1.15);
	}
	25% {
		transform:scale(1.0);
	}
	45% {
		transform:scale(1.13);
	}
	50% {
		transform: scale(1.0);
	}
	95% {
		transform: scale(0.97);
	}
	100% {
		transform: scale(1.0);
	}
}
</style>

