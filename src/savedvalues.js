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
    clear: function () {
        GM_listValues.forEach(e => GM_deleteValue(e));
    },
    logAll: function() {
        GM_listValues.forEach(e => console.log(GM_getValue(e)));
    }
};