let namespaceProps = Object.create(null);
let namespaces: Array<string> = [];

export default {
  register: (name: string): number => namespaces.push(name),
  registerProp: (namespace: string, name: string): string =>
    (namespaceProps[name] = namespace),
  nsExists: (name: string): boolean => namespaces.includes(name),
  nsPropExists: (name: string): boolean =>
    Object.keys(namespaceProps).includes(name),
  getNSForProp: (name: string): any => namespaceProps[name],
  reset: (): void => {
    namespaceProps = Object.create(null);
    namespaces = [];
  },
};
