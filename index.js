// @flow

type ComponentType = 'ACQUISITIONS_OTHER' | 'ACQUISITIONS_EPIC';

export const componentTypes = {
    EPIC: 'ACQUISITIONS_EPIC',
    OTHER: 'ACQUISITIONS_OTHER',
}

type Source = 'GUARDIAN_WEB';

export const sources = {
    GUARDIAN_WEB: 'GUARDIAN_WEB'
}

type ReferrerAcquisitionData = {
    componentId: ?string,
    componentType: ?ComponentType,
    source: ?Source,
    campaignCode: ?string,
    referrerUrl: ?string,
    referrerPageviewId: ?string,
}

const REFERRER_ACQUISITION_DATA_REQUEST = 'referrer-acquisition-data-request';
const REFERRER_ACQUISITION_DATA_RESPONSE = 'referrer-acquisition-data-response';
const ACQUISITION_DATA_QUERY_STRING_FIELD = 'acquisitionData';
const ACQUISITION_LINK_CLASS = 'js-acquisition-link';

function upsertAcquistionDataInUrl(rawUrl: string, newData: ReferrerAcquisitionData): string {
    let url;
    try {
        url = new URL(rawUrl);
    } catch (err) {
        return rawUrl;
    }

    let data = {};
    const json = url.searchParams.get(ACQUISITION_DATA_QUERY_STRING_FIELD);
    if (json) {
        try {
            data = JSON.parse(json);
        } catch (err) {
            return rawUrl;
        }
    }

    const updatedData = {...data, ...newData};
    url.searchParams.set(ACQUISITION_DATA_QUERY_STRING_FIELD, JSON.stringify(updatedData));
    return url.toString();
}

function upsertAcquisitionDataInUrls(data: ReferrerAcquisitionData): void {
    [...document.getElementsByClassName(ACQUISITION_LINK_CLASS)].forEach(el => {
        const href = el.getAttribute('href');
        if (href) {
            el.setAttribute('href', upsertAcquistionDataInUrl(href, data));
        }
    })
}

function isInIframe(): boolean {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function deserializeEventData(event: MessageEvent): ?Object {
    if (typeof event.data === 'string') {
        try {
            return JSON.parse(event.data)
        } catch (e) {}
    }
}

function requestReferrerDataFromParent() {
    const message = { 
        type:  REFERRER_ACQUISITION_DATA_REQUEST,
        name: window.name,
    };
    window.parent.postMessage(JSON.stringify(message), '*');
    window.addEventListener('message', function(event) {
        const data = deserializeEventData(event);
        if (data && data.type === REFERRER_ACQUISITION_DATA_RESPONSE) {
            upsertAcquisitionDataInUrls(data.referrerData);
        }
    })
}

function initPolyfill(): void {
    const polyfillSrc = 'https://cdn.polyfill.io/v2/polyfill.min.js?features=Array.from,URL';
    const polyfillEl = document.createElement('script');
    polyfillEl.setAttribute('src', polyfillSrc);
    if (document.head) {
        document.head.appendChild(polyfillEl);
    }
}

export function enrichLinks(data: ReferrerAcquisitionData): void {
    initPolyfill();
    upsertAcquisitionDataInUrls(data);
    if (isInIframe()) {
        requestReferrerDataFromParent();
    }
}

type ReferrerData = {
    referrerPageviewId: ?string,
    referrerUrl: string,
}

export function respondToReferrerDataRequests(
    getIframeElements: MessageEvent => HTMLIFrameElement[],
    getReferrerData: void => ReferrerData
): void {
    window.addEventListener('message', function(event) {
        const data = deserializeEventData(event)
        if (data && data.type === REFERRER_ACQUISITION_DATA_REQUEST) {
            getIframeElements(event).forEach(el => {
                const message = {
                    type: REFERRER_ACQUISITION_DATA_RESPONSE,
                    referrerData: getReferrerData()
                }
                el.contentWindow.postMessage(JSON.stringify(message), '*')
            })
        }
    })
}

export function getIframeElementsBySrc(event: MessageEvent) {
    const href = event.source.location.href;
    return [...document.getElementsByTagName('iframe')].filter( el =>
         el.getAttribute('src') === href
    );
}