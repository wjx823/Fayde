﻿using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Controls;
using WickedSick.Fayde.Client.NativeEngine.Documents;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public class DependencyObjectInterop
    {
        private static ScriptObject _FaydeCtor;

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
        public void RegisterTypes(ScriptObject faydeCtor, ScriptObject doCtor, ScriptObject dpCtor, ScriptObject uieCtor, ScriptObject feCtor, ScriptObject collCtor, ScriptObject ctrlCtor, ScriptObject popupCtor, ScriptObject txtCtor, ScriptObject pwdCtor, ScriptObject tbCtor, ScriptObject spanCtor, ScriptObject parCtor, ScriptObject secCtor, ScriptObject setterCtor)
        {
            _FaydeCtor = faydeCtor;
            DependencyPropertyWrapper.JsCtor = dpCtor;
            JsCtors.Register<DependencyObjectNative>(doCtor);
            JsCtors.Register<UIElementNative>(uieCtor);
            JsCtors.Register<FrameworkElementNative>(feCtor);
            JsCtors.Register<CollectionNative>(collCtor);
            JsCtors.Register<ControlNative>(ctrlCtor);
            JsCtors.Register<PopupNative>(popupCtor);
            JsCtors.Register<TextBoxNative>(txtCtor);
            JsCtors.Register<PasswordBoxNative>(pwdCtor);
            JsCtors.Register<TextBlockNative>(tbCtor);
            JsCtors.Register<SpanNative>(spanCtor);
            JsCtors.Register<ParagraphNative>(parCtor);
            JsCtors.Register<SectionNative>(secCtor);
            JsCtors.Register<SetterNative>(setterCtor);

            var nmp = doCtor.GetProperty("NameProperty") as ScriptObject;
            if (nmp != null)
                DependencyObjectNative.NameProperty = DependencyPropertyWrapper.Lookup(nmp);

            var dcp = feCtor.GetProperty("DataContextProperty") as ScriptObject;
            if (dcp != null)
                InheritedDataContextPropertyValueProvider.DataContextProperty = DependencyPropertyWrapper.Lookup(dcp);
            var awp = feCtor.GetProperty("ActualWidthProperty") as ScriptObject;
            if (awp != null)
                FrameworkElementPropertyValueProvider.ActualWidthProperty = DependencyPropertyWrapper.Lookup(awp);
            var ahp = feCtor.GetProperty("ActualHeightProperty") as ScriptObject;
            if (ahp != null)
                FrameworkElementPropertyValueProvider.ActualHeightProperty = DependencyPropertyWrapper.Lookup(ahp);

            var iep = ctrlCtor.GetProperty("IsEnabledProperty") as ScriptObject;
            if (iep != null)
                InheritedIsEnabledPropertyValueProvider.IsEnabledProperty = DependencyPropertyWrapper.Lookup(iep);

            var cp = popupCtor.GetProperty("ChildProperty") as ScriptObject;
            if (cp != null)
                PopupNative.ChildProperty = DependencyPropertyWrapper.Lookup(cp);

            TextBoxNative.InitializeProperties(txtCtor);
            PasswordBoxNative.InitializeProperties(pwdCtor);

            var inp = tbCtor.GetProperty("InlinesProperty") as ScriptObject;
            if (inp != null)
                TextBlockNative.InlinesProperty = DependencyPropertyWrapper.Lookup(inp);

            inp = spanCtor.GetProperty("InlinesProperty") as ScriptObject;
            if (inp != null)
                SpanNative.InlinesProperty = DependencyPropertyWrapper.Lookup(inp);

            inp = parCtor.GetProperty("InlinesProperty") as ScriptObject;
            if (inp != null)
                ParagraphNative.InlinesProperty = DependencyPropertyWrapper.Lookup(inp);

            var blp = secCtor.GetProperty("BlocksProperty") as ScriptObject;
            if (blp != null)
                SectionNative.BlocksProperty = DependencyPropertyWrapper.Lookup(blp);

            var prp = setterCtor.GetProperty("PropertyProperty") as ScriptObject;
            if (prp != null)
                SetterNative.PropertyProperty = DependencyPropertyWrapper.Lookup(prp);
            var cvp = setterCtor.GetProperty("ConvertedValueProperty") as ScriptObject;
            if (cvp != null)
                SetterNative.ConvertedValueProperty = DependencyPropertyWrapper.Lookup(cvp);
        }

        internal static object Clone(object value)
        {
            return _FaydeCtor.Invoke("Clone", value);
        }
    }
}