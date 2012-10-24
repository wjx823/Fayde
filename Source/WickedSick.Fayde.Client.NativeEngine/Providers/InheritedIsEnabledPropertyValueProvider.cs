﻿using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public class InheritedIsEnabledPropertyValueProvider : PropertyValueProvider
    {
        public InheritedIsEnabledPropertyValueProvider(DependencyObjectNative @do)
            : base(@do, PropertyPrecedence.IsEnabled)
        {
        }

        public override object GetPropertyValue(DependencyPropertyWrapper prop)
        {
            throw new NotImplementedException();
        }

        public bool LocalValueChanged(DependencyPropertyWrapper prop)
        {
            throw new NotImplementedException();
        }
    }
}
