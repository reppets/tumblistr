<template>
  <div id="app-container">
      <div id="header-area">
        <v-tabs id="tab-bar" dark color="grey darken-3" slider-color="grey" v-model="activeTab">
            <v-tab><v-icon>add</v-icon></v-tab>
        </v-tabs>
        <AccountMenu id="account-menu" />
      </div>
      <div id="content-area">
        <v-tabs-items v-model="activeTab" class="tab-content">
            <v-tab-item key="tab-1" class="opener-tab v-scroll">
                <v-card color="primary">
                    <v-card-title class="title">Dashboard</v-card-title>
                    <v-card-actions>
                        <v-flex xs4><v-select label="Post Type" xs1></v-select></v-flex>
                        <v-btn>Open</v-btn>
                    </v-card-actions>
                </v-card>
                <v-card>
                    <v-card-title class="indigo darken white--text title">Dashboard</v-card-title>
                    <v-card-actions>
                        post type filter : <v-select></v-select>
                        <v-btn>Open</v-btn>
                    </v-card-actions>
                </v-card>
            </v-tab-item>
        </v-tabs-items>
      </div>
  </div>
</template>

<script>
import AccountMenu from './AccountMenu.vue';

export default {
  data () {
      return {
          activeTab: "0"
      }
  },
  components: {
      AccountMenu
  }
}
</script>

<style lang="scss">
body, html {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 0;
    padding: 0;
}

#app-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
}

#header-area {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 100%;
    flex: 0 0 auto;
}

#content-area {
    display: flex;
    flex: 1 0 0;
}

#tab-bar {
    flex: 1 1 0;
    overflow-x: hidden;
}

#account-menu {
    flex: 0 0 auto;
}

.tab-content {
    width: 100%;
    height: 100%;
}

.v-scroll {
    overflow-y: auto;
    max-height: 100%;
}

.v-flex {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.opener-tab {
    padding: 10px;
    .card {
        width: 75%;
        max-width: 800px;
        min-width: 320px;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 1em;
    }
}
</style>



