<template>
  <v-app><v-content><v-container fluid fill-height pa-0><v-layout column>
    <div id="header-area">
      <v-tabs id="tab-bar" dark color="grey darken-3" slider-color="grey" v-model="activeTab">
        <v-tab><v-icon>add</v-icon></v-tab>
      </v-tabs>
      <AccountMenu id="account-menu" />
    </div>
    <div id="content-area">
      <v-tabs-items v-model="activeTab" class="tab-content">
        <v-tab-item key="tab-1" class="opener-tab v-scroll">
          <v-card>
            <v-card-title class="title"><v-icon>home</v-icon>Dashboard</v-card-title>
            <v-card-actions><v-layout justify-end align-center>
              <v-flex xs2 mx-1><v-select label="Post Type"></v-select></v-flex>
              <v-btn color="primary">Open</v-btn>
            </v-layout></v-card-actions>
          </v-card>
          <v-card>
            <v-card-title class="title"><v-icon>home</v-icon>Dashboard</v-card-title>
            <v-card-actions><v-layout justify-end align-center>
              <v-btn color="primary">Open</v-btn>
            </v-layout></v-card-actions>
          </v-card>
          <v-card>
            <v-card-title class="title">Blog</v-card-title>
            <v-card-actions><v-layout justify-end align-center>
              <v-flex xs3 mx-1><v-text-field label="Blog Name"></v-text-field></v-flex>
              <v-flex xs2 mx-1><v-select label="Post Type"></v-select></v-flex>
              <v-flex xs3 mx-1><v-text-field label="Tag Filter"></v-text-field></v-flex>
              <v-btn color="primary">Open</v-btn>
            </v-layout></v-card-actions>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>

  </v-layout></v-container></v-content></v-app>
</template>

<script>
import AccountMenu from "./AccountMenu.vue";

export default {
  data() {
    return {
      activeTab: "0"
    };
  },
  components: {
    AccountMenu
  }
};
</script>

<style lang="scss">
body,
html {
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



