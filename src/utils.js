
export function splitParameter(str) {
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
}

export function functionLogger(logsCall) {
    return function(func) {
        return function () {
            try {
                if (logsCall > 0) console.log(func.name ? func.name : 'function call', arguments);
                return func.apply(this, arguments);
            } catch (e) {
                console.log("error in " + func.name ? func.name : 'function call', e);
                throw e;
            }
        }
    };
}

export function last(array, index) {
    if (index>0) {
        return array[array.length-index];
    } else if (index < 0) {
        return array[array.index+index];
    } else {
        return array[array.length-1];
    }
}

export class Intermitter {
    constructor(func, interval) {
        this.func = func;
        this.interval = interval;
        this.triggered = false;
        this.passInterval = true;
    }

    doFunc() {
        this.func();
        this.passInterval = false;
        this.triggered = false;
        setTimeout(() => {
            if (this.triggered) {
                this.doFunc();
            } else {
                this.passInterval = true;
            }
        }, this.interval);
    }

    trigger() {
        if (this.passInterval) {
            this.doFunc();
        }
    }

    
}