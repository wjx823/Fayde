/// <reference path="../Runtime/Nullstone.js" />
/// CODE
/// <reference path="Enums.js"/>

(function (namespace) {
    function Matrix() {
        this.raw = mat3.identity();
    }

    Object.defineProperty(Matrix.prototype, "M11", {
        get: function () { return this.raw[0]; },
        set: function (value) {
            if (this.raw[0] !== value) {
                this.raw[0] = value;
                this._OnChanged();
            }
        }
    });
    Object.defineProperty(Matrix.prototype, "M12", {
        get: function () { return this.raw[1]; },
        set: function (value) {
            if (this.raw[1] !== value) {
                this.raw[1] = value;
                this._OnChanged();
            }
        }
    });
    Object.defineProperty(Matrix.prototype, "M21", {
        get: function () { return this.raw[3]; },
        set: function (value) {
            if (this.raw[3] !== value) {
                this.raw[3] = value;
                this._OnChanged();
            }
        }
    });
    Object.defineProperty(Matrix.prototype, "M22", {
        get: function () { return this.raw[4]; },
        set: function (value) {
            if (this.raw[4] !== value) {
                this.raw[4] = value;
                this._OnChanged();
            }
        }
    });
    Object.defineProperty(Matrix.prototype, "OffsetX", {
        get: function () { return this.raw[2]; },
        set: function (value) {
            if (this.raw[2] !== value) {
                this.raw[2] = value;
                this._OnChanged();
            }
        }
    });
    Object.defineProperty(Matrix.prototype, "OffsetY", {
        get: function () { return this.raw[5]; },
        set: function (value) {
            if (this.raw[5] !== value) {
                this.raw[5] = value;
                this._OnChanged();
            }
        }
    });
    Object.defineProperty(Matrix.prototype, "Inverse", {
        get: function () {
            var inverse = mat3.identity();
            mat3.inverse(this.raw, inverse);
            if (inverse) {
                var m = new Matrix();
                m.raw = inverse;
                return m;
            }
        }
    });

    Matrix.prototype.toString = function () {
        return mat3.str(this.raw);
    };

    Matrix.prototype._OnChanged = function () {
        if (this._ChangedCallback)
            this._ChangedCallback();
    };
    namespace.Matrix = Matrix;
})(window);