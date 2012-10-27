using System.Collections.Generic;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Walkers;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class StylePropertyValueProvider : PropertyValueProvider
    {
        private ScriptObject _Style;
        private Dictionary<DependencyPropertyWrapper, object> _ht = new Dictionary<DependencyPropertyWrapper, object>();

        public StylePropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.LocalStyle)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            return _ht[prop];
        }

        public override void RecomputePropertyValueOnClear(DependencyPropertyWrapper prop, ScriptObject error)
        {
            var walker = new DeepStyleWalker(_Style);
            SetterNative setter;
            while ((setter = walker.Step()) != null)
            {
                var walkProp = setter.Property;
                if (walkProp._ID != prop._ID)
                    continue;

                var newValue = setter.ConvertedValue;
                var oldValue = _ht[prop];
                _ht[prop] = newValue;
                _Object._ProviderValueChanged(_Precedence, prop, oldValue, newValue, true, true, true, error);
            }
        }

        public void UpdateStyle(ScriptObject style, ScriptObject error)
        {
            var oldWalker = new DeepStyleWalker(_Style);
            var newWalker = new DeepStyleWalker(style);
            style.Invoke("_Seal");

            var oldSetter = oldWalker.Step();
            var newSetter = newWalker.Step();
            DependencyPropertyWrapper oldProp = null;
            DependencyPropertyWrapper newProp = null;

            object oldValue = DependencyObjectNative.UNDEFINED;
            object newValue = DependencyObjectNative.UNDEFINED;

            while (oldSetter != null || newSetter != null)
            {
                if (oldSetter != null)
                    oldProp = oldSetter.Property;
                if (newSetter != null)
                    newProp = newSetter.Property;

                if (oldProp != null && (oldProp._ID < newProp._ID || newProp == null))
                {
                    oldValue = oldSetter.ConvertedValue;
                    newValue = DependencyObjectNative.UNDEFINED;
                    _ht.Remove(oldProp);
                    _Object._ProviderValueChanged(_Precedence, oldProp, oldValue, newValue, true, true, false, error);
                    oldSetter = oldWalker.Step();
                }
                else if (oldProp != null && newProp != null && oldProp._ID == newProp._ID)
                {
                    oldValue = oldSetter.ConvertedValue;
                    newValue = newSetter.ConvertedValue;
                    _ht[oldProp] = newValue;
                    _Object._ProviderValueChanged(_Precedence, oldProp, oldValue, newValue, true, true, false, error);
                    oldSetter = oldWalker.Step();
                    newSetter = newWalker.Step();
                }
                else
                {
                    oldValue = DependencyObjectNative.UNDEFINED;
                    newValue = newSetter.ConvertedValue;
                    _ht[newProp] = newValue;
                    _Object._ProviderValueChanged(_Precedence, newProp, oldValue, newValue, true, true, false, error);
                    newSetter = newWalker.Step();
                }
            }

            _Style = style;
        }
    }
}