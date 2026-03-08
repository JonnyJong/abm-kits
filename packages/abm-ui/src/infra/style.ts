import { type ArrayOr, asArray, Color, notNil } from 'abm-utils';

//#region Type

type SpinalCase<T extends string> = T extends `${infer F}${infer R}`
	? F extends Uppercase<F>
		? `-${Lowercase<F>}${SpinalCase<R>}`
		: `${F}${SpinalCase<R>}`
	: T;

// Property

type RawStyleProperty = Exclude<
	keyof CSSStyleDeclaration & string,
	'cssText' | 'cssFloat' | `webkit${string}`
>;
type BaseStyleProperty = {
	[K in RawStyleProperty]: CSSStyleDeclaration[K] extends string ? K : never;
}[RawStyleProperty];

type CSSSizeProperty = `${'block' | 'inline'}Size` | 'width' | 'height';

// Value

type GlobalStyleValue =
	| 'inherit'
	| 'initial'
	| 'revert'
	| 'revert-layer'
	| 'unset';

type CSSVarValue = `$${string}`;

type BaseStyleValue =
	| GlobalStyleValue
	| CSSVarValue
	| number
	| Color
	| URL
	| null
	| (string & {});

/** 样式值 */
export type StyleValue = ArrayOr<BaseStyleValue>;

type ContentDistribution =
	| 'space-between'
	| 'space-around'
	| 'space-evenly'
	| 'stretch';
type OverflowPosition = 'unsafe ' | 'safe ' | '';
type ContentPosition = 'center' | 'start' | 'end' | 'flex-start' | 'flex-end';
type SelfPosition = ContentPosition | 'self-start' | 'self-end';
type BaselinePosition = `${'first' | 'last'} baseline`;

type ScrollScrollerArg = 'nearest' | 'root' | 'self';
type AxisArg = 'block' | 'inline' | 'x' | 'y';
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/animation-timeline/scroll */
type ScrollFn =
	`scroll(${'' | ScrollScrollerArg | AxisArg | `${AxisArg} ${ScrollScrollerArg}`})`;
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/animation-timeline/view */
type ViewFn = `view(${'' | AxisArg | 'auto' | `${AxisArg} auto`})`;
type JumpTermArg =
	| 'jump-start'
	| 'jump-end'
	| 'jump-none'
	| 'jump-both'
	| 'start'
	| 'end';
type TimingFn =
	| 'linear'
	| 'ease'
	| 'ease-in'
	| 'ease-out'
	| 'ease-in-out'
	| 'cubic-bezier(<p1>, <p2>, <p3>, <p4>)'
	| `steps(<n>, ${JumpTermArg})`
	| 'step-start'
	| 'step-end';
type FilterFn =
	| 'url'
	| 'blur'
	| 'brightness'
	| 'contrast'
	| 'drop-shadow'
	| 'grayscale'
	| 'hue-rotate'
	| 'invert'
	| 'opacity'
	| 'sepia'
	| 'saturate';
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Values/blend-mode */
type BlendMode =
	| 'normal'
	| 'multiply'
	| 'screen'
	| 'overlay'
	| 'darken'
	| 'lighten'
	| 'color-dodge'
	| 'color-burn'
	| 'hard-light'
	| 'soft-light'
	| 'difference'
	| 'exclusion'
	| 'hue'
	| 'saturation'
	| 'color'
	| 'luminosity';
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Values/url_value */
type CSSUrl = 'url()' | URL;
/** @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Values/gradient */
type CSSGradient =
	| 'linear-gradient()'
	| 'radial-gradient()'
	| 'repeating-linear-gradient()'
	| 'repeating-radial-gradient()'
	| 'conic-gradient()';
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Values/image */
type CSSImage = CSSUrl | CSSGradient;
type StrandColor =
	| 'black'
	| 'silver'
	| 'gray'
	| 'white'
	| 'maroon'
	| 'red'
	| 'purple'
	| 'fuchsia'
	| 'green'
	| 'lime'
	| 'olive'
	| 'yellow'
	| 'navy'
	| 'blue'
	| 'teal'
	| 'aqua';
