/// <reference path="../Runtime/Nullstone.js" />
/// <reference path="Panel.js"/>
/// CODE
/// <reference path="../Runtime/LinkedList.js"/>
/// <reference path="../Runtime/LinkedListNode.js"/>
/// <reference path="Enums.js"/>
/// <reference path="ColumnDefinition.js"/>
/// <reference path="RowDefinition.js"/>
/// <reference path="ColumnDefinitionCollection.js"/>
/// <reference path="RowDefinitionCollection.js"/>
/// <reference path="GridLength.js"/>
/// <reference path="../Core/Walkers.js"/>
/// <reference path="GridMetrics.js"/>

(function (namespace) {
    var _Segment = (function () {
        function _Segment(offered, min, max, unitType) {
            if (offered == null) offered = 0.0;
            if (min == null) min = 0.0;
            if (max == null) max = Number.POSITIVE_INFINITY;
            if (unitType == null) unitType = namespace.GridUnitType.Pixel;

            this._DesiredSize = 0;
            this._Min = min;
            this._Max = max;
            this._Stars = 0;
            this._Type = unitType;

            this._OfferedSize = this._Clamp(offered);
            this._OriginalSize = this._OfferedSize;
        }
        _Segment.prototype._SetOfferedToDesired = function () {
            this._OfferedSize = this._DesiredSize;
            return this._OfferedSize;
        };
        _Segment.prototype._SetDesiredToOffered = function () {
            this._DesiredSize = this._OfferedSize;
            return this._DesiredSize;
        };
        _Segment.prototype._Clamp = function (value) {
            if (value < this._Min)
                return this._Min;
            if (value > this._Max)
                return this._Max;
            return value;
        }
        _Segment.prototype.toString = function () {
            return this._OfferedSize.toString() + ";" + this._DesiredSize.toString();
        };
        return _Segment;
    })();
    var _GridNode = (function () {
        var _GridNode = Nullstone.Create("_GridNode", LinkedListNode, 4);
        _GridNode.Instance.Init = function (matrix, row, col, size) {
            this._Matrix = matrix;
            this._Row = row;
            this._Col = col;
            this._Size = size;
            this._Cell = this._Matrix == null ? null : this._Matrix[row][col];
        };
        return Nullstone.FinishCreate(_GridNode);
    })();
    var _GridWalker = (function () {
        var _GridWalker = Nullstone.Create("_GridWalker", undefined, 5);
        _GridWalker.Instance.Init = function (grid, rowMatrix, rowCount, colMatrix, colCount) {
            this._HasAutoAuto = false;
            this._HasStarAuto = false;
            this._HasAutoStar = false;

            var walker = Fayde._VisualTreeWalker.Logical(grid);
            var child;
            var up;
            while (child = walker.Step()) {
                up = child._UpdatePass;
                var starCol = false;
                var starRow = false;
                var autoCol = false;
                var autoRow = false;

                var col = Math.min(up.Grid.Column, colCount - 1);
                var row = Math.min(up.Grid.Row, rowCount - 1);
                var colspan = Math.min(up.Grid.ColumnSpan, colCount - col);
                var rowspan = Math.min(up.Grid.RowSpan, rowCount - row);

                for (var r = row; r < row + rowspan; r++) {
                    starRow |= rowMatrix[r][r].Type === namespace.GridUnitType.Star;
                    autoRow |= rowMatrix[r][r].Type === namespace.GridUnitType.Auto;
                }
                for (var c = col; c < col + colspan; c++) {
                    starCol |= colMatrix[c][c].Type === namespace.GridUnitType.Star;
                    autoCol |= colMatrix[c][c].Type === namespace.GridUnitType.Auto;
                }

                this._HasAutoAuto |= autoRow && autoCol && !starRow && !starCol;
                this._HasStarAuto |= starRow && autoCol;
                this._HasAutoStar |= autoRow && starCol;
            }
        };
        return Nullstone.FinishCreate(_GridWalker);
    })();


    var Grid = Nullstone.Create("Grid", namespace.Panel);

    Grid.Instance.Init = function () {
        this.Init$Panel();
        this._RowMatrix = null;
        this._ColMatrix = null;
    };

    Grid.Instance.InitSpecific = function () {
        this._Metrics = new Fayde.Controls.GridMetrics();
    };

    //#region Attached Dependency Properties

    Grid.ColumnProperty = DependencyProperty.RegisterAttached("Column", function () { return Number; }, Grid, 0, function (d, args) { d._UpdatePass.Grid.Column = args.NewValue; });
    Grid.GetColumn = function (d) {
        return d.$GetValue(Grid.ColumnProperty);
    };
    Grid.SetColumn = function (d, value) {
        d.$SetValue(Grid.ColumnProperty, value);
    };

    Grid.ColumnSpanProperty = DependencyProperty.RegisterAttached("ColumnSpan", function () { return Number; }, Grid, 1, function (d, args) { d._UpdatePass.Grid.ColumnSpan = args.NewValue; });
    Grid.GetColumnSpan = function (d) {
        return d.$GetValue(Grid.ColumnSpanProperty);
    };
    Grid.SetColumnSpan = function (d, value) {
        d.$SetValue(Grid.ColumnSpanProperty, value);
    };

    Grid.RowProperty = DependencyProperty.RegisterAttached("Row", function () { return Number; }, Grid, 0, function (d, args) { d._UpdatePass.Grid.Row = args.NewValue; });
    Grid.GetRow = function (d) {
        return d.$GetValue(Grid.RowProperty);
    };
    Grid.SetRow = function (d, value) {
        d.$SetValue(Grid.RowProperty, value);
    };

    Grid.RowSpanProperty = DependencyProperty.RegisterAttached("RowSpan", function () { return Number; }, Grid, 1, function (d, args) { d._UpdatePass.Grid.RowSpan = args.NewValue; });
    Grid.GetRowSpan = function (d) {
        return d.$GetValue(Grid.RowSpanProperty);
    };
    Grid.SetRowSpan = function (d, value) {
        d.$SetValue(Grid.RowSpanProperty, value);
    };

    //#endregion

    //#region Properties

    var colDefAutoCreater = {
        GetValue: function (propd, dobj) {
            var col = new namespace.ColumnDefinitionCollection();
            dobj._UpdatePass.Grid.ColumnDefinitions = col;
            return col;
        }
    };
    var rowDefAutoCreater = {
        GetValue: function (propd, dobj) {
            var col = new namespace.RowDefinitionCollection();
            dobj._UpdatePass.Grid.RowDefinitions = col;
            return col;
        }
    };
    Grid.ShowGridLinesProperty = DependencyProperty.Register("ShowGridLines", function () { return Boolean; }, Grid, false);
    Grid.ColumnDefinitionsProperty = DependencyProperty.RegisterFull("ColumnDefinitions", function () { return namespace.ColumnDefinitionCollection; }, Grid, undefined, function (d, args) { d._UpdatePass.Grid.ColumnDefinitions = args.NewValue; }, colDefAutoCreater);
    Grid.RowDefinitionsProperty = DependencyProperty.RegisterFull("RowDefinitions", function () { return namespace.RowDefinitionCollection; }, Grid, undefined, function (d, args) { d._UpdatePass.Grid.RowDefinitions = args.NewValue; }, rowDefAutoCreater);

    Nullstone.AutoProperties(Grid, [
        Grid.ShowGridLinesProperty,
        Grid.ColumnDefinitionsProperty,
        Grid.RowDefinitionsProperty
    ]);

    //#endregion

    //#region Measure/Arrange

    Grid.Instance._MeasureOverride = function (availableSize, pass, error) {
        //LayoutDebug(function () { return "Grid Measure Pass: " + this.__DebugToString() + " [" + availableSize.toString() + "]"; });
        var totalSize = size.clone(availableSize);
        var cols = pass.Grid.ColumnDefinitions;// this._GetColumnDefinitionsNoAutoCreate();
        var rows = pass.Grid.RowDefinitions;// this._GetRowDefinitionsNoAutoCreate();
        var colCount = cols ? cols.GetCount() : 0;
        var rowCount = rows ? rows.GetCount() : 0;
        var totalStars = new size();
        var emptyRows = rowCount === 0;
        var emptyCols = colCount === 0;
        var hasChildren = this.Children.GetCount() > 0;

        if (emptyRows) rowCount = 1;
        if (emptyCols) colCount = 1;

        this._CreateMatrices(rowCount, colCount);

        var i;
        var cell;
        if (emptyRows) {
            cell = new _Segment(0.0, 0, Number.POSITIVE_INFINITY, namespace.GridUnitType.Star);
            cell._Stars = 1.0;
            this._RowMatrix[0][0] = cell;
            totalStars.Height += 1.0;
        } else {
            for (i = 0; i < rowCount; i++) {
                var rowdef = rows.GetValueAt(i);
                var height = rowdef.Height;

                rowdef.$SetValueInternal(namespace.RowDefinition.ActualHeightProperty, Number.POSITIVE_INFINITY);
                cell = new _Segment(0.0, rowdef.MinHeight, rowdef.MaxHeight, height.Type);

                if (height.Type === namespace.GridUnitType.Pixel) {
                    cell._OfferedSize = cell._Clamp(height.Value);
                    rowdef.$SetValueInternal(namespace.RowDefinition.ActualHeightProperty, cell._SetDesiredToOffered());
                } else if (height.Type === namespace.GridUnitType.Star) {
                    cell._Stars = height.Value;
                    totalStars.Height += height.Value;
                } else if (height.Type === namespace.GridUnitType.Auto) {
                    cell._OfferedSize = cell._Clamp(0);
                    cell._SetDesiredToOffered();
                }

                this._RowMatrix[i][i] = cell;
            }
        }

        if (emptyCols) {
            cell = new _Segment(0.0, 0, Number.POSITIVE_INFINITY, namespace.GridUnitType.Star);
            cell._Stars = 1.0;
            this._ColMatrix[0][0] = cell;
            totalStars.Width += 1.0;
        } else {
            for (i = 0; i < colCount; i++) {
                var coldef = cols.GetValueAt(i);
                var width = coldef.Width;

                coldef.$SetValueInternal(namespace.ColumnDefinition.ActualWidthProperty, Number.POSITIVE_INFINITY);
                cell = new _Segment(0.0, coldef.MinWidth, coldef.MaxWidth, width.Type);

                if (width.Type === namespace.GridUnitType.Pixel) {
                    cell._OfferedSize = cell._Clamp(width.Value);
                    coldef.$SetValueInternal(namespace.ColumnDefinition.ActualWidthProperty, cell._SetDesiredToOffered());
                } else if (width.Type === namespace.GridUnitType.Star) {
                    cell._Stars = width.Value;
                    totalStars.Width += width.Value;
                } else if (width.Type === namespace.GridUnitType.Auto) {
                    cell._OfferedSize = cell._Clamp(0);
                    cell._SetDesiredToOffered();
                }

                this._ColMatrix[i][i] = cell;
            }
        }

        var sizes = new LinkedList();
        var separator = new _GridNode(null, 0, 0, 0);
        sizes.Append(separator);

        var c;
        var r;
        var node;
        var gridWalker = new _GridWalker(this, this._RowMatrix, this._RowMatrixDim, this._ColMatrix, this._ColMatrixDim);
        for (i = 0; i < 6; i++) {
            var autoAuto = i === 0;
            var starAuto = i === 1;
            var autoStar = i === 2;
            var starAutoAgain = i === 3;
            var nonStar = i === 4;
            var remainingStar = i === 5;

            if (hasChildren) {
                this._ExpandStarCols(totalSize, pass);
                this._ExpandStarRows(totalSize, pass);
            }

            var walker = new Fayde._VisualTreeWalker(this);
            var child;
            var up;
            while (child = walker.Step()) {
                up = child._UpdatePass;
                var childSize = new size();
                var starCol = false;
                var starRow = false;
                var autoCol = false;
                var autoRow = false;

                var col = Math.min(up.Grid.Column, colCount - 1);
                var row = Math.min(up.Grid.Row, rowCount - 1);
                var colspan = Math.min(up.Grid.ColumnSpan, colCount - col);
                var rowspan = Math.min(up.Grid.RowSpan, rowCount - row);

                for (r = row; r < row + rowspan; r++) {
                    starRow |= this._RowMatrix[r][r]._Type === namespace.GridUnitType.Star;
                    autoRow |= this._RowMatrix[r][r]._Type === namespace.GridUnitType.Auto;
                }
                for (c = col; c < col + colspan; c++) {
                    starCol |= this._ColMatrix[c][c]._Type === namespace.GridUnitType.Star;
                    autoCol |= this._ColMatrix[c][c]._Type === namespace.GridUnitType.Auto;
                }

                if (autoRow && autoCol && !starRow && !starCol) {
                    if (!autoAuto)
                        continue;
                    childSize.Width = Number.POSITIVE_INFINITY;
                    childSize.Height = Number.POSITIVE_INFINITY;
                } else if (starRow && autoCol && !starCol) {
                    if (!(starAuto || starAutoAgain))
                        continue;
                    if (starAuto && gridWalker._HasAutoStar)
                        childSize.Height = Number.POSITIVE_INFINITY;
                    childSize.Width = Number.POSITIVE_INFINITY;
                } else if (autoRow && starCol && !starRow) {
                    if (!autoStar)
                        continue;
                    childSize.Height = Number.POSITIVE_INFINITY;
                } else if ((autoRow || autoCol) && !(starRow || starCol)) {
                    if (!nonStar)
                        continue;
                    if (autoRow)
                        childSize.Height = Number.POSITIVE_INFINITY;
                    if (autoCol)
                        childSize.Width = Number.POSITIVE_INFINITY;
                } else if (!(starRow || starCol)) {
                    if (!nonStar)
                        continue;
                } else {
                    if (!remainingStar)
                        continue;
                }

                for (r = row; r < row + rowspan; r++) {
                    childSize.Height += this._RowMatrix[r][r]._OfferedSize;
                }
                for (c = col; c < col + colspan; c++) {
                    childSize.Width += this._ColMatrix[c][c]._OfferedSize;
                }

                child._Measure(childSize, error);

                if (!starAuto) {
                    node = new _GridNode(this._RowMatrix, row + rowspan - 1, row, child._DesiredSize.Height);
                    sizes.InsertBefore(node, node._Row === node._Col ? separator.Next : separator);
                }
                node = new _GridNode(this._ColMatrix, col + colspan - 1, col, child._DesiredSize.Width);
                sizes.InsertBefore(node, node._Row === node._Col ? separator.Next : separator);
            }

            sizes.Remove(separator);

            while (node = sizes.Tail) {
                node._Cell._DesiredSize = Math.max(node._Cell._DesiredSize, node._Size);
                this._AllocateDesiredSize(rowCount, colCount);
                sizes.Remove(node);
            }
            sizes.Append(separator);
        }

        this._SaveMeasureResults();

        sizes.Remove(separator);

        var gridSize = new size();
        for (c = 0; c < colCount; c++) {
            gridSize.Width += this._ColMatrix[c][c]._DesiredSize;
        }
        for (r = 0; r < rowCount; r++) {
            gridSize.Height += this._RowMatrix[r][r]._DesiredSize;
        }
        return gridSize;
    };
    Grid.Instance._ArrangeOverride = function (finalSize, pass, error) {
        //LayoutDebug(function () { return "Grid Arrange Pass: " + this.__DebugToString() + " [" + finalSize.toString() + "]"; });
        var cols = pass.Grid.ColumnDefinitions;// this._GetColumnDefinitionsNoAutoCreate();
        var rows = pass.Grid.RowDefinitions;// this._GetRowDefinitionsNoAutoCreate();

        var colCount = cols ? cols.GetCount() : 0;
        var rowCount = rows ? rows.GetCount() : 0;

        this._RestoreMeasureResults();

        var c;
        var r;

        var totalConsumed = new size();
        for (c = 0; c < this._ColMatrixDim; c++) {
            totalConsumed.Width += this._ColMatrix[c][c]._SetOfferedToDesired();
        }
        for (r = 0; r < this._RowMatrixDim; r++) {
            totalConsumed.Height += this._RowMatrix[r][r]._SetOfferedToDesired();
        }

        if (totalConsumed.Width !== finalSize.Width)
            this._ExpandStarCols(finalSize, pass);
        if (totalConsumed.Height !== finalSize.Height)
            this._ExpandStarRows(finalSize, pass);

        for (c = 0; c < colCount; c++) {
            cols.GetValueAt(c).$SetValueInternal(namespace.ColumnDefinition.ActualWidthProperty, this._ColMatrix[c][c]._OfferedSize);
        }
        for (r = 0; r < rowCount; r++) {
            rows.GetValueAt(r).$SetValueInternal(namespace.RowDefinition.ActualHeightProperty, this._RowMatrix[r][r]._OfferedSize);
        }

        var walker = new Fayde._VisualTreeWalker(this);
        var child;
        var up;
        while (child = walker.Step()) {
            up = child._UpdatePass;
            var col = Math.min(up.Grid.Column, this._ColMatrixDim - 1);
            var row = Math.min(up.Grid.Row, this._RowMatrixDim - 1);
            var colspan = Math.min(up.Grid.ColumnSpan, this._ColMatrixDim - col);
            var rowspan = Math.min(up.Grid.RowSpan, this._RowMatrixDim - row);

            var childFinal = new rect();
            for (c = 0; c < col; c++) {
                childFinal.X += this._ColMatrix[c][c]._OfferedSize;
            }
            for (c = col; c < col + colspan; c++) {
                childFinal.Width += this._ColMatrix[c][c]._OfferedSize;
            }

            for (r = 0; r < row; r++) {
                childFinal.Y += this._RowMatrix[r][r]._OfferedSize;
            }
            for (r = row; r < row + rowspan; r++) {
                childFinal.Height += this._RowMatrix[r][r]._OfferedSize;
            }
            child._Arrange(childFinal, error);
        }

        return finalSize;
    };

    Grid.Instance._ExpandStarRows = function (availableSize, pass) {
        availableSize = size.clone(availableSize);
        var rows = pass.Grid.RowDefinitions;// this._GetRowDefinitionsNoAutoCreate();
        var rowsCount = rows ? rows.GetCount() : 0;

        var i;
        var cur;
        for (i = 0; i < this._RowMatrixDim; i++) {
            cur = this._RowMatrix[i][i];
            if (cur._Type === namespace.GridUnitType.Star)
                cur._OfferedSize = 0;
            else
                availableSize.Height = Math.max(availableSize.Height - cur._OfferedSize, 0);
        }
        availableSize.Height = this._AssignSize(this._RowMatrix, 0, this._RowMatrixDim - 1, availableSize.Height, namespace.GridUnitType.Star, false);
        if (rowsCount > 0) {
            for (i = 0; i < this._RowMatrixDim; i++) {
                cur = this._RowMatrix[i][i];
                if (cur._Type === namespace.GridUnitType.Star)
                    rows.GetValueAt(i).$SetValueInternal(namespace.RowDefinition.ActualHeightProperty, cur._OfferedSize);
            }
        }
    };
    Grid.Instance._ExpandStarCols = function (availableSize, pass) {
        availableSize = size.clone(availableSize);
        var cols = pass.Grid.ColumnDefinitions;// this._GetColumnDefinitionsNoAutoCreate();
        var columnsCount = cols ? cols.GetCount() : 0;

        var i;
        var cur;
        for (i = 0; i < this._ColMatrixDim; i++) {
            cur = this._ColMatrix[i][i];
            if (cur._Type === namespace.GridUnitType.Star)
                cur._OfferedSize = 0;
            else
                availableSize.Width = Math.max(availableSize.Width - cur._OfferedSize, 0);
        }
        availableSize.Width = this._AssignSize(this._ColMatrix, 0, this._ColMatrixDim - 1, availableSize.Width, namespace.GridUnitType.Star, false);
        if (columnsCount > 0) {
            for (i = 0; i < this._ColMatrixDim; i++) {
                cur = this._ColMatrix[i][i];
                if (cur._Type === namespace.GridUnitType.Star) {
                    cols.GetValueAt(i).$SetValueInternal(namespace.ColumnDefinition.ActualWidthProperty, cur._OfferedSize);
                }
            }
        }
    };
    Grid.Instance._AllocateDesiredSize = function (rowCount, colCount) {
        for (var i = 0; i < 2; i++) {
            var matrix = i === 0 ? this._RowMatrix : this._ColMatrix;
            var count = i === 0 ? rowCount : colCount;

            for (var row = count - 1; row >= 0; row--) {
                for (var col = row; col >= 0; col--) {
                    var spansStar = false;
                    for (var j = row; j >= col; j--) {
                        spansStar |= matrix[j][j]._Type === namespace.GridUnitType.Star;
                    }
                    var current = matrix[row][col]._DesiredSize;
                    var totalAllocated = 0;
                    for (var a = row; a >= col; a--) {
                        totalAllocated += matrix[a][a]._DesiredSize;
                    }
                    if (totalAllocated < current) {
                        var additional = current - totalAllocated;
                        if (spansStar) {
                            additional = this._AssignSize(matrix, col, row, additional, namespace.GridUnitType.Star, true);
                        } else {
                            additional = this._AssignSize(matrix, col, row, additional, namespace.GridUnitType.Pixel, true);
                            additional = this._AssignSize(matrix, col, row, additional, namespace.GridUnitType.Auto, true);
                        }
                    }
                }
            }
        }
        for (var r = 0; r < this._RowMatrixDim; r++) {
            this._RowMatrix[r][r]._OfferedSize = this._RowMatrix[r][r]._DesiredSize;
        }
        for (var c = 0; c < this._ColMatrixDim; c++) {
            this._ColMatrix[c][c]._OfferedSize = this._ColMatrix[c][c]._DesiredSize;
        }
    };
    Grid.Instance._AssignSize = function (matrix, start, end, size, unitType, desiredSize) {
        var count = 0;
        var assigned;
        var segmentSize;
        var i;
        var cur;
        for (i = start; i <= end; i++) {
            cur = matrix[i][i];
            segmentSize = desiredSize ? cur._DesiredSize : cur._OfferedSize;
            if (segmentSize < cur._Max)
                count += (unitType === namespace.GridUnitType.Star) ? cur._Stars : 1;
        }
        do {
            assigned = false;
            var contribution = size / count;
            for (i = start; i <= end; i++) {
                cur = matrix[i][i];
                segmentSize = desiredSize ? cur._DesiredSize : cur._OfferedSize;
                if (!(cur._Type === unitType && segmentSize < cur._Max))
                    continue;
                var newSize = segmentSize;
                newSize += contribution * (unitType === namespace.GridUnitType.Star ? cur._Stars : 1);
                newSize = Math.min(newSize, cur._Max);
                assigned |= newSize > segmentSize;
                size -= newSize - segmentSize;
                if (desiredSize)
                    cur._DesiredSize = newSize;
                else
                    cur._OfferedSize = newSize;
            }
        } while (assigned);
        return size;
    };

    //#endregion

    //#region Matrix Management

    Grid.Instance._CreateMatrices = function (rowCount, colCount) {
        if (this._RowMatrix == null || this._ColMatrix == null || this._RowMatrixDim !== rowCount || this._ColMatrixDim !== colCount) {
            this._DestroyMatrices();

            this._RowMatrixDim = rowCount;
            this._RowMatrix = [];
            for (var i = 0; i < rowCount; i++) {
                this._RowMatrix.push([]);
            }

            this._ColMatrixDim = colCount;
            this._ColMatrix = [];
            for (var j = 0; j < colCount; j++) {
                this._ColMatrix.push([]);
            }
        }

        for (var r = 0; r < rowCount; r++) {
            this._RowMatrix[r] = [];
            for (var rr = 0; rr <= r; rr++) {
                this._RowMatrix[r].push(new _Segment());
            }
        }

        for (var c = 0; c < colCount; c++) {
            this._ColMatrix[c] = [];
            for (var cc = 0; cc <= c; cc++) {
                this._ColMatrix[c].push(new _Segment());
            }
        }
    };
    Grid.Instance._DestroyMatrices = function () {
        this._RowMatrix = null;
        this._ColMatrix = null;
    };
    Grid.Instance._SaveMeasureResults = function () {
        var i;
        var j;
        for (i = 0; i < this._RowMatrixDim; i++) {
            for (j = 0; j <= i; j++) {
                this._RowMatrix[i][j]._OriginalSize = this._RowMatrix[i][j]._OfferedSize;
            }
        }

        for (i = 0; i < this._ColMatrixDim; i++) {
            for (j = 0; j <= i; j++) {
                this._ColMatrix[i][j]._OriginalSize = this._ColMatrix[i][j]._OfferedSize;
            }
        }
    };
    Grid.Instance._RestoreMeasureResults = function () {
        var i;
        var j;
        for (i = 0; i < this._RowMatrixDim; i++) {
            for (j = 0; j <= i; j++) {
                this._RowMatrix[i][j]._OfferedSize = this._RowMatrix[i][j]._OriginalSize;
            }
        }

        for (i = 0; i < this._ColMatrixDim; i++) {
            for (j = 0; j <= i; j++) {
                this._ColMatrix[i][j]._OfferedSize = this._ColMatrix[i][j]._OriginalSize;
            }
        }
    };

    //#endregion

    //#region Changes

    //#if ENABLE_CANVAS
    if (Fayde.IsCanvasEnabled) {
        Grid.Instance._OnPropertyChanged = function (args, error) {
            if (args.Property.OwnerType !== Grid) {
                this._OnPropertyChanged$Panel(args, error);
                return;
            }

            if (args.Property._ID === Grid.ShowGridLinesProperty._ID) {
                this._Invalidate();
            }
            this._InvalidateMeasure();
            this.PropertyChanged.Raise(this, args);
        };
        Grid.Instance._OnCollectionChanged = function (col, args) {
            if (col === this._UpdatePass.Grid.ColumnDefinitions || col === this._UpdatePass.Grid.RowDefinitions) {
                this._InvalidateMeasure();
            } else {
                this._OnCollectionChanged$Panel(col, args);
            }
        };
        Grid.Instance._OnCollectionItemChanged = function (col, obj, args) {
            if (col === this._UpdatePass.Panel.Children) {
                if (args.Property._ID === Grid.ColumnProperty._ID
                    || args.Property._ID === Grid.RowProperty._ID
                    || args.Property._ID === Grid.ColumnSpanProperty._ID
                    || args.Property._ID === Grid.RowSpanProperty._ID) {
                    this._InvalidateMeasure();
                    obj._InvalidateMeasure();
                    return;
                }
            } else if (col === this._UpdatePass.Grid.ColumnDefinitions || col === this._UpdatePass.Grid.RowDefinitions) {
                if (args.Property._ID !== namespace.ColumnDefinition.ActualWidthProperty._ID
                    && args.Property._ID !== namespace.RowDefinition.ActualHeightProperty._ID) {
                    this._InvalidateMeasure();
                }
                return;
            }

            this._OnCollectionItemChanged$Panel(col, obj, args);
        };
    }
    //#else
    if (!Fayde.IsCanvasEnabled) {
        Grid.Instance._OnPropertyChanged = function (args, error) {
            if (args.Property.OwnerType !== Grid) {
                this._OnPropertyChanged$Panel(args, error);
                return;
            }

            var ivprop = false;
            if (args.Property._ID === Grid.ShowGridLinesProperty._ID) {
                this._Invalidate();
                ivprop = true;
            }
            this._InvalidateMeasure();
            if (ivprop)
                this.InvalidateProperty(args.Property, args.OldValue, args.NewValue);
            this.PropertyChanged.Raise(this, args);
        };
    }
    //#endif

    //#endregion

    //#if !ENABLE_CANVAS
    if (!Fayde.IsCanvasEnabled) {
        Grid.Instance.GetRowDefinition = function (index) {
            var rd = this.RowDefinitions.GetValueAt(index);
            if (!rd) {
                rd = new namespace.RowDefinition();
                rd.Height.Type = namespace.GridUnitType.Star;
                rd.Height.Value = 1;
            }
            return rd;
        };
        Grid.Instance.GetColumnDefinition = function (index) {
            var cd = this.ColumnDefinitions.GetValueAt(index);
            if (!cd) {
                cd = new namespace.ColumnDefinition();
                cd.Width.Type = namespace.GridUnitType.Star;
                cd.Width.Value = 1;
            }
            return cd;
        };
        Grid.Instance.InsertHtmlChild = function (child, index) {
            //TODO: what to do if row is set to a row number that doesn't exist?
            var table = this.GetHtmlChildrenContainer();
            var row = Grid.GetRow(child);
            var column = Grid.GetColumn(child);
            var rd = this.GetRowDefinition(row);
            var cd = this.GetColumnDefinition(column);
            var contentEl = table.children[row].children[column].firstChild.firstChild;
            contentEl.appendChild(child.GetRootHtmlElement());
            if (rd.Height.Type === Fayde.Controls.GridUnitType.Auto || cd.Width.Type === Fayde.Controls.GridUnitType.Auto) {
                Surface._SizingAdjustments[child._ID] = child;
            }
        };
        Grid.Instance.RemoveHtmlChild = function (child, index) {
            //TODO: what to do if row is set to a row number that doesn't exist?
            var table = this.GetHtmlChildrenContainer();
            var row = Grid.GetRow(child);
            var column = Grid.GetColumn(child);
            var rd = this.GetRowDefinition(row);
            var cd = this.GetColumnDefinition(column);
            var contentEl = table.children[row].children[column].firstChild.firstChild;
            contentEl.removeChild(child.GetRootHtmlElement());
        };
        Grid.Instance.CreateCells = function (table) {
            var rows = this.RowDefinitions.GetCount();
            var columns = this.ColumnDefinitions.GetCount();

            var totalRowStars = 0;
            for (var i = 0; i < rows; i++) {
                var rd = this.RowDefinitions.GetValueAt(i).Height;
                if (rd.Type === namespace.GridUnitType.Star) {
                    totalRowStars += rd.Value;
                }
            }

            var totalColumnStars = 0;
            for (var i = 0; i < columns; i++) {
                var cd = this.ColumnDefinitions.GetValueAt(i).Width;
                if (cd.Type === namespace.GridUnitType.Star) {
                    totalColumnStars += cd.Value;
                }
            }

            //a grid must have at least one row and column to place the content in
            if (rows == 0) {
                rows = 1;
                totalRowStars = 1;
            }
            if (columns == 0) {
                columns = 1;
                totalColumnStars = 1;
            }
            for (var i = 0; i < rows; i++) {
                var rd = this.GetRowDefinition(i);
                var rowEl = table.appendChild(document.createElement("tr"));
                for (var j = 0; j < columns; j++) {
                    var cd = this.GetColumnDefinition(j);
                    var columnEl = rowEl.appendChild(document.createElement("td"));
                    columnEl.style.padding = "0px";
                    switch (rd.Height.Type) {
                        case namespace.GridUnitType.Star:
                            //TODO: chrome, IE, and ff measure this differently
                            //chrome: can set the final row to 100% and it will just fill the remaining
                            //IE: does fractional heights but doesn't take gridlines into account it seems
                            //FF: seems to be fine
                            columnEl.style.height = (rd.Height.Value / totalRowStars) * 100 + "%";
                            break;
                        case namespace.GridUnitType.Pixel:
                            columnEl.style.height = rd.Height.Value + "px";
                            columnEl.style.minHeight = rd.Height.Value + "px";
                            break;
                        case namespace.GridUnitType.Auto:
                            columnEl.style.height = "auto";
                            //columnEl.style.minHeight = rd.MinHeight + "px";
                            //columnEl.style.maxHeight = rd.MaxHeight + "px";
                            break;
                    }
                    switch (cd.Width.Type) {
                        case namespace.GridUnitType.Star:
                            //TODO: chrome, IE, and ff measure this differently
                            //chrome: can set the final column to 100% and it will just fill the remaining
                            //IE: does fractional widths but doesn't take gridlines into account it seems
                            //FF: seems to be fine
                            columnEl.style.width = (cd.Width.Value / totalColumnStars) * 100 + "%";
                            break;
                        case namespace.GridUnitType.Pixel:
                            columnEl.style.width = cd.Width.Value + "px";
                            columnEl.style.minWidth = cd.Width.Value + "px";
                            break;
                        case namespace.GridUnitType.Auto:
                            columnEl.style.width = "auto";
                            //columnEl.style.minWidth = cd.MinWidth + "px";
                            //columnEl.style.maxWidth = cd.MaxWidth + "px";
                            break;
                    }
                    columnEl.style.fontSize = "0px";
                    columnEl.style.overflow = "hidden";
                    var sizingEl = columnEl.appendChild(document.createElement("div"));
                    sizingEl.style.position = "relative";
                    sizingEl.style.display = "table";
                    sizingEl.style.borderCollapse = "separate";
                    sizingEl.style.width = "100%";
                    sizingEl.style.height = "100%";
                    var contentEl = sizingEl.appendChild(document.createElement("div"));
                    contentEl.style.position = "absolute";
                    contentEl.style.display = "table-cell";
                    contentEl.style.width = "100%";
                    contentEl.style.height = "100%";
                }
            }
        };
        Grid.Instance.CreateHtmlChildrenContainer = function () {
            var table = document.createElement("table");
            table.style.borderCollapse = "collapse";
            table.style.borderSpacing = "0px";
            table.style.width = "100%";
            table.style.height = "100%";
            this.CreateCells(table);
            return table;
        };
        Grid.Instance.ApplyHtmlChange = function (change) {
            var propd = change.Property;
            if (propd.OwnerType !== Grid) {
                this.ApplyHtmlChange$Panel(change);
                return;
            }

            if (propd._ID === Grid.ShowGridLinesProperty._ID) {
                var table = this.GetHtmlChildrenContainer();
                var style = this.ShowGridLines ? "solid 1px black" : "";
                for (var i = 0; i < table.children.length; i++) {
                    var row = table.children[i];
                    for (var j = 0; j < row.children.length; j++) {
                        var cell = row.children[j];
                        cell.style.border = style;
                    }
                }
            }
        };
        //this method is called by a child when the child's size has changed
        //this allows the parent to adjust accordingly and propogate that change up the tree
        Grid.Instance.UpdateAdjustedWidth = function (child, width) {
            delete Surface._SizingAdjustments[this._ID];
            var table = this.GetHtmlChildrenContainer();
            var column = Grid.GetColumn(child);
            var row = Grid.GetRow(child);
            var cd = this.GetColumnDefinition(column);
            var rd = this.GetRowDefinition(row);
            if (cd.Width.Type === namespace.GridUnitType.Auto) {
                //when a child of a grid reports a size change, we will adjust auto rows and columns
                //we need to update all column widths
                var existingWidth = table.children[row].children[column].firstChild.offsetWidth;
                //only change the container and children if you are making it bigger
                if (width > existingWidth) {
                    var len = table.children.length;
                    for (var i = 0; i < len; i++) {
                        table.children[i].children[column].firstChild.style.width = width + "px";
                    }
                    //this is code to grow the children's width if the auto row has grown
                    var children = this.Children;
                    len = children.GetCount();
                    for (var i = 0; i < len; i++) {
                        var c = children.GetValueAt(i);
                        if (child != c && Grid.GetColumn(c) === column) {
                            c.CoerceWidth(width);
                        }
                    }
                }
                else {
                    child.CoerceWidth(existingWidth);
                }
            }
            //now that I have updated the appropriate containers and children, make sure I update myself
            //I need to update my outer width based on all my children's sized combined
            if (!this.GetIsFixedWidth()) {
                var myWidth = table.offsetWidth;
                this.GetContentHtmlElement().style.width = myWidth + "px";
                myWidth = this.CalculateOuterWidth(myWidth);
                var parent = this.GetVisualParent();
                if (parent) parent.UpdateAdjustedWidth(this, myWidth);
            }
        };
        //this method is called by a child when the child's size has changed
        //this allows the parent to adjust accordingly and propogate that change up the tree
        Grid.Instance.UpdateAdjustedHeight = function (child, height) {
            delete Surface._SizingAdjustments[this._ID];
            var table = this.GetHtmlChildrenContainer();
            var column = Grid.GetColumn(child);
            var row = Grid.GetRow(child);
            var cd = this.GetColumnDefinition(column);
            var rd = this.GetRowDefinition(row);
            if (rd.Height.Type === namespace.GridUnitType.Auto) {
                //when a child of a grid reports a size change, we will adjust auto rows and columns
                //we need to update all row heights
                var existingHeight = table.children[row].children[column].firstChild.offsetHeight;
                //only change the container and children if you are making it bigger
                if (height > existingHeight) {
                    var len = table.children[row].children.length;
                    for (var i = 0; i < len; i++) {
                        table.children[row].children[i].firstChild.style.height = height + "px";
                    }
                    //this is code to grow the children's height if the auto column has grown
                    var children = this.Children;
                    len = children.GetCount();
                    for (var i = 0; i < len; i++) {
                        var c = children.GetValueAt(i);
                        if (child != c && Grid.GetRow(c) === row) {
                            c.CoerceHeight(height);
                        }
                    }
                }
                else {
                    child.CoerceHeight(existingHeight);
                }
            }
            //now that I have updated the appropriate containers and children, make sure I update myself
            //I need to update my outer width based on all my children's sized combined
            if (!this.GetIsFixedHeight()) {
                var myHeight = table.offsetHeight;
                this.GetContentHtmlElement().style.height = myHeight + "px";
                myHeight = this.CalculateOuterHeight(myHeight);
                var parent = this.GetVisualParent();
                if (parent) parent.UpdateAdjustedHeight(this, myHeight);
            }
        };
        Grid.Instance.GetIsFixedWidth = function (child) {
            if (child) {
                var column = Grid.GetColumn(child);
                var cd = this.GetColumnDefinition(column);
                if (cd.Width.Type === namespace.GridUnitType.Auto) return false;
                else return true;
            }
            else return this.IsFixedWidth;
        };
        Grid.Instance.GetIsFixedHeight = function (child) {
            if (child) {
                var row = Grid.GetRow(child);
                var rd = this.GetRowDefinition(row);
                if (rd.Height.Type === namespace.GridUnitType.Auto) return false;
                else return true;
            }
            else return this.IsFixedHeight;
        };
    }
    //#endif

    Grid.__DebugMatrix = function (matrix) {
        var str = "";
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                str += "[";
                str += matrix[i][j].toString();
                str += "]";
            }
            str += "\n";
        }
        return str;
    };
    Grid.__DebugDiagonalMatrix = function (matrix) {
        var str = "";
        for (var i = 0; i < matrix.length; i++) {
            str += "[";
            str += matrix[i][i].toString();
            str += "]";
            str += "\n";
        }
        return str;
    };

    namespace.Grid = Nullstone.FinishCreate(Grid);
})(Nullstone.Namespace("Fayde.Controls"));
