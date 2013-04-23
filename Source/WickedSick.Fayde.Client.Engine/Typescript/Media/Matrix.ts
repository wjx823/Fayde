/// <reference path="../Runtime/Nullstone.ts" />
/// CODE

module Fayde.Media {
    export interface IMatrixChangedListener {
        MatrixChanged(newMatrix: Matrix);
    }

    export class Matrix {
        _Raw: number[];
        private _Inverse: Matrix = null;
        private _Listener: IMatrixChangedListener;

        get M11() { return this._Raw[0]; }
        set M11(val: number) { this._Raw[0] = val; this._OnChanged(); }

        get M12() { return this._Raw[1]; }
        set M12(val: number) { this._Raw[1] = val; this._OnChanged(); }

        get M21() { return this._Raw[3]; }
        set M21(val: number) { this._Raw[3] = val; this._OnChanged(); }

        get M22() { return this._Raw[4]; }
        set M22(val: number) { this._Raw[4] = val; this._OnChanged(); }

        get OffsetX() { return this._Raw[2]; }
        set OffsetX(val: number) { this._Raw[2] = val; this._OnChanged(); }

        get OffsetY() { return this._Raw[5]; }
        set OffsetY(val: number) { this._Raw[5] = val; this._OnChanged(); }

        get Inverse(): Matrix {
            var inverse = this._Inverse;
            if (!inverse) {
                var i = mat3.identity();
                mat3.inverse(this._Raw, i);
                if (!i)
                    return;
                inverse = new Matrix();
                inverse._Raw = i;
                this._Inverse = inverse;
            }
            return inverse;
        }

        Listen(listener: IMatrixChangedListener) {
            this._Listener = listener;
        }
        Unlisten(listener: IMatrixChangedListener) {
            this._Listener = null;
        }

        private _OnChanged() {
            this._Inverse = null;
            var listener = this._Listener;
            if (listener)
                listener.MatrixChanged(this);
        }

        toString(): string { return mat3.str(this._Raw); }
    }
    Nullstone.RegisterType(Matrix, "Matrix");
}