using System;

namespace WickedSick.Fayde.Client.NativeEngine.Providers
{
    public struct InheritedContext
    {
        public object ForegroundSource;
        public object FontFamilySource;
        public object FontStretchSource;
        public object FontStyleSource;
        public object FontWeightSource;
        public object FontSizeSource;
        public object LanguageSource;
        public object FlowDirectionSource;
        public object UseLayoutRoundingSource;
        public object TextDecorationsSource;

        public static InheritedContext FromObject(DependencyObjectNative obj, InheritedContext parentContext)
        {
            throw new NotImplementedException();
        }

        public bool Compare(InheritedContext withContext, int props)
        {
            throw new NotImplementedException();
        }

        public object GetLocalSource(DependencyObjectNative obj, int prop)
        {
            throw new NotImplementedException();
        }
    }
}