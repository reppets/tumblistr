<template>
    <div class="grey darken-3 account-pane">
        <v-btn flat icon color="white"><v-icon>settings</v-icon></v-btn>
        <v-btn flat icon color="white">
            <v-avatar size="28px" class="grey darken-3" v-if="userData"><img :src="avatarUrl"></v-avatar>
        </v-btn>
    </div>
</template>

<script>
import {Context} from './context.js';

export default {
    
    props: {
        userData: Object
    },
    computed: {
        avatarUrl: function() {
            return this.userData ? Context.client.getAvatarURL(this.userData.name + '.tumblr.com', 40) : '';
        }
    }
}
</script>


<style lang="scss">
.account-pane {
    height: 48px;
}
</style>
