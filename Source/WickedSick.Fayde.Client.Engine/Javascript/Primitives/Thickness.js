/// <reference path="../Runtime/Nullstone.js" />
/// CODE

(function (namespace) {
    var Thickness = Nullstone.Create("Thickness", undefined, 4);

    Thickness.Instance.Init = function (left, top, right, bottom) {
        this.Left = left == null ? 0 : left;
        this.Top = top == null ? 0 : top;
        this.Right = right == null ? 0 : right;
        this.Bottom = bottom == null ? 0 : bottom;
    };

    Thickness.Instance.Plus = function (thickness2) {
        var t = new Thickness();
        t.Left = this.Left + thickness2.Left;
        t.Right = this.Right + thickness2.Right;
        t.Top = this.Top + thickness2.Top;
        t.Bottom = this.Bottom + thickness2.Bottom;
        return t;
    };
    Thickness.Instance.IsEmpty = function () {
        return this.Left == 0 && this.Top == 0 && this.Right == 0 && this.Bottom == 0;
    };
    Thickness.Instance.IsBalanced = function () {
        return this.Left === this.Top
            && this.Left === this.Right
            && this.Left === this.Bottom;
    };

    Thickness.Equals = function (thickness1, thickness2) {
        if (thickness1 == null && thickness2 == null)
            return true;
        if (thickness1 == null || thickness2 == null)
            return false;
        return thickness1.Left === thickness2.Left
            && thickness1.Top === thickness2.Top
            && thickness1.Right === thickness2.Right
            && thickness1.Bottom === thickness2.Bottom;
    };

    Thickness.Instance.toString = function () {
        return "(" + this.Left + ", " + this.Top + ", " + this.Right + ", " + this.Bottom + ")";
    };

    namespace.Thickness = Nullstone.FinishCreate(Thickness);
})(window);