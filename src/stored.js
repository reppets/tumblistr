export const Stored = {
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