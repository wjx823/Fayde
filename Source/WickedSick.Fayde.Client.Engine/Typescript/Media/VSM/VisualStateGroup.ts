/// <reference path="../../Core/DependencyObject.ts" />
/// <reference path="../../Core/XamlObjectCollection.ts" />
/// CODE
/// <reference path="VisualState.ts" />
/// <reference path="VisualTransition.ts" />
/// <reference path="../Animation/Storyboard.ts" />
/// <reference path="../../Controls/Control.ts" />

module Fayde.Media.VSM {
    export class VisualStateChangedEventArgs extends EventArgs {
        constructor(public OldState: VisualState, public NewState: VisualState, public Control: Controls.Control) {
            super();
        }
    }

    export class VisualStateGroup extends DependencyObject {
        static Annotations = { ContentProperty: "States" };
        private _CurrentStoryboards: Animation.Storyboard[] = [];
        private _Transitions: VisualTransition[] = null;
        Transitions: VisualTransition[];
        States: VisualStateCollection;
        CurrentStateChanging: MulticastEvent = new MulticastEvent();
        CurrentStateChanged: MulticastEvent = new MulticastEvent();
        CurrentState: VisualState = null;

        constructor() {
            super();
            Object.defineProperty(this, "States", {
                value: new VisualStateCollection(),
                writable: false
            });
            Object.defineProperty(this, "Transitions", {
                get: function() {
                    if (!this._Transitions)
                        this._Transitions = [];
                    return this._Transitions;
                }
            });
        }

        GetState(stateName: string): VisualState {
            var enumerator = this.States.GetEnumerator();
            var state: VisualState;
            while (enumerator.MoveNext()) {
                state = enumerator.Current;
                if (state.Name === stateName)
                    return state;
            }
            return null;
        }

        StartNewThenStopOld(element: FrameworkElement, newStoryboards: Animation.Storyboard[]) {
            //var that = this;
            //AnimationDebug(function () { return "StartNewThenStopOld (" + element.__DebugToString() + " - " + that.Name + ")"; });
            var i;
            var storyboard;
            for (i = 0; i < newStoryboards.length; i++) {
                storyboard = newStoryboards[i];
                if (storyboard == null)
                    continue;
                element.Resources.Set(storyboard._ID, storyboard);
                try {
                    storyboard.Begin();
                } catch (err) {
                //clear storyboards on error
                    for (var j = 0; j <= i; j++) {
                        if (newStoryboards[j] != null)
                            element.Resources.Remove((<any>newStoryboards[j])._ID);
                    }
                    throw err;
                }
            }

            this.StopCurrentStoryboards(element);

            var curStoryboards = this._CurrentStoryboards;
            for (i = 0; i < newStoryboards.length; i++) {
                if (newStoryboards[i] == null)
                    continue;
                curStoryboards.push(newStoryboards[i]);
            }
        }
        StopCurrentStoryboards(element: FrameworkElement) {
            var curStoryboards = this._CurrentStoryboards;
            var enumerator = ArrayEx.GetEnumerator(curStoryboards);
            var storyboard: Animation.Storyboard;
            while (enumerator.MoveNext()) {
                storyboard = enumerator.Current;
                if (!storyboard)
                    continue;
                element.Resources.Remove((<any>storyboard)._ID);
                storyboard.Stop();
            }
            this._CurrentStoryboards = [];
        }

        RaiseCurrentStateChanging(element: FrameworkElement, oldState: VisualState, newState: VisualState, control: Controls.Control) {
            this.CurrentStateChanging.Raise(this, new VisualStateChangedEventArgs(oldState, newState, control));
        }
        RaiseCurrentStateChanged(element: FrameworkElement, oldState: VisualState, newState: VisualState, control: Controls.Control) {
            this.CurrentStateChanged.Raise(this, new VisualStateChangedEventArgs(oldState, newState, control));
        }
    }
    Nullstone.RegisterType(VisualStateGroup, "VisualStateGroup");

    export class VisualStateGroupCollection extends XamlObjectCollection {
    }
    Nullstone.RegisterType(VisualStateGroupCollection, "VisualStateGroupCollection");
}