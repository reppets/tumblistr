<template>
  <v-app><v-content><v-container fluid fill-height pa-0><v-layout column>
    <div id="header-area" style="max-width:100vw">
      <v-tabs id="tab-bar" v-model="activeTab" show-arrows>
        <v-tab v-for="tab in tabs" :key="tab.key">
          <span v-if="tab.type==='dashboard'" class="tab-label">
            <v-icon>home</v-icon>Dashboard<TypeIcon v-if="tab.args.filter" :type="tab.args.filter"/>
          </span>
          <span v-else-if="tab.type==='likes'" class="tab-label">
            <v-icon>favorite</v-icon>Likes
          </span>
          <span v-else-if="tab.type==='blog'" class="tab-label">
            <img :src="avatarUrl(tab.args.blogName, 24)">{{ tab.args.blogName }}<TypeIcon v-if="tab.args.filter" :type="tab.args.filter"/>
          </span>
        </v-tab>
        <v-tab><v-icon>add</v-icon></v-tab>
      </v-tabs>
      <AccountMenu id="account-menu" :userData="userData"/>
    </div>
    <div id="content-area">
      <v-tabs-items v-model="activeTab" class="tab-content" @input="selectTab">

        <v-tab-item v-for="tab in tabs" :key="tab.key" :transition="false" :reverse-transition="false" style="max-height:100%; height:100%">
          <DashboardPane v-if="tab.type==='dashboard'" :args="tab.args" :active="tab.isActive"></DashboardPane>
          <LikesPane v-else-if="tab.type==='likes'" :active="tab.isActive"></LikesPane>
          <BlogPane v-else-if="tab.type==='blog'" :args="tab.args" :active="tab.isActive"></BlogPane>
        </v-tab-item>

        <v-tab-item class="opener-tab v-scroll" :transition="false" :reverse-transition="false">
          <v-card>
            <v-card-title class="title"><v-icon>home</v-icon>Dashboard</v-card-title>
            <v-card-actions><v-layout justify-end align-center>
              <v-flex xs2 mx-1><v-select label="Post Type" v-model="dashboardType" :items="types" dense></v-select></v-flex>
              <v-btn color="primary" @click.stop="open('dashboard', {filter:dashboardType})">Open</v-btn>
            </v-layout></v-card-actions>
          </v-card>
          <v-card>
            <v-card-title class="title"><v-icon>favorite</v-icon>Likes</v-card-title>
            <v-card-actions><v-layout justify-end align-center>
              <v-btn color="primary" @click.stop="open('likes', {})">Open</v-btn>
            </v-layout></v-card-actions>
          </v-card>
          <v-card>
            <v-card-title class="title"><v-icon>dashboard</v-icon>Blog</v-card-title>
            <v-card-actions><v-layout justify-end align-center>
              <v-flex xs3 mx-1><v-text-field label="Blog Name" v-model="blogName"></v-text-field></v-flex>
              <v-flex xs2 mx-1><v-select label="Post Type" v-model="blogType" :items="types" dense></v-select></v-flex>
              <v-flex xs3 mx-1><v-text-field label="Tag Filter" v-model="blogTag"></v-text-field></v-flex>
              <v-btn color="primary" @click.stop="open('blog', {blogName: blogName, filter: blogType, tag: blogTag})">Open</v-btn>
            </v-layout></v-card-actions>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>

    <v-dialog v-bind:value="authStage === 'consumer-token-unset'" persistent max-width="600px">
      <v-card>
        <v-card-title class="title">Set API Keys</v-card-title>
        <v-card-text>
          <v-text-field label="Consumer Key" v-model="consumerToken" required />
          <v-text-field label="Consumer Secret" v-model="consumerSecret" required />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" :loading="authStage === 'consumer-token-set'" @click="setConsumerToken">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-bind:value="authStage === 'user-token-unset'" persistent max-width="600px">
      <v-card>
        <v-card-title class="title">Please authorize the app</v-card-title>
        <v-card-actions>
          <v-layout justify-center>
            <v-btn color="primary" @click="openAuthPage" :loading="authorizing">Authorize</v-btn>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout></v-container></v-content></v-app>
</template>

<script>
import {Context} from "./context.js";
import AccountMenu from "./AccountMenu.vue";
import TypeIcon from "./TypeIcon.vue";
import DashboardPane from "./DashboardPane.vue";
import LikesPane from "./LikesPane.vue";
import BlogPane from "./BlogPane.vue";

export default {
  data() {
    return {
      activeTab: "0",
      tabs: [],
      consumerToken: null,
      consumerSecret: null,
      validatingKeys: false,
      dashboardType: null,
      blogName: null,
      blogType: null,
      blogTag: null,
      types: [
        {text:'All', value:null}, {text:'Text', value:'text'}, {text:'Photo', value:'photo'}, 
        {text:'Quote', value:'quote'}, {text:'Link', value:'link'}, {text:'Chat', value:'chat'},
        {text: 'Audio', value: 'audio'}, {text:'Video', value:'video'}, {text:'Answer',value:'answer'}]
    };
  },
  props : {
    authStage: String,
    userData: Object,
    authorizing: Boolean
  },
  components: {
    AccountMenu, TypeIcon, DashboardPane, LikesPane, BlogPane
  },
  methods: {
    setConsumerToken: function() {
      Context.eventBus.$emit('set-consumer-token', {consumerToken: this.consumerToken, consumerSecret: this.consumerSecret});
    },
    open: function(type, args) {
      let idx = this.tabs.findIndex(e=>e.key===key(type, args));
      if (idx>=0) {
        this.activeTab = (idx+1).toString();
        return;
      }
      this.tabs.push({
        type: type,
        args: args,
        key: key(type, args),
        isActive: true
      });
      this.activeTab = (this.tabs.length).toString();
    },
    avatarUrl: function(blogName, size) {
      return Context.client.getAvatarURL(blogName+".tumblr.com", size);
    },
    openAuthPage: function() {
      Context.eventBus.$emit('authorize');
    },
    selectTab: function(index) { // type of index is supposed to be a string;
      this.tabs.filter(e=>e.isActive).forEach(e=>e.isActive=false);
      let n = parseInt(index) - 1;
      if (n >= 0) {
        this.tabs[n].isActive = true;
      }
    },
    log: function(print) {
      console.log(print);
    }
  },
  mounted: function() {
    Context.eventBus.$on('show-tab-opener', () => this.activeTab="0");
  }
};

function key(type, args) {
  return [type,args.blogName,args.filter,args.tag].join('-');
}

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
  height: 100%;
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

.tab-label {
  display: inline-flex;
  justify-content:center;
  align-items: center;
}

.c-text {
  color: #565656 !important; }

.c-photo {
  color: #dd6e53 !important; }

.c-quote {
  color: #f3a342 !important; }

.c-link {
  color: #67c395 !important; }

.c-chat {
  color: #63a8d1 !important; }

.c-audio {
  color: #b08ac8 !important; }

.c-video {
  color: #828c95 !important; }

.c-answer {
  color: #774c21 !important; }
</style>



