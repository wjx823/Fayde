using System;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Controls;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class InheritedIsEnabledPropertyValueProvider : PropertyValueProvider, IPropertyChangedListener
    {
        public static DependencyPropertyWrapper IsEnabledProperty;

        private ControlNative _Source;
        private bool _CurrentValue;

        public InheritedIsEnabledPropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.IsEnabled)
        {
            _CurrentValue = GetIsEnabledValue(_Object, PropertyPrecedence.LocalValue);
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            if (prop._ID == IsEnabledProperty._ID)
                return _CurrentValue;
            return DependencyObjectNative.UNDEFINED;
        }

        internal void SetDataSource(ScriptObject source)
        {
            ControlNative sourceNative = null;
            if (source != null)
            {
                sourceNative = ControlNative.FindAncestorControl(source);
                source = sourceNative == null ? null : sourceNative.Object;
            }
            
            if (!Nullstone.RefEquals(_Source, sourceNative))
            {
                sourceNative = sourceNative ?? DependencyObjectNative.GetFromScriptObject(source) as ControlNative;
                _DetachListener(_Source);
                _Source = sourceNative;
                _AttachListener(_Source);
            }

            if (_Object.GetIsAttached())
                LocalValueChanged(IsEnabledProperty);
        }

        private void _AttachListener(ControlNative sourceNative)
        {
            if (sourceNative == null)
                return;
            sourceNative.SubscribePropertyChanged(IsEnabledProperty, this);
        }
        private void _DetachListener(ControlNative sourceNative)
        {
            if (sourceNative == null)
                return;
            sourceNative.UnsubscribePropertyChanged(IsEnabledProperty, this);
        }

        public bool LocalValueChanged(DependencyPropertyWrapper prop)
        {
            if (prop != null && prop._ID != IsEnabledProperty._ID)
                return false;

            var localEnabled = GetIsEnabledValue(_Object, PropertyPrecedence.LocalValue);
            var parentEnabled = _Source != null && (_Object as UIElementNative).VisualParent != null ? GetIsEnabledValue(_Source) : (bool?)null;
            var newValue = localEnabled == true && !(parentEnabled != false);
            if (newValue != _CurrentValue)
            {
                var oldValue = _CurrentValue;
                _CurrentValue = newValue;
                var error = HtmlPage.Window.CreateInstance("BError");
                _Object._ProviderValueChanged(_Precedence, IsEnabledProperty, oldValue, newValue, true, false, false, error);
                return true;
            }
            return false;
        }

        private static bool GetIsEnabledValue(DependencyObjectNative @object, int startingPrecedence = PropertyPrecedence.Highest)
        {
            var val = @object.GetValue(IsEnabledProperty, startingPrecedence);
            if (val == DependencyObjectNative.UNDEFINED)
                return false;
            return val is bool && (bool)val;
        }

        public void PropertyChanged(object sender, PropertyChangedEventArgsNative args)
        {
            this.LocalValueChanged(IsEnabledProperty);
        }
    }
}