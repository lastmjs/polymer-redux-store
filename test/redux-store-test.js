import jsverify from 'jsverify';
import deepEqual from 'deep-equal';

const InitialState = {
    variable1: 5,
    variable2: 'this is a string',
    variable3: {
        prop1: 1,
        prop2: 'this is another string'
    }
};

function RootReducer(state=InitialState, action) {
    switch(action.type) {
        case 'CHANGE_VARIABLE_1': {
            return Object.assign({}, state, {
                variable1: action.variable1
            });
        }
        case 'REPLACE_STATE': {
            return action.state;
        }
        default: {
            return state;
        }
    }
}

class ReduxStoreTest extends HTMLElement {
    _beforeTest() {
        const reduxStoreElement = document.createElement('redux-store');
        this.appendChild(reduxStoreElement);
        return reduxStoreElement;
    }

    _afterTest(reduxStoreElement) {
        this.removeChild(reduxStoreElement);
    }

    prepareTests(test) {
        test('once the root reducer is set actions can fire', [jsverify.number], (number) => {
            const reduxStoreElement = this._beforeTest();

            reduxStoreElement.rootReducer = RootReducer;
            reduxStoreElement.action = {
                type: 'CHANGE_VARIABLE_1',
                variable1: number
            };
            const state = reduxStoreElement.getState();

            const result = state.variable1 === number;

            this._afterTest(reduxStoreElement);

            return result;
        });

        test('if no store name is set the store name is DEFAULT_STORE', [jsverify.number], (number) => {
            const reduxStoreElement = this._beforeTest();

            reduxStoreElement.rootReducer = RootReducer;
            const stores = reduxStoreElement.getStores();

            const storeNameIsCorrect = reduxStoreElement.storeName === 'DEFAULT_STORE';
            const storeNameStoreIsDefined = !!stores['DEFAULT_STORE'].store;

            const result = storeNameIsCorrect && storeNameStoreIsDefined;

            this._afterTest(reduxStoreElement);

            return result;
        });

        test('setting a different store name creates a store with that name', [jsverify.nestring], (storeName) => {
            const reduxStoreElement = this._beforeTest();

            reduxStoreElement.rootReducer = RootReducer;
            reduxStoreElement.storeName = storeName;
            const stores = reduxStoreElement.getStores();

            const storeNameIsCorrect = reduxStoreElement.storeName === storeName;
            const storeNameStoreIsDefined = !!stores[storeName].store;

            const result = storeNameIsCorrect && storeNameStoreIsDefined;

            this._afterTest(reduxStoreElement);

            return result;
        });

        test('getState returns the state', [jsverify.number], (number) => {
            const reduxStoreElement = this._beforeTest();

            reduxStoreElement.rootReducer = RootReducer;
            reduxStoreElement.action = {
                type: 'REPLACE_STATE',
                state: InitialState
            };
            const state = reduxStoreElement.getState();

            const result = deepEqual(InitialState, state);

            this._afterTest(reduxStoreElement);

            return result;
        });

        test('set initial storeName property through attribute', [jsverify.number], (number) => {
            const reduxStoreElement = this._beforeTest();

            reduxStoreElement.rootReducer = RootReducer;
            reduxStoreElement.setAttribute('store-name', 'TEST_STORE');

            const storeNameIsCorrect = reduxStoreElement.storeName === 'TEST_STORE';
            const stores = reduxStoreElement.getStores();
            const storeNameStoreIsDefined = !!stores['TEST_STORE'].store;

            const result = storeNameIsCorrect && storeNameStoreIsDefined;

            this._afterTest(reduxStoreElement);

            return result;
        });

        test('the order of setting the rootReducer and storeName properties should not matter', [jsverify.number(0, 1)], (number) => {
            const reduxStoreElement = this._beforeTest();

            if (number === 0) {
                reduxStoreElement.rootReducer = RootReducer;
                reduxStoreElement.storeName = 'TEST_STORE';
            }
            else {
                reduxStoreElement.storeName = 'TEST_STORE';
                reduxStoreElement.rootReducer = RootReducer;
            }

            const storeNameIsCorrect = reduxStoreElement.storeName === 'TEST_STORE';
            const stores = reduxStoreElement.getStores();
            const storeNameStoreIsDefined = !!stores['TEST_STORE'].store;

            const result = storeNameIsCorrect && storeNameStoreIsDefined;

            this._afterTest(reduxStoreElement);

            return result;
        });

        test('if no store name is set all actions fire against the DEFAULT_STORE', [jsverify.nat(2), jsverify.nat(3), jsverify.number], (numChildrenPerLevel, numLevels, numToSetInAction) => {
            const reduxStoreElement = this._beforeTest();

            reduxStoreElement.rootReducer = RootReducer;
            const rootElement = document.createElement('div');
            const rootElementWithChildren = this._createChildHierarchy(rootElement, numChildrenPerLevel, numLevels, '<redux-store id="reduxStoreElement"></redux-store>');
            this.appendChild(rootElementWithChildren);

            const result = this._allChildrenFireActionsCorrectly(rootElementWithChildren, numToSetInAction);

            this._afterTest(reduxStoreElement);
            this.removeChild(rootElementWithChildren);

            return result;
        });

        test('if a store name is set all actions fire against that store', [jsverify.nat(2), jsverify.nat(3), jsverify.number, jsverify.nestring], (numChildrenPerLevel, numLevels, numToSetInAction, storeName) => {
            const reduxStoreElement = this._beforeTest();

            reduxStoreElement.rootReducer = RootReducer;
            reduxStoreElement.storeName = window.encodeURI(storeName);

            const rootElement = document.createElement('div');
            const rootElementWithChildren = this._createChildHierarchy(rootElement, numChildrenPerLevel, numLevels, `<redux-store id="reduxStoreElement" store-name="${window.encodeURI(storeName)}"></redux-store>`);
            this.appendChild(rootElementWithChildren);

            const result = this._allChildrenFireActionsCorrectly(rootElementWithChildren, numToSetInAction);

            this._afterTest(reduxStoreElement);
            this.removeChild(rootElementWithChildren);

            return result;
        });

        test('firing actions raises the statechange event with the new state', [jsverify.nat(2), jsverify.nat(3)], (numChildrenPerLevel, numLevels) => {
            const reduxStoreElement = this._beforeTest();

            reduxStoreElement.rootReducer = RootReducer;

            const rootElement = document.createElement('div');
            const rootElementWithChildren = this._createChildHierarchy(rootElement, numChildrenPerLevel, numLevels, `<redux-store id="reduxStoreElement"></redux-store>`);
            this.appendChild(rootElementWithChildren);

            const result = this._allChildrenCaptureStatechangeEvent(rootElementWithChildren);

            this._afterTest(reduxStoreElement);
            this.removeChild(rootElementWithChildren);

            return result;
        });

        //TODO test('firing actions on a store only raises the statechange event once from that store')

        // TODO setting the root reducer multiple times has no effect on the store (I want to make an arbitrary tree of DOM nodes to test this, just like in the jfive components)

        //TODO test unsubscription
    }

