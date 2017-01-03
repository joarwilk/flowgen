// @flow
import fs from 'fs';

export default function exportForFlowTyped (moduleName: string, output: string) {
  const folder = '../exports/' + moduleName + '_v1.x.x';
  const outputFile = folder  + '/flow_v0.35.x-/' + moduleName + '.js';

  const testfilePath = folder + '/test_' + moduleName + '.js';

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
    fs.existsSync(folder + '/flow_v0.35.x-') || fs.mkdirSync(folder + '/flow_v0.35.x-');
  }

  fs.writeFileSync(testfilePath, '');
  fs.writeFileSync(folder + '/flow_v0.35.x-/' + moduleName + '.js', output);

  return testfilePath;
}
