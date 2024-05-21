// Adapted from https://github.com/joewalnes/reconnecting-websocket/blob/master/reconnecting-websocket.js

// MIT License:
//
// Copyright (c) 2010-2012, Joe Walnes
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export default class ReconnectingWebSocket {
    private settings: {
        debug: boolean;
        automaticOpen: boolean;
        reconnectInterval: number;
        maxReconnectInterval: number;
        reconnectDecay: number;
        timeoutInterval: number;
        maxReconnectAttempts: number | null;
        binaryType: "blob" | "arraybuffer";
    };
    public reconnectAttempts: number = 0;
    public readyState: number = WebSocket.CONNECTING;
    public protocol: string | null;
    private ws: WebSocket | null;
    public forcedClose: boolean;
    public timedOut: boolean;
    private eventTarget: HTMLDivElement;

    static debugAll: boolean = false;
    static CONNECTING: number = WebSocket.CONNECTING;
    static OPEN: number = WebSocket.OPEN;
    static CLOSING: number = WebSocket.CLOSING;
    static CLOSED: number = WebSocket.CLOSED;

    constructor(
        private url: string,
        private protocols?: string | string[],
        options: Partial<ReconnectingWebSocket["settings"]> = {},
    ) {
        // Default settings
        this.settings = {
            debug: false,
            automaticOpen: true,
            reconnectInterval: 1000,
            maxReconnectInterval: 30000,
            reconnectDecay: 1.5,
            timeoutInterval: 2000,
            maxReconnectAttempts: null,
            binaryType: "blob",
            ...options,
        };

        // These should be treated as read-only properties
        this.url = url;
        this.protocol = null;

        // Private state variables
        this.ws = null;
        this.forcedClose = false;
        this.timedOut = false;
        this.eventTarget = document.createElement("div");

        // Wire up "on*" properties as event handlers
        this.eventTarget.addEventListener("open", (event) => this.onopen(event));
        this.eventTarget.addEventListener("close", (event) => this.onclose(event as CloseEvent));
        this.eventTarget.addEventListener("connecting", (event) => this.onconnecting(event));
        this.eventTarget.addEventListener("message", (event) => this.onmessage(event as MessageEvent));
        this.eventTarget.addEventListener("error", (event) => this.onerror(event));

        // Expose the API required by EventTarget
        this.addEventListener = this.eventTarget.addEventListener.bind(this.eventTarget);
        this.removeEventListener = this.eventTarget.removeEventListener.bind(this.eventTarget);
        this.dispatchEvent = this.eventTarget.dispatchEvent.bind(this.eventTarget);

        // Whether or not to create a websocket upon instantiation
        if (this.settings.automaticOpen) {
            this.open(false);
        }
    }

    private generateEvent(s: string, args?: any): CustomEvent {
        const evt = document.createEvent("CustomEvent");
        // eslint-disable-next-line deprecation/deprecation
        evt.initCustomEvent(s, false, false, args);
        return evt;
    }

    public open(reconnectAttempt?: boolean): void {
        this.ws = new WebSocket(this.url, this.protocols);
        this.ws.binaryType = this.settings.binaryType;

        if (reconnectAttempt) {
            if (this.settings.maxReconnectAttempts && this.reconnectAttempts > this.settings.maxReconnectAttempts) {
                return;
            }
        } else {
            this.eventTarget.dispatchEvent(this.generateEvent("connecting"));
            this.reconnectAttempts = 0;
        }

        if (this.settings.debug || ReconnectingWebSocket.debugAll) {
            // eslint-disable-next-line no-console
            console.debug("ReconnectingWebSocket", "attempt-connect", this.url);
        }

        const localWs = this.ws;
        const timeout = setTimeout(() => {
            if (this.settings.debug || ReconnectingWebSocket.debugAll) {
                // eslint-disable-next-line no-console
                console.debug("ReconnectingWebSocket", "connection-timeout", this.url);
            }
            this.timedOut = true;
            localWs.close();
            this.timedOut = false;
        }, this.settings.timeoutInterval);

        this.ws.onopen = (_event) => {
            clearTimeout(timeout);
            if (this.settings.debug || ReconnectingWebSocket.debugAll) {
                // eslint-disable-next-line no-console
                console.debug("ReconnectingWebSocket", "onopen", this.url);
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.protocol = this.ws!.protocol;
            this.readyState = WebSocket.OPEN;
            this.reconnectAttempts = 0;
            const e = this.generateEvent("open");
            (e as any).isReconnect = reconnectAttempt;
            reconnectAttempt = false;
            this.eventTarget.dispatchEvent(e);
        };

        this.ws.onclose = (event) => {
            clearTimeout(timeout);
            this.ws = null;
            if (this.forcedClose) {
                this.readyState = WebSocket.CLOSED;
                this.eventTarget.dispatchEvent(this.generateEvent("close"));
            } else {
                this.readyState = WebSocket.CONNECTING;
                const e = this.generateEvent("connecting") as any;
                e.code = event.code;
                e.reason = event.reason;
                e.wasClean = event.wasClean;
                this.eventTarget.dispatchEvent(e);
                if (!reconnectAttempt && !this.timedOut) {
                    if (this.settings.debug || ReconnectingWebSocket.debugAll) {
                        // eslint-disable-next-line no-console
                        console.debug("ReconnectingWebSocket", "onclose", this.url);
                    }
                    this.eventTarget.dispatchEvent(this.generateEvent("close"));
                }

                const timeout =
                    this.settings.reconnectInterval * Math.pow(this.settings.reconnectDecay, this.reconnectAttempts);
                setTimeout(
                    () => {
                        this.reconnectAttempts++;
                        this.open(true);
                    },
                    timeout > this.settings.maxReconnectInterval ? this.settings.maxReconnectInterval : timeout,
                );
            }
        };

        this.ws.onmessage = (event) => {
            if (this.settings.debug || ReconnectingWebSocket.debugAll) {
                // eslint-disable-next-line no-console
                console.debug("ReconnectingWebSocket", "onmessage", this.url, event.data);
            }
            const e = this.generateEvent("message") as any;
            e.data = event.data;
            this.eventTarget.dispatchEvent(e);
        };

        this.ws.onerror = (event) => {
            if (this.settings.debug || ReconnectingWebSocket.debugAll) {
                // eslint-disable-next-line no-console
                console.debug("ReconnectingWebSocket", "onerror", this.url, event);
            }
            this.eventTarget.dispatchEvent(this.generateEvent("error"));
        };
    }

    public send(data: string | ArrayBuffer | Blob): void {
        if (this.ws) {
            if (this.settings.debug || ReconnectingWebSocket.debugAll) {
                // eslint-disable-next-line no-console
                console.debug("ReconnectingWebSocket", "send", this.url, data);
            }
            this.ws.send(data);
        } else {
            throw "INVALID_STATE_ERR : Pausing to reconnect websocket";
        }
    }

    public close(code: number = 1000, reason?: string): void {
        this.forcedClose = true;
        this.ws?.close(code, reason);
    }

    public refresh(): void {
        this.ws?.close();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public onopen(_event: Event): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public onclose(_event: CloseEvent): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public onconnecting(_event: Event): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public onmessage(_event: MessageEvent): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public onerror(_event: Event): void {}

    public addEventListener: HTMLDivElement["addEventListener"];
    public removeEventListener: HTMLDivElement["removeEventListener"];
    public dispatchEvent: HTMLDivElement["dispatchEvent"];
}
