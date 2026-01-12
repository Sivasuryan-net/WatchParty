declare module 'webtorrent' {
    export default class WebTorrent {
        constructor(config?: any);
        add(torrentId: string | Buffer | File, opts?: any, onready?: (torrent: any) => void): any;
        get(torrentId: string): any;
        remove(torrentId: string | Buffer, callback?: (err: Error | null) => void): void;
        destroy(callback?: (err: Error | null) => void): void;
        on(event: string, callback: (...args: any[]) => void): void;
    }
}
