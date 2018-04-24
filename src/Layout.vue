<template>
  <v-app>
    <v-navigation-drawer app mini-variant dark mini-variant-width="40" style="display: flex; flex-direction: column; align-items: center;">
      <v-menu v-if="currentAccount">
        <v-btn slot="activator" flat icon color="white"><v-avatar v-if="currentAccount" size="28px" class="grey darken-3"><img :src="currentAccount.userInfo.avatarUrl"></v-avatar></v-btn>
        <v-list>
          <v-list-tile avatar>
            <v-list-tile-avatar><img :src="currentAccount.userInfo.avatarUrl"></v-list-tile-avatar>
            <v-list-tile-title>{{currentAccount.userInfo.name}}</v-list-tile-title>
          </v-list-tile>
          <v-divider/>
          <template v-if="accounts.length > 1">
            <v-subheader>Accounts</v-subheader>
            <v-list-tile avatar v-for="account in accounts" v-if="!account.current" :key="account.userInfo.name" @click="setCurrentAccount(account)">
              <v-list-tile-avatar size="28"><img :src="account.userInfo.avatarUrl"></v-list-tile-avatar>
              <v-list-tile-title>{{account.userInfo.name}}</v-list-tile-title>
            </v-list-tile>
            <v-divider/>
          </template>
          <v-list-tile key="add-account" @click="authorize">
            <v-list-tile-title><v-icon>add</v-icon>Add Account</v-list-tile-title>
          </v-list-tile>

        </v-list>
      </v-menu>
      <hr style="width: 80%; height:1px; background-color:rgba(255,255,255,0.3); border: 0;" />
      <v-menu v-if="currentAccount">
        <v-btn slot="activator" flat icon color="white"><!-- TODO: border-radius styling -->
          <v-avatar size="28px" tile class="grey darken-3"><img :src="currentAccount.reblogTarget.avatarUrl"  style="border-radius: 20%;"></v-avatar>
          <v-icon small style="position: absolute; bottom: 0; right: 0;font-weight:bold;" class="c-reblog">repeat</v-icon>
        </v-btn>
        <v-list>
          <v-subheader>Reblog to</v-subheader>
          <v-list-tile  v-for="blog in currentAccount.userInfo.blogs" :key="blog.name" @click="setReblogTarget(blog)" avatar>
            <v-list-tile-avatar><img :src="blog.avatarUrl"></v-list-tile-avatar>
            <v-list-tile-title>{{blog.name}}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-navigation-drawer>
    <v-content><v-container fluid fill-height pa-0><v-layout column>
      <div id="header-area" style="max-width:calc(100vw - 40px);">
        <v-tabs id="tab-bar" v-model="activeTab" show-arrows>
          <v-tab v-for="tab in tabs" :key="tab.key">
            <span v-if="tab.type==='dashboard'" class="tab-label">
              <v-icon>home</v-icon>Dashboard<TypeIcon v-if="tab.args.filter" :type="tab.args.filter"/>
            </span>
            <span v-else-if="tab.type==='likes'" class="tab-label">
              <v-icon>favorite</v-icon>Likes
            </span>
            <span v-else-if="tab.type==='blog'" class="tab-label">
              <img :src="avatarUrl({blogID: tab.args.blogName, size:24})" width="24" height="24">{{ tab.args.blogName }}<TypeIcon v-if="tab.args.filter" :type="tab.args.filter"/>
            </span>
          </v-tab>
          <v-tab><v-icon>add</v-icon></v-tab>
        </v-tabs>
        <!--<AccountMenu id="account-menu" :userData="userData"/>-->
      </div>
      <div id="content-area">
        <v-tabs-items v-model="activeTab" class="tab-content">

          <v-tab-item v-for="tab in tabs" :key="tab.key" :transition="false" :reverse-transition="false" style="max-height:100%; height:100%">
            <DashboardPane v-if="tab.type==='dashboard'" :tab="tab"></DashboardPane>
            <LikesPane v-else-if="tab.type==='likes'" :tab="tab"></LikesPane>
            <BlogPane v-else-if="tab.type==='blog'" :tab="tab"></BlogPane>
          </v-tab-item>

          <v-tab-item class="opener-tab v-scroll" :transition="false" :reverse-transition="false">
            <v-card>
              <v-card-title class="title"><v-icon>home</v-icon>Dashboard</v-card-title>
              <v-card-actions><v-layout justify-end align-center>
                <v-flex xs2 mx-1><v-select label="Post Type" v-model="dashboardType" :items="types" dense></v-select></v-flex>
                <v-btn color="primary" @click.stop="openTab({type:'dashboard', args:{filter:dashboardType}})">Open</v-btn>
              </v-layout></v-card-actions>
            </v-card>
            <v-card>
              <v-card-title class="title"><v-icon>favorite</v-icon>Likes</v-card-title>
              <v-card-actions><v-layout justify-end align-center>
                <v-btn color="primary" @click.stop="openTab({type:'likes', args:{}})">Open</v-btn>
              </v-layout></v-card-actions>
            </v-card>
            <v-card>
              <v-card-title class="title"><v-icon>dashboard</v-icon>Blog</v-card-title>
              <v-card-actions><v-layout justify-end align-center>
                <v-flex xs3 mx-1><v-text-field label="Blog Name" v-model="blogName" @focus="setMode('input')" @blur="setMode('view')"></v-text-field></v-flex>
                <v-flex xs2 mx-1><v-select label="Post Type" v-model="blogType" :items="types" dense @focus="setMode('input')" @blur="setMode('view')"></v-select></v-flex>
                <v-flex xs3 mx-1><v-text-field label="Tag Filter" v-model="blogTag" @focus="setMode('input')" @blur="setMode('view')"></v-text-field></v-flex>
                <v-btn color="primary" @click.stop="openTab({type:'blog', args:{blogName: blogName, filter: blogType, tag: blogTag}})">Open</v-btn>
              </v-layout></v-card-actions>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </v-layout></v-container></v-content>

    <v-dialog v-bind:value="lacksConsumerToken" persistent max-width="600px">
      <v-card>
        <v-card-title class="title">Set API Keys</v-card-title>
        <v-card-text>
          <v-text-field label="Consumer Key" v-model="consumerKey" required  @focus="setMode('input')" @blur="setMode('view')" />
          <v-text-field label="Consumer Secret" v-model="consumerSecret" required  @focus="setMode('input')" @blur="setMode('view')" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="setConsumerToken({key: consumerKey, secret: consumerSecret})">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-bind:value="lacksActiveAccount" persistent max-width="600px">
      <v-card>
        <v-card-title class="title">Please authorize the app</v-card-title>
        <v-card-actions>
          <v-layout justify-center>
            <v-btn color="primary" @click="authorize" :loading="authorizing">Authorize</v-btn>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import {Saved} from "./savedvalues.js";
