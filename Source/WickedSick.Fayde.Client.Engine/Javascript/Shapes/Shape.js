﻿/// <reference path="../Core/FrameworkElement.js"/>
/// CODE
/// <reference path="../Media/Enums.js"/>
/// <reference path="../Engine/RenderContext.js"/>
/// <reference path="Enums.js"/>
/// <reference path="DoubleCollection.js"/>
/// CODE
/// <reference path="ShapeMetrics.js"/>

(function (namespace) {
    var Shape = Nullstone.Create("Shape", Fayde.FrameworkElement);

    Shape.Instance.Init = function () {
        this.Init$FrameworkElement();
        this._ShapeFlags = 0;
        this._StretchXform = mat3.identity();
        this._NaturalBounds = new rect();
    };
    Shape.Instance.InitSpecific = function () {
        this._Metrics = new Fayde.Shapes.ShapeMetrics();
    };

    //#region Properties

    Shape.FillProperty = DependencyProperty.Register("Fill", function () { return Fayde.Media.Brush; }, Shape);
    http://msdn.microsoft.com/en-us/library/system.windows.shapes.shape.stretch(v=vs.95).aspx
    Shape.StretchProperty = DependencyProperty.Register("Stretch", function () { return new Enum(Fayde.Media.Stretch); }, Shape, Fayde.Media.Stretch.None);
    Shape.StrokeProperty = DependencyProperty.Register("Stroke", function () { return Fayde.Media.Brush; }, Shape);
    Shape.StrokeThicknessProperty = DependencyProperty.Register("StrokeThickness", function () { return Number; }, Shape, 1.0);
    Shape.StrokeDashArrayProperty = DependencyProperty.Register("StrokeDashArray", function () { return namespace.DoubleCollection; }, Shape);
    Shape.StrokeDashCapProperty = DependencyProperty.Register("StrokeDashCap", function () { return new Enum(namespace.PenLineCap); }, Shape, namespace.PenLineCap.Flat);
    Shape.StrokeDashOffsetProperty = DependencyProperty.Register("StrokeDashOffset", function () { return Number; }, Shape, 0.0);
    Shape.StrokeEndLineCapProperty = DependencyProperty.Register("StrokeEndLineCap", function () { return new Enum(namespace.PenLineCap); }, Shape, namespace.PenLineCap.Flat);
    Shape.StrokeLineJoinProperty = DependencyProperty.Register("StrokeLineJoin", function () { return new Enum(namespace.PenLineJoin); }, Shape, namespace.PenLineJoin.Miter);
    Shape.StrokeMiterLimitProperty = DependencyProperty.Register("StrokeMiterLimit", function () { return Number; }, Shape, 10.0);
    Shape.StrokeStartLineCapProperty = DependencyProperty.Register("StrokeStartLineCap", function () { return new Enum(namespace.PenLineCap); }, Shape, namespace.PenLineCap.Flat);

    Nullstone.AutoProperties(Shape, [
        Shape.FillProperty,
        Shape.StretchProperty,
        Shape.StrokeProperty,
        Shape.StrokeThicknessProperty,
        Shape.StrokeDashArrayProperty,
        Shape.StrokeDashCapProperty,
        Shape.StrokeDashOffsetProperty,
        Shape.StrokeEndLineCapProperty,
        Shape.StrokeLineJoinProperty,
        Shape.StrokeMiterLimitProperty,
        Shape.StrokeStartLineCapProperty
    ]);

    //#endregion

    //#region Helpers

    Shape.Instance._IsEmpty = function () { return this._ShapeFlags & namespace.ShapeFlags.Empty; };
    Shape.Instance._IsNormal = function () { return this._ShapeFlags & namespace.ShapeFlags.Normal; };
    Shape.Instance._IsDegenerate = function () { return this._ShapeFlags & namespace.ShapeFlags.Degenerate; };
    Shape.Instance._HasRadii = function () { return this._ShapeFlags & namespace.ShapeFlags.Radii; };
    Shape.Instance._SetShapeFlags = function (sf) { this._ShapeFlags = sf; };
    Shape.Instance._AddShapeFlags = function (sf) { this._ShapeFlags |= sf; };

    Shape.Instance._IsStroked = function () { return this._Stroke != null; };
    Shape.Instance._IsFilled = function () { return this._Fill != null; };
    Shape.Instance._CanFill = function () { return false; };
    Shape.Instance._CanFindElement = function () { return this._IsFilled() || this._IsStroked(); };

    Shape.Instance._GetFillRule = function () {
        return namespace.FillRule.NonZero;
    };

    //#endregion

    //#region Measure/Arrange

    Shape.Instance._MeasureOverride = function (availableSize, pass, error) {
        /// <param name="availableSize" type="size"></param>
        var shapeBounds = this._GetNaturalBounds();
        if (!shapeBounds)
            return new size();
        var sx = 0.0;
        var sy = 0.0;

        var desired;
        if (this instanceof namespace.Rectangle || this instanceof namespace.Ellipse)
            desired = new size();
        else
            desired = size.clone(availableSize);

        var stretch = this.Stretch;
        if (stretch === Fayde.Media.Stretch.None) {
            return size.fromRaw(shapeBounds.X + shapeBounds.Width, shapeBounds.Y + shapeBounds.Height);
        }

        if (!isFinite(availableSize.Width))
            desired.Width = shapeBounds.Width;
        if (!isFinite(availableSize.Height))
            desired.Height = shapeBounds.Height;

        if (shapeBounds.Width > 0)
            sx = desired.Width / shapeBounds.Width;
        if (shapeBounds.Height > 0)
            sy = desired.Height / shapeBounds.Height;

        if (!isFinite(availableSize.Width))
            sx = sy;
        if (!isFinite(availableSize.Height))
            sy = sx;

        switch (stretch) {
            case Fayde.Media.Stretch.Uniform:
                sx = sy = Math.min(sx, sy);
                break;
            case Fayde.Media.Stretch.UniformToFill:
                sx = sy = Math.max(sx, sy);
                break;
            case Fayde.Media.Stretch.Fill:
                if (!isFinite(availableSize.Width))
                    sx = 1.0;
                if (!isFinite(availableSize.Height))
                    sy = 1.0;
                break;
            default:
                break;
        }

        desired.Width = shapeBounds.Width * sx;
        desired.Height = shapeBounds.Height * sy;
        return desired;
    };
    Shape.Instance._ArrangeOverride = function (finalSize, pass, error) {
        /// <param name="finalSize" type="size"></param>
        var sx = 1.0;
        var sy = 1.0;

        var shapeBounds = this._GetNaturalBounds();
        if (!shapeBounds)
            return new size();

        this._InvalidateStretch();

        var arranged;
        var stretch = this.Stretch;
        if (stretch === Fayde.Media.Stretch.None) {
            arranged = size.fromRaw(Math.max(finalSize.Width, shapeBounds.X + shapeBounds.Width), Math.max(finalSize.Height, shapeBounds.Y + shapeBounds.Height));
        } else {
            arranged = size.clone(finalSize);
        }

        if (shapeBounds.Width === 0)
            shapeBounds.Width = arranged.Width;
        if (shapeBounds.Height === 0)
            shapeBounds.Height = arranged.Height;

        if (shapeBounds.Width !== arranged.Width)
            sx = arranged.Width / shapeBounds.Width;
        if (shapeBounds.Height !== arranged.Height)
            sy = arranged.Height / shapeBounds.Height;

        switch (stretch) {
            case Fayde.Media.Stretch.Uniform:
                sx = sy = Math.min(sx, sy);
                break;
            case Fayde.Media.Stretch.UniformToFill:
                sx = sy = Math.max(sx, sy);
                break;
            default:
                break;
        }

        arranged.Width = shapeBounds.Width * sx;
        arranged.Height = shapeBounds.Height * sy;
        return arranged;
    };

    //#endregion

    //#region Invalidation

    Shape.Instance._InvalidateNaturalBounds = function () {
        rect.clear(this._NaturalBounds);
        this._InvalidateStretch();
    };
    Shape.Instance._InvalidateStretch = function () {
        this._Metrics.UpdateStretch();
        this._StretchXform = mat3.identity();
        this._InvalidatePathCache();
    };
    Shape.Instance._InvalidatePathCache = function (free) {
        this._Path = null;
        if (!free) {
            this._UpdateBounds(true);
        }
        this._InvalidateSurfaceCache();
    };
    Shape.Instance._InvalidateSurfaceCache = function () {
        //WTF?
    };
    Shape.Instance._InvalidateStrokeBounds = function () {
        this._InvalidateFillBounds();
    };
    Shape.Instance._InvalidateFillBounds = function () {
        this._InvalidateNaturalBounds();
    };
    Shape.Instance._CacheInvalidateHint = function () {
        this._InvalidatePathCache();
    };

    //#endregion

    //#region Sizes

    Shape.Instance._GetStretchExtents = function () {
        return this._Metrics.GetStretchExtents(this);
    };
    Shape.Instance._ComputeActualSize = function () {
        var desired = this._ComputeActualSize$FrameworkElement();
        var shapeBounds = this._GetNaturalBounds();
        var sx = 1.0;
        var sy = 1.0;
        var parent = this.GetVisualParent();

        var metrics = this._UpdateMetrics;
        if (parent != null && !(parent instanceof Fayde.Controls.Canvas)) {
            if (metrics.PreviousConstraint !== undefined || Fayde.LayoutInformation.GetLayoutSlot(this, true) !== undefined) {
                return desired;
            }
        }

        if (!this._IsAttached)
            return desired;

        if (shapeBounds.Width <= 0 && shapeBounds.Height <= 0)
            return desired;

        var stretch = this.Stretch;
        if (stretch === Fayde.Media.Stretch.None && shapeBounds.Width > 0 && shapeBounds.Height > 0)
            return size.fromRect(shapeBounds);

        if (!isFinite(desired.Width))
            desired.Width = shapeBounds.Width;
        if (!isFinite(desired.Height))
            desired.Height = shapeBounds.Height;

        if (shapeBounds.Width > 0)
            sx = desired.Width / shapeBounds.Width;
        if (shapeBounds.Height > 0)
            sy = desired.Height / shapeBounds.Height;

        switch (stretch) {
            case Fayde.Media.Stretch.Uniform:
                sx = sy = Math.min(sx, sy);
                break;
            case Fayde.Media.Stretch.UniformToFill:
                sx = sy = Math.max(sx, sy);
                break;
            default:
                break;
        }

        desired.Width = Math.min(desired.Width, shapeBounds.Width * sx);
        desired.Height = Math.min(desired.Height, shapeBounds.Height * sy);
        return desired;
    };
    Shape.Instance._GetSizeForBrush = function (ctx) {
        return size.fromRect(this._GetStretchExtents());
    };

    //#endregion

    //#region Bounds

    Shape.Instance._GetNaturalBounds = function () {
        if (!this._NaturalBounds)
            return;
        if (rect.isEmpty(this._NaturalBounds))
            this._NaturalBounds = this._ComputeShapeBoundsImpl(false, null);
        return this._NaturalBounds;
    };
    Shape.Instance._ComputeStretchBounds = function () {
        var shapeBounds = this._GetNaturalBounds();
        if (!shapeBounds || shapeBounds.Width <= 0.0 || shapeBounds.Height <= 0.0) {
            this._SetShapeFlags(namespace.ShapeFlags.Empty);
            return new rect();
        }

        var specified = size.fromRaw(this.Width, this.Height);
        var autoDim = isNaN(specified.Width);
        var framework = size.fromRaw(this.ActualWidth, this.ActualHeight);

        if (specified.Width <= 0.0 || specified.Height <= 0.0) {
            this._SetShapeFlags(namespace.ShapeFlags.Empty);
            return new rect();
        }

        var visualParent = this.GetVisualParent();
        if (visualParent != null && visualParent instanceof Fayde.Controls.Canvas) {
            framework.Width = framework.Width === 0.0 ? shapeBounds.Width : framework.Width;
            framework.Height = framework.Height === 0.0 ? shapeBounds.Height : framework.Height;
            if (!isNaN(specified.Width))
                framework.Width = specified.Width;
            if (!isNaN(specified.Height))
                framework.Height = specified.Height;

        } else if (!this._UpdateMetrics.PreviousConstraint) {
            framework.Width = framework.Width === 0.0 ? shapeBounds.Width : framework.Width;
            framework.Height = framework.Height === 0.0 ? shapeBounds.Height : framework.Height;
        }

        var stretch = this.Stretch;
        if (stretch === Fayde.Media.Stretch.None) {
            rect.transform(shapeBounds, this._StretchXform);
            return shapeBounds;
        }

        if (framework.Width === 0.0 || framework.Height === 0.0) {
            this._SetShapeFlags(namespace.ShapeFlags.Empty);
            return new rect();
        }

        var logicalBounds = this._ComputeShapeBoundsImpl(true, null);

        var adjX = logicalBounds.Width !== 0.0;
        var adjY = logicalBounds.Height !== 0.0;

        var diffX = shapeBounds.Width - logicalBounds.Width;
        var diffY = shapeBounds.Height - logicalBounds.Height;
        var sw = adjX ? (framework.Width - diffX) / logicalBounds.Width : 1.0;
        var sh = adjY ? (framework.Height - diffY) / logicalBounds.Height : 1.0;

        var center = false;
        switch (stretch) {
            case Fayde.Media.Stretch.Fill:
                center = true;
                break;
            case Fayde.Media.Stretch.Uniform:
                sw = sh = (sw < sh) ? sw : sh;
                center = true;
                break;
            case Fayde.Media.Stretch.UniformToFill:
                sw = sh = (sw > sh) ? sw : sh;
                break;
        }

        if ((adjX && Shape.IsSignificant(sw - 1, shapeBounds.Width)) || (adjY && Shape.IsSignificant(sh - 1, shapeBounds.Height))) {
            var temp = mat3.createScale(adjX ? sw : 1.0, adjY ? sh : 1.0);
            var stretchBounds = this._ComputeShapeBoundsImpl(false, temp);
            if (stretchBounds.Width !== shapeBounds.Width && stretchBounds.Height !== shapeBounds.Height) {
                sw *= adjX ? (framework.Width - stretchBounds.Width + logicalBounds.Width * sw) / (logicalBounds.Width * sw) : 1.0;
                sh *= adjY ? (framework.Height - stretchBounds.Height + logicalBounds.Height * sh) / (logicalBounds.Height * sh) : 1.0;
                switch (stretch) {
                    case Fayde.Media.Stretch.Uniform:
                        sw = sh = (sw < sh) ? sw : sh;
                        break;
                    case Fayde.Media.Stretch.UniformToFill:
                        sw = sh = (sw > sh) ? sw : sh;
                        break;
                }
            }
        }

        var x = (!autoDim || adjX) ? shapeBounds.X : 0;
        var y = (!autoDim || adjY) ? shapeBounds.Y : 0;

        var st = this._StretchXform;
        if (!(this instanceof namespace.Line) || !autoDim)
            mat3.translate(st, -x, -y);
        mat3.translate(st,
            adjX ? -shapeBounds.Width * 0.5 : 0.0,
            adjY ? -shapeBounds.Height * 0.5 : 0.0);
        mat3.scale(st,
            adjX ? sw : 1.0,
            adjY ? sh : 1.0);
        if (center) {
            mat3.translate(st,
                adjX ? framework.Width * 0.5 : 0,
                adjY ? framework.Height * 0.5 : 0);
        } else {
            mat3.translate(st,
                adjX ? (logicalBounds.Width * sw + diffX) * 0.5 : 0,
                adjY ? (logicalBounds.Height * sh + diffY) * 0.5 : 0);
        }
        this._StretchXform = st;

        rect.transform(shapeBounds, this._StretchXform);
        return shapeBounds;
    };
    Shape.IsSignificant = function (dx, x) {
        return Math.abs(x) < 0.000019 && (Math.abs(dx) * x - x) > 1.0;
    };
    Shape.Instance._ComputeShapeBounds = function (logical) {
        this._ComputeShapeBoundsImpl(logical, null);
    };
    Shape.Instance._ComputeShapeBoundsImpl = function (logical, matrix) {
        var thickness = (logical || !this._IsStroked()) ? 0.0 : this.StrokeThickness;

        if (this._Path == null)
            this._BuildPath();

        if (this._IsEmpty())
            return new rect();

        if (logical) {
            //TODO: measure path extents
        } else if (thickness > 0) {
            //TODO: measure stroke extents
        } else {
            //TODO: measure fill extents
        }
        NotImplemented("Shape._ComputeShapeBoundsImpl");
        return new rect();
    };

    //#endregion

    //#region Hit Testing

    Shape.Instance._InsideObject = function (ctx, x, y) {
        if (!this._InsideLayoutClip(x, y))
            return false;
        if (!this._InsideClip(ctx, x, y))
            return false;
        var p = new Point(x, y);
        this._TransformPoint(p);
        x = p.X;
        y = p.Y;
        if (!rect.containsPointXY(this._GetStretchExtents(), x, y))
            return false;
        return this._InsideShape(ctx, x, y);
    };

    Shape.Instance._InsideShape = function (ctx, x, y) {
        /// <param name="ctx" type="_RenderContext"></param>
        if (this._IsEmpty())
            return false;
        var ret = false;
        var area = this._GetStretchExtents();
        ctx.Save();
        ctx.PreTransform(this._StretchXform);
        if (this._Fill != null) {
            this._DrawPath(ctx);
            if (ctx.IsPointInPath(new Point(x, y)))
                ret = true;
        }
        if (!ret && this._Stroke != null) {
            NotImplemented("Shape._InsideShape-Stroke");
        }
        ctx.Restore();
        return ret;
    };

    //#endregion

    Shape.Instance._Render = function (ctx, region) {
        /// <param name="ctx" type="_RenderContext"></param>
        if (this._IsEmpty())
            return;
        var area = this._GetStretchExtents();
        ctx.Save();
        ctx.PreTransform(this._StretchXform);
        this._DrawPath(ctx);
        if (this._Fill != null)
            ctx.Fill(this._Fill, area);
        if (this._Stroke != null)
            ctx.Stroke(this._Stroke, this.StrokeThickness, area);
        ctx.Restore();
    };

    Shape.Instance._BuildPath = function () { };
    Shape.Instance._DrawPath = function (ctx) {
        /// <param name="ctx" type="_RenderContext"></param>
        this._Path.Draw(ctx);
    };

    //#region Property Changed

    //#if !ENABLE_CANVAS
    if (!Fayde.IsCanvasEnabled) {
        Shape.Instance._OnPropertyChanged = function (args, error) {
            if (args.Property.OwnerType !== Shape) {
                if (args.Property._ID === Fayde.FrameworkElement.HeightProperty || args.Property._ID === Fayde.FrameworkElement.WidthProperty) {
                    this.InvalidateProperty(Shape.StretchProperty);
                }
                this._OnPropertyChanged$FrameworkElement(args, error);
                return;
            }
            this.InvalidateProperty(args.Property, args.OldValue, args.NewValue);
            this.PropertyChanged.Raise(this, args);
        };
        Shape.Instance._OnSubPropertyChanged = function (propd, sender, args) {
            if (propd != null && (propd._ID === Shape.FillProperty._ID || propd._ID === Shape.StrokeProperty._ID)) {
                this.InvalidateProperty(propd);
            } else {
                this._OnSubPropertyChanged$FrameworkElement(propd, sender, args);
            }
        };
    }
    //#else
    if (Fayde.IsCanvasEnabled) {
        Shape.Instance._OnPropertyChanged = function (args, error) {
            if (args.Property.OwnerType !== Shape) {
                if (args.Property._ID === Fayde.FrameworkElement.HeightProperty || args.Property._ID === Fayde.FrameworkElement.WidthProperty) {
                    this._InvalidateStretch();
                }
                this._OnPropertyChanged$FrameworkElement(args, error);
                return;
            }

            if (args.Property._ID === Shape.StretchProperty._ID) {
                this._InvalidateMeasure();
                this._InvalidateStretch();
            } else if (args.Property._ID === Shape.StrokeProperty._ID) {
                var newStroke = Nullstone.As(args.NewValue, Fayde.Media.Brush);
                if (this._Stroke == null || newStroke == null) {
                    this._InvalidateStrokeBounds();
                } else {
                    this._InvalidateSurfaceCache();
                }
                this._Stroke = newStroke;
            } else if (args.Property._ID === Shape.FillProperty._ID) {
                var newFill = Nullstone.As(args.NewValue, Fayde.Media.Brush);
                if (this._Fill == null || newFill == null) {
                    this._InvalidateFillBounds();
                } else {
                    this._InvalidateSurfaceCache();
                }
                this._Fill = newFill;
            } else if (args.Property._ID === Shape.StrokeThicknessProperty._ID) {
                this._InvalidateStrokeBounds();
            } else if (args.Property._ID === Shape.StrokeDashCapProperty._ID
                || args.Property._ID === Shape.StrokeDashArrayProperty._ID
                || args.Property._ID === Shape.StrokeEndLineCapProperty._ID
                || args.Property._ID === Shape.StrokeLineJoinProperty._ID
                || args.Property._ID === Shape.StrokeMiterLimitProperty._ID
                || args.Property._ID === Shape.StrokeStartLineCapProperty._ID) {
                this._InvalidateStrokeBounds();
            }

            this._Invalidate();
            this.PropertyChanged.Raise(this, args);
        };
        Shape.Instance._OnSubPropertyChanged = function (propd, sender, args) {
            if (propd != null && (propd._ID === Shape.FillProperty._ID || propd._ID === Shape.StrokeProperty._ID)) {
                this._Invalidate();
                this._InvalidateSurfaceCache();
            } else {
                this._OnSubPropertyChanged$FrameworkElement(propd, sender, args);
            }
        };
    }
    //#endif

    //#endregion

    //#if !ENABLE_CANVAS
    if (!Fayde.IsCanvasEnabled) {
        Shape.Instance.CreateHtmlObjectImpl = function () {
            var rootEl = this.CreateHtmlObjectImpl$FrameworkElement();
            var contentEl = rootEl.firstChild;
            var svg = this.GetSvg();
            svg.appendChild(this.GetSvgShape());
            contentEl.appendChild(svg);
            return rootEl;
        };
        Shape.Instance.CreateSvg = function () {
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.style.position = "absolute";
            svg.style.width = "100%";
            svg.style.height = "100%";
            var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svg.appendChild(defs);
            return svg;
        };
        Shape.Instance.GetSvg = function () {
            if (!this._Svg)
                this._Svg = this.CreateSvg();
            return this._Svg;
        };
        Shape.Instance.CreateSvgShape = function () { };
        Shape.Instance.GetSvgShape = function () {
            if (!this._Shape) {
                this._Shape = this.CreateSvgShape();
                this._Shape.setAttribute("width", "100%");
                this._Shape.setAttribute("height", "100%");
            }
            return this._Shape;
        };

        Shape.Instance.ApplySizingMargin = function (rootEl, subEl, horizontalLayoutType, verticalLayoutType) {
            var margin = this.Margin;
            var left = margin.Left;
            if (isNaN(left)) left = 0;
            var top = margin.Top;
            if (isNaN(top)) top = 0;
            var right = margin.Right;
            if (isNaN(right)) right = 0;
            var bottom = margin.Bottom;
            if (isNaN(bottom)) bottom = 0;

            var half = this.StrokeThickness / 2.0;
            left += half;
            top += half;
            right += half;
            bottom += half;

            if (horizontalLayoutType === HorizontalLayoutType.Stretch) {
                subEl.style.left = left + "px";
                subEl.style.right = right + "px";
            } else {
                rootEl.style.marginLeft = left + "px";
                rootEl.style.marginRight = right + "px";
            }
            if (verticalLayoutType === VerticalLayoutType.Stretch) {
                subEl.style.top = top + "px";
                subEl.style.bottom = bottom + "px";
            } else {
                rootEl.style.marginTop = top + "px";
                rootEl.style.marginBottom = bottom + "px";
            }
        };
        Shape.Instance.ApplySizingSizes = function (rootEl, subEl) {
            if (!isNaN(this.Width)) {
                //explicit width
                rootEl.style.width = this.Width + "px";
            } else {
                rootEl.style.width = "100%";
                //subEl.style.width = "100%";
            }
            if (!isNaN(this.Height)) {
                //explicit height
                rootEl.style.height = this.Height + "px";
            } else {
                rootEl.style.height = "100%";
                //subEl.style.height = "100%";
            }

            //set max width and max height on root element
            rootEl.style.maxHeight = this.MaxHeight + "px";
            rootEl.style.maxWidth = this.MaxWidth + "px";
        };

        Shape.Instance.CalculateIsFixedWidth = function () {
            return !isNaN(this.Width);
        };
        Shape.Instance.CalculateIsFixedHeight = function () {
            return !isNaN(this.Height);
        };

        /*
        Shape.Instance.FindAndSetAdjustedWidth = function () {
            if (this.GetIsFixedWidth())
                return this.FindAndSetAdjustedWidth$FrameworkElement();
            if (!this.GetIsFixedHeight())
                return this.FindAndSetAdjustedWidth$FrameworkElement();
            delete Surface._SizingAdjustments[this._ID];
            var height = this.GetRootHtmlElement().offsetHeight;
            return height * this.GetAspectRatio();
        };
        Shape.Instance.FindAndSetAdjustedHeight = function () {
            if (this.GetIsFixedHeight())
                return this.FindAndSetAdjustedHeight$FrameworkElement();
            if (!this.GetIsFixedWidth())
                return this.FindAndSetAdjustedHeight$FrameworkElement();
            delete Surface._SizingAdjustments[this._ID];
            var width = this.GetRootHtmlElement().offsetWidth;
            return width / this.GetAspectRatio();
        };
        Shape.Instance.GetAspectRatio = function () {
            var shape = this._Shape;
            var bounds = shape.getBBox();
            return bounds.width / bounds.height;
        };
        */

        var serializeDashArray = function (collection) {
            var s = "";
            var len = collection.GetCount();
            for (var i = 0; i < len; i++) {
                if (s)
                    s += ", ";
                s = collection.GetValueAt(i).toString();
            }
            return s;
        };
        Shape.Instance.ApplyHtmlChange = function (change) {
            var propd = change.Property;
            if (propd.OwnerType !== Shape) {
                this.ApplyHtmlChange$FrameworkElement(change);
                return;
            }

            var shape = this.GetSvgShape();
            if (propd._ID === Shape.StretchProperty._ID) {
                var stretch = change.NewValue;
                if (!stretch)
                    stretch = this.Stretch;
                //TODO: Stretch property
            } else if (propd._ID === Shape.FillProperty._ID) {
                var fill = change.NewValue;
                if (!fill)
                    fill = this.Fill;
                this.ChangeFillOnSvg(fill);
            } else if (propd._ID === Shape.StrokeProperty._ID) {
                var stroke = change.NewValue;
                if (!stroke)
                    stroke = this.Stroke;
                this.ChangeStrokeOnSvg(stroke);
            } else if (propd._ID === Shape.StrokeThicknessProperty._ID) {
                shape.setAttribute("stroke-width", change.NewValue);
            } else if (propd._ID === Shape.StrokeDashArrayProperty._ID) {
                shape.setAttribute("stroke-dasharray", serializeDashArray(change.NewValue));
            } else if (propd._ID === Shape.StrokeDashOffsetProperty._ID) {
                shape.setAttribute("stroke-dashoffset", change.NewValue);
            } else if (propd._ID === Shape.StrokeLineJoinProperty._ID) {
                switch (change.NewValue) {
                    case Miter:
                        shape.setAttribute("stroke-linejoin", "miter");
                        break;
                    case Bevel:
                        shape.setAttribute("stroke-linejoin", "bevel");
                        break;
                    case Round:
                        shape.setAttribute("stroke-linejoin", "round");
                        break;
                }
            } else if (propd._ID === Shape.StrokeMiterLimitProperty._ID) {
                shape.setAttribute("stroke-miterlimit", change.NewValue);
            }
        };
        Shape.Instance.ChangeFillOnSvg = function (newFill) {
            var svg = this.GetSvg();
            var defs = svg.firstChild;
            var fill = this._ExistingFill;
            if (fill)
                defs.removeChild(fill);
            
            var shape = this.GetSvgShape();
            var svgBrush = newFill.CreateForSvg();
            var fillAttr = "";
            if (typeof svgBrush === "string") {
                fillAttr = svgBrush;
            } else {
                var id = "fillBrush" + newFill._ID.toString();
                svgBrush.id = id;
                this._ExistingFill = svgBrush;
                defs.appendChild(svgBrush);
                fillAttr = "url(#" + id + ")";
            }
            shape.setAttribute("fill", fillAttr);
        };
        Shape.Instance.ChangeStrokeOnSvg = function (newStroke) {
            var svg = this.GetSvg();
            var defs = svg.firstChild;
            var stroke = this._ExistingStroke;
            if (stroke)
                defs.removeChild(stroke);

            var shape = this.GetSvgShape();
            var svgBrush = newStroke.CreateForSvg();
            var strokeAttr = "";
            if (typeof svgBrush === "string") {
                strokeAttr = svgBrush;
            } else {
                var id = "strokeBrush" + newStroke._ID.toString();
                svgBrush.id = id;
                this._ExistingStroke = svgBrush;
                defs.appendChild(svgBrush);
                strokeAttr = "url(#" + id + ")";
            }
            shape.setAttribute("stroke", strokeAttr);
        };
    }
    //#endif

    namespace.Shape = Nullstone.FinishCreate(Shape);
})(Nullstone.Namespace("Fayde.Shapes"));