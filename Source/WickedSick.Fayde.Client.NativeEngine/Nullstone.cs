using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public static class Nullstone
    {
        public static bool RefEquals(object o1, object o2)
        {
            if (o1 == null && o2 == null)
                return true;
            if (o1 == null || o2 == null)
                return false;
            var ow1 = o1 as INullstoneObjectWrapper;
            var ow2 = o2 as INullstoneObjectWrapper;
            if (ow1 != null && ow2 != null)
            {
                return ow1._ID == ow2._ID;
            }
            return false;
        }

        public new static bool Equals(object o1, object o2)
        {
            if (o1 == null && o2 == null)
                return true;
            if (o1 == null || o2 == null)
                return false;
            var ow1 = o1 as INullstoneObjectWrapper;
            var ow2 = o2 as INullstoneObjectWrapper;
            if (ow1 != null && ow2 != null)
            {
                return ow1._ID == ow2._ID;
            }
            return o1.Equals(o2);
        }

        public static ScriptObject ScriptObject { get; set; }

        public static bool Is(ScriptObject so, string typeName)
        {
            if (so == null)
                return false;
            var type = HtmlPage.Window.Eval(typeName);
            var rv = ScriptObject.Invoke("Is", so, type);
            return rv != null && (bool)rv;
        }
    }
}