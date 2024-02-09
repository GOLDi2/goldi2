import { LitElement, html } from 'lit';

export async function updateWithScrollCompensation(
    element: LitElement,
    parent?: LitElement
) {
    parent ??= element;
    const scrollTop = parent.scrollTop;
    const diffBefore = parent.scrollHeight - parent.scrollTop;

    element.requestUpdate();
    await element.updateComplete;

    const diffAfter = parent.scrollHeight - scrollTop;
    parent.scrollTop = scrollTop + diffAfter - diffBefore;
}

export function renderLoadingScreen(loadingFinished: boolean) {
    return html`<div ?hidden=${loadingFinished} class="w-full">
        <div
            class=" bg-slate-300 w-full h-full flex justify-center items-center"
        >
            <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    </div>`;
}

export function renderSmallLoadingScreen(loadingFinished: boolean) {
    return html`<div ?hidden=${loadingFinished} class="w-full">
        <div
            class=" bg-slate-300 w-full h-full flex justify-center items-center"
        >
            <div class="lds-ring-small">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    </div>`;
}

export function parseDate(
    dateToBeParsed: number | string | Date,
    withTime: boolean = true
) {
    const parsedDate = new Date(dateToBeParsed);

    const year = parsedDate.getFullYear();

    let month: number | string = parsedDate.getMonth() + 1;
    if (month < 10) month = '0' + month;

    let date: number | string = parsedDate.getDate();
    if (date < 10) date = '0' + date;

    let hours: number | string = parsedDate.getHours();
    if (hours < 10) hours = '0' + hours;

    let minutes: number | string = parsedDate.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;

    if (withTime) return `${year}-${month}-${date}T${hours}:${minutes}`;

    return `${year}-${month}-${date}`;
}
