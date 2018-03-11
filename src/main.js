try{
    console.log('loaded');
    console.log(GM_listValues());
    
    const Settings = {
        tumblrLogLevel: Tumblr.LOG_DEBUG,
        rootElementId: "#root",
        tokenObserveElementId: "#tokenObserver",
        callbackUrl: "https://reppets.net/tumblistr/dev/tumblistr.html?callback=true",
        loadTriggerScrollMarginPx: 80,
        tumblrPostsPerRequest: 20,
        tumblrDashboardOffsetLimit: 250,
        dashboardAverageWindow: 1000,
        keybinds: {
            nextPost:'right',
            previousPost: 'left',
            nextPhoto: 'shift right',
            previousPhoto: 'shift left',
            scrollDown: 'down',
            scrollUp: 'up',
            detailScrollDown: 'shift down',
            reblog: 'r',
            quickReblog: 'shift r',
            like: 'l',
            quickLike: 'shift l',
        }
    }
    
    const Context = {
        tumblr: null,
        data: {
            consumerTokenStatus: null,  // unset/set/valid/invalid
            consumerTokenError: null,
            userTokenStatus: null,  // unset/set/valid/invalid
            temporalConsumerKey: '',
            temporalConsumerSecret: '',
            temporalTypeFilter: '',
            temporalTagFilter: '',
            temporalBlogName: '',
            userData: null,
            tabs: [],
            selectedTab: null,
            mode: null,
            initialized: false,
            actionHistory: [],
            reblogTo: null,
            showDetailMetadata: false
        },
        resizeScrollers: [],
    };
    
    const Util = {
        logLevel: 1,
        logging: (func) => {
            return function () {
                try {
                    if (Util.logLevel > 0) console.log(func.name ? func.name : 'function call', arguments);
                    return func.apply(this, arguments);
                } catch (e) {
                    console.log("error in " + func.name ? func.name : 'function call', e);
                    throw e;
                }
            }
        },
        splitParameter: (str) => {
            if (str.length > 0 && str.charAt(0) == '?') {
                str = str.substr(1);
            }
    
            var result = {};
            str.split('&').forEach(
                function (e, i, array) {
                    var param = e.split('=');
                    result[param[0]] = param[1];
                });
            return result;
        },
        zeroPad2: (num) => {
            if (num >= 10) {
                return num.toString();
            } else {
                return '0'+num;
            }
        }
    }
    
    const Stored = {
        get consumerToken() {
            return GM_getValue('consumer_token', null);
        },
        set consumerToken(value) {
            GM_setValue('consumer_token', value);
        },
        get userToken() {
            return GM_getValue('user_token', null);
        },
        set userToken(value) {
            GM_setValue('user_token', value);
        },
        clear: function () {
            GM_deleteValue('consumer_token');
            GM_deleteValue('user_token');
        }
    };
    
    class Tab {
    
        constructor(content, type, tag, blogName, blogData) {
            this.content = content;
            this.type= type;
            this.tag = tag;
            this.blogName = blogName;
            this.blogId = blogName ? blogName + '.tumblr.com': undefined;
            this.key = Tab.generateKey(content, type, tag, blogName ? blogName: null);
            this.blog = blogData;
            this.posts =  [];
            this.loading = false;
            this.noOlderPosts = false;
            this.offset = 0;
            this.selected = false;
            this.selectedPost = null;
            Context.data.tabs.push(this);
        }
    
        select() {
            if (Context.data.selectedTab) {
                Context.data.selectedTab.selected = false;
            }
            this.selected = true;
            Context.data.selectedTab = this;
            return this;
        }
    
        close() {
            let tabIndex = Context.data.tabs.findIndex((t)=>t===this);
            Context.data.tabs.splice(tabIndex, 1);
            if (Context.data.tabs.length <= tabIndex) {
                Context.data.selectedTab.selected = false;
                Context.data.selectedTab = null;
            } else {
                Context.data.tabs[tabIndex].select();
            }
        }
    
        static generateKey(content, type, tag, blogName) {
            return [content, type ? type: '', tag?tag:'', blogName?blogName:''].join('-');
        }
    
        static open(content, type, tag, blogName, blogData) {
            let tab = Context.data.tabs.find((t)=>t.key===Tab.generateKey(content,type,tag,blogName ? blogName: null));
            if (tab) {
                return tab.select();
            } else {
                return new Tab(content, type, tag, blogName, blogData).select();
            }
        }
    
        static openDashboard(type) {
            return Tab.open('dashboard', type);
        }
    
        static openBlog(blogName, type, tag, blogData) {
            return Tab.open('blog', type, tag, blogName, blogData);
        }
    
        static openMyLikes() {
            return Tab.open('mylikes');
        }
    }
    
    const App = {
        refreshUserData: function() {
            Context.tumblr.getUserInfo({
                onload: Util.logging(function(response) {
                    console.log(JSON.parse(JSON.stringify(response)));
                    if (response.status === 200) {
                        let user = response.response.response.user;
                        Context.data.userData = user;
                        Context.data.reblogTo = user.blogs.find((blog)=>blog.primary).name;
                    }
                    // TODO status handling
                })
            })
        },
        dashboardKey: (type) => ['dashboard',type ? type: ''].join('-'),
        blogKey: (blogName, type, tag) => ['blog',type ? type: '', tag ? tag: '', blogName].join('-'),
        myLikesKey: () => 'mylikes',
        loadDashboard: Util.logging(function loadDashboard(tab){
            if (!tab || tab.loading || tab.noOlderPosts) {
                return;
            }
            let offset = tab.offset
            tab.loading = true;
            if (offset <= Settings.tumblrDashboardOffsetLimit) {
                Context.tumblr.getUserDashboard({offset: offset, type: tab.type, tag: tab.tag, reblog_info: true, notes_info: true},{
                    onload: Util.logging(function dashboardOnLoad(response) {
                        // TODO status handling
                        let body = response.response;
                        tab.posts = tab.posts.concat(body.response.posts.filter((e)=>_.last(tab.posts) ? e.id < _.last(tab.posts).id : true));
                        tab.loading = false;
                        tab.offset += Settings.tumblrPostsPerRequest;
                        if (body.response.posts === 0) {
                            tab.noOlderPosts = true;
                            return;
                        }
                    })
                })
            } else {
                let size = Math.min(tab.posts.length, Settings.dashboardAverageWindow);
                let nextSinceId = Math.floor(_.last(tab.posts).id - ((_.nth(tab.posts, -size).id - _.last(tab.posts).id) / (size-1) * 20));
                this.loadDashboardSinceId(tab, nextSinceId, []);
            }
        }),
        loadDashboardSinceId: Util.logging(function loadDashboardSinceId(tab, sinceId, postsToAdd) {
            sinceId = Math.max(sinceId, 1);
            tab.loading = true;
            Context.tumblr.getUserDashboard({since_id: sinceId, type: tab.type, tag: tab.tag}, {
                onload: Util.logging(function dashboardOnloadSinceId(response) {
                    let body = response.response;
                    if (_.isEmpty(postsToAdd) && _.last(body.response.posts).id >= _.last(tab.posts).id) {
                        // TODO depth limit
                        let nextSinceId = _.last(tab.posts).id - ((_.last(tab.posts).id - sinceId) * 2);
                        if (nextSinceId < 1) {
                            tab.loading = false;
                            tab.noOlderPosts = true;
                            return;
                        }
                        App.loadDashboardSinceId(tab, nextSinceId, postsToAdd);
                    } else {
                        if (body.response.posts[0].id < _.last(tab.posts).id) {
                            postsToAdd = body.response.posts.concat(postsToAdd);
                            App.loadDashboardSinceId(tab, postsToAdd[0].id, postsToAdd);
                        } else {
                            tab.posts = tab.posts.concat(body.response.posts.filter((e)=>_.last(tab.posts) ? e.id < _.last(tab.posts).id : true), postsToAdd);
                            tab.loading = false;
                            return;
                        }
                    }
                })
            }, {reblog_info:true, notes_info:true})
        }),
        loadBlogPosts: Util.logging(function loadBlogPosts(tab) {
            if (!tab || tab.loading || tab.noOlderPosts) {
                return;
            }
            let offset = tab.offset;
            tab.loading = true;
            Context.tumblr.getPosts(tab.blogId, tab.type, {tag: tab.tag, offset:offset},{
                onload: Util.logging(function blogOnLoad(response) {
                    // TODO status handling
                    let body = response.response;
                    tab.posts = tab.posts.concat(body.response.posts);
                    tab.loading = false;
                    tab.offset += Settings.tumblrPostsPerRequest;
                    if (body.response.posts.length === 0) {
                        tab.noOlderPosts = true;
                        return;
                    }
                })
            }, {reblog_info:true, notes_info:true});
        }),
        loadMyLikedPosts: Util.logging(function loadMyLikedPosts(tab){
            if (!tab || tab.loading || tab.noOlderPosts) {
                return;
            }
            tab.loading = true;
            Context.tumblr.getUserLikes({offset:tab.offset},{
                onload: Util.logging(function likedOnLoad(response) {
                    // TODO status handling
                    let body = response.response;
                    tab.posts = tab.posts.concat(body.response.liked_posts);
                    tab.loading = false;
                    tab.offset += Settings.tumblrPostsPerRequest;
                    if (body.response.liked_posts.length === 0) {
                        tab.noOlderPosts = true;
                        return;
                    }
                })
            });
        }),
        selectPost: Util.logging(function selectPost(tab, post) {
            console.log(JSON.parse(JSON.stringify(post)));
            tab.selectedPost = post;
        }),
        reblogCurrentPost: Util.logging(function reblogCurrentPost() {
            let data = Context.data;
            let selectedTab = data.selectedTab;
            if (data.selectedTab && data.selectedTab.selectedPost) {
                let post = data.selectedTab.selectedPost;
                let action = {
                    post: post,
                    action: 'reblog',
                    status: 'started'
                }
                Context.data.actionHistory.push(action);
                Vue.set(post, 'reblogging', true);
                Context.tumblr.reblog(Context.data.reblogTo+'.tumblr.com', {
                    id:post.id,
                    reblog_key: post.reblog_key
                }, {
                    onload: function(r) {
                        console.log(r);
                        post.reblogging = false;
                        Vue.set(post, 'reblogged', true);
                        action.status = 'done';
                    }
                })
            }
        }),
        likeCurrentPost: Util.logging(function likeCurrentPost() {
            let data = Context.data;
            let selectedTab = data.selectedTab;
            if (data.selectedTab && data.selectedTab.selectedPost) {
                let post = data.selectedTab.selectedPost;
                let action = {
                    post: post,
                    action: 'like',
                    status: 'started'
                }
                Context.data.actionHistory.push(action);
                Vue.set(post, 'liking', true);
                Context.tumblr.like(post.id, post.reblog_key, {
                    onload: function(r) {
                        console.log(r);
                        post.liking = false;
                        post.liked = true;
                        action.status = 'done';
                    }
                })
            }
        }),
        unlikeCurrentPost: Util.logging(function unlikeCurrentPost() {
            let data = Context.data;
            let selectedTab = data.selectedTab;
            if (data.selectedTab && data.selectedTab.selectedPost) {
                let post = data.selectedTab.selectedPost;
                let action = {
                    post: post,
                    action: 'unlike',
                    status: 'started'
                }
                Context.data.actionHistory.push(action);
                Vue.set(post, 'unliking', true);
                Context.tumblr.unlike(post.id, post.reblog_key, {
                    onload: function(r) {
                        console.log(r);
                        post.unliking = false;
                        post.liked = false;
                        action.status = 'done';
                    }
                })
            }
        })
    };
    
    var main = function () { // main
        let logging = Util.logging;
        let split = Util.splitParameter;
    
        if (window.location.search.indexOf('callback') > 0) {
            // when opened by callback
            if (window.location.search.indexOf('oauth_token') > 0 && window.location.search.indexOf('oauth_verifier') > 0 && window.opener) {
                var search = split(window.location.search);
                var validPattern = /^\w+$/
                if (!validPattern.test(search.oauth_token)) throw 'invalid oauth_token';
                if (!validPattern.test(search.oauth_verifier)) throw 'invalid oauth_verifier';
                window.eval("window.opener.oauthCallback('" + search.oauth_token + "','" + search.oauth_verifier + "');");
            }
            window.close();
            return;
        }
    
        // add function to window for callback.
        window.eval('window.oauthCallback=function(token,verifier){document.querySelector("'+Settings.tokenObserveElementId+'").insertAdjacentHTML("beforeend", "<input type=\\"hidden\\"name=\\""+token+"\\" value=\\""+verifier+"\\">")}');
        function tokenObserver(oauthToken, oauthTokenSecret) {
            return logging((mut, self) => {
                mut.forEach(logging((mr) => {
                    for (var node of mr.addedNodes) {
                        if (node.attributes.getNamedItem('name').value === oauthToken) {
                            var oauthVerifier = node.attributes.getNamedItem('value').value;
                            Context.tumblr.getAccessToken(oauthToken, oauthTokenSecret, oauthVerifier, {
                                onload: logging(function (response) {
                                    var params = split(response.responseText);
                                    Context.tumblr.setToken(params.oauth_token, params.oauth_token_secret);
                                    Stored.userToken = { key: params.oauth_token, secret: params.oauth_token_secret };
                                    data.userTokenStatus = "valid";
                                    console.log('token stored.');
                                    App.refreshUserData();
                                })
                            });
                            self.disconnect();
                        }
                    }
                }));
            });
        }
    
        
        // Vue instance
        let data = Context.data;
        Vue.use(VueMaterial.default);
        Vue.component('dialog-box', {
            template: '#dialog-template',
            props: ['title', 'message']
        });
        Vue.directive('show-on-load', {
            bind: function(el, binding) {
                el.src = binding.value;
            },
            update: function(el, binding, vnode, oldVnode) {
                if (binding.value === binding.oldValue) {
                    return;
                }
                let src = binding.value;
                el.style.display = 'none';
                el.onload = (ev) => {
                    el.style.display="";
                }
                el.src = src;
            }
        });
        Vue.directive('watch-selection', {
            componentUpdated: function(el, binding, vnode, oldVnode) {
                if(binding.value===binding.oldValue) {return;}
                let cell = el.querySelector('.post-cell.selected');
                if (! cell) {return;}
                if (el.scrollTop + el.clientHeight <= cell.offsetTop + cell.clientHeight) {
                    cell.scrollIntoView(false);
                } else if (el.scrollTop > cell.offsetTop) {
                    cell.scrollIntoView(true);
                }
            }
        });
        Vue.directive('on-inserted', {
            inserted: function(el, binding, vnode) {
                binding.value(el, binding, vnode);
            }
        });
        Vue.directive('on-component-updated', {
            componentUpdated: function(el, binding, vnode, oldVnode) {
                binding.value(el, binding, vnode, oldVnode);
            }
        });
        Vue.directive('scroll-on-resize', {
            bind: function(el, binding, vnode) {
                Context.resizeScrollers.push(el);
            },
            unbind: function(el, binding, vnode) {
                Context.resizeScrollers = Context.resizeScrollers.filter((e)=>(e!==el));
            }
        });
        let vm = new Vue({
            el: Settings.rootElementId,
            data: data,
            mounted: function() {
                data.initialized = true;
            },
            computed: {
                selectedPost: function() {
                    return data.selectedTab ? data.selectedTab.selectedPost: null;
                },
            },
            methods: {
                validateConsumerToken: logging(function validateConsumerToken(consumerKey, consumerSecret) {
                    this.consumerTokenStatus = "set";
                    let tumblr = new Tumblr(consumerKey, consumerSecret, Settings.tumblrLogLevel);
                    let self = this;
                    tumblr.getRequestToken("dum.my", {
                        onload: logging(function getRequestTokenCallback(response) {
                            if (response.status === 200) {
                                self.consumerTokenStatus = "valid";
                                Context.tumblr = tumblr;
                                Stored.consumerToken = { key: consumerKey, secret: consumerSecret };
                            } else if (response.status === 401) {
                                self.consumerTokenStatus = "invalid";
                                self.consumerTokenError = response.responseText;
                                console.log(response.responseText);
                            }
                            // TODO other status handling
                        })
                    });
                }),
                authorize: logging(function authorize() {
                    Context.tumblr.getRequestToken(Settings.callbackUrl, {
                        onload: logging(function (response) {
                            if (response.status === 200) {
                                console.log(response);
                                let params = split(response.responseText);
                                new MutationObserver(tokenObserver(params.oauth_token, params.oauth_token_secret)).observe(document.querySelector(Settings.tokenObserveElementId), { childList: true });
                                window.open(Context.tumblr.getAuthorizeURL(params.oauth_token), '_blank');
                            }
                        })
                    })
                }),
                clearStoredValues: function () {
                    Stored.clear();
                },
                openDashboard: function(type) {
                    let tab = Tab.openDashboard(type==='' ? null : type);
                },
                openBlog: logging(function openBlog(blogName, type, tag, blogData) {
                    let tab = Tab.openBlog(blogName, type===''?null:type, tag===''?null:tag, blogData);
                }),
                openMyLikes: logging(function openMyLikes() {
                    let tab = Tab.openMyLikes();
                }),
                triggerLoadPosts: logging(function triggerLoadPosts(tab, el, items, oldItems) {
                    if (items && oldItems && items.length === oldItems.length) {
                        console.log('no items added');
                        return;
                    }
                    let contentPane = el;
                    if (contentPane.offsetParent === null) {
                        console.log('offsetParent is null');
                        return;
                    }
                    if (contentPane.scrollTop + contentPane.clientHeight + Settings.loadTriggerScrollMarginPx >= contentPane.scrollHeight) {
                        switch (tab.content) {
                        case 'dashboard':
                            App.loadDashboard(tab);
                            break;
                        case 'mylikes':
                            App.loadMyLikedPosts(tab);
                            break;
                        case 'blog':
                            App.loadBlogPosts(tab);
                            break;
                        default:
                            throw 'Unexpected tab.content';
                        }
                    }
                }),
                selectTab: logging(function selectTab(tab) {
                    if (tab) {
                        tab.select();
                    } else {
                        this.selectedTab.selected = false;
                        this.selectedTab = null;
                    }
                }),
                closeTab: logging(function closeTab(tab){
                    tab.close();
                }),
                select: App.selectPost,
                selectPhoto: logging(function selectPhoto(post, index) {
                    // TODO size selection;
                    if (post.photos.length <= 1) {
                        return post.photos[0].original_size.url;
                    } else if (post.selectedPhotoIndex === undefined) {
                        Vue.set(post, 'selectedPhotoIndex', index ? index : 0);
                        return post.photos[0].original_size.url;
                    } else {
                        if (index !== undefined) {
                            post.selectedPhotoIndex = index;
                        }
                        return post.photos[post.selectedPhotoIndex].original_size.url;
                    }
                }),
                reblogCurrentPost: App.reblogCurrentPost,
                likeCurrentPost: App.likeCurrentPost,
                unlikeCurrentPost: App.unlikeCurrentPost,
                avatarUrl: logging(function avatarUrl(blogName) {
                    return Context.tumblr.getAvatarURL(blogName+'.tumblr.com', 16);
                }),
                subcontentScroll: logging(function subcontentScroll(e) {
                    if(e.deltaY>0) {
                        this.selectedPost.selectedPhotoIndex=Math.min(this.selectedPost.selectedPhotoIndex+1, this.selectedPost.photos.length-1);
                    } else {
                        this.selectedPost.selectedPhotoIndex=Math.max(0, this.selectedPost.selectedPhotoIndex-1)
                    }
                }),
                timestampToDate: logging(function timestampToDate(timestamp){
                    let d = new Date(timestamp * 1000);
                    return [d.getFullYear(), Util.zeroPad2(d.getMonth()+1), Util.zeroPad2(d.getDate())].join('/')+' '+[Util.zeroPad2(d.getHours()), Util.zeroPad2(d.getMinutes()), Util.zeroPad2(d.getSeconds())].join(':');
                }),
                log: (s) => console.log(JSON.stringify(s)),
            }
        });
        window.addEventListener('resize', logging(function resizeListener(e) {
            Context.resizeScrollers.forEach((el) => {
                el.dispatchEvent(new UIEvent('scroll'));
            });
        }));
    
        // register key binds
        let keyListener = new window.keypress.Listener();
        keyListener.register_combo({
            keys: Settings.keybinds.nextPost,
            on_keydown: logging(function keyNextPost(e, count) {
                let currentTab = data.selectedTab;
                if (currentTab) {
                    if (currentTab.selectedPost) {
                        let index = currentTab.posts.findIndex((e)=>e.id===currentTab.selectedPost.id);
                        App.selectPost(currentTab, currentTab.posts[index < currentTab.posts.length-1 ? index+1 : index]);
                    } else {
                        App.selectPost(currentTab, currentTab.posts[0]);
                    }
                }
            }),
            is_solitary: true
        });
        keyListener.register_combo({
            keys: Settings.keybinds.previousPost,
            on_keydown:  (e) => {
                let currentTab = data.selectedTab;
                if (currentTab) {
                    if (currentTab.selectedPost) {
                        let index = currentTab.posts.findIndex((e)=>e.id===currentTab.selectedPost.id);
                        App.selectPost(currentTab, currentTab.posts[index > 0 ? index-1 : 0])
                    } else {
                        App.selectPost(currentTab, currentTab.posts[0]);
                    }
                }
            },
            is_solitary: true
        });
        keyListener.register_combo({
            keys: Settings.keybinds.nextPhoto,
            on_keydown: (e) => {
                let selectedTab = data.selectedTab;
                if (data.selectedTab && data.selectedTab.selectedPost && data.selectedTab.selectedPost.type === 'photo' && data.selectedTab.selectedPost.photos.length > 1) {
                    let post = data.selectedTab.selectedPost;
                    if (post.selectedPhotoIndex !== undefined) {
                        if (post.selectedPhotoIndex < post.photos.length - 1) {post.selectedPhotoIndex++;}
                    } else {
                        Vue.set(post, 'selectedPhotoIndex', 0);
                    }
                }
            },
            is_solitary: true
        });
        keyListener.register_combo({
            keys: Settings.keybinds.previousPhoto,
            on_keydown: (e) => {
                let selectedTab = data.selectedTab;
                if (data.selectedTab && data.selectedTab.selectedPost && data.selectedTab.selectedPost.type === 'photo' && data.selectedTab.selectedPost.photos.length > 1) {
                    let post = data.selectedTab.selectedPost;
                    if (post.selectedPhotoIndex !== undefined) {
                        if (post.selectedPhotoIndex>0) {post.selectedPhotoIndex--;}
                    } else {
                        Vue.set(post, 'selectedPhotoIndex', 0);
                    }
                }
            },
            is_solitary: true
        });
        keyListener.register_combo({
            keys: Settings.keybinds.quickLike,
            on_keydown: App.likeCurrentPost,
            is_solitary: true
        });
        keyListener.register_combo({
            keys: Settings.keybinds.quickReblog,
            on_keydown: App.reblogCurrentPost,
            is_solitary: true
        });
    
        // Initialize Tumblr api client
        let consumerToken = Stored.consumerToken;
        if (consumerToken) {
            Context.tumblr = new Tumblr(consumerToken.key, consumerToken.secret, Settings.tumblrLogLevel);
            data.consumerTokenStatus = "valid";
        } else {
            data.consumerTokenStatus = "unset";
            return;
        }
    
        // User authentication
        let userToken = Stored.userToken;
        if (userToken) {
            Context.tumblr.setToken(userToken.key, userToken.secret);
            data.userTokenStatus = "valid";
            App.refreshUserData();
        } else {
            data.userTokenStatus = "unset";
        }
    };
    
    try {
        main();
    } catch (e) {
        console.log(e);
    }
    
    }catch(e){console.log(e);}