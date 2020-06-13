let namespaceProps = Object.create(null);
let namespaces: Array<string> = [];

// todo: remove this and setContext method
// eslint-disable-next-line no-unused-vars
let context: string = "";

export default {
  register: (name: string): number => namespaces.push(name),
  registerProp: (namespace: string, name: string): string =>
    (namespaceProps[name] = namespace),
  nsExists: (name: string): boolean => namespaces.includes(name),
  nsPropExists: (name: string): boolean =>
    Object.keys(namespaceProps).includes(name),
  getNSForProp: (name: string): any => namespaceProps[name],
  setContext: (namespace: string): string => (context = namespace),

  reset: (): void => {
    namespaceProps = Object.create(null);
    namespaces = [];
  },
};