type OtherColor =
	| 'aliceblue'
	| 'antiquewhite'
	| 'aqua'
	| 'aquamarine'
	| 'azure'
	| 'beige'
	| 'bisque'
	| 'black'
	| 'blanchedalmond'
	| 'blue'
	| 'blueviolet'
	| 'brown'
	| 'burlywood'
	| 'cadetblue'
	| 'chartreuse'
	| 'chocolate'
	| 'coral'
	| 'cornflowerblue'
	| 'cornsilk'
	| 'crimson'
	| 'cyan'
	| 'darkblue'
	| 'darkcyan'
	| 'darkgoldenrod'
	| 'darkgray'
	| 'darkgreen'
	| 'darkgrey'
	| 'darkkhaki'
	| 'darkmagenta'
	| 'darkolivegreen'
	| 'darkorange'
	| 'darkorchid'
	| 'darkred'
	| 'darksalmon'
	| 'darkseagreen'
	| 'darkslateblue'
	| 'darkslategray'
	| 'darkslategrey'
	| 'darkturquoise'
	| 'darkviolet'
	| 'deeppink'
	| 'deepskyblue'
	| 'dimgray'
	| 'dimgrey'
	| 'dodgerblue'
	| 'firebrick'
	| 'floralwhite'
	| 'forestgreen'
	| 'fuchsia'
	| 'gainsboro'
	| 'ghostwhite'
	| 'gold'
	| 'goldenrod'
	| 'gray'
	| 'green'
	| 'greenyellow'
	| 'grey'
	| 'honeydew'
	| 'hotpink'
	| 'indianred'
	| 'indigo'
	| 'ivory'
	| 'khaki'
	| 'lavender'
	| 'lavenderblush'
	| 'lawngreen'
	| 'lemonchiffon'
	| 'lightblue'
	| 'lightcoral'
	| 'lightcyan'
	| 'lightgoldenrodyellow'
	| 'lightgray'
	| 'lightgreen'
	| 'lightgrey'
	| 'lightpink'
	| 'lightsalmon'
	| 'lightseagreen'
	| 'lightskyblue'
	| 'lightslategray'
	| 'lightslategrey'
	| 'lightsteelblue'
	| 'lightyellow'
	| 'lime'
	| 'limegreen'
	| 'linen'
	| 'magenta'
	| 'maroon'
	| 'mediumaquamarine'
	| 'mediumblue'
	| 'mediumorchid'
	| 'mediumpurple'
	| 'mediumseagreen'
	| 'mediumslateblue'
	| 'mediumspringgreen'
	| 'mediumturquoise'
	| 'mediumvioletred'
	| 'midnightblue'
	| 'mintcream'
	| 'mistyrose'
	| 'moccasin'
	| 'navajowhite'
	| 'navy'
	| 'oldlace'
	| 'olive'
	| 'olivedrab'
	| 'orange'
	| 'orangered'
	| 'orchid'
	| 'palegoldenrod'
	| 'palegreen'
	| 'paleturquoise'
	| 'palevioletred'
	| 'papayawhip'
	| 'peachpuff'
	| 'peru'
	| 'pink'
	| 'plum'
	| 'powderblue'
	| 'purple'
	| 'rebeccapurple'
	| 'red'
	| 'rosybrown'
	| 'royalblue'
	| 'saddlebrown'
	| 'salmon'
	| 'sandybrown'
	| 'seagreen'
	| 'seashell'
	| 'sienna'
	| 'silver'
	| 'skyblue'
	| 'slateblue'
	| 'slategray'
	| 'slategrey'
	| 'snow'
	| 'springgreen'
	| 'steelblue'
	| 'tan'
	| 'teal'
	| 'thistle'
	| 'tomato'
	| 'transparent'
	| 'turquoise'
	| 'violet'
	| 'wheat'
	| 'white'
	| 'whitesmoke'
	| 'yellow'
	| 'yellowgreen';
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Values/named-color */
type NamedColor = 'currentcolor' | StrandColor | OtherColor;
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Values/system-color */
type SystemColor =
	| 'AccentColor'
	| 'AccentColorText'
	| 'ActiveText'
	| 'ButtonBorder'
	| 'ButtonFace'
	| 'ButtonText'
	| 'Canvas'
	| 'CanvasText'
	| 'Field'
	| 'FieldText'
	| 'GrayText'
	| 'Highlight'
	| 'HighlightText'
	| 'LinkText'
	| 'Mark'
	| 'MarkText'
	| 'VisitedText';
type CSSColorSpace =
	| 'rgb'
	| 'hsl'
	| 'hwb'
	| 'lab'
	| 'lch'
	| 'oklab'
	| 'oklch'
	| 'color';
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Values/color_value */
type CSSColor =
	| NamedColor
	| Lowercase<SystemColor>
	| `${CSSColorSpace}()`
	| 'color-mix()'
	| 'light-dark()';
type Repetition = 'repeat' | 'space' | 'round' | 'no-repeat';
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/width */
type CSSSize =
	| 'auto'
	| 'max-content'
	| 'min-content'
	| 'fit-content'
	| 'stretch'
	| 'contain'
	| 'calc()'
	| 'calc-size()'
	| 'anchor-size()';
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/border-width */
type BorderWidth = 'thin' | 'medium' | 'thick' | CSSSize;
/** @see https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/border-style */
type BorderStyle =
	| 'none'
	| 'hidden'
	| 'dotted'
	| 'dashed'
	| 'solid'
	| 'double'
	| 'groove'
	| 'ridge'
	| 'inset'
	| 'outset';
type CSSBreak =
	| 'auto'
	| 'avoid'
	| 'always'
	| 'all'
	| 'avoid-page'
	| 'page'
	| 'left'
	| 'right'
	| 'recto'
	| 'verso'
	| 'avoid-column'
	| 'column'
	| 'avoid-region'
	| 'region';
type BasicShape = 'inset()' | 'circle()' | 'ellipse()' | 'polygon()' | 'path()';
type GeometryBox =
	| 'margin-box'
	| 'border-box'
	| 'padding-box'
	| 'content-box'
	| 'fill-box'
	| 'stroke-box'
	| 'view-box';
type DisplayOutside = 'block' | 'inline' | 'run-in';
type DisplayInside = 'flow' | 'flow-root' | 'table' | 'flex' | 'grid' | 'ruby';
type DisplayListItem =
	`${`${DisplayOutside} ` | ''}${'flow ' | 'flow-root ' | ''}list-item`;
type DisplayInternal =
	| 'table-row-group'
	| 'table-header-group'
	| 'table-footer-group'
	| 'table-row'
	| 'table-cell'
	| 'table-column-group'
	| 'table-column'
	| 'table-caption'
	| 'ruby-base'
	| 'ruby-text'
	| 'ruby-base-container'
	| 'ruby-text-container';
