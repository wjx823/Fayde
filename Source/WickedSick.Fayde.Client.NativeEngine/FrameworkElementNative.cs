using System;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class FrameworkElementNative  : UIElementNative
    {
        public FrameworkElementNative(ScriptObject @object)
            : base(@object)
        {
            _Providers[PropertyPrecedence.LocalStyle] = new StylePropertyValueProvider(this);
            _Providers[PropertyPrecedence.ImplicitStyle] = new ImplicitStylePropertyValueProvider(this);
            _Providers[PropertyPrecedence.DynamicValue] = new FrameworkElementPropertyValueProvider(this);
            _Providers[PropertyPrecedence.InheritedDataContext] = new InheritedDataContextPropertyValueProvider(this);
        }

        internal ScriptObject CallComputeActualSize()
        {
            return Object.InvokeSelf("_ComputeActualSize") as ScriptObject;
        }
    }
}