using System;
using System.Collections.Generic;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    [ScriptableType]
    public class DependencyObjectNative : INullstoneObjectWrapper
    {
        public static DependencyObjectNative GetFromObject(object o)
        {
            return GetFromScriptObject(o as ScriptObject);
        }
        public static DependencyObjectNative GetFromScriptObject(ScriptObject so)
        {
            if (so == null)
                return null;
            return so.GetProperty("_Native") as DependencyObjectNative;
        }


        protected Dictionary<DependencyPropertyWrapper, int> _ProviderBitmasks = new Dictionary<DependencyPropertyWrapper, int>();
        protected List<PropertyValueProvider> _Providers = new List<PropertyValueProvider>();

        public static readonly UndefinedObject UNDEFINED = new UndefinedObject { ID = Guid.NewGuid() };

        public DependencyObjectNative(ScriptObject @object)
        {
            Object = @object;
            _IDLazy = new LazyMember<double>(@object, "_ID");

            for (int i = 0; i <= PropertyPrecedence.Lowest; i++)
            {
                _Providers.Add(null);
            }

            _Providers[PropertyPrecedence.LocalValue] = new LocalValuePropertyValueProvider(this);
            _Providers[PropertyPrecedence.DefaultValue] = new DefaultValuePropertyValueProvider(this);
            _Providers[PropertyPrecedence.AutoCreate] = new AutoCreatePropertyValueProvider(this);
        }

        #region Properties

        public ScriptObject Object { get; protected set; }

        private LazyMember<double> _IDLazy;
        public int _ID { get { return (int)_IDLazy.Value; } }
        
        public object _ResourceBase { get; set; }

        protected LocalValuePropertyValueProvider LocalValueProvider { get { return _Providers[PropertyPrecedence.LocalValue] as LocalValuePropertyValueProvider; } }
        protected AutoCreatePropertyValueProvider AutoCreateProvider { get { return _Providers[PropertyPrecedence.AutoCreate] as AutoCreatePropertyValueProvider; } }
        protected StylePropertyValueProvider LocalStyleProvider { get { return _Providers[PropertyPrecedence.LocalStyle] as StylePropertyValueProvider; } }
        protected ImplicitStylePropertyValueProvider ImplicitStyleProvider { get { return _Providers[PropertyPrecedence.ImplicitStyle] as ImplicitStylePropertyValueProvider; } }
        protected InheritedPropertyValueProvider InheritedProvider { get { return _Providers[PropertyPrecedence.Inherited] as InheritedPropertyValueProvider; } }

        #endregion

        #region GetValue

        [ScriptableMember]
        public object GetValue(ScriptObject prop)
        {
            return GetValue(new DependencyPropertyWrapper(prop));
        }
        public object GetValue(DependencyPropertyWrapper prop, int startingPrec = PropertyPrecedence.Highest, int endingPrec = PropertyPrecedence.Lowest)
        {
            var bitmask = GetProviderBitmask(prop) | prop.BitmaskCache;
            for (int i = startingPrec; i <= endingPrec; i++)
            {
                if ((bitmask & (1 << i)) == 0)
                    continue;
                var provider = _Providers[i];
                if (provider == null)
                    continue;
                var val = provider.GetPropertyValue(prop);
                if (val == DependencyObjectNative.UNDEFINED)
                    continue;
                return val;
            }
            return DependencyObjectNative.UNDEFINED;
        }
        internal object GetValueNoAutoCreate(DependencyPropertyWrapper prop)
        {
            var v = GetValue(prop, PropertyPrecedence.LocalValue, PropertyPrecedence.InheritedDataContext);
            if (v == DependencyObjectNative.UNDEFINED && prop._IsAutoCreated)
                v = AutoCreateProvider.ReadLocalValue(prop);
            return v;
        }

        #endregion

        #region SetValue

        [ScriptableMember]
        public void SetValue(ScriptObject prop, object value)
        {
            SetValue(new DependencyPropertyWrapper(prop), value);
        }
        private void SetValue(DependencyPropertyWrapper prop, object value)
        {
            if (prop == null)
                return;

            if (value == null)
            {
                this.DoSetValue(prop, value);
                return;
            }

            //is UnsetValue? --> ClearValue

            this.DoSetValue(prop, value);
        }
        private void DoSetValue(DependencyPropertyWrapper prop, object value)
        {
            var coerced = value;
            //TODO: Coercing
        }
        private bool DoSetValueImpl(DependencyPropertyWrapper prop, object value)
        {
            //TODO: If frozen (don't think this happens in silverlight) --> error

            object currentValue;
            var equal = false;

            if ((currentValue = ReadLocalValue(prop)) == UNDEFINED)
            {
                if (prop._IsAutoCreated)
                    currentValue = AutoCreateProvider.ReadLocalValue(prop);
            }

            if (currentValue != UNDEFINED && value != UNDEFINED)
                equal = !prop._AlwaysChange && Nullstone.Equals(currentValue, value);
            else
                equal = currentValue == UNDEFINED && value == UNDEFINED;

            if (!equal)
            {
                LocalValueProvider.ClearValue(prop);
                if (prop._IsAutoCreated)
                    AutoCreateProvider.ClearValue(prop);

                var newValue = value;

                if (newValue != UNDEFINED)
                    LocalValueProvider.SetValue(prop, newValue);
                _ProviderValueChanged(PropertyPrecedence.LocalValue, prop, currentValue, newValue, true, true, true);
            }

            return true;
        }

        #endregion

        #region ReadLocalValue

        [ScriptableMember]
        public object ReadLocalValue(ScriptObject prop)
        {
            return ReadLocalValue(new DependencyPropertyWrapper(prop));
        }
        private object ReadLocalValue(DependencyPropertyWrapper prop)
        {
            return LocalValueProvider.GetPropertyValue(prop);
        }

        #endregion

        #region ClearValue

        [ScriptableMember]
        public void ClearValue(ScriptObject prop, bool notifyListeners)
        {
            ClearValue(new DependencyPropertyWrapper(prop), notifyListeners);
        }
        private void ClearValue(DependencyPropertyWrapper prop, bool notifyListeners)
        {
            var oldLocalValue = this.ReadLocalValue(prop);
            if (oldLocalValue == UNDEFINED)
            {
                if (prop._IsAutoCreated)
                    oldLocalValue = AutoCreateProvider.ReadLocalValue(prop);
            }

            if (oldLocalValue != UNDEFINED)
            {
                if (oldLocalValue != null && oldLocalValue is ScriptObject)
                {
                    var dob = oldLocalValue as ScriptObject;
                    if (!prop._IsCustom)
                    {
                        var dobn = GetFromScriptObject(dob);
                        dobn.CallRemoveParent(this);
                        dobn.CallRemovePropertyChangedListener(Object, prop);
                        dobn._IsAttached = false;
                        if (Nullstone.Is(dob, JsTypeNames.Collection))
                        {
                            //TODO: Changed Event - Remove Handler
                            //TODO: Item Changed Event - Remove Handler
                        }
                    }
                }
                LocalValueProvider.ClearValue(prop);
                if (prop._IsAutoCreated)
                    AutoCreateProvider.ClearValue(prop);
            }

            for (int i = PropertyPrecedence.LocalValue + 1; i < PropertyPrecedence.Count; i++)
            {
                var provider = this._Providers[i];
                if (provider != null)
                    provider.RecomputePropertyValueOnClear(prop);
            }

            if (oldLocalValue != UNDEFINED)
                _ProviderValueChanged(PropertyPrecedence.LocalValue, prop, oldLocalValue, UNDEFINED, notifyListeners, true, false);
        }

        #endregion

        internal void _ProviderValueChanged(int precedence, DependencyPropertyWrapper prop, object oldProviderValue, object newProviderValue, bool notifyListeners, bool setParent, bool mergeNamesOnSetParent)
        {
            var bitmask = GetProviderBitmask(prop);
            if (newProviderValue != UNDEFINED)
                bitmask |= 1 << precedence;
            else
                bitmask &= ~(1 << precedence);
            _ProviderBitmasks[prop] = bitmask;

            var higher = (((1 << ((int)precedence + 1)) - 2) & bitmask) | prop.BitmaskCache;

            for (int j = precedence - 1; j >= PropertyPrecedence.Highest; j--)
            {
                if ((higher & (1 << j)) == 0)
                    continue;
                var provider = _Providers[j];
                if (provider == null)
                    continue;
                if (provider.GetPropertyValue(prop) != UNDEFINED)
                {
                    _CallRecomputePropertyValueForProviders(prop, precedence);
                    return;
                }
            }

            object oldValue = UNDEFINED;
            object newValue = UNDEFINED;

            if (oldProviderValue == UNDEFINED || newProviderValue == UNDEFINED)
            {
                var lowerPriorityValue = GetValue(prop, precedence + 1);
                if (newProviderValue == UNDEFINED)
                {
                    oldValue = oldProviderValue;
                    newValue = lowerPriorityValue;
                }
                else if (oldProviderValue == UNDEFINED)
                {
                    oldValue = lowerPriorityValue;
                    newValue = newProviderValue;
                }
            }
            else
            {
                oldValue = oldProviderValue;
                newValue = newProviderValue;
            }

            var equal = (oldValue == null && newValue == null) || (oldValue == UNDEFINED && newValue == UNDEFINED);
            if (oldValue != null && newValue != null)
            {
                equal = !prop._AlwaysChange && Nullstone.Equals(oldValue, newValue);
            }

            if (equal)
                return;


            if (precedence != PropertyPrecedence.IsEnabled)
            {
                var isEnabledProvider = _Providers[PropertyPrecedence.IsEnabled] as InheritedIsEnabledPropertyValueProvider;
                if (isEnabledProvider != null && isEnabledProvider.LocalValueChanged(prop))
                    return;
            }

            _CallRecomputePropertyValueForProviders(prop, precedence);

            DependencyObjectNative oldDON = null;
            DependencyObjectNative newDON = null;

            var setsParent = setParent && !prop._IsCustom;
            oldDON = GetFromObject(oldValue);
            newDON = GetFromObject(newValue);

            if (oldDON != null)
            {
                if (setsParent)
                {
                    oldDON._IsAttached = false;
                    oldDON.CallRemoveParent(this);
                    oldDON.CallRemoveTarget(this);

                    oldDON.CallRemovePropertyChangedListener(Object, prop);
                    if (Nullstone.Is(oldDON.Object, JsTypeNames.Collection))
                    {
                        //TODO: 
                        //  Unsubscribe Collection Changed Event handler
                        //  Unsubscribe Collection Item Changed Event handler
                    }
                }
                else
                {
                    oldDON.Mentor = null;
                }
            }
            if (newDON != null)
            {
                if (setsParent)
                {
                    newDON._IsAttached = this._IsAttached;
                    newDON.CallAddParent(this, mergeNamesOnSetParent);

                    newDON._ResourceBase = _ResourceBase;
                    if (Nullstone.Is(newDON.Object, JsTypeNames.Collection))
                    {
                        //TODO: 
                        //  Subscribe Collection Changed Event handler
                        //  Subscribe Collection Item Changed Event handler
                    }
                    oldDON.CallAddPropertyChangedListener(Object, prop);
                }
                else
                {
                    //TODO: Recurse up mentors until finding a FrameworkElement, Set as mentor
                }
            }

            if (notifyListeners)
            {
                var args = new PropertyChangedEventArgsNative(prop, oldValue, newValue);
                CallOnPropertyChanged(args);
                prop.CallChangedCallback(this, args);

                if (prop._Inheritable > 0)
                {
                    if (precedence != PropertyPrecedence.Inherited)
                    {
                        if (InheritedProvider != null && ((GetProviderBitmask(prop) & ((1 << PropertyPrecedence.Inherited) - 1)) != 0))
                        {
                            InheritedProvider.PropagateInheritedProperty(prop, this, this);
                        }
                    }
                }
            }
        }

        private void _CallRecomputePropertyValueForProviders(DependencyPropertyWrapper prop, int precedence)
        {
            for (int i = 0; i < precedence; i++)
            {
                var provider = _Providers[i];
                if (provider != null)
                    provider.RecomputePropertyValueOnLower(prop);
            }
        }

        #region Inherited Helpers

        internal bool _PropagateInheritedValue(int inheritable, DependencyObjectNative source, object newValue)
        {
            if (InheritedProvider == null)
                return true;

            InheritedProvider.SetPropertySource(inheritable, source);
            var prop = InheritedPropertyValueProvider.GetProperty(inheritable, this);
            if (prop == null)
                return false;

            _ProviderValueChanged(PropertyPrecedence.Inherited, prop, UNDEFINED, newValue, true, false, false);
            return true;
        }
        internal object _GetInheritedValueSource(int inheritable)
        {
            if (InheritedProvider == null)
                return null;
            return InheritedProvider.GetPropertySource(inheritable);
        }
        internal void _SetInheritedValueSource(int inheritable, DependencyObjectNative source)
        {
            if (InheritedProvider == null)
                return;
            if (source == null)
            {
                var prop = InheritedPropertyValueProvider.GetProperty(inheritable, this);
                if (prop == null)
                    return;
                _ProviderBitmasks[prop] = GetProviderBitmask(prop) & ~(1 << PropertyPrecedence.Inherited);
            }
            InheritedProvider.SetPropertySource(inheritable, source);
        }

        internal int GetPropertyValueProvider(DependencyPropertyWrapper prop)
        {
            var bitmask = _ProviderBitmasks[prop];
            for (int i = 0; i < PropertyPrecedence.Lowest; i++)
            {
                var p = 1 << i;
                if ((bitmask & p) == p)
                    return i;
                if (i == PropertyPrecedence.DefaultValue && prop._HasDefaultValue)
                    return i;
                if (i == PropertyPrecedence.AutoCreate && prop._IsAutoCreated)
                    return i;
            }
            return -1;
        }

        internal virtual IEnumerable<DependencyObjectNative> GetChildrenForInheritedPropagation()
        {
            throw new NotImplementedException();
        }

        #endregion

        #region Property Changed

        private void CallOnPropertyChanged(PropertyChangedEventArgsNative args)
        {
            RaisePropertyChanged(args);
            Object.InvokeSelf("_OnPropertyChanged", args.Object);
        }
        private void CallAddPropertyChangedListener(ScriptObject so, DependencyPropertyWrapper prop)
        {
            Object.InvokeSelf("AddPropertyChangedListener", so, prop.Object);
        }
        private void CallRemovePropertyChangedListener(ScriptObject so, DependencyPropertyWrapper prop)
        {
            Object.InvokeSelf("RemovePropertyChangedListener", so, prop.Object);
        }

        private List<WeakPropertyChangedHandler> _PropertyChangedListeners = new List<WeakPropertyChangedHandler>();
        internal void SubscribePropertyChanged(DependencyPropertyWrapper prop, IPropertyChangedListener listener)
        {
            _PropertyChangedListeners.Add(new WeakPropertyChangedHandler(listener, prop));
        }
        internal void UnsubscribePropertyChanged(DependencyPropertyWrapper prop, IPropertyChangedListener listener)
        {
            for (int i = 0; i < _PropertyChangedListeners.Count; i++)
            {
                var pcl = _PropertyChangedListeners[i];
                if (pcl.Property == prop && pcl.WeakListener.Target == listener)
                {
                    _PropertyChangedListeners.RemoveAt(i);
                    i--;
                }
            }
        }
        private void RaisePropertyChanged(PropertyChangedEventArgsNative args)
        {
            for (int i = 0; i < _PropertyChangedListeners.Count; i++)
            {
                var listener = _PropertyChangedListeners[i];
                if (!listener.Handle(this, args))
                {
                    _PropertyChangedListeners.RemoveAt(i);
                    i--;
                }
            }
        }

        #endregion

        #region IsAttached

        private bool __IsAttached;
        public bool _IsAttached
        {
            get { return __IsAttached; }
            set
            {
                if (__IsAttached == value)
                    return;
                __IsAttached = value;
                _OnAttachedChanged(value);
            }
        }
        private void _OnAttachedChanged(bool isAttached)
        {
            LocalValueProvider.ForeachValue((p, v) => _PropagateIsAttached(p, v, isAttached));
            AutoCreateProvider.ForeachValue((p, v) => _PropagateIsAttached(p, v, isAttached));
        }

        private static void _PropagateIsAttached(DependencyPropertyWrapper prop, object value, bool newIsAttached)
        {
            if (prop._IsCustom)
                return;
            var so = value as ScriptObject;
            if (so == null)
                return;

            if (Nullstone.Is(so, JsTypeNames.DependencyObject))
            {
                var dobn = DependencyObjectNative.GetFromScriptObject(so);
                dobn._IsAttached = newIsAttached;
            }
        }

        #endregion

        #region Target

        private void CallAddTarget(DependencyObjectNative obj)
        {
        }
        private void CallRemoveTarget(DependencyObjectNative obj)
        {
        }

        #endregion

        #region Parent

        private void CallAddParent(DependencyObjectNative parent, bool mergeNamesFromSubtree)
        {
            Object.InvokeSelf("_AddParent", parent.Object, mergeNamesFromSubtree);
        }
        private void CallRemoveParent(DependencyObjectNative parent)
        {
            Object.InvokeSelf("_RemoveParent", parent.Object);
        }

        #endregion

        #region Mentor

        private DependencyObjectNative _Mentor;
        public DependencyObjectNative Mentor
        {
            get { return _Mentor; }
            set
            {
                if (_Mentor == value)
                    return;
                var oldMentor = _Mentor;
                _Mentor = value;
                _OnMentorChanged(oldMentor, value);
            }
        }

        private void _OnMentorChanged(DependencyObjectNative oldMentor, DependencyObjectNative newMentor)
        {
            if (!Nullstone.Is(Object, JsTypeNames.FrameworkElement))
            {
                AutoCreateProvider.ForeachValue((p, v) => _PropagateMentorChanged(p, v, newMentor));
                LocalValueProvider.ForeachValue((p, v) => _PropagateMentorChanged(p, v, newMentor));
                if (LocalStyleProvider != null)
                    LocalStyleProvider.ForeachValue((p, v) => _PropagateMentorChanged(p, v, newMentor));
                if (ImplicitStyleProvider != null)
                    ImplicitStyleProvider.ForeachValue((p, v) => _PropagateMentorChanged(p, v, newMentor));
            }
        }

        private static void _PropagateMentorChanged(DependencyPropertyWrapper prop, object value, DependencyObjectNative newMentor)
        {
            var dobn = GetFromObject(value);
            if (dobn == null)
                return;
            dobn.Mentor = newMentor;
        }

        #endregion

        private int GetProviderBitmask(DependencyPropertyWrapper prop)
        {
            if (_ProviderBitmasks.ContainsKey(prop))
                return _ProviderBitmasks[prop];
            return 0;
        }
    }
}