type DisplayBox = 'contents' | 'none';
type DisplayLegacy =
	| 'inline-block'
	| 'inline-table'
	| 'inline-flex'
	| 'inline-grid';
type Display =
	| DisplayOutside
	| DisplayInside
	| `${DisplayOutside} ${DisplayInside}`
	| `${DisplayInside} ${DisplayOutside}`
	| DisplayListItem
	| DisplayInternal
	| DisplayBox
	| DisplayLegacy
	| 'grid-lanes'
	| 'inline-grid-lanes'
	| 'ruby'
	| 'ruby-base'
	| 'ruby-text'
	| 'ruby-base-container'
	| 'ruby-text-container';
type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type OverflowBlock = 'visible' | 'hidden' | 'clip' | 'scroll' | 'auto';
type TextBoxTrim = 'none' | 'trim-start' | 'trim-end' | 'trim-both';
type TextEdge =
	| 'text'
	| 'ideographic'
	| 'ideographic-ink'
	| `${'text' | 'ideographic' | 'ideographic-ink' | 'cap' | 'ex'} ${'text' | 'ideographic' | 'ideographic-ink' | 'alphabetic'}`;
type TextBoxEdge = 'auto' | TextEdge;
type TextWrapMode = 'wrap' | 'nowrap';
type TextWrapStyle = 'auto' | 'balance' | 'stable' | 'pretty' | 'avoid-orphans';
type TouchX = 'pan-x' | 'pan-left' | 'pan-right';
type TouchY = 'pan-y' | 'pan-up' | 'pan-down';
type TouchZ = 'pinch-zoom';
type AlignmentBaseline =
	| 'baseline'
	| 'text-bottom'
	| 'alphabetic'
	| 'ideographic'
	| 'middle'
	| 'central'
	| 'mathematical'
	| 'text-top';
type BaselineShift = 'sub' | 'super' | 'top' | 'center' | 'bottom';
type WhiteSpaceCollapse =
	| 'collapse'
	| 'discard'
	| 'preserve'
	| 'preserve-breaks'
	| 'preserve-spaces'
	| 'break-spaces';

// Declaration

type CSSPart =
	| `${'Block' | 'Inline'}${'' | 'Start' | 'End'}`
	| 'Top'
	| 'Right'
	| 'Bottom'
	| 'Left';

