using System;
using System.Collections.Generic;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class DependencyPropertyWrapper : INullstoneObjectWrapper
    {
        private static Dictionary<double, DependencyPropertyWrapper> _Registered = new Dictionary<double, DependencyPropertyWrapper>();

        public static DependencyPropertyWrapper Lookup(ScriptObject jsProp)
        {
            var id = (double)jsProp.GetProperty("_ID");
            if (_Registered.ContainsKey(id))
                return _Registered[id];
            var prop = new DependencyPropertyWrapper(jsProp);
            _Registered[id] = prop;
            return prop; 
        }

        public DependencyPropertyWrapper(ScriptObject @object)
        {
            Object = @object;
            _IDLazy = new LazyMember<double>(@object, "_ID");
            _NameLazy = new LazyMember<string>(@object, "Name");
            _DefaultValueLazy = new LazyMember<object>(@object, "DefaultValue");
            _HasDefaultLazy = new LazyMember<bool?>(@object, "_HasDefaultValue");
            _IsAutoCreatedLazy = new LazyMember<bool?>(@object, "_IsAutoCreated");
            _AutoCreatorLazy = new LazyMember<ScriptObject>(@object, "_AutoCreator");
            _IsCustomLazy = new LazyMember<bool?>(@object, "_IsCustom");
            _AlwaysChangeLazy = new LazyMember<bool?>(@object, "_AlwaysChange");
            _ChangedCallbackLazy = new LazyMember<object>(@object, "_ChangedCallback");
            _InheritableLazy = new LazyMember<double?>(@object, "_Inheritable");
            _OwnerTypeLazy = new LazyMember<ScriptObject>(@object, "OwnerType");
        }

        public static ScriptObject JsCtor { get; set; }
        public ScriptObject Object { get; protected set; }

        #region Javascript Members

        private LazyMember<double> _IDLazy;
        public int _ID { get { return (int)_IDLazy.Value; } }

        private LazyMember<string> _NameLazy;
        public string Name { get { return _NameLazy.Value; } }

        private LazyMember<object> _DefaultValueLazy;
        public object DefaultValue { get { return _DefaultValueLazy.Value; } }

        private LazyMember<bool?> _HasDefaultLazy;
        public bool _HasDefaultValue { get { return _HasDefaultLazy.Value == true; } }

        private LazyMember<bool?> _IsAutoCreatedLazy;
        public bool _IsAutoCreated { get { return _IsAutoCreatedLazy.Value == true; } }

        private LazyMember<ScriptObject> _AutoCreatorLazy;
        public ScriptObject _AutoCreator { get { return _AutoCreatorLazy.Value; } }

        private LazyMember<bool?> _IsCustomLazy;
        public bool _IsCustom { get { return _IsCustomLazy.Value == true; } }

        private LazyMember<bool?> _AlwaysChangeLazy;
        public bool _AlwaysChange { get { return _AlwaysChangeLazy.Value == true; } }

        private LazyMember<object> _ChangedCallbackLazy;
        public object _ChangedCallback { get { return _ChangedCallbackLazy.Value; } }

        private LazyMember<double?> _InheritableLazy;
        public int _Inheritable { get { return (int)(_InheritableLazy.Value ?? 0.0); } }

        private LazyMember<ScriptObject> _OwnerTypeLazy;
        public ScriptObject OwnerType { get { return _OwnerTypeLazy.Value as ScriptObject; } }

        #endregion

        private int _BitmaskCache;
        public int BitmaskCache
        {
            get
            {
                if (_BitmaskCache == 0)
                {
                    _BitmaskCache |= 1 << PropertyPrecedence.Inherited;
                    _BitmaskCache |= 1 << PropertyPrecedence.DynamicValue;
                    if (_IsAutoCreated)
                        _BitmaskCache |= 1 << PropertyPrecedence.AutoCreate;
                    if (_HasDefaultValue)
                        _BitmaskCache |= 1 << PropertyPrecedence.DefaultValue;
                }
                return _BitmaskCache;
            }
        }

        internal object _GetAutoCreatedValue(DependencyObjectNative @do)
        {
            return _AutoCreator.Invoke("GetValue", Object, @do.Object);
        }

        internal void CallChangedCallback(DependencyObjectNative donative, PropertyChangedEventArgsNative args)
        {
            if (_ChangedCallback == null)
                return;
            Object.Invoke("_ChangedCallback", donative.Object, args.Object);
        }

        internal int GetInheritable(object ancestor)
        {
            var rv = Object.Invoke("_GetInheritable", ancestor);
            if (rv == null)
                return 0;
            return (int)(double)rv;
        }

        internal static DependencyPropertyWrapper GetFromInheritable(int inheritable, object ancestor)
        {
            var rv = JsCtor.Invoke("_GetFromInheritable", inheritable, ancestor) as ScriptObject;
            if (rv == null)
                return null;
            return DependencyPropertyWrapper.Lookup(rv);
        }

        internal bool Coerce(ScriptObject instance, object value, ScriptObject error, out object coerced)
        {
            coerced = Object.Invoke("_Coerce", instance, value, error);
            return coerced != null && coerced != DependencyObjectNative.UNDEFINED;
        }

        internal bool Validate(ScriptObject instance, object value, ScriptObject error)
        {
            var o = Object.Invoke("_Validate", instance, Object, value, error);
            return o is bool && (bool)o;
        }
    }
}