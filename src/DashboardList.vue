<template>
  <div class="wrapper">
    <ul class="list">
      <li v-for="(post,index) in posts" :key="post.id"  @click="select(index)" :class="{'selected': index===selected}">
        <div :class="['cell', {'elevation-2': index!==selected, 'elevation-8': index===selected}]">
          <img v-if="post.type==='photo'" :src="thumbnailUrl(post.photos[0])">
          <div v-else-if="post.type==='quote'">{{post.text}}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {Context} from "./context"

export default {
  props: {
    type: String
  },
  data: function() {
    return {
      offset: null,
      posts: [],
      selected: null
    };
  },
  mounted: function() {
    let self = this;
    Context.client.getUserDashboard({type: this.type}, {onload: function(response) {
      self.posts = self.posts.concat(response.response.response.posts);
      console.log(self.posts);
    }});
  },
  methods: {
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
.wrapper {
  width: 100%;
  overflow-y: auto;
}
.list {
  width: 100%;
  max-width: 100%;
  line-height: 0;
  padding: 4px;
}
.cell {
  width: 75px;
  height: 75px;
  overflow: hidden;
  div {
    line-height: 1;
    font-size: xx-small;
  }
}

li {
  display: inline-block;
  margin: 0;
  padding: 4px;
  vertical-align: top;
  &.selected {
    padding-top: 0px;
    padding-left: 0px;
    padding-bottom: 8px;
    padding-right: 8px;
  }
}

</style>
