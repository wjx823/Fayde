var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="RoutedEventArgs.ts" />
/// CODE
/// <reference path="../Primitives/size.ts" />
var Fayde;
(function (Fayde) {
    var SizeChangedEventArgs = (function (_super) {
        __extends(SizeChangedEventArgs, _super);
        function SizeChangedEventArgs(previousSize, newSize) {
                _super.call(this);
            Object.defineProperty(this, "PreviousSize", {
                get: function () {
                    return size.clone(previousSize);
                }
            });
            Object.defineProperty(this, "NewSize", {
                get: function () {
                    return size.clone(newSize);
                }
            });
        }
        return SizeChangedEventArgs;
    })(Fayde.RoutedEventArgs);
    Fayde.SizeChangedEventArgs = SizeChangedEventArgs;    
    Nullstone.RegisterType(SizeChangedEventArgs, "SizeChangedEventArgs");
})(Fayde || (Fayde = {}));
//@ sourceMappingURL=SizeChangedEventArgs.js.map