type SpecificStyleMap = {
	accentColor: 'auto' | CSSColor;
	alignContent:
		| 'normal'
		| BaselinePosition
		| ContentDistribution
		| `${OverflowPosition}${ContentPosition}`;
	alignItems:
		| 'normal'
		| 'stretch'
		| BaselinePosition
		| `${OverflowPosition}${ContentPosition}`
		| 'anchor-center';
	alignSelf:
		| 'auto'
		| `${OverflowPosition}${'normal' | SelfPosition}`
		| 'stretch'
		| BaselinePosition
		| 'anchor-center';
	alignmentBaseline:
		| 'baseline'
		| 'alphabetic'
		| 'central'
		| 'ideographic'
		| 'mathematical'
		| 'middle'
		| 'text-bottom'
		| 'text-top'
		| 'text-before-edge'
		| 'text-after-edge';
	anchorName: 'none';
	anchorScope: 'none' | 'all';
	animationComposition: ArrayOr<'replace' | 'add' | 'accumulate'>;
	animationDirection: ArrayOr<
		'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
	>;
	animationFillMode: ArrayOr<'none' | 'forwards' | 'backwards' | 'both'>;
	animationIterationCount: ArrayOr<'infinite'>;
	animationName: ArrayOr<'none'>;
	animationPlayState: ArrayOr<'running' | 'paused'>;
	animationRange: ArrayOr<'normal' | 'cover' | 'contain'>;
	animationRangeEnd: ArrayOr<'normal' | 'cover' | 'contain'>;
	animationRangeStart: ArrayOr<'normal' | 'cover' | 'contain'>;
	animationTimeline: ArrayOr<'none' | 'auto' | ScrollFn | ViewFn>;
	animationTimingFunction: ArrayOr<TimingFn>;
	appearance:
		| 'none'
		| 'auto'
		| 'menulist-button'
		| 'textfield'
		| 'button'
		| 'searchfield'
		| 'textarea'
		| 'push-button'
		| 'slider-horizontal'
		| 'checkbox'
		| 'radio'
		| 'square-button'
		| 'menulist'
		| 'listbox'
		| 'meter'
		| 'progress-bar';
	aspectRatio: 'auto';
	backdropFilter: ArrayOr<`${FilterFn}()`> | 'none';
	backfaceVisibility: 'visible' | 'hidden';
	backgroundAttachment: ArrayOr<'scroll' | 'fixed' | 'local'>;
	backgroundBlendMode: ArrayOr<BlendMode>;
	backgroundClip: ArrayOr<'border-box' | 'padding-box' | 'content-box' | 'text'>;
	backgroundColor: ArrayOr<CSSColor>;
	backgroundImage: ArrayOr<CSSImage>;
	backgroundOrigin: ArrayOr<'border-box' | 'padding-box' | 'content-box'>;
	backgroundPosition: ArrayOr<'top' | 'bottom' | 'left' | 'right' | 'center'>;
	backgroundPositionX: ArrayOr<'left' | 'center' | 'right'>;
	backgroundPositionY: ArrayOr<'top' | 'center' | 'bottom'>;
	backgroundRepeat: ArrayOr<
		'repeat-x' | 'repeat-y' | Repetition | `${Repetition} ${Repetition}`
	>;
	backgroundSize: ArrayOr<'cover' | 'contain' | 'auto'>;
	baselineSource: 'auto' | 'first' | 'last';
	borderImageRepeat: ArrayOr<'stretch' | 'repeat' | 'round' | 'space'>;
	borderImageSource: CSSImage;
	boxDecorationBreak: 'slice' | 'clone';
	boxSizing: 'content-box' | 'border-box';
	breakAfter: CSSBreak;
	breakBefore: CSSBreak;
	breakInside: 'auto' | 'avoid' | 'avoid-page' | 'avoid-column' | 'avoid-region';
	captionSide:
		| 'top'
		| 'bottom'
		| 'block-start'
		| 'block-start'
		| 'inline-start'
		| 'inline-end';
	caretColor: CSSColor;
	caretShape: 'auto' | 'bar' | 'block' | 'underscore';
	clear: 'none' | 'left' | 'right' | 'both' | 'inline-start' | 'inline-end';
	clipPath:
		| 'none'
		| 'url()'
		| BasicShape
		| GeometryBox
		| `${BasicShape} ${GeometryBox}`
		| `${GeometryBox} ${BasicShape}`;
	clipRule: 'nonzero' | 'evenodd';
	color: CSSColor;
	colorInterpolation: 'auto' | 'sRGB' | 'linearRGB';
	colorInterpolationFilters: 'auto' | 'sRGB' | 'linearRGB';
	colorSchema:
		| 'normal'
		| 'light'
		| 'dark'
		| 'light dark'
		| 'dark light'
		| 'only light'
		| 'only dark';
	columnCount: 'auto';
	columnFill: 'auto' | 'balance' | 'balance-all';
	columnGap: 'auto';
	columnRuleColor: CSSColor;
	columnRuleStyle: BorderStyle;
	columnRuleWidth: BorderWidth;
	columnSpan: 'none' | 'all';
	columnWidth: 'auto';
	columns: 'auto';
	contain:
		| 'none'
		| 'strict'
		| 'content'
		| ArrayOr<'size' | 'inline-size' | 'layout' | 'style' | 'paint'>;
	containerName: 'none';
	containerType: 'normal' | ArrayOr<'size' | 'inline-size' | 'scroll-state'>;
	content:
		| 'none'
		| 'normal'
		| 'url()'
		| 'attr()'
		| 'open-quote'
		| 'close-quote'
		| 'no-open-quote'
		| 'no-close-quote';
	contentVisibility: 'visible' | 'hidden' | 'auto';
	counterIncrement: 'none';
	counterReset: 'none';
	counterSet: 'none';
	cursor: ArrayOr<
		| 'auto'
		| 'default'
		| 'none'
		| 'context-menu'
		| 'help'
		| 'pointer'
		| 'progress'
		| 'wait'
		| 'cell'
		| 'crosshair'
		| 'text'
		| 'vertical-text'
		| '	alias'
		| 'copy'
		| 'move'
		| 'no-drop'
		| 'not-allowed'
		| 'grab'
		| 'grabbing'
		| 'all-scroll'
		| 'col-resize'
		| 'row-resize'
		| 'n-resize'
		| 'e-resize'
		| 's-resize'
		| 'w-resize'
		| 'ne-resize'
		| 'nw-resize'
		| 'se-resize'
		| 'sw-resize'
		| 'ew-resize'
		| 'ns-resize'
		| 'nesw-resize'
		| 'nwse-resize'
		| 'zoom-in'
		| 'zoom-out'
	>;
	d: 'none' | 'path()';
	direction: 'ltr' | 'rtl';
	display: Display;
	dominantBaseline:
		| 'auto'
		| 'text-bottom'
		| 'alphabetic'
		| 'ideographic'
		| 'middle'
		| 'central'
		| 'mathematical'
		| 'hanging'
		| 'text-top';
	dynamicRangeLimit:
		| 'standard'
		| 'no-limit'
		| 'constrained'
		| 'dynamic-range-limit-mix()';
	emptyCells: 'show' | 'hide';
	fieldSizing: 'fixed' | 'content';
	fill: 'none' | 'context-fill' | 'context-stroke' | CSSColor | 'url()';
	fillRule: 'nonzero' | 'evenodd';
	filter: ArrayOr<`${FilterFn}()`> | 'none';
	flex: 'auto' | 'none';
	flexBasic: CSSSize | 'fill' | 'content';
	flexDirection: FlexDirection;
	flexFlow:
		| FlexDirection
		| FlexWrap
		| `${FlexDirection} ${FlexWrap}`
		| `${FlexWrap} ${FlexDirection}`;
	flexWrap: FlexWrap;
	float:
		| 'block-start'
		| 'block-end'
		| 'inline-start'
		| 'inline-end'
		| 'snap-block'
		| 'snap-block()'
		| 'snap-inline'
		| 'snap-inline()'
		| 'left'
		| 'right'
		| 'top'
		| 'bottom'
		| 'none'
		| 'footnote';
	floodColor: CSSColor;
	fontFamily: ArrayOr<
		| 'serif'
		| 'sans-serif'
		| 'system-ui'
		| 'cursive'
		| 'fantasy'
		| 'math'
		| 'monospace'
		| 'ui-serif'
		| 'ui-sans-serif'
		| 'ui-monospace'
		| 'ui-rounded'
	>;
	fontFeatureSettings: 'normal';
	fontKerning: 'auto' | 'normal' | 'none';
	fontLanguageOverride: 'normal';
	fontOpticalSizing: 'auto' | 'none';
	fontPalette: 'normal' | 'light' | 'dark';
	fontSize:
		| 'xx-small'
		| 'x-small'
		| 'small'
		| 'medium'
		| 'large'
		| 'x-large'
		| 'xx-large'
		| 'xxx-large'
		| 'larger'
		| 'smaller'
		| 'math';
	fontSizeAdjust: 'none';
	fontStretch:
		| 'normal'
		| 'ultra-condensed'
		| 'extra-condensed'
		| 'condensed'
		| 'semi-condensed'
		| 'semi-expanded'
		| 'expanded'
		| 'extra-expanded'
		| 'ultra-expanded';
	fontStyle: 'normal' | 'italic' | 'left' | 'right' | 'oblique <deg>';
	fontSynthesisSmallCaps: 'auto' | 'none';
	fontSynthesisStyle: 'auto' | 'none' | 'oblique-only';
	fontSynthesisWeight: 'auto' | 'none';
	fontVariantCaps:
		| 'normal'
		| 'small-caps'
		| 'all-small-caps'
		| 'petite-caps'
		| 'all-petite-caps'
		| 'unicase'
		| 'titling-caps';
	fontVariantEmoji: 'normal' | 'text' | 'emoji' | 'unicode';
	fontVariantPosition: 'normal' | 'sub' | 'super';
	fontWeight: 'bolder' | 'lighter' | 'normal' | 'bold';
	forcedColorAdjust: 'auto' | 'none' | 'preserve-parent-color';
	gridAutoAlow: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
	hangingPunctuation:
		| 'none'
		| ArrayOr<'first' | 'force-end' | 'allow-end' | 'last'>;
	hyphenateCharacter: 'auto';
	hyphenateLimitChars: ArrayOr<'auto'>;
	hyphens: 'none' | 'manual' | 'auto';
	imageOrientation: 'from-image' | 'none' | 'flip';
	imageRendering:
		| 'auto'
		| 'smooth'
		| 'high-quality'
		| 'pixelated'
		| 'crisp-edges';
	initialLetter: 'normal';
	isolation: 'auto' | 'isolate';
	justifyContent:
		| 'normal'
		| ContentDistribution
		| `${OverflowPosition}${ContentPosition | 'left' | 'right'}`;
	justifyItems:
		| 'normal'
		| 'stretch'
		| BaselinePosition
		| `${OverflowPosition}${SelfPosition | 'left' | 'right'}`
		| 'legacy'
		| `legacy ${'left' | 'right' | 'center'}`
		| 'anchor-center';
	justifySelf:
		| 'auto'
		| `${OverflowPosition}${'normal' | SelfPosition | 'left' | 'right'}`
		| 'stretch'
		| BaselinePosition
		| 'anchor-center';
	letterSpacing: 'normal';
	lightingColor: CSSColor;
	lineBreak: 'auto' | 'loose' | 'normal' | 'strict' | 'anywhere';
	lineHeight: 'normal';
	listStylePosition: 'inside' | 'outside';
	marginTrim: 'none' | ArrayOr<`${'block' | 'inline'}${'' | 'Start' | 'End'}`>;
	maskBorderMode: 'luminance' | 'alpha';
	maskBorderRepeat: ArrayOr<'stretch' | 'repeat' | 'round' | 'space'>;
	maskBorderWidth: ArrayOr<'auto'>;
	maskClip: ArrayOr<
		| 'content-box'
		| 'padding-box'
		| 'border-box'
		| 'fill-box'
		| 'stroke-box'
		| 'view-box'
		| 'no-clip'
	>;
	maskComposite: ArrayOr<'add' | 'subtract' | 'intersect' | 'exclude'>;
	maskMode: ArrayOr<'alpha' | 'luminance' | 'match-source'>;
	maskOrigin: ArrayOr<
		| 'content-box'
		| 'padding-box'
		| 'border-box'
		| 'fill-box'
		| 'stroke-box'
		| 'view-box'
	>;
	maskRepeat: ArrayOr<
		'repeat-x' | 'repeat-y' | Repetition | `${Repetition} ${Repetition}`
	>;
	maskSize: ArrayOr<'cover' | 'contain' | 'auto'>;
	maskType: 'luminance' | 'alpha';
	mathDepth: 'auto-add' | 'add()';
	mathShift: 'normal' | 'compact';
	mathStyle: 'normal' | 'compact';
	mixBlendMode: BlendMode | 'plus-lighter';
	objectFit:
		| 'fill'
		| 'none'
		| 'contain'
		| 'cover'
		| 'scale-down'
		| 'contain scale-down'
		| 'cover scale-down';
	outlineStyle: BorderStyle;
	outlineWidth: BorderWidth;
	outlineColor: CSSColor;
	overflow: ArrayOr<OverflowBlock>;
	overflowAnchor: 'auto' | 'none';
	overflowBlock: OverflowBlock;
	overflowClipMargin: 'content-box' | 'padding-box' | 'border-box';
	overflowInline: OverflowBlock;
	overflowWrap: 'normal' | 'break-word' | 'anywhere';
	overflowX: OverflowBlock;
	overflowY: OverflowBlock;
	overscrollBehavior: ArrayOr<'contain' | 'none' | 'auto'>;
	overscrollBehaviorBlock: 'contain' | 'none' | 'auto';
	overscrollBehaviorInline: 'contain' | 'none' | 'auto';
	overscrollBehaviorX: 'contain' | 'none' | 'auto';
	overscrollBehaviorY: 'contain' | 'none' | 'auto';
	page: 'auto';
	paintOrder: 'normal' | ArrayOr<'fill' | 'stroke' | 'markers'>;
	perspective: 'none';
	placeContent: `${
		| 'normal'
		| BaselinePosition
		| ContentDistribution
		| `${OverflowPosition}${ContentPosition}`}${
		| ''
		| ` ${
				| 'normal'
				| ContentDistribution
				| `${OverflowPosition}${ContentPosition | 'left' | 'right'}`}`}`;
	placeItems: `${
		| 'normal'
		| 'stretch'
		| BaselinePosition
		| `${OverflowPosition}${ContentPosition}`
		| 'anchor-center'}${
		| ''
		| ` ${
				| 'normal'
				| 'stretch'
				| BaselinePosition
				| `${OverflowPosition}${SelfPosition | 'left' | 'right'}`
				| 'legacy'
				| `legacy ${'left' | 'right' | 'center'}`
				| 'anchor-center'}`}`;
	placeSelf: `${
		| 'auto'
		| `${OverflowPosition}${'normal' | SelfPosition}`
		| 'stretch'
		| BaselinePosition
		| 'anchor-center'} ${
		| ''
		| ` ${
				| 'auto'
				| `${OverflowPosition}${'normal' | SelfPosition | 'left' | 'right'}`
				| 'stretch'
				| BaselinePosition
				| 'anchor-center'}`}`;
	pointerEvents:
		| 'auto'
		| 'none'
		| 'visiblePainted'
		| 'visibleFill'
		| 'visibleStroke'
		| 'visible'
		| 'painted'
		| 'fill'
		| 'stroke'
		| 'all';
	position:
		| 'static'
		| 'relative'
		| 'absolute'
		| 'sticky'
		| 'fixed'
		| 'running()';
	positionAnchor: 'normal' | 'none' | 'auto';
	positionArea: 'none';
	positionTryOrder:
		| 'normal'
		| `most-${'width' | 'height' | `${'block' | 'inline'}-size`}`;
	positionVisibility:
		| 'always'
		| ArrayOr<'anchors-valid' | 'anchors-visible' | 'no-overflow'>;
	printColorAdjust: 'economy' | 'exact';
	quotes: 'auto' | 'none' | 'match-parent';
	resize: 'none' | 'both' | 'horizontal' | 'vertical' | 'block' | 'inline';
	rotate: 'none';
	rowGap: 'normal';
	rubyAlign: 'start' | 'center' | 'space-between' | 'space-around';
	rubyPosition:
		| 'alternate'
		| 'alternate over'
		| 'alternate under'
		| 'inter-character';
	scale: 'none';
	scrollBehavior: 'auto' | 'smooth';
	scrollSnapAlign: ArrayOr<'none' | 'start' | 'end' | 'center'>;
	scrollSnapStop: 'normal' | 'always';
	scrollSnapType:
		| 'none'
		| `${'x' | 'y' | 'block' | 'inline' | 'both'}${'' | ' mandatory' | ' proximity'}`;
	scrollTimelineAxis: ArrayOr<'block' | 'inline' | 'x' | 'y'>;
	scrollTimelineName: 'none';
	scrollbarColor: 'auto' | ArrayOr<CSSColor>;
	scrollbarGutter: 'auto' | 'stable' | 'stable both-edges';
	scrollbarWidth: 'auto' | 'thin' | 'none';
	shapeRendering: 'auto' | 'optimizeSpeed' | 'crispEdges' | 'geometricPrecision';
	stopColor: CSSColor;
	strokeDasharray: 'none';
	strokeDashoffset: 'none';
	strokeLinecap: 'butt' | 'round' | 'square';
	strokeLinejoin:
		| 'crop'
		| 'arcs'
		| 'miter'
		| 'bevel'
		| 'round'
		| 'fallback'
		| `${'crop' | 'arcs' | 'miter'} ${'bevel' | 'round' | 'fallback'}`;
	tableLayout: 'auto' | 'fixed';
	textAlign:
		| 'start'
		| 'end'
		| 'left'
		| 'right'
		| 'center'
		| 'justify'
		| 'match-parent'
		| 'justify-all';
	textAlignLast:
		| 'start'
		| 'end'
		| 'left'
		| 'right'
		| 'center'
		| 'justify'
		| 'match-parent';
	textAnchor: 'start' | 'middle' | 'end';
	textAutospace:
		| 'normal'
		| 'no-autospace'
		| 'auto'
		| ArrayOr<
				| 'ideograph-alpha'
				| 'ideograph-numeric'
				| 'punctuation'
				| 'insert'
				| 'replace'
		  >;
	textBox: 'normal' | TextBoxTrim | `${TextBoxTrim} ${TextBoxEdge}`;
	textBoxEdge: TextBoxEdge;
	textBoxTrim: TextBoxTrim;
	textCombineUpright: 'none' | 'all' | 'digits';
	textDecorationColor: CSSColor;
	textDecorationLine:
		| 'none'
		| 'spelling-error'
		| 'grammar-error'
		| ArrayOr<'underline' | 'overline' | 'line-through' | 'blink'>;
	textDecorationSkipInk: 'auto' | 'none' | 'all';
	textDecorationStyle: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
	textDecorationThickness: 'auto' | 'from-font';
	textEmphasisColor: CSSColor;
	textEmphasisPosition: `${'over' | 'under'}${'' | ' right' | ' left'}`;
	textEmphasisStyle:
		| 'none'
		| `${'filled ' | 'open ' | ''}${'dot' | 'circle' | 'double-circle' | 'triangle' | 'sesame'}`;
	textIndent: 'hanging' | 'each-line' | 'hanging each-line';
	textJustify: `${'auto' | 'none' | 'inter-word' | 'inter-character' | 'ruby'}${'' | ' no-compress'}`;
	textOrientation: 'mixed' | 'upright' | 'sideways';
	textOverflow: ArrayOr<'clip' | 'ellipsis' | 'fade' | 'fade()'>;
	textRendering:
		| 'auto'
		| 'optimizeSpeed'
		| 'optimizeLegibility'
		| 'geometricPrecision';
	textTransform:
		| 'none'
		| `${'capitalize' | 'uppercase' | 'lowercase'}${'' | ' full-width'}${'' | ' full-size-kana'}`
		| 'full-width'
		| 'full-size-kana'
		| 'full-width full-size-kana'
		| 'math-auto';
	textUnderlineOffset: 'auto';
	textUnderlinePosition:
		| 'auto'
		| 'from-font'
		| 'under'
		| 'left'
		| 'right'
		| `${'from-font' | 'under'} ${'left' | 'right'}`;
	textWrap: TextWrapMode | TextWrapStyle | `${TextWrapMode} ${TextWrapStyle}`;
	textWrapMode: TextWrapMode;
	textWrapStyle: TextWrapStyle;
	timelineScope: 'none' | 'all';
	touchAction:
		| 'auto'
		| 'none'
		| TouchX
		| TouchX
		| TouchZ
		| `${TouchX} ${TouchY | TouchZ}`
		| `${TouchY} ${TouchZ}`
		| `${TouchX} ${TouchY} ${TouchZ}`
		| 'manipulation';
	transform: ArrayOr<`${
		| 'scale3d'
		| 'scale'
		| 'scaleX'
		| 'scaleY'
		| 'scaleZ'
		| 'translate3d'
		| 'translate'
		| 'translateX'
		| 'translateY'
		| 'translateZ'
		| 'rotate3d'
		| 'rotate'
		| 'rotateX'
		| 'rotateY'
		| 'rotateZ'
		| 'skew'
		| 'skewX'
		| 'skewY'
		| 'matrix3d'
		| 'matrix'
		| 'perspective'}()`>;
	transformBox:
		| 'content-box'
		| 'border-box'
		| 'fill-box'
		| 'stroke-box'
		| 'view-box';
	transformStyle: 'flat' | 'preserve-3d';
	transitionBehavior: 'normal' | 'allow-discrete';
	transitionProperty:
		| 'none'
		| ArrayOr<'all' | SpinalCase<BaseStyleProperty> | 'float'>;
	transitionTimeline: ArrayOr<'none' | 'auto' | ScrollFn | ViewFn>;
	translate: 'none';
	userSelect: 'auto' | 'text' | 'none' | 'contain' | 'all';
	vectorEffect:
		| 'none'
		| 'non-scaling-stroke'
		| 'non-scaling-size'
		| 'non-rotation'
		| 'fixed-position';
	verticalAlign:
		| 'first'
		| 'last'
		| `${'first' | 'last'} ${AlignmentBaseline}`
		| `${'first' | 'last'} ${BaselineShift}`
		| `${'first' | 'last'} ${AlignmentBaseline} ${BaselineShift}`;
	viewTimelineAxis: ArrayOr<'block' | 'inline' | 'x' | 'y'>;
	viewTimelineName: ArrayOr<'none'>;
	viewTransitionClass: 'none';
	viewTransitionName: 'none';
	visibility: 'visible' | 'hidden' | 'force-hidden' | 'collapse';
	whiteSpace:
		| 'normal'
		| 'pre'
		| 'pre-wrap'
		| 'pre-line'
		| WhiteSpaceCollapse
		| TextWrapMode
		| TextWrapStyle
		| `${WhiteSpaceCollapse} ${TextWrapMode | TextWrapStyle}`
		| `${TextWrapMode} ${TextWrapStyle}`
		| `${WhiteSpaceCollapse} ${TextWrapMode} ${TextWrapStyle}`;
	whiteSpaceCollapse: WhiteSpaceCollapse;
	willChange: 'auto' | ArrayOr<'scroll-position' | 'contents'>;
	wordBreak:
		| 'normal'
		| 'break-all'
		| 'keep-all'
		| 'manual'
		| 'auto-phrase'
		| 'break-word';
	wordSpacing: 'normal';
	writingMode:
		| 'horizontal-tb'
		| 'vertical-rl'
		| 'vertical-lr'
		| 'sideways-rl'
		| 'sideways-lr';
	zIndex: 'auto';
} & {
	[P in `border${'' | CSSPart}Width`]: BorderWidth;
} & {
	[P in `border${'' | CSSPart}Style`]: BorderStyle;
} & {
	[P in `border${'' | CSSPart}Color`]: CSSColor;
} & {
	[P in `containIntrinsic${'BlockSize' | 'Height' | 'InlineSize' | 'Size' | 'Width'}`]: 'none';
} & {
	[P in
		| `inset${'' | `${'Block' | 'Inline'}${'' | 'Start' | 'End'}`}`
		| 'top'
		| 'right'
		| 'bottom'
		| 'left']: 'auto';
} & {
	[P in `${'margin' | 'padding'}${'' | CSSPart}`]: 'auto';
} & {
	[P in `marker${'Start' | 'Mid' | 'End'}`]: 'none' | 'url()';
} & {
	[P in
		| CSSSizeProperty
		| `${'max' | 'min'}${Capitalize<CSSSizeProperty>}`]: CSSSize;
};

