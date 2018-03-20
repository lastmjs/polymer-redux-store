import {createStore} from 'redux';

let stores = {};
let currentElementId = -1;

class ReduxStore extends HTMLElement {
    constructor() {
        super();

        this._rootReducer = null;
        this._storeName = 'DEFAULT_STORE';
        this.elementId = `redux-store-element-${++currentElementId}`;
    }

    static get observedAttributes() {
        return [
            'root-reducer',
            'store-name',
            'action'
        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'root-reducer': {
                this.rootReducer = newValue;
                break;
            }
            case 'store-name': {
                this.storeName = newValue;
                break;
            }
            case 'action': {
                this.action = newValue;
                break;
            }
        }
    }

    set rootReducer(val) {
        this._rootReducer = val;
        if (this._rootReducer && this._storeName) {
            this.createTheStore();
        }
    }

    get rootReducer() {
        return this._rootReducer;
    }

    set storeName(val) {
        this._storeName = val;
        if (this._rootReducer && this._storeName) {
            this.createTheStore();
        }
    }

    get storeName() {
        return this._storeName;
    }

    set action(val) {
        stores[this._storeName].store.dispatch(val);
    }

    connectedCallback() {
        if (!stores[this._storeName]) {
            setTimeout(() => {
                this.connectedCallback();
            });
            return;
        }

        this.unsubscribe = stores[this._storeName].store.subscribe(() => {
            this.dispatchEvent(new CustomEvent('statechange', {
                detail: {
                    state: stores[this._storeName].store.getState()
                },
                bubbles: false
            }));
        });
    }

    getState() {
        return stores[this._storeName].store.getState();
    }

    getStores() {
        return stores;
    }

    createTheStore() {
        if (stores[this._storeName]) return; // I think it is safe to presume that a store should only be created once. Whithout this check there are some problems when a root reducer is set multiple times for one store

        stores[this._storeName] = {
            store: createStore(this._rootReducer),
            rootReducer: this._rootReducer
        };
    }
}

window.customElements.define('redux-store', ReduxStore);
