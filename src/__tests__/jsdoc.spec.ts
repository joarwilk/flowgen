import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle basic jsdoc", () => {
  const ts = `const skip: number
/**
 * @param {string} userToken User authentication token
 * @returns {Promise<void>}
 */
declare function authorize(userToken: string): Promise<void>

/**
 * @param {*} any_type
 * @returns {void}
 */
declare function untyped(any_type: any): void;

type F = {
  /**
   * Get instance or instances of type registered under the provided name and optional hint.
   * @param {string} name The binding name.
   * @param {string} hint The binding hint.
   * @param {...args} args Additional args.
   */
  get<T>(name: string, hint?: string, ...args: any[]): T;
  /**
   * This method inserts an entry to the list. Optionally it can place new entry at provided index.
   * @param entry {?} - The entry to insert
   * @param opt_idx {number=} - The index where the new entry should be inserted; if omitted or greater then the current size of the list, the entry is added at the end of the list;
   * a negative index is treated as being relative from the end of the list
   */
  add(entry: any, opt_idx?: number): void;
}

/**
 * Patches an Element with the the provided function. Exactly one top level
 * element call should be made corresponding to \`node\`.
 * @param {!Element} node The Element where the patch should start.
 * @param {!function(T)} fn A function containing open/close/etc. calls that
 *     describe the DOM. This should have at most one top level element call.
 * @param {T=} data An argument passed to fn to represent DOM state.
 * @return {?Node} The node if it was updated, its replacedment or null if it
 *     was removed.
 * @template T
 */
declare var patchOuter: <T>(
  node: Element,
  fn: (data: T) => void,
  data?: T,
) => Node | null;

declare class ECharts {}

/**
 * Creates an ECharts instance, and returns an echartsInstance. You shall
 *     not initialize multiple ECharts instances on a single container.
 *
 * @param {HTMLDivElement | HTMLCanvasElement} dom Instance container,
 *     usually is a \`div\` element with height and width defined.
 * @param {object | string} [theme] Theme to be applied.
 *     This can be a configuring object of a theme, or a theme name
 *     registered through [echarts.registerTheme](https://echarts.apache.org/api.html#echarts.registerTheme).
 * @param {object} [opts] Chart configurations.
 * @param {number} [opts.devicePixelRatio] Ratio of one physical pixel to
 *     the size of one device independent pixels. Browser's
 *     \`window.devicePixelRatio\` is used by default.
 * @param {string} [opts.renderer] Supports \`'canvas'\` or \`'svg'\`.
 *     See [Render by Canvas or SVG](https://echarts.apache.org/tutorial.html#Render%20by%20Canvas%20or%20SVG).
 * @param {number} [opts.width] Specify width explicitly, in pixel.
 *     If setting to \`null\`/\`undefined\`/\`'auto'\`, width of \`dom\`
 *     (instance container) will be used.
 * @param {number} [opts.height] Specify height explicitly, in pixel.
 *     If setting to \`null\`/\`undefined\`/\`'auto'\`, height of \`dom\`
 *     (instance container) will be used.
 */
function init(
  dom: HTMLDivElement | HTMLCanvasElement,
  theme?: object | string,
  opts?: {
    devicePixelRatio?: number;
    renderer?: string;
    width?: number | string;
    height?: number | string;
  },
): ECharts;

/**
 * Plain comment
 */
declare function test(): Promise<void>
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should remove jsdoc", () => {
  const ts = `
/**
 * @param {string} userToken User authentication token
 * @returns {Promise<void>}
 */
declare function authorize(userToken: string): Promise<void>
`;
  const result = compiler.compileDefinitionString(ts, {
    quiet: true,
    jsdoc: false,
  });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
