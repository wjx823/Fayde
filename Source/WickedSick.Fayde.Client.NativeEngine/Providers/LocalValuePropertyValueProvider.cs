using System.Collections.Generic;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class LocalValuePropertyValueProvider : PropertyValueProvider
    {
        private Dictionary<DependencyPropertyWrapper, object> _ht = new Dictionary<DependencyPropertyWrapper, object>();

        public LocalValuePropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.LocalValue)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            if (!_ht.ContainsKey(prop))
                return DependencyObjectNative.UNDEFINED;
            return _ht[prop];
        }

        public void SetValue(DependencyPropertyWrapper prop, object value)
        {
            this._ht[prop] = value;
        }

        public void ClearValue(DependencyPropertyWrapper prop)
        {
            if (_ht.ContainsKey(prop))
                _ht.Remove(prop);
        }

        public override void ForeachValue(System.Action<DependencyPropertyWrapper, object> action)
        {
            foreach (var kvp in _ht)
            {
                action(kvp.Key, kvp.Value);
            }
        }
    }
}