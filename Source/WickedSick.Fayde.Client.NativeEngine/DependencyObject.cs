using System;
using System.Collections.Generic;
using System.Net;
using System.Windows;
using System.Windows.Browser;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    [ScriptableType]
    public class DependencyObject
    {
        private int _Bitmask = 0;
        private List<PropertyValueProvider> _Providers = new List<PropertyValueProvider>();

        public static readonly object UNDEFINED = new object();

        public DependencyObject()
        {
            for (int i = 0; i <= PropertyPrecedence.Highest; i++)
            {
                _Providers.Add(null);
            }
        }

        #region Properties

        [ScriptableMember]
        public int _ID { get; set; }

        public object _ResourceBase { get; set; }

        #endregion

        [ScriptableMember]
        public object GetValue(DependencyProperty prop)
        {
            return GetValueInternal(prop, PropertyPrecedence.LocalValue, PropertyPrecedence.Highest);
        }

        public object GetValueInternal(DependencyProperty prop, int startingPrec = PropertyPrecedence.Lowest, int endingPrec = PropertyPrecedence.Highest)
        {
            var bitmask = _Bitmask | prop.BitmaskCache;
            for (int i = startingPrec; i <= endingPrec; i++)
            {
                if ((bitmask & (1 << i)) == 0)
                    continue;
                var provider = _Providers[i];
                if (provider == null)
                    continue;
                var val = provider.GetPropertyValue(prop);
                if (val != DependencyObject.UNDEFINED)
                    continue;
                return val;
            }
            return DependencyObject.UNDEFINED;
        }

        [ScriptableMember]
        public void SetValue(int propID, object value)
        {

        }

        internal void _ProviderValueChanged(int precedence, DependencyProperty prop, object oldProviderValue, object newProviderValue, bool notifyListeners, bool setParent, bool mergeNamesOnSetParent)
        {
            var bitmask = _Bitmask;
            if (newProviderValue != UNDEFINED)
                bitmask |= 1 << precedence;
            else
                bitmask &= ~(1 << precedence);
            _Bitmask = bitmask;

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
                var lowerPriorityValue = GetValueInternal(prop, precedence + 1);
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
                throw new NotImplementedException();
                //equal = !prop._AlwaysChange && Nullstone.Equals(oldValue, newValue);
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

            DependencyObject oldDO = null;
            DependencyObject newDO = null;

            var setsParent = setParent && !prop._IsCustom;
            if (oldValue != null && oldValue is DependencyObject)
                oldDO = oldValue as DependencyObject;
            if (newValue != null && newValue is DependencyObject)
                newDO = newValue as DependencyObject;

            if (oldDO != null)
            {
                if (setsParent)
                {
                    oldDO._IsAttached = false;
                    oldDO._RemoveParent(this);
                    oldDO._RemoveTarget(this);

                    //TODO: 
                    //  Remove property listener
                    //  Unsubscribe Collection Changed Event handler
                    //  Unsubscribe Collection Item Changed Event handler
                }
                else
                {
                    oldDO.Mentor = null;
                }
            }
            if (newDO != null)
            {
                if (setsParent)
                {
                    newDO._IsAttached = this._IsAttached;
                    newDO._AddParent(this, mergeNamesOnSetParent);

                    newDO._ResourceBase = _ResourceBase;

                    //TODO: 
                    //  Subscribe Collection Changed Event handler
                    //  Subscribe Collection Item Changed Event handler
                    //  Add property listener
                }
                else
                {
                    //TODO: Recurse up mentors until finding a FrameworkElement, Set as mentor
                }
            }

            if (notifyListeners)
            {
                var args = new object();
                _OnPropertyChanged(args);

                //TODO: Changed callback

                //TODO: Propagate inherited if should
            }
        }

        private void _CallRecomputePropertyValueForProviders(DependencyProperty prop, int precedence)
        {

        }

        private void _OnPropertyChanged(object args)
        {
        }

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
            throw new NotImplementedException();
        }

        #endregion

        #region Target

        private void _AddTarget(DependencyObject obj)
        {
        }
        private void _RemoveTarget(DependencyObject obj)
        {
        }

        #endregion

        #region Parent

        private void _AddParent(DependencyObject parent, bool mergeNamesFromSubtree)
        {
            throw new NotImplementedException();
        }
        private void _RemoveParent(DependencyObject parent)
        {
            throw new NotImplementedException();
        }

        #endregion

        #region Mentor

        private DependencyObject _Mentor;
        public DependencyObject Mentor
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

        private void _OnMentorChanged(DependencyObject oldMentor, DependencyObject newMentor)
        {
            //TODO: Propagate mentor
            throw new NotImplementedException();
        }

        #endregion
    }
}