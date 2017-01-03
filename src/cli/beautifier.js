/* @flow */
import { js_beautify } from 'js-beautify';

export default function beautify(str: string) {
  const formatted: string = js_beautify(str);

  // no idea how to disable this correction in js-beautify
  const corrected = formatted.split(' ? : ').join('?: ')
                            // .split('(\n            ').join('(')
                             .split('declare\n').join('declare ')
                             .split('declare     ').join('declare ')
                             .split(' < ').join('<')
                             .split(' > ').join('>');


  return corrected;
}
