using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class DependencyObjectInterop
    {
        [ScriptableMember]
        public DependencyObjectNative CreateDependencyObjectNative(ScriptObject so)
        {
            return new DependencyObjectNative(so);
        }

        [ScriptableMember]
        public UIElementNative CreateUIElementNative(ScriptObject so)
        {
            return new UIElementNative(so);
        }

        [ScriptableMember]
        public FrameworkElementNative CreateFrameworkElementNative(ScriptObject so)
        {
            return new FrameworkElementNative(so);
        }

        [ScriptableMember]
        public ControlNative CreateControlNative(ScriptObject so)
        {
            return new ControlNative(so);
        }

        [ScriptableMember]
        public object CreateUndefined()
        {
            return DependencyObjectNative.UNDEFINED;
        }

        [ScriptableMember]
        public void RegisterNullstone(ScriptObject so)
        {
            Nullstone.ScriptObject = so;
        }

        [ScriptableMember]
        public void RegisterTypes(ScriptObject doCtor, ScriptObject uieCtor, ScriptObject feCtor, ScriptObject ctrlCtor)
        {
            DependencyObjectNative.JsCtor = doCtor;
            UIElementNative.JsCtor = uieCtor;
            FrameworkElementNative.JsCtor = feCtor;
            ControlNative.JsCtor = ctrlCtor;

            var dcp = feCtor.GetProperty("DataContextProperty") as ScriptObject;
            if (dcp != null)
                InheritedDataContextPropertyValueProvider.DataContextProperty = new DependencyPropertyWrapper(dcp);
            var awp = feCtor.GetProperty("ActualWidthProperty") as ScriptObject;
            if (awp != null)
                FrameworkElementPropertyValueProvider.ActualWidthProperty = new DependencyPropertyWrapper(awp);
            var ahp = feCtor.GetProperty("ActualHeightProperty") as ScriptObject;
            if (ahp != null)
                FrameworkElementPropertyValueProvider.ActualHeightProperty = new DependencyPropertyWrapper(ahp);

            var iep = ctrlCtor.GetProperty("IsEnabledProperty") as ScriptObject;
            if (iep != null)
                InheritedIsEnabledPropertyValueProvider.IsEnabledProperty = new DependencyPropertyWrapper(iep);
        }
    }
}