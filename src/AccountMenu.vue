<template>
	<div class="grey darken-3 account-pane">
    <v-btn flat icon color="white"><v-icon>settings</v-icon></v-btn>
		<v-menu>
			<v-btn slot="activator" flat icon color="white">
      	<v-avatar size="28px" class="grey darken-3" v-if="userData"><img :src="avatarUrl"></v-avatar>
    	</v-btn>
			<v-list>
				<v-list-tile @click="forget">
					<v-list-tile-title>Forget</v-list-tile-title>
				</v-list-tile>
			</v-list>
		</v-menu>
  </div>
</template>

<script>

export default {
    
    props: {
        userData: Object
    },
    computed: {
        avatarUrl: function() {
            return this.userData ? Context.client.getAvatarURL(this.userData.name, 40) : '';
        }
		},
		methods: {
			forget: function() {
				Context.eventBus.$emit('forget-account');
			}
		}
}
</script>


<style lang="scss">
.account-pane {
    height: 48px;
}
</style>
