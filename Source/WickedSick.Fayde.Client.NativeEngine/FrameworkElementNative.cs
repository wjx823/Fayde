using System;
using System.Windows.Browser;
using WickedSick.Fayde.Client.NativeEngine.Providers;

namespace WickedSick.Fayde.Client.NativeEngine
{
    [ScriptableType]
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

        #region Providers

        protected StylePropertyValueProvider StyleProvider { get { return _Providers[PropertyPrecedence.LocalStyle] as StylePropertyValueProvider; } }
        protected ImplicitStylePropertyValueProvider ImplicitStyleProvider { get { return _Providers[PropertyPrecedence.ImplicitStyle] as ImplicitStylePropertyValueProvider; } }
        protected FrameworkElementPropertyValueProvider DynamicValueProvider { get { return _Providers[PropertyPrecedence.DynamicValue] as FrameworkElementPropertyValueProvider; } }
        protected InheritedDataContextPropertyValueProvider InheritedDataContextProvider { get { return _Providers[PropertyPrecedence.InheritedDataContext] as InheritedDataContextPropertyValueProvider; } }

        #endregion

        #region DataContext

        [ScriptableMember]
        public void SetDataContextDataSource(ScriptObject dataSource)
        {
            InheritedDataContextProvider.SetDataSource(dataSource);
        }

        [ScriptableMember]
        public void EmitDataContextChanged()
        {
            InheritedDataContextProvider.EmitChanged();
        }

        #endregion

        #region LocalStyle

        [ScriptableMember]
        public void UpdateLocalStyle(ScriptObject newStyle)
        {
            StyleProvider.UpdateStyle(newStyle);
        }

        #endregion

        #region ImplicitStyle

        [ScriptableMember]
        public void SetImplicitStyles(int styleMask, ScriptObject[] styles)
        {
            ImplicitStyleProvider.SetStyles(styleMask, styles);
        }

        [ScriptableMember]
        public void ClearImplicitStyles(int styleMask)
        {
            ImplicitStyleProvider.ClearStyles(styleMask);
        }

        #endregion

        internal ScriptObject CallComputeActualSize()
        {
            return Object.InvokeSelf("_ComputeActualSize") as ScriptObject;
        }

        [ScriptableMember]
        public override void ChangeMentors(ScriptObject oldMentor, ScriptObject newMentor)
        {
            base.ChangeMentors(oldMentor, newMentor);
            if (StyleProvider != null)
                StyleProvider.ForeachValue((p, v) => _PropagateMentorChanged(p, v, oldMentor, newMentor));
            if (ImplicitStyleProvider != null)
                ImplicitStyleProvider.ForeachValue((p, v) => _PropagateMentorChanged(p, v, oldMentor, newMentor));
        }
    }
}