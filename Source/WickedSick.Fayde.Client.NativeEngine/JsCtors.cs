using System;
using System.Collections.Generic;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public static class JsCtors
    {
        private static Dictionary<double, Func<ScriptObject, DependencyObjectNative>> _ObjectFactories = new Dictionary<double, Func<ScriptObject, DependencyObjectNative>>();
        private static Dictionary<Type, ScriptObject> _Ctors = new Dictionary<Type, ScriptObject>();

        public static void Register<T>(ScriptObject ctor) where T : DependencyObjectNative
        {
            _Ctors[typeof(T)] = ctor;
            RegisterObjectFactory<T>(ctor);
        }

        public static ScriptObject GetCtor<T>()
        {
            return _Ctors[typeof(T)];
        }

        private static void RegisterObjectFactory<T>(ScriptObject ctor) where T : DependencyObjectNative
        {
            var typeID = (double)ctor.GetProperty("_TypeID");
            _ObjectFactories[typeID] = so => (T)Activator.CreateInstance(typeof(T), so);
        }
        public static Func<ScriptObject, DependencyObjectNative> GetInstanceCreator(ScriptObject ctor)
        {
            if (ctor == null)
                return null;
            var func = DoGetInstanceCreator(ctor);
            if (func != null)
                return func;
            return GetInstanceCreator(ctor.GetProperty("_BaseClass") as ScriptObject);
        }
        private static Func<ScriptObject, DependencyObjectNative> DoGetInstanceCreator(ScriptObject ctor)
        {
            var typeID = (double)ctor.GetProperty("_TypeID");
            if (!_ObjectFactories.ContainsKey(typeID))
                return null;
            return _ObjectFactories[typeID];
        }
    }
}