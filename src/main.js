import Layout from './Layout.vue';

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


(function() {
    let font = document.createElement('link');
    font.setAttribute('rel', 'stylesheet');
    font.setAttribute('href', 'https://fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons');
    document.head.appendChild(font);
    let style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', 'https://unpkg.com/vuetify/dist/vuetify.min.css');
    document.head.appendChild(style);
})();

let client = null;
let consumerToken = Stored.consumerToken;
let data = {
    props: {
        authStage: 0
    }
}
if (consumerToken) {
    data.props.authStage = 1;
    client = new Tumblr(consumerToken.token, consumerToken.secret);
}

let vm = new Vue({
    el: '#root',
    template: '<Layout v-bind="props" v-on:update="update"/>',
    components: {Layout},
    data: data,
    methods: {
        update: function(type, value) {
            if (type="consumerKeySet") {
                Stored.consumerToken = {token:value.consumerToken, secret:value.consumerSecret};
                client = value.client;
                this.props.authStage=1;
            }
        }
    }
})