export type StyleDeclaration = {
	[P in keyof SpecificStyleMap]?: SpecificStyleMap[P] | StyleValue;
} & {
	[P in BaseStyleProperty]?: StyleValue;
} & {
	[P in string]?: StyleValue;
};

//#region Helper

const PATTERN_CSS_VAR_DECLARE = /^\$(.)/;
const PATTERN_CSS_UPPER = /[A-Z]/g;

const NO_CACHE_PROP = new Set([
	'background',
	'animation',
	'border',
	'transition',
]);
const SPECIAL_UNIT_MAP = new Map<string, string>(
	Object.entries({
		aspectRatio: '',
		animationIterationCount: '',
		animationDelay: 's',
		animationDuration: 's',
		columnCount: '',
		fillOpacity: '',
		flexGrow: '',
		flexShrink: '',
		floodOpacity: '',
		fontSizeAdjust: '',
		fontStretch: '%',
		fontWeight: '',
		hyphenateLimitChars: '',
		imageOrientation: 'deg',
		initialLetter: '',
		maskBorderSlice: '',
		maskBorderWidth: '',
		mathDepth: '',
		opacity: '',
		order: '',
		orphans: '',
		rotate: 'deg',
		scale: '',
		stopOpacity: '',
		strokeMiterlimit: '',
		strokeOpacity: '',
		transitionDelay: 's',
		transitionDuration: 's',
		widows: '',
		wordSpacing: '%',
		zIndex: '',
		zoom: '',
	}),
);
const tester = document.createElement('p');
const splitterCache = new Map<string, ', ' | ' '>();
const BASE_CSS =
	'*{box-sizing:border-box;scrollbar-width:this;scrollbar-color:grey transparent}:focus{outline:0}';

