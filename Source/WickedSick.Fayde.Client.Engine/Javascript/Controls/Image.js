﻿/// <reference path="../Core/FrameworkElement.js"/>
/// CODE
/// <reference path="../Media/ImageSource.js"/>
/// <reference path="Enums.js"/>
/// <reference path="../Primitives/Enums.js"/>
/// <reference path="../Media/Enums.js"/>
/// <reference path="../Primitives/Uri.js"/>
/// <reference path="../Media/Imaging/BitmapImage.js"/>
/// <reference path="../Engine/RenderContext.js"/>

(function (namespace) {
    var Image = Nullstone.Create("Image", Fayde.FrameworkElement);

    Image.Instance.Init = function () {
        this.Init$FrameworkElement();
        this.ImageFailed = new MulticastEvent();
        this.ImageOpened = new MulticastEvent();
    };

    //#region Properties

    Image.SourceProperty = DependencyProperty.RegisterFull("Source", function () { return Fayde.Media.Imaging.ImageSource; }, Image, undefined, undefined, { GetValue: function (propd, obj) { return new Fayde.Media.Imaging.BitmapImage(); } });
    // http: //msdn.microsoft.com/en-us/library/system.windows.media.stretch(v=vs.95).aspx
    Image.StretchProperty = DependencyProperty.RegisterCore("Stretch", function () { return new Enum(Fayde.Media.Stretch); }, Image, Fayde.Media.Stretch.Uniform);

    Nullstone.AutoProperties(Image, [
        Image.StretchProperty
    ]);

    Nullstone.AutoProperty(Image, Image.SourceProperty, function (value) {
        if (value instanceof Uri)
            return new Fayde.Media.Imaging.BitmapImage(value);
        return value;
    });

    //#endregion

    //#region Measure/Arrange

    Image.Instance._MeasureOverride = function (availableSize, pass, error) {
        /// <param name="availableSize" type="size"></param>
        var desired = size.clone(availableSize);
        var shapeBounds = new rect();
        var source = this.Source;
        var sx = sy = 0.0;

        if (source != null) {
            shapeBounds.Width = source.PixelWidth;
            shapeBounds.Height = source.PixelHeight;
        }

        if (!isFinite(desired.Width))
            desired.Width = shapeBounds.Width;
        if (!isFinite(desired.Height))
            desired.Height = shapeBounds.Height;

        if (shapeBounds.Width > 0)
            sx = desired.Width / shapeBounds.Width;
        if (shapeBounds.Height > 0)
            sy = desired.Height / shapeBounds.Height;

        if (!isFinite(availableSize.Width))
            sx = sy;
        if (!isFinite(availableSize.Height))
            sy = sx;

        switch (this.Stretch) {
            case Fayde.Media.Stretch.Uniform:
                sx = sy = Math.min(sx, sy);
                break;
            case Fayde.Media.Stretch.UniformToFill:
                sx = sy = Math.max(sx, sy);
                break;
            case Fayde.Media.Stretch.Fill:
                if (!isFinite(availableSize.Width))
                    sx = sy;
                if (!isFinite(availableSize.Height))
                    sy = sx;
                break;
            case Fayde.Media.Stretch.None:
                sx = sy = 1.0;
                break;
        }

        desired.Width = shapeBounds.Width * sx;
        desired.Height = shapeBounds.Height * sy;
        return desired;
    };
    Image.Instance._ArrangeOverride = function (finalSize, pass, error) {
        /// <param name="finalSize" type="size"></param>
        var arranged = size.clone(finalSize);
        var shapeBounds = new rect();
        var source = this.Source;
        var sx = 1.0;
        var sy = 1.0;

        if (source != null) {
            shapeBounds.Width = source.PixelWidth;
            shapeBounds.Height = source.PixelHeight;
        }

        if (shapeBounds.Width === 0)
            shapeBounds.Width = arranged.Width;
        if (shapeBounds.Height === 0)
            shapeBounds.Height = arranged.Height;

        if (shapeBounds.Width !== arranged.Width)
            sx = arranged.Width / shapeBounds.Width;
        if (shapeBounds.Height !== arranged.Height)
            sy = arranged.Height / shapeBounds.Height;

        switch (this.Stretch) {
            case Fayde.Media.Stretch.Uniform:
                sx = sy = Math.min(sx, sy);
                break;
            case Fayde.Media.Stretch.UniformToFill:
                sx = sy = Math.max(sx, sy);
                break;
            case Fayde.Media.Stretch.None:
                sx = sy = 1.0;
                break;
            default:
                break;
        }

        arranged.Width = shapeBounds.Width * sx;
        arranged.Height = shapeBounds.Height * sy;
        return arranged;
    };

    //#endregion

    //#region Hit Testing

    Image.Instance._CanFindElement = function () { return true; };
    Image.Instance._InsideObject = function (ctx, x, y) {
        if (!this._InsideObject$FrameworkElement(ctx, x, y))
            return false;
        var source = this.Source;
        if (!source)
            return false;
        var stretch = this.Stretch;
        if (stretch === Fayde.Media.Stretch.Fill || stretch === Fayde.Media.Stretch.UniformToFill)
            return true;
        var metrics = this._CalculateRenderMetrics(source);
        if (!metrics)
            return null;

        var irect = new rect();
        irect.Width = source.PixelWidth;
        irect.Height = source.PixelHeight;
        rect.transform(irect, metrics.Matrix);
        var np = new Point(x, y);
        this._TransformPoint(np);
        return rect.containsPoint(irect, np);
    };

    //#endregion

    Image.Instance._ComputeActualSize = function () {
        var result = this._ComputeActualSize$FrameworkElement();

        var parent = this.GetVisualParent();
        var source = this.Source;

        if (parent && !(parent instanceof namespace.Canvas))
            if (Fayde.LayoutInformation.GetLayoutSlot(this, true) !== undefined)
                return result;

        if (source) {
            var available = this._ApplySizeConstraints(size.createInfinite());
            result = this._MeasureOverride(available);
            this._ApplySizeConstraints(result);
        }

        return result;
    };

    Image.Instance._Render = function (ctx, region) {
        /// <param name="ctx" type="_RenderContext"></param>
        // Just to get something working, we do all the matrix transforms for stretching.
        // Eventually, we can let the html5 canvas do all the dirty work.

        var source = this.Source;
        if (!source)
            return;

        source.Lock();
        var metrics = this._CalculateRenderMetrics(source);
        if (!metrics) {
            source.Unlock();
            return;
        }

        ctx.Save();
        if (metrics.Overlap !== RectOverlap.In || this._HasLayoutClip())
            this._RenderLayoutClip(ctx);
        ctx.PreTransform(metrics.Matrix);
        ctx.CanvasContext.drawImage(source._Image, 0, 0);
        DrawDebug("Image: [" + source._Image.src + "]");
        ctx.Restore();

        source.Unlock();
    };
    var computeMatrix = function (width, height, sw, sh, stretch, alignX, alignY) {
        /// <param name="width" type="Number"></param>
        /// <param name="height" type="Number"></param>
        /// <param name="sw" type="Number"></param>
        /// <param name="sh" type="Number"></param>
        /// <param name="stretch" type="Stretch"></param>
        /// <param name="alignX" type="Number"></param>
        /// <param name="alignY" type="Number"></param>

        var sx = width / sw;
        var sy = height / sh;
        if (width === 0)
            sx = 1.0;
        if (height === 0)
            sy = 1.0;

        if (stretch === Fayde.Media.Stretch.Fill) {
            return mat3.createScale(sx, sy);
        }

        var scale = 1.0;
        var dx = 0.0;
        var dy = 0.0;
        switch (stretch) {
            case Fayde.Media.Stretch.Uniform:
                scale = sx < sy ? sx : sy;
                break;
            case Fayde.Media.Stretch.UniformToFill:
                scale = sx < sy ? sy : sx;
                break;
            case Fayde.Media.Stretch.None:
                break;
        }

        switch (alignX) {
            case Fayde.Media.AlignmentX.Left:
                dx = 0.0;
                break;
            case Fayde.Media.AlignmentX.Center:
                dx = (width - (scale * sw)) / 2;
                break;
            case Fayde.Media.AlignmentX.Right:
            default:
                dx = width - (scale * sw);
                break;
        }

        switch (alignY) {
            case Fayde.Media.AlignmentY.Top:
                dy = 0.0;
                break;
            case Fayde.Media.AlignmentY.Center:
                dy = (height - (scale * sh)) / 2;
                break;
            case Fayde.Media.AlignmentY.Bottom:
            default:
                dy = height - (scale * sh);
                break;
        }
        var m = mat3.createScale(scale, scale);
        mat3.translate(m, dx, dy);
        return m;
    };
    Image.Instance._CalculateRenderMetrics = function (source) {
        var stretch = this.Stretch;
        var specified = size.fromRaw(this.ActualWidth, this.ActualHeight);
        var stretched = this._ApplySizeConstraints(size.clone(specified));
        var adjust = !size.isEqual(specified, this._RenderSize);

        var pixelWidth = source.PixelWidth;
        var pixelHeight = source.PixelHeight;
        if (pixelWidth === 0 || pixelHeight === 0)
            return null;

        if (stretch !== Fayde.Media.Stretch.UniformToFill)
            size.min(specified, stretched);

        var paint = rect.fromSize(specified);
        var image = new rect();
        image.Width = pixelWidth;
        image.Height = pixelHeight;

        if (stretch === Fayde.Media.Stretch.None)
            rect.union(paint, image);

        var matrix = computeMatrix(paint.Width, paint.Height, image.Width, image.Height,
            stretch, Fayde.Media.AlignmentX.Center, Fayde.Media.AlignmentY.Center);

        if (adjust) {
            this._MeasureOverride(specified);
            rect.set(paint,
                (stretched.Width - specified.Width) * 0.5,
                (stretched.Height - specified.Height) * 0.5,
                specified.Width,
                specified.Height);
        }

        var overlap = RectOverlap.In;
        if (stretch === Fayde.Media.Stretch.UniformToFill || adjust) {
            var bounds = rect.clone(paint);
            rect.roundOut(bounds);
            var box = rect.clone(image);
            rect.transform(box, matrix);
            rect.roundIn(box);
            overlap = rect.rectIn(bounds, box);
        }

        return {
            Matrix: matrix,
            Overlap: overlap
        };
    };

    //#region Property Changed

    //#if !ENABLE_CANVAS
    if (!Fayde.IsCanvasEnabled) {
        Image.Instance._OnPropertyChanged = function (args, error) {
            if (args.Property.OwnerType !== Image) {
                this._OnPropertyChanged$FrameworkElement(args, error);
                return;
            }

            var ivprop = false;
            if (args.Property._ID === Image.SourceProperty._ID) {
                var oldBmpSrc = Nullstone.As(args.OldValue, Fayde.Media.Imaging.BitmapSource);
                if (oldBmpSrc) {
                    oldBmpSrc._ErroredCallback = null;
                    oldBmpSrc._LoadedCallback = null;
                }
                var newBmpSrc = Nullstone.As(args.NewValue, Fayde.Media.Imaging.BitmapSource);
                if (newBmpSrc) {
                    var that = this;
                    newBmpSrc._ErroredCallback = function () { that.ImageFailed.Raise(that, new EventArgs()); };
                    newBmpSrc._LoadedCallback = function () {
                        Surface._SizingAdjustments[that._ID] = that;
                        that.ImageOpened.Raise(that, new EventArgs());
                    };
                }
                ivprop = true;
            }
            if (ivprop)
                this.InvalidateProperty(args.Property, args.OldValue, args.NewValue);
            this.PropertyChanged.Raise(this, args);
        };
        Image.Instance._OnSubPropertyChanged = function (propd, sender, args) {
            if (propd && (propd._ID === Image.SourceProperty._ID)) {
                this.InvalidateProperty(propd, undefined, undefined);
                return;
            }
        };
    }
    //#else
    if (Fayde.IsCanvasEnabled) {
        Image.Instance._OnPropertyChanged = function (args, error) {
            if (args.Property.OwnerType !== Image) {
                this._OnPropertyChanged$FrameworkElement(args, error);
                return;
            }

            if (args.Property._ID === Image.SourceProperty._ID) {
                var oldBmpSrc = Nullstone.As(args.OldValue, Fayde.Media.Imaging.BitmapSource);
                if (oldBmpSrc) {
                    oldBmpSrc._ErroredCallback = null;
                    oldBmpSrc._LoadedCallback = null;
                }
                var newBmpSrc = Nullstone.As(args.NewValue, Fayde.Media.Imaging.BitmapSource);
                if (newBmpSrc) {
                    var that = this;
                    newBmpSrc._ErroredCallback = function () { that.ImageFailed.Raise(that, new EventArgs()); };
                    newBmpSrc._LoadedCallback = function () { that.ImageOpened.Raise(that, new EventArgs()); };
                } else {
                    this._UpdateBounds();
                    this._Invalidate();
                }
                this._InvalidateMeasure();
            }
            this.PropertyChanged.Raise(this, args);
        };
        Image.Instance._OnSubPropertyChanged = function (propd, sender, args) {
            if (propd && (propd._ID === Image.SourceProperty._ID)) {
                this._InvalidateMeasure();
                this._Invalidate();
                return;
            }
        };
    }
    //#endif

    //#endregion

    //#if !ENABLE_CANVAS
    if (!Fayde.IsCanvasEnabled) {
        Image.Instance.CreateHtmlObjectImpl = function () {
            var rootEl = document.createElement("div");
            rootEl.appendChild(document.createElement("div"));
            this.InitializeHtml(rootEl);
            var that = this;
            window.addEventListener("resize", function (e) { that._HandleResizeStretch(e); }, false);
            return rootEl;
        };
        var applyImage = function (rootEl, parentIsFixedWidth, parentIsFixedHeight, source, stretch) {
            var imgEl = rootEl.firstChild;
            //if (!parentIsFixedHeight && !parentIsFixedWidth) {
            //    stretch = Stretch.None;
            //}
            imgEl.style.backgroundImage = "url('" + source._Image.src + "')";
            imgEl.style.backgroundRepeat = "no-repeat";
            switch (stretch) {
                case Fayde.Media.Stretch.None:
                    //var img = imgEl.appendChild(document.createElement("img"));
                    //img.src = source._Image.src;
                    imgEl.style.backgroundPosition = "center";
                    break;
                case Fayde.Media.Stretch.Fill:
                    imgEl.style.backgroundSize = "100% 100%";
                    break;
                case Fayde.Media.Stretch.Uniform:
                    imgEl.style.backgroundSize = "contain";
                    imgEl.style.backgroundPosition = "center";
                    break;
                case Fayde.Media.Stretch.UniformToFill:
                    imgEl.style.backgroundSize = "cover";
                    imgEl.style.backgroundPosition = "left top";
                    break;
            }
        };
        Image.Instance.ApplyHtmlChanges = function (invalidations) {
            var imageChecks = [Image.StretchProperty, Image.SourceProperty];
            for (var i = 0; i < imageChecks.length; i++) {
                if (invalidations[imageChecks[i]._ID]) {
                    applyImage(this.GetRootHtmlElement(), this.GetParentIsFixedWidth(), this.GetParentIsFixedHeight(), this.Source, this.Stretch);
                    break;
                }
            }
            this.ApplyHtmlChanges$FrameworkElement(invalidations);
        };

        Image.Instance._HandleResizeStretch = function (e) {
            var isFixedWidth = this.GetIsFixedWidth();
            var isFixedHeight = this.GetIsFixedHeight();
            if ((isFixedWidth && !isFixedHeight) || (!isFixedWidth && isFixedHeight))
                Surface._SizingAdjustments[this._ID] = this;
        };
        Image.Instance.FindAndSetAdjustedHeight = function () {
            if (this.GetIsFixedHeight() || !this.GetIsFixedWidth())
                return this.FindAndSetAdjustedHeight$FrameworkElement();

            var isNoneStretch = this.Stretch === Fayde.Media.Stretch.None;
            var src = this.Source;
            if (!src || src.PixelWidth === 0 || src.PixelHeight === 0)
                return this.FindAndSetAdjustedHeight$FrameworkElement();

            var aspectRatio = src.PixelWidth / src.PixelHeight;

            var parent = this.GetVisualParent();
            var parentWidth = parent.GetContentHtmlElement().offsetWidth;

            var result = parentWidth / aspectRatio;
            this.GetContentHtmlElement().style.height = result + "px";
            result = this.CalculateOuterHeight(result);
            delete Surface._SizingAdjustments[this._ID];
            return result;
        };
        Image.Instance.FindAndSetAdjustedWidth = function () {
            if (this.GetIsFixedWidth() || !this.GetIsFixedHeight())
                return this.FindAndSetAdjustedWidth$FrameworkElement();

            var isNoneStretch = this.Stretch === Fayde.Media.Stretch.None;
            var src = this.Source;
            if (!src || src.PixelWidth === 0 || src.PixelHeight === 0)
                return this.FindAndSetAdjustedHeight$FrameworkElement();

            var aspectRatio = src.PixelWidth / src.PixelHeight;

            var parent = this.GetVisualParent();
            var parentHeight = parent.GetContentHtmlElement().offsetHeight;

            var result = parentHeight * aspectRatio;
            this.GetContentHtmlElement().style.width = result + "px";
            result = this.CalculateOuterWidth(result);
            delete Surface._SizingAdjustments[this._ID];
            return result;
        };
    }
    //#endif

    namespace.Image = Nullstone.FinishCreate(Image);
})(Nullstone.Namespace("Fayde.Controls"));