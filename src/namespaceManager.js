/* @flow */

let namespaceProps = {};
let namespaces: Array<string> = [];

let context: string = "";

export default {
  register: (name: string) => namespaces.push(name),
  registerProp: (namespace: string, name: string) =>
    (namespaceProps[name] = namespace),
  nsExists: (name: string) => namespaces.includes(name),
  nsPropExists: (name: string) => Object.keys(namespaceProps).includes(name),
  getNSForProp: (name: string) => namespaceProps[name],
  setContext: (namespace: string) => (context = namespace),

  reset: () => {
    namespaceProps = {};
    namespaces = [];
  },
};
