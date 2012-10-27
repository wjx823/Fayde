using System.Collections.Generic;
using System.Windows.Browser;

namespace WickedSick.Fayde.Client.NativeEngine
{
    public static class ArrayEx
    {
        public static IEnumerable<T> GetItems<T>(this ScriptObject @object) where T : class
        {
            var lenObj = @object.GetProperty("length");
            if (lenObj != null)
            {
                var len = (int)(double)lenObj;
                for (int i = 0; i < len; i++)
                {
                    yield return @object.GetProperty(i) as T;
                }
            }
        }
    }
}