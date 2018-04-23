import {last, splitParameter} from './utils.js';
import {Saved} from './savedvalues.js';
import { tokenObserver } from './token.js';

export const SET_AUTHORIZING = 'setAuthorizing';
export const SET_CONSUMER_TOKEN = 'setConsumerToken';
export const ADD_ACCOUNT = 'addAccount';
export const SET_CURRENT_ACCOUNT = 'setCurrentAccount';
export const SET_REBLOG_TARGET = 'setReblogTarget';
export const SET_VUETIFY_TAB_INDEX = 'setVuetifyTabIndex';
export const OPEN_TAB = 'openTab';
export const UPDATE_TAB = 'updateTab';
export const SELECT_POST = 'selectPost';
export const SELECT_PHOTO = 'selectPhoto';
export const SELECT_NEXT_POST = 'selectNextPost';
export const SELECT_PREVIOUS_POST = 'selectPrevPost';
export const SET_MODE = 'setMode';

export const AUTHORIZE = 'authorize';
export const LOAD_DASHBOARD = 'loadDashboard';
export const LOAD_LIKES = 'loadLikes';
export const LOAD_BLOG = 'loadBlog';

export const Mode = Object.freeze({
	VIEW:'view', INPUT:'input'
});

const CALLBACK_URL = 'http://reppets.net/tumblistr/dev/tumblistr.html?callback=true';
const TOKEN_OBSERVER_ID = '#tokenObserver';

Saved.logAll();

const initialState = {
	consumerToken: Saved.consumerToken,
	accounts: Saved.accounts,
	currentAccount: null,
	authorizing: false,
	tabs: [],
	vuetifyTabIndex: '0',
	mode: Mode.VIEW
};

let tumblr = initialState.consumerToken != null ? new Tumblr(initialState.consumerToken): null;
let currentAccount = initialState.accounts.find(e=>e.current);
initialState.currentAccount = currentAccount ? currentAccount: initialState.accounts[0];
if (currentAccount) tumblr.setToken(initialState.currentAccount.token);

function key(tab) {
  return [tab.type, tab.args.blogName, tab.args.filter, tab.args.tag].join('-');
}

