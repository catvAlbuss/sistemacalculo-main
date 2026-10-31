import {pressureChartTheme} from './chartPresentation.js';
import {LIGHT_PLOT_PALETTE} from '../sheets/plotTheme.js';

const unsupported = /\b(oklch|oklab|color-mix|color|lab|lch|var)\s*\(/i;
const colorProperties = ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','outlineColor','textDecorationColor','fill','stroke'];
// The report is printed: it never inherits the viewer's dark theme.
const lightTokens = {'--pr-bg':'#f3f6fa','--pr-panel':'#fff','--pr-soft':'#f8fafc','--pr-text':'#172b43','--pr-muted':'#526478','--pr-line':'#dce4ee','--pr-blue':'#1959b8'};

function copyColors(node) {
    if (node.ownerSVGElement) return;
    const style = node.ownerDocument.defaultView.getComputedStyle(node);
    for (const property of colorProperties) {
        const value = style[property];
        node.style[property] = unsupported.test(value || '') ? (property === 'backgroundColor' ? 'transparent' : '#172b43') : value;
    }
    if (/\btext-red-/.test(node.className)) node.style.color = '#b42318';
    if (/\btext-green-/.test(node.className)) node.style.color = '#047857';
    if (node.closest('.text-white.bg-gray-900')) node.style.color = '#172b43';
    node.style.boxShadow = 'none';
    node.style.textShadow = 'none';
    if (unsupported.test(style.backgroundImage)) node.style.backgroundImage = 'none';
}

// html2canvas draws control text from the padding box: without vertical padding the value is not clipped.
function fitField(copy) {
    if (!copy.matches('input:not([type=checkbox],[type=radio],[type=file],[type=hidden]),select')) return;
    Object.assign(copy.style, {height:'30px',minHeight:'30px',paddingTop:'0',paddingBottom:'0',lineHeight:'30px',backgroundColor:'#fff',backgroundImage:'none'});
}

// Only the html2canvas document is expanded. Live Alpine state and inline styles stay untouched.
export function prepareCaptureClone(original, clone, width) {
    // Without this, computed colors would still report the dark theme mid-transition.
    const frozen = clone.ownerDocument.createElement('style');
    frozen.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
    clone.ownerDocument.head.appendChild(frozen);
    const sheet = clone.closest('.retaining-wall-sheet') || clone.ownerDocument.documentElement;
    Object.entries(lightTokens).forEach(([token, value]) => sheet.style.setProperty(token, value));
    let source = original, target = clone;
    while (target && target.tagName !== 'HTML') {
        copyColors(target);
        Object.assign(target.style, {display:'block',visibility:'visible',opacity:'1',position:'static',transform:'none',overflow:'visible',maxHeight:'none',height:'auto'});
        target.removeAttribute('x-cloak');
        source = source?.parentElement;
        target = target.parentElement;
    }
    Object.assign(clone.style, {width:width+'px',maxWidth:'none',minWidth:'0'});
    for (const node of clone.querySelectorAll('[x-show]')) {
        const expression = node.getAttribute('x-show') || '';
        if (/^show(?!.*[Ee]rror)/.test(expression)) node.style.setProperty('display','block','important');
    }
    for (const node of clone.querySelectorAll('*')) {
        copyColors(node);
        fitField(node);
    }
    // html2canvas loses the text nested in a flex button; the report has no use for the control itself.
    for (const button of clone.querySelectorAll('button')) {
        const heading = clone.ownerDocument.createElement('div');
        heading.className = button.className;
        heading.style.cssText = button.style.cssText;
        heading.append(...button.childNodes);
        button.replaceWith(heading);
    }
}

export function captureChartDataURL(element, width=700, height=440) {
    const instance = window.echarts?.getInstanceByDom?.(element);
    if (!instance || instance.isDisposed()) return null;
    const host = document.createElement('div');
    host.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:${height}px;pointer-events:none`;
    document.body.appendChild(host);
    let chart;
    try {
        chart = window.echarts.init(host, null, {width,height});
        chart.setOption({...instance.getOption(),animation:false});
        chart.setOption(pressureChartTheme(LIGHT_PLOT_PALETTE));
        return chart.getDataURL({type:'png',pixelRatio:1.5,backgroundColor:'#fff',excludeComponents:['toolbox','brush']});
    } finally {
        chart?.dispose();
        host.remove();
    }
}

export async function captureElementContent(elementId, options={}) {
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Elemento ${elementId} no encontrado`);
    const width = options.width || 700;
    const native = captureChartDataURL(element, width, options.height || 440);
    if (native) {
        const image = new Image(); image.src = native; await image.decode();
        const canvas = document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
        canvas.getContext('2d').drawImage(image,0,0);return canvas;
    }
    return window.html2canvas(element, {
        backgroundColor:'#fff',scale:options.scale || 1.2,width,
        ...(options.height ? {height:options.height} : {}),
        windowWidth:Math.max(1000,width),useCORS:true,allowTaint:false,logging:false,removeContainer:true,imageTimeout:5000,
        onclone:(_document, clone) => prepareCaptureClone(element,clone,width),
    });
}

export const captureElementContentDynamic = captureElementContent;
export const captureElementBySections = captureElementContent;
// Retain the existing entry points without expanding any live component.
export const prepareElementForCapture = async element => element;
export const expandAlpineComponent = async element => element;
Object.assign(globalThis,{captureElementContent,captureElementContentDynamic,captureElementBySections,prepareElementForCapture,expandAlpineComponent});
