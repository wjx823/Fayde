/// <reference path="../../Runtime/Nullstone.js" />
/// <reference path="../TileBrush.js"/>
/// CODE
/// <reference path="BitmapSource.js"/>
/// <reference path="BitmapImage.js"/>

(function (namespace) {
    var ImageBrush = Nullstone.Create("ImageBrush", Fayde.Media.TileBrush);

    ImageBrush.Instance.Init = function () {
        this.Init$TileBrush();
        this.ImageFailed = new MulticastEvent();
        this.ImageOpened = new MulticastEvent();
    };

    //#region Properties

    ImageBrush.ImageSourceProperty = DependencyProperty.RegisterFull("ImageSource", function () { return Fayde.Media.Imaging.ImageSource; }, ImageBrush, undefined, undefined, { GetValue: function (propd, obj) { return new Fayde.Media.Imaging.BitmapImage(); } });

    Nullstone.AutoProperty(ImageBrush, ImageBrush.ImageSourceProperty, function (value) {
        if (value instanceof Uri)
            return new Fayde.Media.Imaging.BitmapImage(value);
        return value;
    });

    //#endregion

    ImageBrush.Instance._OnPropertyChanged = function (args, error) {
        if (args.Property.OwnerType !== ImageBrush) {
            this._OnPropertyChanged$TileBrush(args, error);
            return;
        }

        if (args.Property._ID === ImageBrush.ImageSourceProperty._ID) {
            var oldBmpSrc = Nullstone.As(args.OldValue, Fayde.Media.Imaging.BitmapSource);
            if (oldBmpSrc != null) {
                oldBmpSrc._ErroredCallback = null;
                oldBmpSrc._LoadedCallback = null;
            }
            var newBmpSrc = Nullstone.As(args.NewValue, Fayde.Media.Imaging.BitmapSource);
            if (newBmpSrc != null) {
                var ib = this;
                newBmpSrc._ErroredCallback = function () { ib.ImageFailed.Raise(this, new EventArgs()); };
                newBmpSrc._LoadedCallback = function () { ib.ImageOpened.Raise(this, new EventArgs()); };
            }
            this._InvalidateSurfaceCache();
        }

        this.PropertyChanged.Raise(this, args);
    };

    ImageBrush.Instance.SetupBrush = function (ctx, bounds) {
        var source = this.ImageSource;
        if (source == null)
            return null;

        if (source._Image == null)
            return null;

        this.SetupBrush$TileBrush(ctx, bounds);
    };
    ImageBrush.Instance.GetTileExtents = function () {
        var source = this.ImageSource;
        var r = new rect();
        r.Width = source.PixelWidth;
        r.Height = source.PixelHeight;
        return r;
    };
    ImageBrush.Instance.DrawTile = function (canvasCtx, bounds) {
        var source = this.ImageSource;
        canvasCtx.rect(0, 0, bounds.Width, bounds.Height);
        canvasCtx.fillStyle = canvasCtx.createPattern(source._Image, "no-repeat");
        canvasCtx.fill();
    };

    namespace.ImageBrush = Nullstone.FinishCreate(ImageBrush);
})(Nullstone.Namespace("Fayde.Media.Imaging"));