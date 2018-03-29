<template>
  <v-icon small :class="'c-'+type">{{iconName}}</v-icon>
</template>

<script>
let typeToIcon = {
  text: 'description',
  photo: 'camera_alt',
  quote: 'format_quote',
  link: 'link',
  chat: 'chat',
  audio: 'audiotrack',
  answer: 'question_answer'
}

export default {
  props: {
    type: String
  },
  computed: {
    iconName: function() {
      return typeToIcon[this.type];
    }
  }
}
</script>
