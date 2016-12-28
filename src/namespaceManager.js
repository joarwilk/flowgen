/* @flow */

const namespaceProps: Array<string> = [];
const namespaces: Array<string> = [];

let context: string = '';

export default {
  register: (name: string) => namespaces.push(name),
  registerProp: (namespace: string, name: string) => namespaceProps.push(name),
  nsExists: (name: string) => namespaces.includes(name),
  nsPropExists: (name: string) => namespaceProps.includes(name),
  setContext: (namespace: string) => context = namespace,
}
