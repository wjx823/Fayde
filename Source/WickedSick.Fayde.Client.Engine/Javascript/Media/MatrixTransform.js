﻿/// <reference path="Transform.js"/>
/// CODE

(function (namespace) {
    var MatrixTransform = Nullstone.Create("MatrixTransform", namespace.Transform);

    //#region Properties

    MatrixTransform.MatrixProperty = DependencyProperty.RegisterFull("Matrix", function () { return Matrix; }, MatrixTransform, undefined, undefined, { GetValue: function () { return new Matrix(); } });

    Nullstone.AutoProperty(MatrixTransform, MatrixTransform.MatrixProperty);

    //#endregion

    MatrixTransform.Instance._BuildValue = function () {
        return this.Matrix.raw;
    };

    MatrixTransform.Instance._OnPropertyChanged = function (args, error) {
        if (args.Property.OwnerType !== MatrixTransform) {
            this._OnPropertyChanged$Transform(args, error);
            return;
        }
        //We need to subscribe Matrix._ChangedCallback to notify ValueProperty changed
        if (args.Property._ID === MatrixTransform.MatrixProperty._ID) {
            if (args.OldValue != null)
                args.OldValue._ChangedCallback = null;
            if (args.NewValue != null) {
                var mt = this;
                args.NewValue._ChangedCallback = function () { mt._OnSubPropertyChanged(MatrixTransform.MatrixProperty, this, args) };
            }
        }
        this.PropertyChanged.Raise(this, args);
    };
    MatrixTransform.Instance._OnSubPropertyChanged = function (propd, sender, args) {
        this._NeedUpdate = true;
        this._OnSubPropertyChanged$Transform(propd, sender, args);
        var newArgs = {
            Property: propd,
            OldValue: null,
            NewValue: this._GetValue(propd)
        };
        this.PropertyChanged.Raise(this, newArgs);
    };

    namespace.MatrixTransform = Nullstone.FinishCreate(MatrixTransform);
})(Nullstone.Namespace("Fayde.Media"));