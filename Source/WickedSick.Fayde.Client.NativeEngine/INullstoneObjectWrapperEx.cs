using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public static class INullstoneObjectWrapperEx
    {
        public static string _GetTypeName(this INullstoneObjectWrapper wrapper)
        {
            var ctor = wrapper.Object.GetProperty("constructor") as ScriptObject;
            if (ctor == null)
                return null;
            return ctor.GetProperty("_TypeName") as string;
        }
    }
}