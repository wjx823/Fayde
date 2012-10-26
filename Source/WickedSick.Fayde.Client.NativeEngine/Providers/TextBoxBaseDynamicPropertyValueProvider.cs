using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class TextBoxBaseDynamicPropertyValueProvider : FrameworkElementPropertyValueProvider
    {
        protected DependencyPropertyWrapper ForegroundProp { get; set; }
        protected DependencyPropertyWrapper BackgroundProp { get; set; }
        protected DependencyPropertyWrapper BaselineOffsetProp { get; set; }

        private object _SelectionBackground;
        private object _SelectionForeground;
        private object _BaselineOffset;

        public TextBoxBaseDynamicPropertyValueProvider(DependencyObjectNative @do, DependencyPropertyWrapper foregroundProp, DependencyPropertyWrapper backgroundProp, DependencyPropertyWrapper baselineOffsetProp)
            : base(@do)
        {
            ForegroundProp = foregroundProp;
            BackgroundProp = backgroundProp;
            BaselineOffsetProp = baselineOffsetProp;
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            object v = DependencyObjectNative.UNDEFINED;
            if (prop._ID == ForegroundProp._ID)
            {
                v = _Object.GetValue(prop, _Precedence + 1);
                if (v == null || v == DependencyObjectNative.UNDEFINED)
                    v = _SelectionBackground;
            }
            else if (prop._ID == BackgroundProp._ID)
            {
                v = _Object.GetValue(prop, _Precedence + 1);
                if (v == null || v == DependencyObjectNative.UNDEFINED)
                    v = _SelectionForeground;
            }
            else if (prop._ID == BaselineOffsetProp._ID)
            {
                var view = _Object.Object.GetProperty("_View") as ScriptObject;
                v = _BaselineOffset = view == null ? 0 : view.Invoke("GetBaselineOffset");
            }
            if (v != DependencyObjectNative.UNDEFINED)
                return v;
            return base.GetPropertyValue(prop);
        }

        public override void RecomputePropertyValueOnClear(DependencyPropertyWrapper prop)
        {
            if (prop._ID == ForegroundProp._ID)
                _SelectionForeground = null;
            else if (prop._ID == BackgroundProp._ID)
                _SelectionBackground = null;
            else
                base.RecomputePropertyValueOnClear(prop);
        }

        public override void RecomputePropertyValueOnLower(DependencyPropertyWrapper prop)
        {
            if (prop._ID == ForegroundProp._ID)
                _SelectionForeground = null;
            else if (prop._ID == BackgroundProp._ID)
                _SelectionBackground = null;
            else
                base.RecomputePropertyValueOnLower(prop);
        }

        internal void InitSelectionBrushes(object foreground, object background)
        {
            if (_SelectionForeground == null)
                _SelectionForeground = foreground;
            if (_SelectionBackground == null)
                _SelectionBackground = background;
        }
    }
}