    //TODO make this test more like in jfive-web-components
    _createChildHierarchy(element, numChildrenPerLevel, numLevels, childInnerHTML) {
        if (numLevels === 0) {
            return element;
        }

        const children = new Array(numChildrenPerLevel).fill(null).map(() => {
            const child = document.createElement('div');
            child.innerHTML = childInnerHTML;
            return child;
        });

        const newElement = children.reduce((result, child) => {
            result.appendChild(child);
            return result;
        }, element);

        //TODO I would like to figure out how to do this with a map or reduce or such, making it more functional/declarative/recursive
        children.forEach((child) => {
            this._createChildHierarchy(child, numChildrenPerLevel, numLevels - 1, childInnerHTML);
        });

        return newElement;
    }

    _allChildrenFireActionsCorrectly(element, numToSetInAction) {
        const children = Array.from(element.children).filter((child) => child.tagName !== 'REDUX-STORE');
        if (children.length === 0) return true;

        const actionsFiredCorrectly = children.reduce((result, child) => {
            const reduxStoreElement = child.querySelector('#reduxStoreElement');
            reduxStoreElement.action = {
                type: 'CHANGE_VARIABLE_1',
                variable1: numToSetInAction
            };
            const state = reduxStoreElement.getState();
            if (state.variable1 !== numToSetInAction) return false;
            return result;
        }, true);

        return actionsFiredCorrectly && children.reduce((result, child) => {
            const allActionsFiredCorrectly = this._allChildrenFireActionsCorrectly(child, numToSetInAction);
            if (!allActionsFiredCorrectly) return false;
            return result;
        }, true);
    }

    //TODO this function is almost the same as _allChildrenFireActionsCorrectly, extract the similar pieces into a function and pass in a function with the differences
    _allChildrenCaptureStatechangeEvent(element) {
        const children = Array.from(element.children).filter((child) => child.tagName !== 'REDUX-STORE');
        if (children.length === 0) return true;

        const actionsFiredCorrectly = children.reduce((result, child) => {
            let eventFired = false;
            let theEvent;
            const reduxStoreElement = child.querySelector('#reduxStoreElement');
            reduxStoreElement.addEventListener('statechange', (event) => { //TODO the evil is unspeakable. Mutating the variables at the top of the function from this function, perhaps monads could help us fix this in the future
                eventFired = true;
                theEvent = event;
            });
            reduxStoreElement.action = {
                type: 'DEFAULT_ACTION'
            };
            if (!eventFired || !theEvent.detail.state) return false;
            return result;
        }, true);

        return actionsFiredCorrectly && children.reduce((result, child) => {
            const allActionsFiredCorrectly = this._allChildrenFireActionsCorrectly(child);
            if (!allActionsFiredCorrectly) return false;
            return result;
        }, true);
    }
}

window.customElements.define('redux-store-test', ReduxStoreTest);
