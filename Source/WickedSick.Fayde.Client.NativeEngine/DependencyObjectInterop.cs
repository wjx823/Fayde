using System;
using System.Collections.Generic;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Controls;
using WickedSick.Fayde.Client.NativeEngine.Documents;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class DependencyObjectInterop
    {
        [ScriptableMember]
        public DependencyObjectNative CreateObjectNative(ScriptObject so)
        {
            var ctor = so.GetProperty("constructor") as ScriptObject;
            var factory = JsCtors.GetInstanceCreator(ctor);
            return factory != null ? factory(so) : null;
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
        public void RegisterTypes(ScriptObject doCtor, ScriptObject dpCtor, ScriptObject uieCtor, ScriptObject feCtor, ScriptObject ctrlCtor, ScriptObject popupCtor, ScriptObject tbCtor, ScriptObject spanCtor, ScriptObject parCtor, ScriptObject secCtor)
        {
            JsCtors.Register<DependencyObjectNative>(doCtor);
            JsCtors.Register<UIElementNative>(uieCtor);
            JsCtors.Register<FrameworkElementNative>(feCtor);
            JsCtors.Register<ControlNative>(ctrlCtor);
            JsCtors.Register<PopupNative>(popupCtor);
            JsCtors.Register<TextBlockNative>(tbCtor);
            JsCtors.Register<SpanNative>(spanCtor);
            JsCtors.Register<ParagraphNative>(parCtor);
            JsCtors.Register<SectionNative>(secCtor);

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

            var cp = popupCtor.GetProperty("ChildProperty") as ScriptObject;
            if (cp != null)
                PopupNative.ChildProperty = new DependencyPropertyWrapper(cp);

            var inp = tbCtor.GetProperty("InlinesProperty") as ScriptObject;
            if (inp != null)
                TextBlockNative.InlinesProperty = new DependencyPropertyWrapper(inp);

            inp = spanCtor.GetProperty("InlinesProperty") as ScriptObject;
            if (inp != null)
                SpanNative.InlinesProperty = new DependencyPropertyWrapper(inp);

            inp = parCtor.GetProperty("InlinesProperty") as ScriptObject;
            if (inp != null)
                ParagraphNative.InlinesProperty = new DependencyPropertyWrapper(inp);

            var blp = secCtor.GetProperty("BlocksProperty") as ScriptObject;
            if (blp != null)
                SectionNative.BlocksProperty = new DependencyPropertyWrapper(blp);
        }
    }
}