using System;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public struct InheritedContext
    {
        public DependencyObjectNative ForegroundSource;
        public DependencyObjectNative FontFamilySource;
        public DependencyObjectNative FontStretchSource;
        public DependencyObjectNative FontStyleSource;
        public DependencyObjectNative FontWeightSource;
        public DependencyObjectNative FontSizeSource;
        public DependencyObjectNative LanguageSource;
        public DependencyObjectNative FlowDirectionSource;
        public DependencyObjectNative UseLayoutRoundingSource;
        public DependencyObjectNative TextDecorationsSource;

        public static InheritedContext FromObject(DependencyObjectNative obj, InheritedContext parentContext)
        {
            var ic = new InheritedContext();

            ic.ForegroundSource = ic.GetLocalSource(obj, Inheritable.Foreground) ?? parentContext.ForegroundSource;
            ic.FontFamilySource = ic.GetLocalSource(obj, Inheritable.FontFamily) ?? parentContext.FontFamilySource;
            ic.FontStretchSource = ic.GetLocalSource(obj, Inheritable.FontStretch) ?? parentContext.FontStretchSource;
            ic.FontStyleSource = ic.GetLocalSource(obj, Inheritable.FontStyle) ?? parentContext.FontStyleSource;
            ic.FontWeightSource = ic.GetLocalSource(obj, Inheritable.FontWeight) ?? parentContext.FontWeightSource;
            ic.FontSizeSource = ic.GetLocalSource(obj, Inheritable.FontSize) ?? parentContext.FontSizeSource;
            ic.LanguageSource = ic.GetLocalSource(obj, Inheritable.Language) ?? parentContext.LanguageSource;
            ic.FlowDirectionSource = ic.GetLocalSource(obj, Inheritable.FlowDirection) ?? parentContext.FlowDirectionSource;
            ic.UseLayoutRoundingSource = ic.GetLocalSource(obj, Inheritable.UseLayoutRounding) ?? parentContext.UseLayoutRoundingSource;
            ic.TextDecorationsSource = ic.GetLocalSource(obj, Inheritable.TextDecorations) ?? parentContext.TextDecorationsSource;

            return ic;
        }

        public int Compare(InheritedContext withContext, int props)
        {
            var rv = Inheritable.None;

            if ((props & Inheritable.Foreground) > 0 && Nullstone.RefEquals(withContext.ForegroundSource, ForegroundSource))
                rv |= Inheritable.Foreground;
            if ((props & Inheritable.FontFamily) > 0 && Nullstone.RefEquals(withContext.FontFamilySource, FontFamilySource))
                rv |= Inheritable.FontFamily;
            if ((props & Inheritable.FontStretch) > 0 && Nullstone.RefEquals(withContext.FontStretchSource, FontStretchSource))
                rv |= Inheritable.FontStretch;
            if ((props & Inheritable.FontStyle) > 0 && Nullstone.RefEquals(withContext.FontStyleSource, FontStyleSource))
                rv |= Inheritable.FontStyle;
            if ((props & Inheritable.FontWeight) > 0 && Nullstone.RefEquals(withContext.FontWeightSource, FontWeightSource))
                rv |= Inheritable.FontWeight;
            if ((props & Inheritable.FontSize) > 0 && Nullstone.RefEquals(withContext.FontSizeSource, FontSizeSource))
                rv |= Inheritable.FontSize;
            if ((props & Inheritable.Language) > 0 && Nullstone.RefEquals(withContext.LanguageSource, LanguageSource))
                rv |= Inheritable.Language;
            if ((props & Inheritable.FlowDirection) > 0 && Nullstone.RefEquals(withContext.FlowDirectionSource, FlowDirectionSource))
                rv |= Inheritable.FlowDirection;
            if ((props & Inheritable.UseLayoutRounding) > 0 && Nullstone.RefEquals(withContext.UseLayoutRoundingSource, UseLayoutRoundingSource))
                rv |= Inheritable.UseLayoutRounding;
            if ((props & Inheritable.TextDecorations) > 0 && Nullstone.RefEquals(withContext.TextDecorationsSource, TextDecorationsSource))
                rv |= Inheritable.TextDecorations;

            return rv;
        }

        public DependencyObjectNative GetLocalSource(DependencyObjectNative obj, int prop)
        {
            var propd = DependencyPropertyWrapper.GetFromInheritable(prop, obj);
            if (propd == null)
                return null;

            if (obj.GetPropertyValueProvider(propd) < PropertyPrecedence.Inherited)
                return obj;
            
            return null;
        }
    }
}