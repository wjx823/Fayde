using System;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class InheritedDataContextPropertyValueProvider : PropertyValueProvider, IPropertyChangedListener
    {
        public static DependencyPropertyWrapper DataContextProperty;

        private FrameworkElementNative _Source;

        public InheritedDataContextPropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.InheritedDataContext)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            if (_Source == null || prop._ID != DataContextProperty._ID)
                return DependencyObjectNative.UNDEFINED;
            return _Source.GetValue(prop);
        }

        internal void SetDataSource(ScriptObject source)
        {
            if (Nullstone.RefEquals(this._Source.Object, source))
                return;

            var sourceNative = DependencyObjectNative.GetFromScriptObject(source) as FrameworkElementNative;

            var oldValue = this._Source == null ? DependencyObjectNative.UNDEFINED : this._Source.GetValue(DataContextProperty);
            var newValue = sourceNative == null ? DependencyObjectNative.UNDEFINED : sourceNative.GetValue(DataContextProperty);

            _DetachListener(this._Source);
            this._Source = sourceNative;
            _AttachListener(this._Source);

            if (!Nullstone.Equals(oldValue, newValue))
                _Object._ProviderValueChanged(_Precedence, DataContextProperty, oldValue, newValue, false, false, false);
        }

        private void _AttachListener(FrameworkElementNative sourceNative)
        {
            if (sourceNative == null)
                return;
             sourceNative.SubscribePropertyChanged(DataContextProperty, this);
        }
        private void _DetachListener(FrameworkElementNative sourceNative)
        {
            if (sourceNative == null)
                return;
            sourceNative.UnsubscribePropertyChanged(DataContextProperty, this);
        }

        internal void EmitChanged()
        {
            if (_Source != null)
            {
                _Object._ProviderValueChanged(_Precedence, DataContextProperty, DependencyObjectNative.UNDEFINED, _Source.GetValue(DataContextProperty), true, false, false);
            }
        }
        
        public void PropertyChanged(object sender, PropertyChangedEventArgsNative args)
        {
            _Object._ProviderValueChanged(_Precedence, args.Property, args.OldValue, args.NewValue, true, false, false);
        }
    }
}