export const store = new Vuex.Store({
	state: initialState,
	getters: {
		lacksConsumerToken: state => state.consumerToken == null,
		lacksActiveAccount: state => state.consumerToken != null && (state.currentAccount == null || state.authorizing), // TODO rename
		avatarUrl: state => args => tumblr.getAvatarURL(args.blogID, args.size)
	},
	mutations: {
		[SET_AUTHORIZING]: (state, value) => state.authorizing = value,
		[SET_CONSUMER_TOKEN]: (state, value) => {
			state.consumerToken = value;
			tumblr = new Tumblr(value);
			Saved.consumerToken = value;
		},
		[ADD_ACCOUNT]: (state, value) => {
			if (value.reblogTarget == null) {
				// set default reblog target if unset.
				value.reblogTarget = value.userInfo.blogs.find(e => e.primary);
			}
			const existingIndex = state.accounts.findIndex(e=>e.userInfo.name === value.userInfo.name);
			if (existingIndex > 0) {
				// if the same account already exists, replace it to new one.
				state.accounts.splice(existingIndex, 1, value);
			} else {
				state.accounts.push(value);
			}
			Saved.accounts = state.accounts;
		},
		[SET_CURRENT_ACCOUNT]: (state, value) => {
			const oldCurrent = state.accounts.find(e => e.current);
			if (oldCurrent !=null) {
				oldCurrent.current = false;
			}
			const newCurrent = state.accounts.find(e => e.userInfo.name === value.userInfo.name);
			newCurrent.current = true;
			state.currentAccount = newCurrent;
			Saved.accounts = state.accounts;
			tumblr.setToken(state.currentAccount.token);
		},
		[SET_REBLOG_TARGET]: (state, value) => {
			state.currentAccount.reblogTarget = value;
		},
		[SET_VUETIFY_TAB_INDEX]: (state, value) => state.vuetifyTabIndex = value,
		[OPEN_TAB]: (state, tab) => {
			/*
			argument
			{
        type: String,
        args: {[blogName]: String, [filter]: String, [tag]: String}
			}
			stored form
			{
				type,
				args,
				key: String,
				posts: Array,
				selectedPost: Object,
				selectedIndex: Number,
				noOlderPost: Boolean,
				loading: Boolean,
				[currentOffset]: Number
			}
			*/
			const existingIndex = state.tabs.findIndex(e => e.key === key(tab));
			if (existingIndex >= 0) {
				// if a same tab is already opened, just show it.
				state.vuetifyTabIndex = (existingIndex + 1).toString();
			} else {
				const newTab = Object.assign(
					{
						key: key(tab),
						posts: [],
						selectedPost: null,
						selectedIndex: null,
						noOlderPost: false,
						loading: false
					}, tab
				);
				if (tab.type === 'dashboard' || tab.type === 'blog') {
					newTab.currentOffset = 0;
				}
				state.tabs.push(newTab);
				state.vuetifyTabIndex = state.tabs.length.toString();
			}
		},
		[UPDATE_TAB]: (state, updates) => {
			/*
			updates: {
				tab: {key: String}
				[newPosts]: [],
				[currentOffset]: Number,
				[noOlderPost]: Boolean,
				[loading]: Boolean
			}
			*/
			const tab = state.tabs.find(e => e.key === updates.tab.key);
			if (updates.newPosts != null) {
				updates.newPosts.forEach(e => tab.posts.push(e));
			}
			if (updates.currentOffset != null) {
				tab.currentOffset = updates.currentOffset;
			}
			if (updates.noOlderPost != null) {
				tab.noOlderPost = updates.noOlderPost;
			}
			if (updates.loading != null) {
				tab.loading = updates.loading;
			}
		},
		[SELECT_POST]: (state, selection) => {
			const tab = state.tabs.find(e => e.key === selection.tab.key);
			tab.selectedIndex = selection.index;
			if (tab.selectedPost) tab.selectedPost.selected = false;
			tab.selectedPost = selection.post;
			Vue.set(tab.selectedPost, 'selected', true);
			if (tab.selectedPost.type === 'photo' && tab.selectedPost.selectedPhotoIndex == null) {
				Vue.set(tab.selectedPost, 'selectedPhotoIndex', 0);
			}
		},
		[SELECT_PHOTO]: (state, selection) => {
			const tab = state.tabs.find(e => e.key === selection.tab.key);
			tab.posts[selection.postIndex].selectedPhotoIndex = selection.photoIndex;
		},
		[SELECT_NEXT_POST]: (state) => {
			const activeTabIndex = parseInt(state.vuetifyTabIndex) - 1;
			if (activeTabIndex < 0) {
				return;
			}
			const activeTab = state.tabs[activeTabIndex];
			if (activeTab.posts.length === 0) {
				return;
			}
			const postIndex = activeTab.selectedIndex;
			const newPostIndex = postIndex == null ? 0 : (postIndex >= activeTab.posts.length - 1 ? postIndex : postIndex + 1);
			activeTab.selectedIndex = newPostIndex;
			if (activeTab.selectedPost) activeTab.selectedPost.selected = false;
			activeTab.selectedPost = activeTab.posts[newPostIndex];
			Vue.set(activeTab.selectedPost, 'selected', true);
			if (activeTab.selectedPost.type === 'photo' && activeTab.selectedPost.selectedPhotoIndex == null) {
				Vue.set(activeTab.selectedPost, 'selectedPhotoIndex', 0);
			}
		},
		[SELECT_PREVIOUS_POST]: (state) => {
			const activeTabIndex = parseInt(state.vuetifyTabIndex) - 1;
			if (activeTabIndex < 0) {
				return;
			}
			const activeTab = state.tabs[activeTabIndex];
			if (activeTab.posts.length === 0) {
				return;
			}
			const postIndex = activeTab.selectedIndex;
			const newPostIndex = postIndex == null ? 0 : (postIndex === 0  ? postIndex : postIndex - 1);
			activeTab.selectedIndex = newPostIndex;
			if (activeTab.selectedPost) activeTab.selectedPost.selected = false;
			activeTab.selectedPost = activeTab.posts[newPostIndex];
			Vue.set(activeTab.selectedPost, 'selected', true);
			if (activeTab.selectedPost.type === 'photo' && activeTab.selectedPost.selectedPhotoIndex == null) {
				Vue.set(activeTab.selectedPost, 'selectedPhotoIndex', 0);
			}
		},
		[SET_MODE]: (state, mode) => {
			state.mode = mode;
		}
	},
	actions: {
		[AUTHORIZE]: (context) => {
			context.commit(SET_AUTHORIZING, true);
			tumblr.getRequestToken({
				oauth_callback: CALLBACK_URL,
				onload: (response) => {
					if (response.status === 200) {
						// after obtaining the request token, set the observer and open the authorization page.
						const params = splitParameter(response.responseText);
						const observer = new MutationObserver(tokenObserver(params.oauth_token, params.oauth_token_secret, tumblr, (key, secret)=> {
							const token = {key: key, secret: secret};
							tumblr.getUserInfo({
								token: token,
								onload: (response) => {
									if (response.status === 200) {
										const userInfo = response.response.response.user;
										userInfo.avatarUrl = tumblr.getAvatarURL(userInfo.name, 40);
										userInfo.blogs.forEach(e => e.avatarUrl = tumblr.getAvatarURL(e.name, 40));
										const newAccount = {
											token: token,
											userInfo: userInfo,
											reblogTarget: userInfo.blogs.find(e=>e.primary),
											current: false,
										};
										context.commit(ADD_ACCOUNT, newAccount);
										context.commit(SET_CURRENT_ACCOUNT, newAccount);
									} // TODO error handling
									context.commit(SET_AUTHORIZING, false);
								}
							})
						}));
						observer.observe(document.querySelector(TOKEN_OBSERVER_ID),{ childList: true });
						window.open(tumblr.getAuthorizeURL(params.oauth_token), '_blank');
					} else if (response.status === 401) {
						context.commit(SET_CONSUMER_TOKEN, null);
						// TODO show error message.
					}
				}
			});
		},
		[LOAD_DASHBOARD]: (context, target) => {
			const tab = context.state.tabs.find(e=>e.key === target.key);
			context.commit(UPDATE_TAB, {tab:tab, loading: true});
			if (tab.currentOffset <= 200) {
				tumblr.getUserDashboard({
					offset: tab.currentOffset,
					type: tab.args.filter,
					tag: tab.args.tag,
					reblog_info: false, 
					notes_info: false,
					onload: (response) => {
						let olderPosts = response.response.response.posts;
						let postsToAdd = olderPosts.filter(p => tab.posts.length === 0 || p.id < last(tab.posts).id);
						context.commit(UPDATE_TAB, {
							tab: tab,
							newPosts: postsToAdd, 
							currentOffset: tab.currentOffset+(olderPosts.length-postsToAdd.length)+olderPosts.length,
							noOlderPost: olderPosts.length === 0,
							loading: false
						});
					}
				});
			} else {
				(function loadWithSinceId(sinceId, postsToAdd) {
					// TODO check negative sinceId
					if (!sinceId) {
						sinceId = last(tab.posts).id - Math.round((last(tab.posts,101).id - last(tab.posts).id) / 5);
					}
					tumblr.getUserDashboard({
						since_id: sinceId,
						type: tab.args.filter,
						tag: tab.args.tag,
						reblog_info: false,
						notes_info: false,
						onload: (response) => {
							let olderPosts = response.response.response.posts;
							if (last(olderPosts).id >= last(tab.posts).id) { // all posts are duplicated.
								if (postsToAdd) {
									context.commit(UPDATE_TAB, {tab: tab, newPosts: postsToAdd, loading: false});
								} else {
									sinceId = last(tab.posts).id - (last(tab.posts).id - sinceId) * 2;
									loadWithSinceId(sinceId);
								}
							} else if (olderPosts[0].id < last(tab.posts).id) { // no duplication.
								loadWithSinceId(olderPosts[0].id, postsToAdd ? olderPosts.concat(postsToAdd): olderPosts);
							} else {	// some posts are duplicated
								context.commit(UPDATE_TAB,{
									tab: tab,
									newPosts: postsToAdd ? olderPosts.filter(e => e.id < last(tab.posts).id).concat(postsToAdd): olderPosts.filter(e => e.id < last(tab.posts).id),
									loading: false
								})
							}
						}
					});
				})();
			}
		},
		[LOAD_LIKES]: (context, target) => {
			const tab = context.state.tabs.find(e => e.key===target.key);
			context.commit(UPDATE_TAB, {tab:tab, loading: true});
			tumblr.getUserLikes({
				before: tab.posts.length>0 ? last(tab.posts).liked_timestamp : null,
				onload: (response) => {
					const posts = response.response.response.liked_posts;
					context.commit(UPDATE_TAB, {
						tab: tab,
						newPosts: posts,
						noOlderPost: posts.length === 0,
						loading: false
					})
				}
			});
		},
		[LOAD_BLOG]: (context, target) => {
			const tab = context.state.tabs.find(e => e.key===target.key);
			context.commit(UPDATE_TAB, {tab:tab, loading: true});
			tumblr.getPosts({
				blogID: tab.args.blogName,
				type: tab.args.filter,
				offset: tab.currentOffset,
				tag: tab.args.tag,
				reblog_info: false,
				notes_info: false,
				onload: (response) => {
					let olderPosts = response.response.response.posts;
					let postsToAdd = olderPosts.filter(p => tab.posts.length > 0 ? p.id < last(tab.posts).id : true);
					context.commit(UPDATE_TAB, {
						tab: tab,
						newPosts: postsToAdd,
						offset: tab.currentOffset+(olderPosts.length-postsToAdd.length)+olderPosts.length,
						noOlderPost: postsToAdd.length === 0,
						loading: false
					});
				}
			});
		}
	},

	strict: true // TODO: disable in production.
	 

});