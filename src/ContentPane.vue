<template>
	<div class="pane">
		<div class="v-scroll list"><slot name="list"></slot></div>
		<div class="splitter"></div>
		<div class="detail"><slot name="detail"></slot></div>
	</div>
</template>

<script>
export default {

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
.list {
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
</style>