import {SET_VUETIFY_TAB_INDEX, AUTHORIZE, SET_CONSUMER_TOKEN, SET_CURRENT_ACCOUNT, SET_REBLOG_TARGET, OPEN_TAB, SET_MODE, Mode} from "./store.js";
import AccountMenu from "./AccountMenu.vue";
import TypeIcon from "./TypeIcon.vue";
import DashboardPane from "./DashboardPane.vue";
import LikesPane from "./LikesPane.vue";
import BlogPane from "./BlogPane.vue";

export default {
  data() {
    return {
      consumerKey: null,
      consumerSecret: null,
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
  components: {
    AccountMenu, TypeIcon, DashboardPane, LikesPane, BlogPane
  },
  computed: Object.assign(
    {
      activeTab: {
        get: function() {
          return this.$store.state.vuetifyTabIndex;
        },
        set: function(value) {
          this.$store.commit(SET_VUETIFY_TAB_INDEX, value);
        }
      }
    },
    Vuex.mapState([
      'accounts','currentAccount','authorizing','tabs'
    ]),
    Vuex.mapGetters([
      'lacksConsumerToken', 'lacksActiveAccount', 'avatarUrl'
    ]),
  ),
  methods: Object.assign(
    {

    },
    Vuex.mapMutations([
      SET_CONSUMER_TOKEN, SET_CURRENT_ACCOUNT, SET_REBLOG_TARGET, OPEN_TAB, SET_MODE
    ]),
    Vuex.mapActions([
      AUTHORIZE,
    ])
  ),
  watch: {
    lacksActiveAccount: function(newValue) {
      if (newValue) {
        this.$store.commit(SET_MODE, Mode.DIALOG);
      } else {
        this.$store.commit(SET_MODE, Mode.VIEW);
      }
    }
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

.c-reblog {
  color: #56bc8a !important; }
</style>



