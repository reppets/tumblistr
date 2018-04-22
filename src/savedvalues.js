export const Saved = {
    get consumerToken() {
        return GM_getValue('consumer_token', null);
    },
    set consumerToken(value) {
        GM_setValue('consumer_token', value);
    },
    get accounts() {
        return GM_getValue('accounts', []);
    },
    set accounts(value) {
        GM_setValue('accounts', value);
    },
    get userToken() {
        return GM_getValue('user_token', null);
    },
    set userToken(value) {
        GM_setValue('user_token', value);
    },
    get reblogTarget() {
        return GM_getValue('reblog_target', null);
    },
    set reblogTarget(value) {
        return GM_setValue('reblog_target', value);
    },
    clear: function () {
        GM_deleteValue('consumer_token');
        GM_deleteValue('user_token');
        GM_deleteValue('reblog_target');
        GM_deleteValue('accounts');
    }
};