using System;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class SetterNative : DependencyObjectNative
    {
        public static DependencyPropertyWrapper PropertyProperty;
        public static DependencyPropertyWrapper ConvertedValueProperty;

        public SetterNative(ScriptObject @object)
            : base(@object)
        {
        }

        public DependencyPropertyWrapper Property { get { return DependencyPropertyWrapper.Lookup(GetValue(PropertyProperty) as ScriptObject); } }
        public object ConvertedValue { get { return GetValue(ConvertedValueProperty); } }
    }
}