/** 解析简写 CSS 变量 */
function parseCSSVar(input: string): string {
	return input
		.replace(PATTERN_CSS_VAR_DECLARE, (_, c: string) => `--${c.toLowerCase()}`)
		.replaceAll(PATTERN_CSS_UPPER, (c) => `-${c.toLowerCase()}`);
}

/** 解析 CSS 属性名 */
function parseCSSProperty(property: string): string {
	return parseCSSVar(property);
}

/** 解析 CSS 值 */
function parseCSSValue(
	property: string,
	prop: string,
	value: StyleValue,
): string {
	// Format
	const unit = SPECIAL_UNIT_MAP.get(property) ?? 'px';
	const values = asArray(value)
		.filter(notNil)
		.map((value) => {
			if (value instanceof Color) return value.hexa();
			if (value instanceof URL) return `url("${value.href}")`;
			if (typeof value === 'number') return `${value}${unit}`;
			if (typeof value !== 'string') value = String(value);
			if (value[0] !== '$') return value;
			return `var(${parseCSSVar(value)})`;
		});
	if (values.length === 0) return '';
	if (values.length === 1) return values[0];
	// Test splitter
	const cache = splitterCache.get(property);
	if (cache) return values.join(cache);
	let splitter: ' ' | ', ' = ' ';
	let result = values.join(' ');
	tester.style.setProperty(prop, result);
	if (!tester.style.getPropertyValue(prop)) {
		splitter = ', ';
		result = values.join(', ');
	}
	tester.style.removeProperty(prop);
	if (property[0] !== '$' && !NO_CACHE_PROP.has(property)) {
		splitterCache.set(property, splitter);
	}
	return result;
}

