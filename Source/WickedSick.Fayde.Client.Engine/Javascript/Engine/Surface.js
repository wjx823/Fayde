/// <reference path="../Runtime/Nullstone.js" />
/// <reference path="../Runtime/LinkedList.js"/>
/// CODE
/// <reference path="../Primitives.js"/>
/// <reference path="Dirty.js"/>
/// <reference path="Debug.js"/>
/// <reference path="../Core/LayoutInformation.js"/>
/// <reference path="../Core/Collections/InternalCollection.js"/>
/// <reference path="../Runtime/EventArgs.js"/>
/// <reference path="DirtyNode.js"/>
/// <reference path="../Primitives/Font.js"/>
/// <reference path="../Core/Walkers.js"/>
/// <reference path="../Core/Input/KeyCodes.js"/>
/// <reference path="../Core/Input/Keyboard.js"/>
/// <reference path="../Core/Input/Enums.js"/>
/// <reference path="../Runtime/KeyInterop.js"/>
/// <reference path="../Runtime/JsEx.js"/>

(function (namespace) {
    //#region FocusChangedNode
    var FocusChangedNode = Nullstone.Create("FocusChangedNode", LinkedListNode, 2);
    FocusChangedNode.Instance.Init = function (lostFocus, gotFocus) {
        this.Init$LinkedListNode();
        this.LostFocus = lostFocus;
        this.GotFocus = gotFocus;
    };
    Nullstone.FinishCreate(FocusChangedNode);
    //#endregion

    var Surface = Nullstone.Create("Surface", undefined, 1);

    Surface.Instance.Init = function (app) {
        this._App = app;
        this._InputList = new LinkedList();
        this._FocusChangedEvents = new LinkedList();
        this._FirstUserInitiatedEvent = false;
        this._UserInitiatedEvent = false;
        this._Cursor = CursorType.Default;
        if (Surface._Invalidations == null)
            Surface._Invalidations = [];
        this.LayoutUpdated = new MulticastEvent();
        this._KeyInterop = KeyInterop.CreateInterop(this);

        this.InitHtml();
    };

    //#region Initialization

    Surface.Instance.Register = function (canvas, width, widthType, height, heightType) {
        Surface._TestCanvas = document.createElement('canvas');
        this._Layers = [];
        this._DownDirty = new _DirtyList("Down");
        this._UpDirty = new _DirtyList("Up");

        this._Canvas = canvas;

        if (!width) {
            width = 100;
            widthType = "Percentage";
        } else if (!widthType) {
            widthType = "Percentage";
        }
        if (!height) {
            height = 100;
            heightType = "Percentage";
        } else if (!heightType) {
            heightType = "Percentage";
        }
        this._InitializeCanvas(this._Canvas, width, widthType, height, heightType);

        this._Ctx = this._Canvas.getContext('2d');
        this._CalculateOffset();
        this.RegisterEvents();
    };
    Surface.Instance.RegisterEvents = function () {
        var surface = this;
        var canvas = this.GetCanvas();

        canvas.addEventListener("mousedown", function (e) { surface._HandleButtonPress(window.event ? window.event : e); });
        canvas.addEventListener("mouseup", function (e) { surface._HandleButtonRelease(window.event ? window.event : e); });
        canvas.addEventListener("mouseout", function (e) { surface._HandleOut(window.event ? window.event : e); });
        canvas.addEventListener("mousemove", function (e) { surface._HandleMove(window.event ? window.event : e); });

        //IE9, Chrome, Safari, Opera
        canvas.addEventListener("mousewheel", function (e) { surface._HandleWheel(window.event ? window.event : e); });
        //Firefox
        canvas.addEventListener("DOMMouseScroll", function (e) { surface._HandleWheel(window.event ? window.event : e); });

        this._KeyInterop.RegisterEvents();
    };
    Surface.Instance._Attach = function (element) {
        /// <param name="element" type="UIElement"></param>
        if (this._TopLevel) {
            this._DetachLayer(this._TopLevel);
        }

        if (!element) {
            this._Invalidate();
            return;
        }

        if (!(element instanceof Fayde.UIElement)) {
            _Console.WriteLine("Unsupported top level element.");
            return;
        }

        if (!Fayde.NameScope.GetNameScope(element)) {
            Fayde.NameScope.SetNameScope(element, new NameScope());
        }

        this._TopLevel = element;

        this._AttachLayer(this._TopLevel);
    };
    Surface.Instance._AttachLayer = function (layer) {
        /// <param name="layer" type="UIElement"></param>
        if (Nullstone.RefEquals(layer, this._TopLevel))
            this._Layers.splice(0, 0, layer);
        else
            this._Layers.push(layer);
        layer._UpdatePass.IsTopLevel = true;

        DirtyDebug("AttachLayer");
        layer._FullInvalidate(true);
        layer._InvalidateMeasure();
        layer._MainSurface = this;
        layer._SetIsAttached(true);
        layer._SetIsLoaded(true);
        this.FinishAttachLayer(layer);

        this._App._NotifyDebugLayer(true, layer);
    };
    Surface.Instance._DetachLayer = function (layer) {
        /// <param name="layer" type="UIElement"></param>

        layer._UpdatePass.IsTopLevel = false;

        if (!this._InputList.IsEmpty() && Nullstone.RefEquals(this._InputList.Tail.UIElement, layer)) {
            this._InputList = new LinkedList();
        }

        if (this._FocusedElement != null) {
            var inThisLayer = false;
            var f = this._FocusedElement;
            while (f != null) {
                if (Nullstone.RefEquals(f, layer)) {
                    inThisLayer = true;
                    break;
                }
                f = f.GetVisualParent();
            }
            if (inThisLayer)
                this._FocusElement();
        }

        Array.removeNullstone(this._Layers, layer);
        layer._SetIsLoaded(false);
        layer._SetIsAttached(false);
        layer._MainSurface = undefined;

        this._Invalidate(layer._GetSubtreeBounds());

        this._App._NotifyDebugLayer(false, layer);
    };
    Surface.Instance._InitializeCanvas = function (canvas, width, widthType, height, heightType) {
        var resizesWithWindow = false;

        if (widthType === "Percentage") {
            resizesWithWindow = true;
            this._PercentageWidth = width;
        } else {
            canvas.width = width;
        }

        if (heightType === "Percentage") {
            resizesWithWindow = true;
            this._PercentageHeight = height;
        } else {
            canvas.height = height;
        }

        if (resizesWithWindow) {
            this._ResizeCanvas();
            var surface = this;
            window.onresize = function (e) { surface._HandleResize(window.event ? window.event : e); };
        }
    };
    Surface.Instance._CalculateOffset = function () {
        var left = 0;
        var top = 0;
        var cur = this._Canvas;
        if (cur.offsetParent) {
            do {
                left += cur.offsetLeft;
                top += cur.offsetTop;
            } while (cur = cur.offsetParent);
        }
        this._CanvasOffset = { left: left, top: top };
    };

    //#endregion

    //#region Properties

    Surface.Instance.GetCanvas = function () { return this._Canvas; };
    Surface.Instance.GetExtents = function () {
        if (!this._Extents)
            this._Extents = size.fromRaw(this.GetWidth(), this.GetHeight());
        return this._Extents;
    };
    Surface.Instance._InvalidateExtents = function () {
        delete this._Extents;
    };
    Surface.Instance.GetWidth = function () {
        return this._Canvas.offsetWidth;
    };
    Surface.Instance.GetHeight = function () {
        return this._Canvas.offsetHeight;
    };

    Nullstone.Property(Surface, "ActualWidth", {
        get: function () { return this._Canvas.offsetWidth; }
    });
    Nullstone.Property(Surface, "ActualHeight", {
        get: function () { return this._Canvas.offsetHeight; }
    });
    Nullstone.Property(Surface, "Root", {
        get: function () { return this._TopLevel; }
    });

    //#endregion

    //#region Render

    var staticRender = function () {
        var cur;
        var invalidations = Surface._Invalidations;
        while (cur = invalidations.pop()) {
            var rect2 = cur._InvalidatedRect;
            cur._InvalidatedRect = null;
            cur._IsRenderQueued = false;
            if (window.RenderDebug) RenderDebug(" --> " + rect2.toString());
            cur.Render(rect2);
        }
    };
    Surface.Instance._Invalidate = function (rect) { };
    //#if ENABLE_CANVAS
    if (Fayde.IsCanvasEnabled) {
        Surface.Instance._Invalidate = function (irect) {
            if (window.RenderDebug) RenderDebug("Invalidation: " + irect.toString());
            if (!irect) {
                irect = new rect();
                irect.Width = this.GetWidth();
                irect.Height = this.GetHeight();
            }
            if (!this._InvalidatedRect)
                this._InvalidatedRect = rect.clone(irect);
            else
                rect.union(this._InvalidatedRect, irect);

            if (this._IsRenderQueued)
                return;
            this._IsRenderQueued = true;
            Surface._Invalidations.push(this);
            setTimeout(staticRender, 1);
        };
        }
    //#endif
    Surface.Instance.Render = function (region) {
        var startRenderTime;
        var isRenderPassTimed;
        if (isRenderPassTimed = (this._App._DebugFunc[4] != null))
            startRenderTime = new Date().getTime();

        var layers = this._Layers;
        var layerCount = layers ? layers.length : 0;

        if (window.RenderDebug) RenderDebug.Count = 0;
        var ctx = new Fayde._RenderContext(this);
        ctx.Clear(region);
        ctx.CanvasContext.save();
        ctx.Clip(region);
        for (var i = 0; i < layerCount; i++) {
            layers[i]._DoRender(ctx, region);
        }
        ctx.CanvasContext.restore();
        if (window.RenderDebug) RenderDebug("UIElement Count: " + RenderDebug.Count);

        if (isRenderPassTimed)
            this._App._NotifyDebugRenderPass(new Date().getTime() - startRenderTime);
    };

    //#endregion

    //#region Update

    Surface.Instance.ProcessDirtyElements = function () {
        var error = new BError();
        var dirty = this._UpdateLayout(error);
        if (error.Message)
            throw new Exception(error.Message);
        if (!dirty)
            return false;
        this.LayoutUpdated.Raise(this, new EventArgs());
        return true;
    };
    Surface.Instance._UpdateLayout = function (error) {
        var UIElementFlags = Fayde.UIElementFlags;
        var startTime;
        var layers = this._Layers;
        if (!layers)
            return false;
        var pass = new Fayde.LayoutPass();
        var dirty = false;
        pass.Updated = true;
        var updatedLayout = false;
        while (pass.Count < Fayde.LayoutPass.MaxCount && pass.Updated) {
            pass.Updated = false;
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var element = layer;
                if (!element._HasFlag(UIElementFlags.DirtyMeasureHint) && !element._HasFlag(UIElementFlags.DirtyArrangeHint))
                    continue;

                var elMetrics = element._UpdateMetrics;
                var last = elMetrics.PreviousConstraint;
                var available = size.fromRaw(this.GetWidth(), this.GetHeight());
                if (element.IsContainer() && (!last || (!size.isEqual(last, available)))) {
                    element._InvalidateMeasure();
                    elMetrics.PreviousConstraint = available;
                }

                element._UpdateLayer(pass, error);
            }

            dirty = dirty || !this._DownDirty.IsEmpty() || !this._UpDirty.IsEmpty();

            //startTime = new Date().getTime();
            this._ProcessDownDirtyElements();
            //var elapsed = new Date().getTime() - startTime;
            //if (elapsed > 0)
            //DirtyDebug.DownTiming.push(elapsed);

            //startTime = new Date().getTime();
            this._ProcessUpDirtyElements();
            //var elapsed = new Date().getTime() - startTime;
            //if (elapsed > 0)
            //DirtyDebug.UpTiming.push(elapsed);

            if (pass.Updated || dirty)
                updatedLayout = true;
        }

        if (pass.Count >= Fayde.LayoutPass.MaxCount) {
            if (error)
                error.SetErrored(BError.Exception, "UpdateLayout has entered infinite loop and has been aborted.");
        }

        return updatedLayout;
    };
    //Down --> RenderVisibility, HitTestVisibility, Transformation, Clip, ChildrenZIndices
    Surface.Instance._ProcessDownDirtyElements = function () {
        var node;
        while (node = this._DownDirty.Head) {
            var uie = node.UIElement;
            var visualParent = this.VisualParent;
            if (visualParent && visualParent._DownDirtyNode != null) {
                //OPTIMIZATION: uie is overzealous. His parent will invalidate him later
                this._DownDirty.Remove(node);
                this._DownDirty.InsertAfter(node, visualParent._DownDirtyNode);
            }
            if (uie._UpdatePass.ProcessDown(this, uie)) {
                this._DownDirty.Remove(node);
                uie._DownDirtyNode = null;
            }
        }

        if (!this._DownDirty.IsEmpty()) {
            Warn("Finished DownDirty pass, not empty.");
        }
    };
    //Up --> Bounds, Invalidation
    Surface.Instance._ProcessUpDirtyElements = function () {
        var node;
        while (node = this._UpDirty.Head) {
            var uie = node.UIElement;
            var childNode = this._GetChildNodeInUpList(uie);
            if (childNode) {
                // OPTIMIZATION: Parent is overzealous, children will invalidate him
                this._UpDirty.Remove(node);
                this._UpDirty.InsertAfter(node, childNode);
                continue;
            }
            if (uie._UpdatePass.ProcessUp(this, uie)) {
                this._UpDirty.Remove(node);
                uie._UpDirtyNode = null;
            }
        }

        if (!this._UpDirty.IsEmpty()) {
            Warn("Finished UpDirty pass, not empty.");
        }
    };
    Surface.Instance._PropagateDirtyFlagToChildren = function (element, dirt) {
        var walker = Fayde._VisualTreeWalker.Logical(element);
        var child;
        while (child = walker.Step()) {
            this._AddDirtyElement(child, dirt);
        }
    };
    Surface.Instance._AddDirtyElement = function (element, dirt) {
        /// <param name="element" type="UIElement"></param>
        if (element.GetVisualParent() == null && !this._IsTopLevel(element))
            return;

        /*
        DirtyDebug.Level++;
        if (dirt & _Dirty.DownDirtyState)
            DirtyDebug("AddDirtyElement(Down): [" + element.__DebugToString() + "]" + element.__DebugDownDirtyFlags() + " --> " + _Dirty.__DebugToString(dirt));
        if (dirt & _Dirty.UpDirtyState)
            DirtyDebug("AddDirtyElement(Up): [" + element.__DebugToString() + "]" + element.__DebugUpDirtyFlags() + " --> " + _Dirty.__DebugToString(dirt));
        DirtyDebug.Level--;
        */

        element._DirtyFlags |= dirt;

        if (dirt & _Dirty.DownDirtyState && element._DownDirtyNode == null)
            element._DownDirtyNode = this._DownDirty.Append({ UIElement: element });
        if (dirt & _Dirty.UpDirtyState && element._UpDirtyNode == null)
            element._UpDirtyNode = this._UpDirty.Append({ UIElement: element });
        //this._Invalidate();
    };
    Surface.Instance._RemoveDirtyElement = function (uie) {
        /// <param name="uie" type="UIElement"></param>
        if (uie._UpDirtyNode != null) {
            this._UpDirty.Remove(uie._UpDirtyNode);
            delete uie._UpDirtyNode;
        }
        if (uie._DownDirtyNode != null) {
            this._DownDirty.Remove(uie._DownDirtyNode);
            delete uie._DownDirtyNode;
        }
    };
    Surface.Instance._IsTopLevel = function (top) {
        /// <param name="top" type="UIElement"></param>
        if (!top || !this._Layers)
            return false;
        //TODO: full-screen message
        return Array.containsNullstone(this._Layers, top);
    };
    Surface.Instance._GetChildNodeInUpList = function (uie) {
        var subtree = uie._SubtreeObject;
        if (!subtree)
            return;

        if (subtree instanceof Fayde.UIElement)
            return subtree._UpDirtyNode;

        if (subtree instanceof Fayde.UIElementCollection) {
            var children = subtree._ht;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                var child = children[i];
                if (child._UpDirtyNode != null)
                    return child._UpDirtyNode;
            }
        }
    };

    //#endregion

    //#region Cursor

    Surface.Instance._UpdateCursorFromInputList = function () {
        var newCursor = CursorType.Default;
        for (var node = this._InputList.Head; node; node = node.Next) {
            newCursor = node.UIElement.Cursor;
            if (newCursor !== CursorType.Default)
                break;
        }
        this._SetCursor(newCursor);
    };
    Surface.Instance._SetCursor = function (cursor) {
        this._Cursor = cursor;
        this._Canvas.style.cursor = cursor;
    };

    //#endregion

    //#region Mouse

    Surface.Instance._HandleButtonRelease = function (evt) {
        Fayde.Input.Keyboard.RefreshModifiers(evt);
        var button = evt.which ? evt.which : evt.button;
        var pos = this._GetMousePosition(evt);

        this._SetUserInitiatedEvent(true);
        this._HandleMouseEvent("up", button, pos);
        this._UpdateCursorFromInputList();
        this._SetUserInitiatedEvent(false);
        if (this._Captured)
            this._PerformReleaseCapture();
    };
    Surface.Instance._HandleButtonPress = function (evt) {
        Fayde.Input.Keyboard.RefreshModifiers(evt);
        var button = evt.which ? evt.which : evt.button;
        var pos = this._GetMousePosition(evt);

        this._SetUserInitiatedEvent(true);
        this._HandleMouseEvent("down", button, pos);
        this._UpdateCursorFromInputList();
        this._SetUserInitiatedEvent(false);
    };
    Surface.Instance._HandleWheel = function (evt) {
        Fayde.Input.Keyboard.RefreshModifiers(evt);
        var delta = 0;
        if (evt.wheelDelta)
            delta = evt.wheelDelta / 120;
        else if (evt.detail)
            delta = -evt.detail / 3;
        if (evt.preventDefault)
            evt.preventDefault();
        evt.returnValue = false;
        this._HandleMouseEvent("wheel", null, this._GetMousePosition(evt), delta);
        this._UpdateCursorFromInputList();
    };
    Surface.Instance._HandleMove = function (evt) {
        Fayde.Input.Keyboard.RefreshModifiers(evt);
        var pos = this._GetMousePosition(evt);
        this._HandleMouseEvent("move", null, pos);
        this._UpdateCursorFromInputList();
    };
    Surface.Instance._HandleOut = function (evt) {
        Fayde.Input.Keyboard.RefreshModifiers(evt);
        var pos = this._GetMousePosition(evt);
        this._HandleMouseEvent("out", null, pos);
    };
    Surface.Instance._HandleMouseEvent = function (type, button, pos, delta, emitLeave, emitEnter) {
        var app = this._App;
        app._NotifyDebugCoordinates(pos);
        this._CurrentPos = pos;
        if (this._EmittingMouseEvent)
            return false;
        if (this._TopLevel == null)
            return false;

        this._EmittingMouseEvent = true;
        if (this._Captured) {
            this._EmitMouseList(type, button, pos, delta, this._InputList);
        } else {
            this.ProcessDirtyElements();
            var ctx = new Fayde._RenderContext(this);
            var newInputList = new LinkedList();
            var layers = this._Layers;
            var layerCount = layers.length;

            var startTime = new Date().getTime();
            for (var i = layerCount - 1; i >= 0 && newInputList.IsEmpty() ; i--) {
                var layer = layers[i];
                layer._HitTestPoint(ctx, pos, newInputList);
            }

            var indices = {};
            this._FindFirstCommonElement(this._InputList, newInputList, indices);
            if (emitLeave === undefined || emitLeave === true)
                this._EmitMouseList("leave", button, pos, delta, this._InputList, indices.Index1);
            if (emitEnter === undefined || emitEnter === true)
                this._EmitMouseList("enter", button, pos, delta, newInputList, indices.Index2);
            if (type !== "noop")
                this._EmitMouseList(type, button, pos, delta, newInputList);

            app._NotifyDebugHitTest(newInputList, new Date().getTime() - startTime);
            this._InputList = newInputList;
        }

        if (this._PendingCapture)
            this._PerformCapture(this._PendingCapture);
        if (this._PendingReleaseCapture || (this._Captured && !this._Captured.CanCaptureMouse()))
            this._PerformReleaseCapture();
        this._EmittingMouseEvent = false;
    };

    Surface.Instance._GetMousePosition = function (evt) {
        return new Point(
            evt.clientX + window.pageXOffset + this._CanvasOffset.left,
            evt.clientY + window.pageYOffset + this._CanvasOffset.top);
    };
    Surface.Instance._FindFirstCommonElement = function (list1, list2, outObj) {
        /// <param name="list1" type="LinkedList"></param>
        /// <param name="list2" type="LinkedList"></param>
        var ui1 = list1.Tail;
        var i1 = list1._Count - 1;
        var ui2 = list2.Tail;
        var i2 = list2._Count - 1;

        outObj.Index1 = -1;
        outObj.Index2 = -1;

        while (ui1 != null && ui2 != null) {
            if (Nullstone.RefEquals(ui1.UIElement, ui2.UIElement)) {
                outObj.Index1 = i1;
                outObj.Index2 = i2;
            } else {
                return;
            }
            ui1 = ui1.Previous;
            ui2 = ui2.Previous;
            i1--;
            i2--;
        }
    };
    Surface.Instance._EmitMouseList = function (type, button, pos, delta, list, endIndex) {
        var handled = false;
        if (endIndex === 0)
            return handled;
        if (!endIndex || endIndex === -1)
            endIndex = list._Count;
        var i = 0;
        var args = this._CreateEventArgs(type, pos, delta);
        var node = list.Head;
        if (node && args instanceof Fayde.RoutedEventArgs)
            args.Source = node.UIElement;
        for (node = list.Head; node && i < endIndex; node = node.Next, i++) {
            if (type === "leave")
                args.Source = node.UIElement;
            if (node.UIElement._EmitEvent(type, button, args))
                handled = true;
            if (type === "leave") //MouseLeave gets new event args on each emit
                args = this._CreateEventArgs(type, pos, delta);
        }
        return handled;
    };

    Surface.Instance.SetMouseCapture = function (uie) {
        /// <param name="uie" type="UIElement"></param>
        if (this._Captured || this._PendingCapture)
            return Nullstone.RefEquals(uie, this._Captured) || Nullstone.RefEquals(uie, this._PendingCapture);
        if (!this._EmittingMouseEvent)
            return false;
        this._PendingCapture = uie;
        return true;
    };
    Surface.Instance.ReleaseMouseCapture = function (uie) {
        /// <param name="uie" type="UIElement"></param>
        if (!Nullstone.RefEquals(uie, this._Captured) && !Nullstone.RefEquals(uie, this._PendingCapture))
            return;
        if (this._EmittingMouseEvent)
            this._PendingReleaseCapture = true;
        else
            this._PerformReleaseCapture();
    };
    Surface.Instance._PerformCapture = function (uie) {
        /// <param name="uie" type="UIElement"></param>
        this._Captured = uie;
        var newInputList = new LinkedList();
        while (uie != null) {
            newInputList.Append(new Fayde.UIElementNode(uie));
            uie = uie.GetVisualParent();
        }
        this._InputList = newInputList;
        this._PendingCapture = null;
    };
    Surface.Instance._PerformReleaseCapture = function () {
        var oldCaptured = this._Captured;
        this._Captured = null;
        this._PendingReleaseCapture = false;
        oldCaptured._EmitLostMouseCapture(this._CurrentPos);
        //force "MouseEnter" on any new elements
        this._HandleMouseEvent("noop", null, this._CurrentPos, undefined, false, true);
    };

    //#endregion

    //#region Keyboard

    Surface.Instance._HandleKeyDown = function (args) {
        this._SetUserInitiatedEvent(true);
        Fayde.Input.Keyboard.RefreshModifiers(args);
        var handled = false;
        if (this._FocusedElement != null) {
            var focusToRoot = Surface._ElementPathToRoot(this._FocusedElement);
            handled = this._EmitKeyDown(focusToRoot, args);
        }

        if (!handled && args.Key === Key.Tab) {
            if (this._FocusedElement != null)
                Fayde.TabNavigationWalker.Focus(this._FocusedElement, args.Shift);
            else
                this._EnsureElementFocused();
        }
        this._SetUserInitiatedEvent(false);
        return handled;
    };
    Surface.Instance._EmitKeyDown = function (list, args, endIndex) {
        if (endIndex === 0)
            return;
        if (!endIndex || endIndex === -1)
            endIndex = list._Count;
        var i = 0;
        for (var node = list.Head; node && i < endIndex; node = node.Next, i++) {
            node.UIElement._EmitKeyDown(args);
        }
        return args.Handled;
    };

    //#endregion

    //#region Resize

    var resizeTimeout;
    Surface.Instance._HandleResize = function (evt) {
        var surface = this;
        if (resizeTimeout)
            clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () { surface._HandleResizeTimeout(evt); }, 20);
    };
    Surface.Instance._HandleResizeTimeout = function (evt) {
        this._ResizeCanvas();
        this._InvalidateExtents();

        var layers = this._Layers;
        var layersCount = layers.length;
        var layer;
        for (var i = 0; i < layersCount; i++) {
            layer = layers[i];
            //layer._FullInvalidate(true);
            layer._InvalidateMeasure();
        }
        resizeTimeout = null;
    };
    Surface.Instance._ResizeCanvas = function () {
        var width = this._PercentageWidth;
        var height = this._PercentageHeight;
        if (width != null)
            this._Canvas.width = window.innerWidth * width / 100.0;
        if (height != null)
            this._Canvas.height = window.innerHeight * height / 100.0;
    };

    //#endregion

    //#region Focus

    Surface.Instance._FocusElement = function (uie) {
        /// <param name="uie" type="UIElement"></param>
        if (uie)
            FocusDebug("Surface._FocusElement (" + uie.__DebugToString() + ")");
        if (Nullstone.RefEquals(uie, this._FocusedElement))
            return true;

        if (this._FocusedElement != null)
            this._FocusChangedEvents.Append(new FocusChangedNode(Surface._ElementPathToRoot(this._FocusedElement), null));

        this._FocusedElement = uie;

        if (uie)
            this._FocusChangedEvents.Append(new FocusChangedNode(null, Surface._ElementPathToRoot(uie)));

        if (this._FirstUserInitiatedEvent)
            this._EmitFocusChangeEventsAsync();

        return true;
    };
    Surface.Instance._RemoveFocus = function (uie) {
        if (Nullstone.RefEquals(this._FocusedElement, uie))
            this._FocusElement(null);
    };
    Surface.Instance._EnsureElementFocused = function () {
        if (!this._FocusedElement) {
            var last = this._Layers.length - 1;
            for (var i = last; i >= 0; i--) {
                if (Fayde.TabNavigationWalker.Focus(layers.GetValueAt(i)))
                    break;
            }
            if (!this._FocusedElement && last !== -1)
                this._FocusElement(layers.GetValueAt(last));
        }
        if (this._FirstUserInitiatedEvent)
            this._EmitFocusChangeEventsAsync();
    };
    Surface.Instance._EmitFocusChangeEventsAsync = function () {
        var surface = this;
        window.setTimeout(function () { surface._EmitFocusChangeEvents(); }, 1);
    };
    Surface.Instance._EmitFocusChangeEvents = function () {
        var node;
        while (node = this._FocusChangedEvents.Head) {
            this._FocusChangedEvents.Remove(node);
            this._EmitFocusList("lost", node.LostFocus);
            this._EmitFocusList("got", node.GotFocus);
        }
    };
    Surface.Instance._EmitFocusList = function (type, list) {
        if (list == null)
            return;
        for (var node = list.Head; node; node = node.Next) {
            node.UIElement._EmitFocusChange(type);
        }
    };

    //#endregion

    //#region Event

    Surface.Instance._CreateEventArgs = function (type, pos, delta) {
        if (type === "up") {
            return new Fayde.Input.MouseButtonEventArgs(pos);
        } else if (type === "down") {
            return new Fayde.Input.MouseButtonEventArgs(pos);
        } else if (type === "leave") {
            return new Fayde.Input.MouseEventArgs(pos);
        } else if (type === "enter") {
            return new Fayde.Input.MouseEventArgs(pos);
        } else if (type === "move") {
            return new Fayde.Input.MouseEventArgs(pos);
        } else if (type === "wheel") {
            return new Fayde.Input.MouseWheelEventArgs(pos, delta);
        }
    };

    //#endregion

    Surface.Instance._SetUserInitiatedEvent = function (val) {
        this._EmitFocusChangeEvents();
        this._FirstUserInitiatedEvent = this._FirstUserInitiatedEvent || val;
        this._UserInitiatedEvent = val;
    };

    if (!Fayde.IsCanvasEnabled) {
        //#region Html Translations
        Surface.Instance.InitHtml = function () {
            if (Surface._SizingAdjustments == null)
                Surface._SizingAdjustments = [];
            var body = document.body;
            this._RootHtmlEl = body;
        };
        Surface.Instance.ProcessHtmlChanges = function () {
            Fayde.DependencyObject.ProcessHtmlChanges();
        };
        Surface.Instance.ProcessSizingAdjustments = function () {
            for (var key in Surface._SizingAdjustments) {
                var el = Surface._SizingAdjustments[key];
                var width = el.FindAndSetAdjustedWidth();
                var height = el.FindAndSetAdjustedHeight();
                var parent = el.GetVisualParent();
                if (parent) {
                    parent.UpdateAdjustedWidth(el, width);
                    parent.UpdateAdjustedHeight(el, height);
                }
            }
        };
        Surface.Instance.FinishAttachLayer = function (layer) {
            var rootEl = layer.GetRootHtmlElement();
            this._RootHtmlEl.style.overflow = "hidden";
            this._RootHtmlEl.appendChild(rootEl);
            layer.OnHtmlAttached();
        };
        //#endregion
    }

    Surface.MeasureText = function (text, font) {
        return size.fromRaw(Surface._MeasureWidth(text, font), Surface._MeasureHeight(font));
    };
    Surface._MeasureWidth = function (text, font) {
        /// <param name="text" type="String"></param>
        /// <param name="font" type="Font"></param>
        var test = Surface._EnsureTestCanvas();
        test.Context.font = font.ToHtml5Object();
        return test.Context.measureText(text).width;
    };
    Surface._MeasureHeight = function (font) {
        /// <param name="font" type="Font"></param>
        if (font._CachedHeight)
            return font._CachedHeight;

        var body = document.getElementsByTagName("body")[0];
        var dummy = document.createElement("div");
        var dummyText = document.createTextNode("M");
        dummy.appendChild(dummyText);
        dummy.setAttribute("style", "font: " + font.ToHtml5Object() + ";");
        body.appendChild(dummy);
        var result = dummy.offsetHeight;
        body.removeChild(dummy);

        font._CachedHeight = result;
        return result;
    };
    Surface.IsLeftButton = function (button) {
        return button === 1;
    };
    Surface.IsRightButton = function (button) {
        return button === 2;
    };
    Surface._ElementPathToRoot = function (source) {
        var list = new LinkedList();
        while (source) {
            list.Append(new Fayde.UIElementNode(source));
            source = source.GetVisualParent();
        }
        return list;
    };
    Surface._EnsureTestCanvas = function () {
        var canvas = Surface._TestCanvas;
        var ctx = Surface._TestCanvasContext;
        if (!ctx) {
            if (!canvas)
                canvas = Surface._TestCanvas = document.createElement('canvas');
            ctx = Surface._TestCanvasContext = canvas.getContext('2d');
        }
        return {
            Canvas: canvas,
            Context: ctx
        };
    };

    if (!Fayde.IsCanvasEnabled) {
        Surface.Instance._Invalidate = function () { };
        Surface.Instance.ProcessDirtyElements = function () { };
    } else {
        Surface.Instance.InitHtml = function () { };
        Surface.Instance.FinishAttachLayer = function (layer) { };
    }

    namespace.Surface = Nullstone.FinishCreate(Surface);
})(window);