using System;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public abstract class PropertyValueProvider
    {
        protected DependencyObjectNative _Object;
        protected int _Precedence;

        public PropertyValueProvider(DependencyObjectNative @do, int precedence)
        {
            _Object = @do;
            _Precedence = precedence;
        }

        public abstract object GetPropertyValue(DependencyPropertyWrapper prop);

        public virtual void RecomputePropertyValueOnClear(DependencyPropertyWrapper prop, ScriptObject error) { }
        public virtual void RecomputePropertyValueOnLower(DependencyPropertyWrapper prop, ScriptObject error) { }

        public virtual void ForeachValue(Action<DependencyPropertyWrapper, object> action) { }
    }
}