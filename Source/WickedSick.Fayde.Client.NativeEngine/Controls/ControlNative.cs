using System;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine.Controls
{
    [ScriptableType]
    public class ControlNative : FrameworkElementNative
    {
        public ControlNative(ScriptObject @object)
            : base(@object)
        {
            _Providers[PropertyPrecedence.IsEnabled] = new InheritedIsEnabledPropertyValueProvider(this);
        }

        protected InheritedIsEnabledPropertyValueProvider InheritedIsEnabledProvider { get { return _Providers[PropertyPrecedence.IsEnabled] as InheritedIsEnabledPropertyValueProvider; } }

        internal static ControlNative FindAncestorControl(ScriptObject source)
        {
            var ctor = JsCtors.GetCtor<ControlNative>();
            return DependencyObjectNative.GetFromObject(ctor.Invoke("_FindAncestorControl", source)) as ControlNative;
        }

        [ScriptableMember]
        public void SetDataSource(ScriptObject dataSource)
        {
            InheritedIsEnabledProvider.SetDataSource(dataSource);
        }
    }
}