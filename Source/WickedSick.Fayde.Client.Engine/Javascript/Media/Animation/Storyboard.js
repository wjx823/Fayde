/// <reference path="Timeline.js"/>
/// <reference path="../../Core/Collections/InternalCollection.js"/>
/// CODE
/// <reference path="../../Primitives/TimeSpan.js"/>
/// <reference path="../../Primitives/Duration.js"/>
/// <reference path="Animation.js"/>

(function (namespace) {
    var Storyboard = Nullstone.Create("Storyboard", namespace.Timeline);

    //#region Properties

    Storyboard.ChildrenProperty = DependencyProperty.RegisterFull("Children", function () { return namespace.TimelineCollection; }, Storyboard, undefined, undefined, { GetValue: function () { return new namespace.TimelineCollection(); } });

    Storyboard.TargetNameProperty = DependencyProperty.RegisterAttached("TargetName", function () { return String }, Storyboard);
    Storyboard.GetTargetName = function (d) {
        ///<returns type="String"></returns>
        return d.$GetValue(Storyboard.TargetNameProperty);
    };
    Storyboard.SetTargetName = function (d, value) {
        ///<param name="value" type="String"></param>
        d.$SetValue(Storyboard.TargetNameProperty, value);
    };

    Storyboard.TargetPropertyProperty = DependencyProperty.RegisterAttached("TargetProperty", function () { return Fayde.Data.PropertyPath }, Storyboard);
    Storyboard.GetTargetProperty = function (d) {
        ///<returns type="PropertyPath"></returns>
        return d.$GetValue(Storyboard.TargetPropertyProperty);
    };
    Storyboard.SetTargetProperty = function (d, value) {
        ///<param name="value" type="PropertyPath"></param>
        d.$SetValue(Storyboard.TargetPropertyProperty, value);
    };

    Nullstone.AutoProperties(Storyboard, [
        Storyboard.ChildrenProperty
    ]);

    //#endregion

    //#region Annotations

    Storyboard.Annotations = {
        ContentProperty: Storyboard.ChildrenProperty
    };

    //#endregion

    Storyboard.Instance.Begin = function () {
        this.Reset();
        var error = new BError();
        var promotedValues = [];
        if (this._HookupAnimations(promotedValues, error)) {
            App.Instance.RegisterStoryboard(this);
        } else {
            throw error.CreateException();
        }
    };
    Storyboard.Instance.Pause = function () {
        this.Pause$Timeline();

        var children = this.Children;
        var count = children.GetCount();
        for (var i = 0; i < count; i++) {
            children.GetValueAt(i).Pause();
        }
    };
    Storyboard.Instance.Resume = function () {
        this.Resume$Timeline();

        var children = this.Children;
        var count = children.GetCount();
        for (var i = 0; i < count; i++) {
            children.GetValueAt(i).Resume();
        }
    };
    Storyboard.Instance.Stop = function () {
        this.Stop$Timeline();
        App.Instance.UnregisterStoryboard(this);
        var children = this.Children;
        if (!children)
            return;
        var count = children.GetCount();
        for (var i = 0; i < count; i++) {
            children.GetValueAt(i).Stop();
        }
    };

    Storyboard.Instance._HookupAnimations = function (promotedValues, error) {
        /// <param name="error" type="BError"></param>
        var children = this.Children;
        if (!children)
            return true;
        var count = children.GetCount();
        for (var i = 0; i < count; i++) {
            if (!this._HookupAnimation(children.GetValueAt(i), null, null, promotedValues, error))
                return false;
        }
        return true;
    };
    Storyboard.Instance._HookupAnimation = function (animation, targetObject, targetPropertyPath, promotedValues, error) {
        /// <param name="animation" type="Animation"></param>
        /// <param name="targetObject" type="DependencyObject"></param>
        /// <param name="targetPropertyPath" type="PropertyPath"></param>
        /// <param name="error" type="BError">Description</param>
        animation.Reset();
        var localTargetObject = null;
        var localTargetPropertyPath = null;
        if (animation.HasManualTarget) {
            localTargetObject = animation.ManualTarget;
        } else {
            var name = Storyboard.GetTargetName(animation);
            if (name)
                localTargetObject = animation.FindName(name);
        }
        localTargetPropertyPath = Storyboard.GetTargetProperty(animation);

        if (localTargetObject != null)
            targetObject = localTargetObject;
        if (localTargetPropertyPath != null)
            targetPropertyPath = localTargetPropertyPath;

        var refobj = {
            Value: targetObject
        };
        targetPropertyPath.TryResolveDependencyProperty(targetObject);
        var targetProperty = DependencyProperty.ResolvePropertyPath(refobj, targetPropertyPath, promotedValues);
        if (targetProperty == null) {
            error.SetErrored(BError.XamlParseException, "Could not resolve property for storyboard. [" + localTargetPropertyPath.Path.toString() + "]");
            return false;
        }
        if (!animation.Resolve(refobj.Value, targetProperty)) {
            error.SetErrored(BError.InvalidOperation, "Storyboard value could not be converted to the correct type");
            return false;
        }
        AnimationDebug(function () { return "Hookup (" + Storyboard.GetTargetName(animation) + "." + targetPropertyPath.Path + ")"; });
        animation.HookupStorage(refobj.Value, targetProperty);
        return true;
    };

    Storyboard.Instance.UpdateInternal = function (clockData) {
        var children = this.Children;
        if (!children)
            return;
        var count = children.GetCount();
        for (var i = 0; i < count; i++) {
            children.GetValueAt(i).Update(clockData.CurrentTime._Ticks);
        }
    };

    Storyboard.Instance.GetNaturalDurationCore = function () {
        var children = this.Children;
        var count = children.GetCount();
        if (count === 0)
            return new Duration(new TimeSpan());

        var fullTicks = null;
        for (var i = 0; i < count; i++) {
            var timeline = children.GetValueAt(i);
            var dur = timeline.GetNaturalDuration();
            if (dur.IsAutomatic)
                continue;
            if (dur.IsForever)
                return Duration.CreateForever();
            //duration must have a timespan if we got here
            var spanTicks = dur.TimeSpan._Ticks;
            var repeat = timeline.RepeatBehavior;
            if (repeat.IsForever)
                return dur.IsForever;
            if (repeat.HasCount)
                spanTicks = spanTicks * repeat.Count;
            if (timeline.AutoReverse)
                spanTicks *= 2;
            if (repeat.HasDuration)
                spanTicks = repeat.Duration.TimeSpan._Ticks;
            if (spanTicks !== 0)
                spanTicks = spanTicks / timeline.SpeedRatio;
            spanTicks += timeline.BeginTime._Ticks;
            if (fullTicks == null || fullTicks <= spanTicks)
                fullTicks = spanTicks;
        }
        if (fullTicks == null)
            return Duration.CreateAutomatic();
        return new Duration(new TimeSpan(fullTicks));
    };

    namespace.Storyboard = Nullstone.FinishCreate(Storyboard);
})(Nullstone.Namespace("Fayde.Media.Animation"));

(function (namespace) {
    var StoryboardCollection = Nullstone.Create("StoryboardCollection", Fayde.InternalCollection);
    StoryboardCollection.Instance.IsElementType = function (obj) {
        return obj instanceof namespace.Storyboard;
    };
    namespace.StoryboardCollection = Nullstone.FinishCreate(StoryboardCollection);
})(Nullstone.Namespace("Fayde.Media.Animation"));
