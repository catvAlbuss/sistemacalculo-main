import { readPlotPalette } from '../sheets/plotTheme.js';

const observers = new WeakMap();

export function pressureChartTheme(palette) {
    const axis = {
        axisLabel: { color: palette.text },
        nameTextStyle: { color: palette.text },
        axisLine: { lineStyle: { color: palette.line } },
        splitLine: { lineStyle: { color: palette.line } },
    };
    return {
        backgroundColor: palette.panel,
        textStyle: { color: palette.text },
        title: { textStyle: { color: palette.text } },
        legend: { textStyle: { color: palette.text }, type: 'scroll', top: 30 },
        tooltip: { backgroundColor: palette.panel, borderColor: palette.line, textStyle: { color: palette.text } },
        xAxis: axis,
        yAxis: { ...axis },
    };
}

export function observePressureChart(chart, element) {
    if (observers.has(element)) return;
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
        if (!element.isConnected || chart.isDisposed()) {
            observer.disconnect();
            media.removeEventListener('change', update);
            observers.delete(element);
            return;
        }
        chart.setOption(pressureChartTheme(readPlotPalette(element)));
        if (element.clientWidth) chart.resize();
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    media.addEventListener('change', update);
    observers.set(element, observer);
    update();
}
