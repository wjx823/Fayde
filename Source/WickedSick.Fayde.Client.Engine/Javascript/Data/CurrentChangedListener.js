/// <reference path="../Runtime/Nullstone.js" />
/// CODE

(function (namespace) {
    var CurrentChangedListener = Nullstone.Create("CurrentChangedListener", null, 3);

    CurrentChangedListener.Instance.Init = function (source, closure, func) {
        /// <param name="source" type="ICollectionView"></param>
        /// <param name="closure" type="Object"></param>
        /// <param name="func" type="Function"></param>
        this._Source = source;
        this._Closure = closure;
        this._Func = func;
        this._Source.CurrentChanged.Subscribe(this, this.OnCurrentChangedInternal);
    };

    CurrentChangedListener.Instance.Detach = function () {
        if (this._Source) {
            this._Source.CurrentChanged.Unsubscribe(this, this.OnCurrentChangedInternal);
            this._Source = null;
            this._Closure = null;
            this._Func = null;
        }
    };
    CurrentChangedListener.Instance.OnCurrentChangedInternal = function (s, e) {
        if (this._Closure && this._Func)
            this._Func.call(this._Closure, s, e);
    };

    namespace.CurrentChangedListener = Nullstone.FinishCreate(CurrentChangedListener);
})(Nullstone.Namespace("Fayde.Data"));