//#region Fn

/** 从字符串生成 CSS 样式表 */
export function compileCSS(css: string): CSSStyleSheet {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(css);
	return sheet;
}

/**
 * CSS 样式表生成标签模板函数
 * @description
 * 将模板字符串编译为可插入文档的 CSSStyleSheet 对象。
 * 自动在所有生成的样式前添加 `*{box-sizing:border-box;}` 等基础样式。
 * @example
 * ```ts
 * const styles = css`
 *   .button {
 *     color: ${color};
 *     padding: 0.5em 1em;
 *   }
 * `;
 * document.adoptedStyleSheets = [styles];
 * ```
 * @returns 已编译的 CSSStyleSheet 对象
 */
export function css(
	content: TemplateStringsArray,
	...args: any[]
): CSSStyleSheet {
	const css = content.flatMap((v, i) => [v, args[i]]).join('');
	return compileCSS(BASE_CSS + css);
}

/**
 * 原始 CSS 样式表生成标签模板函数
 * @description
 * 与 `css` 函数功能相同，但不会自动添加基础样式
 * @example
 * ```ts
 * const rawStyles = rawCSS`
 *   :host {
 *     display: block;
 *   }
 * `;
 * ```
 * @returns 已编译的 CSSStyleSheet 对象
 */
export function rawCSS(
	content: TemplateStringsArray,
	...args: any[]
): CSSStyleSheet {
	const css = content.flatMap((v, i) => [v, args[i]]).join('');
	return compileCSS(css);
}

/** 应用样式到指定元素 */
export function $style<T extends ElementCSSInlineStyle>(
	element: T,
	declaration?: StyleDeclaration | string,
): T {
	if (typeof declaration === 'string') {
		element.style.cssText = declaration;
		return element;
	}
	if (!declaration) return element;

	for (const [property, value] of Object.entries(declaration)) {
		const prop = parseCSSProperty(property);
		if (!notNil(value)) {
			element.style.removeProperty(prop);
			continue;
		}
		element.style.setProperty(prop, parseCSSValue(property, prop, value));
	}

	return element;
}
