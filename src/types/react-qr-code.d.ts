
declare module 'qrcode.react' {
    import * as React from 'react';

    export interface QRCodeProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
        value: string;
        size?: number;
        bgColor?: string;
        fgColor?: string;
        level?: 'L' | 'M' | 'Q' | 'H';
        renderAs?: 'canvas' | 'svg';
        imageSettings?: {
            src: string;
            x?: number;
            y?: number;
            height?: number;
            width?: number;
            excavate?: boolean;
        };
    }

    class QRCode extends React.Component<QRCodeProps, any> {}

    export default QRCode;
}
