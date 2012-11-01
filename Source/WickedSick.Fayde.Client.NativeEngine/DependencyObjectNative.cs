using System;
using System.Collections.Generic;
using System.Linq;
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
            var obj = so.GetProperty("_Native") as ScriptObject;
            if (obj == null)
                return null;
            return obj.ManagedObject as DependencyObjectNative;
        }


        protected Dictionary<DependencyPropertyWrapper, int> _ProviderBitmasks = new Dictionary<DependencyPropertyWrapper, int>();
        protected List<PropertyValueProvider> _Providers = new List<PropertyValueProvider>();

        public static readonly UndefinedObject UNDEFINED = new UndefinedObject { ID = Guid.NewGuid() };
        public static DependencyPropertyWrapper NameProperty;

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

        #endregion

        #region Providers

        protected LocalValuePropertyValueProvider LocalValueProvider { get { return _Providers[PropertyPrecedence.LocalValue] as LocalValuePropertyValueProvider; } }
        protected AutoCreatePropertyValueProvider AutoCreateProvider { get { return _Providers[PropertyPrecedence.AutoCreate] as AutoCreatePropertyValueProvider; } }
        protected InheritedPropertyValueProvider InheritedProvider { get { return _Providers[PropertyPrecedence.Inherited] as InheritedPropertyValueProvider; } }

        #endregion

        #region GetValue

        [ScriptableMember]
        public object GetValue(ScriptObject prop, double startingPrec, double endingPrec)
        {
            return GetValue(DependencyPropertyWrapper.Lookup(prop), (int)startingPrec, (int)endingPrec);
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

        [ScriptableMember]
        public object GetValueNoAutoCreate(ScriptObject prop)
        {
            return GetValueNoAutoCreate(DependencyPropertyWrapper.Lookup(prop));
        }
        internal object GetValueNoAutoCreate(DependencyPropertyWrapper prop)
        {
            var v = GetValue(prop, PropertyPrecedence.LocalValue, PropertyPrecedence.InheritedDataContext);
            if (v == DependencyObjectNative.UNDEFINED && prop._IsAutoCreated)
                v = AutoCreateProvider.ReadLocalValue(prop);
            return v;
        }

        [ScriptableMember]
        public object GetValueNoDefault(ScriptObject prop)
        {
            return GetValueNoDefault(DependencyPropertyWrapper.Lookup(prop));
        }
        internal object GetValueNoDefault(DependencyPropertyWrapper prop)
        {
            for (int i = 0; i < PropertyPrecedence.DefaultValue; i++)
			{
                var provider = _Providers[i];
                if (provider == null)
                    continue;
                var value = provider.GetPropertyValue(prop);
                if (value != UNDEFINED)
                    return value;
			}
            return UNDEFINED;
        }

        #endregion

        #region SetValue

        [ScriptableMember]
        public void SetValue(ScriptObject prop, object value, ScriptObject error)
        {
            SetValue(DependencyPropertyWrapper.Lookup(prop), value, error);
        }
        private void SetValue(DependencyPropertyWrapper prop, object value, ScriptObject error)
        {
            if (prop == null)
                return;

            if (value == null)
            {
                this.DoSetValue(prop, value, error);
                return;
            }

            //is UnsetValue? --> ClearValue

            this.DoSetValue(prop, value, error);
        }
        private void DoSetValue(DependencyPropertyWrapper prop, object value, ScriptObject error)
        {
            var coerced = value;
            //TODO: Coercer/validate
            DoSetValueImpl(prop, value, error);
        }
        private bool DoSetValueImpl(DependencyPropertyWrapper prop, object value, ScriptObject error)
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
                _ProviderValueChanged(PropertyPrecedence.LocalValue, prop, currentValue, newValue, true, true, true, error);
            }

            return true;
        }

        #endregion

        #region ReadLocalValue

        [ScriptableMember]
        public object ReadLocalValue(ScriptObject prop)
        {
            return ReadLocalValue(DependencyPropertyWrapper.Lookup(prop));
        }
        private object ReadLocalValue(DependencyPropertyWrapper prop)
        {
            return LocalValueProvider.GetPropertyValue(prop);
        }

        #endregion

        #region ClearValue

        [ScriptableMember]
        public void ClearValue(ScriptObject prop, object notifyListeners, ScriptObject error)
        {
            ClearValue(DependencyPropertyWrapper.Lookup(prop), notifyListeners != null && notifyListeners is bool && (bool)notifyListeners, error);
        }
        private void ClearValue(DependencyPropertyWrapper prop, bool notifyListeners, ScriptObject error)
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
                        if (dobn != null)
                        {
                            dobn.CallRemoveParent(this, error);
                            dobn.CallRemovePropertyChangedListener(Object, prop);
                            dobn.SetIsAttached(false);
                            if (dobn is CollectionNative)
                            {
                                //TODO: Changed Event - Remove Handler
                                //TODO: Item Changed Event - Remove Handler
                            }
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
                    provider.RecomputePropertyValueOnClear(prop, error);
            }

            if (oldLocalValue != UNDEFINED)
                _ProviderValueChanged(PropertyPrecedence.LocalValue, prop, oldLocalValue, UNDEFINED, notifyListeners, true, false, error);
        }

        #endregion

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
        internal void _ProviderValueChanged(int precedence, DependencyPropertyWrapper prop, object oldProviderValue, object newProviderValue, bool notifyListeners, bool setParent, bool mergeNamesOnSetParent, ScriptObject error)
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
                    _CallRecomputePropertyValueForProviders(prop, precedence, error);
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

            _CallRecomputePropertyValueForProviders(prop, precedence, error);

            DependencyObjectNative oldDON = null;
            DependencyObjectNative newDON = null;

            var setsParent = setParent && !prop._IsCustom;
            oldDON = GetFromObject(oldValue);
            newDON = GetFromObject(newValue);

            if (oldDON != null)
            {
                if (setsParent)
                {
                    oldDON.SetIsAttached(false);
                    oldDON.CallRemoveParent(this, error);
                    oldDON.CallRemoveTarget(this);

                    oldDON.CallRemovePropertyChangedListener(Object, prop);
                    CallRemoveCollectionListeners(oldDON);
                }
                else
                {
                    oldDON.SetMentor(null);
                }
            }
            if (newDON != null)
            {
                if (setsParent)
                {
                    newDON.SetIsAttached(this.GetIsAttached());
                    newDON.CallAddParent(this, mergeNamesOnSetParent, error);

                    newDON._ResourceBase = _ResourceBase;
                    CallAddCollectionListeners(newDON);
                    newDON.CallAddPropertyChangedListener(Object, prop);
                }
                else
                {
                    newDON.SetMentor(FindAncestorMentor());
                }
            }

            if (notifyListeners)
            {
                var args = new PropertyChangedEventArgsNative(prop, oldValue, newValue);
                CallOnPropertyChanged(args, error);
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
        private void _CallRecomputePropertyValueForProviders(DependencyPropertyWrapper prop, int precedence, ScriptObject error)
        {
            for (int i = 0; i < precedence; i++)
            {
                var provider = _Providers[i];
                if (provider != null)
                    provider.RecomputePropertyValueOnLower(prop, error);
            }
        }

        #region Inherited Helpers

        internal bool _PropagateInheritedValue(int inheritable, DependencyObjectNative source, object newValue)
        {
            if (InheritedProvider == null)
                return true;

            InheritedProvider.SetPropertySource(inheritable, source);
            var prop = DependencyPropertyWrapper.GetFromInheritable(inheritable, this);
            if (prop == null)
                return false;

            var error = HtmlPage.Window.CreateInstance("BError");
            _ProviderValueChanged(PropertyPrecedence.Inherited, prop, UNDEFINED, newValue, true, false, false, error);
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
                var prop = DependencyPropertyWrapper.GetFromInheritable(inheritable, this);
                if (prop == null)
                    return;
                _ProviderBitmasks[prop] = GetProviderBitmask(prop) & ~(1 << PropertyPrecedence.Inherited);
            }
            InheritedProvider.SetPropertySource(inheritable, source);
        }
        internal virtual IEnumerable<DependencyObjectNative> GetChildrenForInheritedPropagation()
        {
            return Enumerable.Empty<DependencyObjectNative>();
        }

        [ScriptableMember]
        public void PropagateOnAdd(ScriptObject item)
        {
            InheritedProvider.PropagateInheritedPropertiesOnAddingToTree(DependencyObjectNative.GetFromScriptObject(item));
        }

        [ScriptableMember]
        public void PropagateOnRemove(ScriptObject item)
        {
            InheritedProvider.ClearInheritedPropertiesOnRemovingFromTree(DependencyObjectNative.GetFromScriptObject(item));
        }

        #endregion

        #region Property Changed

        private void CallOnPropertyChanged(PropertyChangedEventArgsNative args, ScriptObject error)
        {
            RaisePropertyChanged(args);
            Object.Invoke("_OnPropertyChanged", args.Object, error);
        }
        private void CallAddPropertyChangedListener(ScriptObject so, DependencyPropertyWrapper prop)
        {
            Object.Invoke("AddPropertyChangedListener", so, prop.Object);
        }
        private void CallRemovePropertyChangedListener(ScriptObject so, DependencyPropertyWrapper prop)
        {
            Object.Invoke("RemovePropertyChangedListener", so, prop.Object);
        }
        private void CallAddCollectionListeners(DependencyObjectNative don)
        {
            Object.Invoke("AddCollectionListeners", don.Object);
        }
        private void CallRemoveCollectionListeners(DependencyObjectNative don)
        {
            Object.Invoke("RemoveCollectionListeners", don.Object);
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

        [ScriptableMember]
        public void _OnIsAttachedChanged(object isAttachedObject)
        {
            var isAttached = isAttachedObject != null && isAttachedObject is bool && (bool)isAttachedObject;
            LocalValueProvider.ForeachValue((p, v) => _PropagateIsAttached(p, v, isAttached));
            AutoCreateProvider.ForeachValue((p, v) => _PropagateIsAttached(p, v, isAttached));
        }

        internal bool GetIsAttached()
        {
            var val = Object.GetProperty("_IsAttached");
            return val != null && val is bool && (bool)val;
        }
        internal void SetIsAttached(bool isAttached)
        {
            Object.Invoke("_SetIsAttached", isAttached);
        }

        private static void _PropagateIsAttached(DependencyPropertyWrapper prop, object value, bool newIsAttached)
        {
            if (prop._IsCustom)
                return;
            var dobn = DependencyObjectNative.GetFromObject(value);
            if (dobn != null)
                dobn.SetIsAttached(newIsAttached);
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

        private void CallAddParent(DependencyObjectNative parent, bool mergeNamesFromSubtree, ScriptObject error)
        {
            Object.Invoke("_AddParent", parent.Object, mergeNamesFromSubtree, error);
        }
        private void CallRemoveParent(DependencyObjectNative parent, ScriptObject error)
        {
            Object.Invoke("_RemoveParent", parent.Object, error);
        }

        #endregion

        #region Mentor

        protected ScriptObject FindAncestorMentor()
        {
            var native = this;
            var obj = Object;
            while (native != null && !(native is FrameworkElementNative))
            {
                obj = native.GetMentor();
                native = GetFromObject(obj);
            }
            return obj;
        }

        protected ScriptObject GetMentor()
        {
            return Object.GetProperty("_Mentor") as ScriptObject;
        }

        protected void SetMentor(ScriptObject value)
        {
            Object.Invoke("SetMentor", value);
        }

        [ScriptableMember]
        public virtual void ChangeMentors(ScriptObject oldMentor, ScriptObject newMentor)
        {
            AutoCreateProvider.ForeachValue((p, v) => _PropagateMentorChanged(p, v, oldMentor, newMentor));
            LocalValueProvider.ForeachValue((p, v) => _PropagateMentorChanged(p, v, oldMentor, newMentor));
        }

        protected void _PropagateMentorChanged(DependencyPropertyWrapper prop, object value, ScriptObject oldMentor, ScriptObject newMentor)
        {
            var dobn = GetFromObject(value);
            if (dobn == null)
                return;
            dobn.SetMentor(newMentor);
        }

        #endregion

        #region Name

        [ScriptableMember]
        public void RegisterNames(ScriptObject namescope, ScriptObject error)
        {
            AutoCreateProvider.ForeachValue((prop, value) => RegisterNames(prop, value, namescope, error));
            LocalValueProvider.ForeachValue((prop, value) => RegisterNames(prop, value, namescope, error));
        }

        private void RegisterNames(DependencyPropertyWrapper prop, object value, ScriptObject namescope, ScriptObject error)
        {
            var dobn = DependencyObjectNative.GetFromObject(value);
            if (dobn == null)
                return;
            dobn.Object.Invoke("_RegisterAllNamesRootedAt", namescope, error);
        }

        [ScriptableMember]
        public void UnregisterNames(ScriptObject namescope)
        {
            AutoCreateProvider.ForeachValue((prop, value) => UnregisterNames(prop, value, namescope));
            LocalValueProvider.ForeachValue((prop, value) => UnregisterNames(prop, value, namescope));
        }

        private void UnregisterNames(DependencyPropertyWrapper prop, object value, ScriptObject namescope)
        {
            if (prop._IsCustom)
                return;
            var dobn = DependencyObjectNative.GetFromObject(value);
            if (dobn == null)
                return;
            dobn.Object.Invoke("_UnregisterAllNamesRootedAt", namescope);
        }

        #endregion

        #region Clone

        [ScriptableMember]
        public void CloneCore(ScriptObject source)
        {
            var sourceNative = GetFromObject(source);
            AutoCreateProvider.ForeachValue((prop, value) => CloneAutoCreatedValue(prop, value, sourceNative, this));
            LocalValueProvider.ForeachValue((prop, value) => CloneLocalValue(prop, value, this));
        }

        private void CloneAutoCreatedValue(DependencyPropertyWrapper prop, object value, DependencyObjectNative oldObject, DependencyObjectNative newObject)
        {
            var oldValue = oldObject.GetValue(prop, PropertyPrecedence.AutoCreate);
            var newValue = newObject.GetValue(prop, PropertyPrecedence.AutoCreate);

            var oldValueNative = GetFromObject(oldValue);
            var newValueNative = GetFromObject(newValue);
            if (oldValueNative != null && newValueNative != null)
                newValueNative.Object.Invoke("CloneCore", oldValueNative.Object);
        }

        private void CloneLocalValue(DependencyPropertyWrapper prop, object value, DependencyObjectNative newObject)
        {
            if (prop._ID == NameProperty._ID)
                return;
            var error = HtmlPage.Window.CreateInstance("BError");
            newObject.SetValue(prop, DependencyObjectInterop.Clone(value), error);
        }

        #endregion

        protected int GetProviderBitmask(DependencyPropertyWrapper prop)
        {
            if (_ProviderBitmasks.ContainsKey(prop))
                return _ProviderBitmasks[prop];
            return 0;
        }
    }
}